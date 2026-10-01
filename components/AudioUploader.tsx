import React, { useCallback, useState } from 'react';
import { Upload, Music, X } from 'lucide-react';
import { AudioState } from '../types';

interface AudioUploaderProps {
  onAudioSelected: (audio: AudioState) => void;
  currentAudio: AudioState | null;
  onClear: () => void;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onAudioSelected, currentAudio, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        onAudioSelected({
            file,
            blob: file,
            url
        });
    } else {
        alert("Please upload a valid audio file.");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAudioSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  if (currentAudio) {
      return (
          <div className="w-full p-6 bg-slate-800/50 border border-indigo-500/30 rounded-xl flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Music size={24} />
                  </div>
                  <div>
                      <p className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-md">
                          {currentAudio.file?.name || "Recorded Audio"}
                      </p>
                      <p className="text-sm text-slate-400">
                          {(currentAudio.blob?.size ? (currentAudio.blob.size / 1024 / 1024).toFixed(2) : 0)} MB
                      </p>
                  </div>
              </div>
              <button 
                onClick={onClear}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                title="Remove file"
              >
                  <X size={20} />
              </button>
          </div>
      )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center p-8
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'}
      `}
    >
      <input
        type="file"
        id="audio-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="audio/*"
        onChange={handleFileInput}
      />
      <div className="pointer-events-none flex flex-col items-center space-y-4">
        <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
            ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}
        `}>
          <Upload size={32} />
        </div>
        <div>
            <p className="text-lg font-medium text-slate-200">
                Drag & drop audio file here
            </p>
            <p className="text-sm text-slate-400 mt-1">
                or click to browse
            </p>
        </div>
        <div className="flex gap-2">
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500 border border-slate-700">MP3</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500 border border-slate-700">WAV</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500 border border-slate-700">M4A</span>
        </div>
      </div>
    </div>
  );
};
