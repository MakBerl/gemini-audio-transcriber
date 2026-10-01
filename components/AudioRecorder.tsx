import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCcw } from 'lucide-react';
import { AudioState } from '../types';
import { formatDuration } from '../services/utils';
import { Button } from './Button';

interface AudioRecorderProps {
  onRecordingComplete: (audio: AudioState) => void;
  onClear: () => void;
  hasAudio: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onClear, hasAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // webm is standard for browser recording
        const url = URL.createObjectURL(blob);
        const file = new File([blob], "recording.webm", { type: 'audio/webm' });
        
        onRecordingComplete({
            blob,
            file,
            url
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Timer
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMicError("Could not access microphone. Please ensure microphone permissions are granted in your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleReset = () => {
      onClear();
      setDuration(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (hasAudio) {
      return (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-800/30 rounded-xl border border-slate-700">
             <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Mic size={32} />
                 </div>
                 <h3 className="text-xl font-medium text-white">Recording Complete</h3>
                 <p className="text-slate-400 mt-1">Duration: {formatDuration(duration)}</p>
             </div>
             <div className="flex gap-4">
                 <Button onClick={handleReset} variant="secondary" icon={<RefreshCcw size={16} />}>
                     Record Again
                 </Button>
             </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 rounded-xl border border-slate-700 min-h-[16rem]">
      <div className="relative mb-8">
          {/* Pulse animation ring */}
          {isRecording && (
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
          )}
          <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-xl shadow-red-500/30' : 'bg-slate-700'}`}>
               <Mic size={40} className="text-white" />
          </div>
      </div>

      <div className="mb-8 text-center h-8">
          {isRecording ? (
              <div className="text-2xl font-mono text-white font-bold tracking-wider">
                  {formatDuration(duration)}
              </div>
          ) : (
              <p className="text-slate-400">Click start to begin recording</p>
          )}
      </div>

      <div className="flex gap-4">
        {!isRecording ? (
            <Button 
                onClick={startRecording} 
                className="w-40 h-12 text-lg bg-indigo-600 hover:bg-indigo-500"
            >
                Start Recording
            </Button>
        ) : (
            <Button 
                onClick={stopRecording} 
                variant="danger"
                className="w-40 h-12 text-lg"
                icon={<Square size={20} className="fill-current" />}
            >
                Stop
            </Button>
        )}
      </div>

      {micError && (
        <p className="mt-4 text-xs text-red-400 text-center max-w-xs">{micError}</p>
      )}
    </div>
  );
};
