
import React, { useState, useEffect } from 'react';
import { enhanceScript } from '../services/geminiService';
import { Project } from '../types';
import { PROJECT_TEMPLATES } from '../constants';

interface ScriptWriterProps {
  onSave?: (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => void;
  initialContent?: string;
  initialTone?: string;
  onClearTemplate?: () => void;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ onSave, initialContent, initialTone, onClearTemplate }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tone, setTone] = useState('Corporate Professional');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setInput(initialContent);
    }
    if (initialTone) {
      setTone(initialTone);
    }
    // Clean up if the component unmounts
    return () => onClearTemplate?.();
  }, [initialContent, initialTone]);

  const handleEnhance = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await enhanceScript(input, tone);
      setOutput(result || 'Failed to generate script.');
    } catch (err) {
      console.error(err);
      setOutput('Error connecting to AI. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (output && onSave) {
      onSave({
        type: 'script',
        name: `Script_${tone.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}`,
        data: output,
        metadata: { tone }
      });
    }
  };

  const selectTemplate = (tpl: typeof PROJECT_TEMPLATES[0]) => {
    setInput(tpl.content);
    setTone(tpl.tone);
    setShowTemplateSelector(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)] animate-in fade-in duration-500 relative">
      <div className="flex flex-col gap-6">
        <div className="studio-glass p-6 rounded-3xl border border-white/5 flex-1 flex flex-col shadow-inner relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-widest">Script Editor</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase"
              >
                {showTemplateSelector ? 'Close Templates' : 'Use Template'}
              </button>
              <span className="text-[10px] text-zinc-600">{input.length} characters</span>
            </div>
          </div>
          
          {showTemplateSelector ? (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide animate-in slide-in-from-top-4">
              {PROJECT_TEMPLATES.map(tpl => (
                <button 
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left group hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold group-hover:text-blue-400">{tpl.title}</span>
                    <span className="text-lg">{tpl.icon}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">{tpl.desc}</p>
                </button>
              ))}
            </div>
          ) : (
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your script idea, marketing copy, or radio ad draft here..."
              className="flex-1 bg-transparent border-none resize-none focus:outline-none text-zinc-200 leading-relaxed text-sm placeholder:text-zinc-700"
            />
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[#0d0d0f] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer text-white"
            >
              <optgroup label="Professional & Executive" className="bg-[#0d0d0f]">
                <option value="Corporate Professional">Corporate Professional</option>
                <option value="Formal Executive">Formal Executive</option>
                <option value="Educational & Explainer">Educational & Explainer</option>
              </optgroup>
              <optgroup label="Creative & Marketing" className="bg-[#0d0d0f]">
                <option value="Energetic Marketing">Energetic Marketing</option>
                <option value="Persuasive & Sales-driven">Persuasive & Sales-driven</option>
                <option value="Humorous & Witty">Humorous & Witty</option>
                <option value="Radio/TV Advertisement">Radio/TV Advertisement</option>
              </optgroup>
              <optgroup label="Social & Modern" className="bg-[#0d0d0f]">
                <option value="Social Media Casual">Social Media Casual</option>
                <option value="Informal & Friendly">Informal & Friendly</option>
                <option value="Inspiring Visionary">Inspiring Visionary</option>
              </optgroup>
            </select>
          </div>
          <button 
            disabled={isProcessing || !input.trim() || showTemplateSelector}
            onClick={handleEnhance}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            {isProcessing ? 'Polishing...' : 'Enhance Script'}
          </button>
        </div>
      </div>

      <div className="studio-glass p-8 rounded-3xl border border-white/5 bg-white/2 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-blue-400 uppercase text-xs tracking-widest">AI Polished Version</h3>
          {output && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(output);
                alert('Copied to clipboard!');
              }}
              className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
            >
              COPY TO CLIPBOARD
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          {isProcessing ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded-full animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
              ))}
            </div>
          ) : output ? (
            <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap animate-in slide-in-from-right-2">
              {output}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-4">
              <span className="text-4xl">✨</span>
              <p className="max-w-xs text-sm">Your professionally rebranded script will appear here after processing.</p>
            </div>
          )}
        </div>
        
        {output && !isProcessing && (
          <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
             <button 
              onClick={() => {
                const blob = new Blob([output], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `script-${tone.replace(/\s+/g, '-')}.txt`;
                a.click();
              }}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
             >
                Export as TXT
             </button>
             <button 
              onClick={handleSave}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
             >
                Save to Projects
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;
