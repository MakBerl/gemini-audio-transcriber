import React, { useState } from 'react';
import { AudioSource, AudioState } from './types';
import { AudioUploader } from './components/AudioUploader';
import { AudioRecorder } from './components/AudioRecorder';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { Button } from './components/Button';
import { transcribeAudio } from './services/geminiService';
import { blobToBase64 } from './services/utils';
import { Mic, Upload, Wand2, FileAudio, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AudioSource>(AudioSource.UPLOAD);
  const [audioState, setAudioState] = useState<AudioState | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudioSelected = (audio: AudioState) => {
    setAudioState(audio);
    setTranscription(null);
    setError(null);
  };

  const handleClear = () => {
    setAudioState(null);
    setTranscription(null);
    setError(null);
  };

  const handleTranscribe = async () => {
    if (!audioState?.blob) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Convert blob/file to base64
      const base64 = await blobToBase64(audioState.blob);
      
      // 2. Determine mime type
      const mimeType = audioState.blob.type || 'audio/mp3'; // Default fallback

      // 3. Call Gemini
      const result = await transcribeAudio(base64, mimeType);
      setTranscription(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during transcription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FileAudio className="text-white w-6 h-6" />
             </div>
             <h1 className="text-xl font-bold text-white tracking-tight">Gemini<span className="text-indigo-400">Scribe</span></h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Powered by Google Gemini 2.0 Flash
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tab Navigation */}
            <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex">
               <button 
                 onClick={() => setActiveTab(AudioSource.UPLOAD)}
                 className={`flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === AudioSource.UPLOAD ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 <Upload size={18} className="mr-2" />
                 Upload File
               </button>
               <button 
                 onClick={() => setActiveTab(AudioSource.RECORD)}
                 className={`flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === AudioSource.RECORD ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
               >
                 <Mic size={18} className="mr-2" />
                 Record Audio
               </button>
            </div>

            {/* Input Area */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <div className="mb-6">
                   <h2 className="text-lg font-semibold text-white mb-1">
                       {activeTab === AudioSource.UPLOAD ? 'Choose Audio File' : 'Record Voice'}
                   </h2>
                   <p className="text-slate-400 text-sm">
                       {activeTab === AudioSource.UPLOAD 
                        ? 'Support for MP3, WAV, AAC, and more.' 
                        : 'Use your microphone to capture high-quality audio.'}
                   </p>
               </div>

               {activeTab === AudioSource.UPLOAD ? (
                 <AudioUploader 
                   onAudioSelected={handleAudioSelected} 
                   currentAudio={audioState}
                   onClear={handleClear}
                 />
               ) : (
                 <AudioRecorder 
                   onRecordingComplete={handleAudioSelected}
                   onClear={handleClear}
                   hasAudio={!!audioState}
                 />
               )}
               
               {/* Audio Player Preview (if audio exists) */}
               {audioState?.url && (
                   <div className="mt-6 pt-6 border-t border-slate-800">
                       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Audio Preview</label>
                       <audio 
                         controls 
                         src={audioState.url} 
                         className="w-full h-10 rounded-lg" 
                       />
                   </div>
               )}

               {/* Action Button */}
               <div className="mt-8">
                   <Button 
                     onClick={handleTranscribe}
                     disabled={!audioState || isLoading}
                     isLoading={isLoading}
                     className="w-full h-12 text-lg"
                     icon={<Wand2 size={20} />}
                   >
                     {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
                   </Button>
               </div>

               {/* Error Message */}
               {error && (
                   <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start text-red-400 text-sm">
                       <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                       <span>{error}</span>
                   </div>
               )}
            </div>
            
            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4">
                <h4 className="text-indigo-400 font-medium text-sm mb-2">Pro Tip</h4>
                <p className="text-indigo-200/60 text-xs leading-relaxed">
                    For best results, ensure the audio has clear speech with minimal background noise. The model can distinguish between speakers, but clearer audio yields better separation.
                </p>
            </div>

          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
              {transcription ? (
                  <TranscriptDisplay text={transcription} />
              ) : (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                          <FileAudio className="text-slate-600 w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-300 mb-2">No Transcription Yet</h3>
                      <p className="text-slate-500 max-w-sm">
                          Upload or record audio on the left, then click "Transcribe Audio" to see the magic happen here.
                      </p>
                  </div>
              )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
