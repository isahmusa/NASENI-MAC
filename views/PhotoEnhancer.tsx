
import React, { useState } from 'react';
import { enhanceImage } from '../services/geminiService';
import { Project } from '../types';

interface PhotoEnhancerProps {
  onSave?: (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => void;
}

const PhotoEnhancer: React.FC<PhotoEnhancerProps> = ({ onSave }) => {
  const [original, setOriginal] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mimeType, setMimeType] = useState('');
  const [fileName, setFileName] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginal(reader.result as string);
        setEnhanced(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processEnhancement = async () => {
    if (!original) return;
    setIsProcessing(true);
    try {
      const result = await enhanceImage(original, mimeType);
      setEnhanced(result);
    } catch (err) {
      console.error(err);
      alert('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (enhanced && onSave) {
      onSave({
        type: 'photo',
        name: `Enhanced_${fileName || 'Image'}`,
        data: enhanced,
        metadata: { originalName: fileName, mimeType }
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold mb-4">AI Photo Enhancer</h2>
        <p className="text-zinc-500">Transform low-resolution photos into studio-quality HD images using Gemini vision models.</p>
      </div>

      {!original ? (
        <label className="w-full max-w-xl p-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer group text-center">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">🖼️</span>
          <p className="font-bold text-lg">Drop low-quality image here</p>
          <p className="text-xs text-zinc-600 mt-2">Supports JPG, PNG, WebP up to 10MB</p>
        </label>
      ) : (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Original Source</h3>
              <div className="studio-glass p-2 rounded-2xl border border-white/5 overflow-hidden">
                <img src={original} alt="Original" className="w-full h-80 object-cover rounded-xl" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Enhanced Result</h3>
              <div className="studio-glass p-2 rounded-2xl border border-white/5 overflow-hidden min-h-[320px] flex items-center justify-center bg-black/40">
                {isProcessing ? (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-blue-400 font-medium animate-pulse">Upscaling & Remastering...</p>
                  </div>
                ) : enhanced ? (
                  <img src={enhanced} alt="Enhanced" className="w-full h-80 object-cover rounded-xl animate-in zoom-in-95" />
                ) : (
                  <p className="text-zinc-600 text-sm">Waiting for processing...</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => {setOriginal(null); setEnhanced(null);}}
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Clear
            </button>
            {!enhanced && !isProcessing && (
              <button 
                onClick={processEnhancement}
                className="px-12 py-3 bg-blue-600 rounded-xl font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Enhance to HD
              </button>
            )}
            {enhanced && (
              <>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Save to Projects
                </button>
                <a 
                  href={enhanced} 
                  download={`enhanced-${fileName || 'image'}.png`}
                  className="px-12 py-3 bg-green-600 rounded-xl font-bold shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Download HD
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoEnhancer;
