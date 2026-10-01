import React, { useState } from 'react';
import { Copy, Download, Check, Type } from 'lucide-react';
import { Button } from './Button';
import { downloadText } from '../services/utils';

interface TranscriptDisplayProps {
  text: string;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadText(text, `transcription-${new Date().toISOString().slice(0,10)}.txt`);
  };

  return (
    <div className="w-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center text-slate-700">
           <Type className="mr-2" size={20} />
           <h3 className="font-semibold text-lg">Transcription Result</h3>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={handleCopy}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium"
                title="Copy to clipboard"
            >
                {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button 
                onClick={handleDownload}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium"
                title="Download text"
            >
                <Download size={18} />
                <span className="hidden sm:inline">Download</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="prose prose-slate max-w-none">
            {text.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-slate-700 leading-relaxed text-lg">
                    {paragraph}
                </p>
            ))}
        </div>
      </div>
    </div>
  );
};
