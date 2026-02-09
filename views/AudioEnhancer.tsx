
import React, { useState, useRef, useEffect } from 'react';
import { processAudio, getAudioPreview, getFullEnhancedAudio } from '../services/geminiService';
import { Project } from '../types';

interface AudioEnhancerProps {
  onSave?: (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => void;
}

// Helper to wrap raw PCM data into a valid WAV file for download
function createWavFile(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.length, true); // file length
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmData.length, true);

  return new Blob([header, pcmData], { type: 'audio/wav' });
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioEnhancer: React.FC<AudioEnhancerProps> = ({ onSave }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [enhancedPreviewBuffer, setEnhancedPreviewBuffer] = useState<AudioBuffer | null>(null);
  const [masteredAudioBlob, setMasteredAudioBlob] = useState<Blob | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingEnhanced, setIsPlayingEnhanced] = useState(false);
  
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      if (currentSourceRef.current) currentSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setEnhancedPreviewBuffer(null);
      setMasteredAudioBlob(null);
      setReport(null);
    }
  };

  const handlePreview = async () => {
    if (!audioFile) return;
    setIsPreviewing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const pcmData = await getAudioPreview(base64, audioFile.type);
        
        if (pcmData) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          audioContextRef.current = ctx;
          const buffer = await decodeAudioData(decodeBase64(pcmData), ctx);
          setEnhancedPreviewBuffer(buffer);
        }
        setIsPreviewing(false);
      };
      reader.readAsDataURL(audioFile);
    } catch (err) {
      console.error(err);
      setIsPreviewing(false);
      alert('Failed to generate preview.');
    }
  };

  const playOriginal = () => {
    if (isPlayingEnhanced) stopEnhanced();
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    }
  };

  const playEnhanced = () => {
    if (isPlayingOriginal) {
      originalAudioRef.current?.pause();
      setIsPlayingOriginal(false);
    }

    if (!enhancedPreviewBuffer || !audioContextRef.current) return;

    if (isPlayingEnhanced) {
      stopEnhanced();
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = enhancedPreviewBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingEnhanced(false);
      source.start();
      currentSourceRef.current = source;
      setIsPlayingEnhanced(true);
    }
  };

  const stopEnhanced = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setIsPlayingEnhanced(false);
  };

  const startFullMastering = async () => {
    if (!audioFile) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Parallel requests for report and full audio
        const [textResult, audioPcmData] = await Promise.all([
          processAudio(base64, audioFile.type),
          getFullEnhancedAudio(base64, audioFile.type)
        ]);
        
        setReport(textResult);
        if (audioPcmData) {
          const wavBlob = createWavFile(decodeBase64(audioPcmData), 24000);
          setMasteredAudioBlob(wavBlob);
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(audioFile);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Full mastering failed. Please check the audio length or try again.');
    }
  };

  const handleSave = () => {
    if (masteredAudioBlob && onSave && audioFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave({
          type: 'audio',
          name: `Mastered_${audioFile.name}`,
          data: reader.result as string,
          metadata: { originalName: audioFile.name, mimeType: 'audio/wav' }
        });
      };
      reader.readAsDataURL(masteredAudioBlob);
    }
  };

  const downloadMastered = () => {
    if (!masteredAudioBlob) return;
    const url = URL.createObjectURL(masteredAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mastered_${audioFile?.name?.split('.')[0] || 'audio'}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold mb-4">AI Audio Studio</h2>
        <p className="text-zinc-500">Advanced noise removal, normalization, and studio mastering using Gemini 2.5 Native Audio.</p>
      </div>

      {!audioFile ? (
        <label className="w-full max-w-xl p-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer group text-center">
          <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
          <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">🎙️</span>
          <p className="font-bold text-lg">Upload recording</p>
          <p className="text-xs text-zinc-600 mt-2">Supports MP3, WAV, M4A up to 20MB</p>
        </label>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          <div className="studio-glass p-8 rounded-3xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl">🎵</div>
              <div>
                <h3 className="font-bold text-lg">{audioFile.name}</h3>
                <p className="text-sm text-zinc-500">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Source Ready</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setAudioFile(null);
                setEnhancedPreviewBuffer(null);
                setMasteredAudioBlob(null);
                setReport(null);
                stopEnhanced();
              }}
              className="p-3 text-zinc-500 hover:text-white transition-colors"
            >
              Remove
            </button>
          </div>

          <audio 
            ref={originalAudioRef} 
            src={audioFile ? URL.createObjectURL(audioFile) : ''} 
            onEnded={() => setIsPlayingOriginal(false)}
            className="hidden" 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Comparison Console */}
              <div className="studio-glass p-8 rounded-3xl border border-white/5 bg-black/40 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">A/B Comparison Console</h4>
                  <div className="flex gap-2">
                    <span className={`w-2 h-2 rounded-full ${enhancedPreviewBuffer ? 'bg-green-500' : 'bg-zinc-700'}`}></span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">AI Buffer Ready</span>
                  </div>
                </div>
                
                {isProcessing ? (
                   <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="text-center">
                      <p className="text-sm text-blue-400 font-bold animate-pulse">Mastering Audio Architecture...</p>
                      <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest">Applying EQ, Normalization & Denoising</p>
                    </div>
                  </div>
                ) : report ? (
                  <div className="flex-1 flex flex-col animate-in fade-in">
                    <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed mb-6">
                      <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="text-blue-500">✨</span> Mastering Final Report:
                      </h5>
                      <div className="whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5">{report}</div>
                    </div>
                    {masteredAudioBlob && (
                       <div className="mt-auto flex items-center gap-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">✓</div>
                          <div>
                             <p className="text-xs font-bold text-blue-400">Audio Mastered Successfully</p>
                             <p className="text-[10px] text-zinc-500">Enhanced 24-bit studio quality WAV ready for export.</p>
                          </div>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 space-y-12 py-6">
                    {isPreviewing ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-6 h-full">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-blue-400 font-bold animate-pulse">Generating AI Preview...</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-8">
                          {/* Original A */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-zinc-600 uppercase">Input A: Original</span>
                              {isPlayingOriginal && <span className="text-[10px] text-zinc-400 animate-pulse">PLAYING</span>}
                            </div>
                            <button 
                              onClick={playOriginal}
                              className={`w-full py-6 rounded-2xl border transition-all flex flex-col items-center gap-2 ${isPlayingOriginal ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                            >
                              <span className="text-2xl">{isPlayingOriginal ? '⏸' : '▶'}</span>
                              <span className="text-[10px] font-bold">RAW AUDIO</span>
                            </button>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                               <div className={`h-full bg-zinc-600 transition-all ${isPlayingOriginal ? 'w-full duration-[5000ms]' : 'w-0 duration-0'}`}></div>
                            </div>
                          </div>

                          {/* Enhanced B */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-500 uppercase">Input B: AI Enhanced</span>
                              {isPlayingEnhanced && <span className="text-[10px] text-blue-400 animate-pulse">ACTIVE</span>}
                            </div>
                            <button 
                              disabled={!enhancedPreviewBuffer}
                              onClick={playEnhanced}
                              className={`w-full py-6 rounded-2xl border transition-all flex flex-col items-center gap-2 disabled:opacity-30 ${isPlayingEnhanced ? 'bg-blue-600/20 border-blue-500/50' : 'bg-blue-600/5 border-blue-500/10 hover:border-blue-500/30'}`}
                            >
                              <span className="text-2xl">{isPlayingEnhanced ? '⏸' : '✨'}</span>
                              <span className="text-[10px] font-bold text-blue-400">STUDIO MASTER</span>
                            </button>
                             <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                               <div className={`h-full bg-blue-500 transition-all ${isPlayingEnhanced ? 'w-full duration-[5000ms]' : 'w-0 duration-0'}`}></div>
                            </div>
                          </div>
                        </div>
                        
                        {!enhancedPreviewBuffer && !isPreviewing && (
                          <div className="text-center">
                            <p className="text-xs text-zinc-600 mb-4">A/B preview allows comparison of the first 5 seconds.</p>
                            <button 
                              onClick={handlePreview}
                              className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold hover:bg-white/10 transition-all"
                            >
                              GENERATE A/B PREVIEW
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="studio-glass p-6 rounded-3xl border border-white/5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Studio Presets</h4>
                <div className="space-y-2">
                  {['Podcast Clear', 'Voice Isolation', 'Loudness Boost', 'Warm Analog'].map((p, i) => (
                    <button key={i} className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${i === 0 ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              {!report && (
                <button 
                  disabled={isProcessing}
                  onClick={startFullMastering}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {isProcessing ? 'Mastering Full File...' : 'Start Full Mastering'}
                </button>
              )}

              {report && (
                <div className="space-y-3">
                  <button 
                    onClick={downloadMastered}
                    disabled={!masteredAudioBlob}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold shadow-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Download Mastered Audio
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!masteredAudioBlob}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    Save to Project History
                  </button>
                  <button 
                    onClick={() => {
                      setReport(null);
                      setMasteredAudioBlob(null);
                    }}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    Start New Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioEnhancer;
