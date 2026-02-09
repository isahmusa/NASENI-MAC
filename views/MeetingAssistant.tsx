
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as mammoth from 'mammoth';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface MeetingAssistantProps {
  onSyncContext?: (text: string, name: string) => void;
}

const MeetingAssistant: React.FC<MeetingAssistantProps> = ({ onSyncContext }) => {
  const [agenda, setAgenda] = useState('');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsLoading(true);
      const reader = new FileReader();
      
      try {
        if (file.name.toLowerCase().endsWith('.docx')) {
          reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            try {
              const result = await mammoth.extractRawText({ arrayBuffer });
              const text = result.value;
              setAgenda(text);
              onSyncContext?.(text, file.name);
            } catch (err) {
              console.error("Error parsing docx", err);
              alert("Could not parse MS Word document. Please ensure it is a valid .docx file.");
            } finally {
              setIsLoading(false);
            }
          };
          reader.readAsArrayBuffer(file);
        } else {
          reader.onload = (event) => {
            const content = event.target?.result as string;
            setAgenda(content);
            onSyncContext?.(content, file.name);
            setIsLoading(false);
          };
          reader.readAsText(file);
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        alert("An error occurred while uploading the file.");
      }
    }
  };

  const startMeeting = () => {
    if (!agenda.trim()) return;
    setIsMeetingActive(true);
    setMessages([
      { 
        role: 'model', 
        text: "The document has been successfully processed. I have analyzed the agenda items and I'm ready to facilitate the discussion. Which specific item would the MAC committee like to address first?" 
      }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are the MAC Studio Meeting Facilitator, an advanced AI designed to assist the MAC (Media & Communications) committee. 
          You have been provided with an official agenda document.
          
          MANDATORY INSTRUCTIONS:
          1. Base your responses EXCLUSIVELY on the provided agenda content.
          2. Actively analyze the items, proposing potential discussion points or clarifying complexities.
          3. Maintain a professional, executive, and helpful corporate tone.
          4. When users ask for a discussion, guide them through the agenda points logically.
          
          Document Content:
          ${agenda}
          
          Identify key action points and decisions as the conversation progresses.`,
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the discussion engine. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMeetingActive) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Meeting Intelligence</h2>
          <p className="text-zinc-500 text-lg">Upload MS Word or Text agendas for an AI-facilitated MAC discussion.</p>
        </div>

        <div className="studio-glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Meeting Agenda Content</label>
              {fileName && (
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
                  Loaded: {fileName}
                </span>
              )}
            </div>
            {isLoading && !isMeetingActive ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Analyzing Document...</span>
                </div>
              </div>
            ) : null}
            <textarea 
              value={agenda}
              onChange={(e) => {
                setAgenda(e.target.value);
                onSyncContext?.(e.target.value, 'Pasted Content');
              }}
              placeholder="The contents of your uploaded document or pasted text will appear here for verification..."
              className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none placeholder:text-zinc-700 font-mono text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all group border-spacing-4">
               <input type="file" className="hidden" accept=".docx,.txt,.md" onChange={handleFileUpload} />
               <span className="text-xl group-hover:scale-110 transition-transform">📁</span>
               <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                 {fileName ? 'Change MS Document' : 'Upload MS Word / Text Agenda'}
               </span>
            </label>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {setAgenda(''); setFileName(null); onSyncContext?.('', '');}}
                className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all active:scale-95"
              >
                Clear
              </button>
              <button 
                onClick={startMeeting}
                disabled={!agenda.trim() || isLoading}
                className="px-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Launch Discussion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                <span className="animate-pulse text-blue-500 text-xs">●</span>
            </div>
            <div>
                <h3 className="font-bold">Active MAC Session</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">facilitated Analysis in progress</p>
            </div>
        </div>
        <button 
          onClick={() => setIsMeetingActive(false)}
          className="px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/10 rounded-xl text-xs font-bold transition-all"
        >
          Close Session
        </button>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col studio-glass rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-zinc-300 rounded-tl-none shadow-inner'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[10px] font-bold text-zinc-500 ml-2 uppercase tracking-tighter">Analyzing</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-black/20 border-t border-white/5 flex gap-4">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about specific agenda items or request an analysis..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-zinc-700"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-8 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-95"
            >
              Analyze
            </button>
          </form>
        </div>

        {/* Agenda Reference Sidebar */}
        <div className="w-80 hidden lg:flex flex-col gap-6">
            <div className="studio-glass p-6 rounded-[2rem] border border-white/5 flex-1 overflow-y-auto bg-black/20 shadow-inner">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex justify-between">
                  <span>Document Context</span>
                  <span className="text-blue-500/50">#OFFICIAL</span>
                </h4>
                <div className="prose prose-invert prose-xs">
                    <p className="text-zinc-400 text-[11px] italic leading-relaxed whitespace-pre-wrap font-mono">
                        {agenda}
                    </p>
                </div>
            </div>
            <div className="studio-glass p-6 rounded-2xl border border-white/5 bg-blue-600/5 group">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Analysis Mode</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                    The AI Facilitator has full visibility into your MS Word document. You can request deep analysis of any item or ask for a summary of resolutions.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingAssistant;
