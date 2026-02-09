
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { NASENI_2026_STRATEGY } from '../constants';

// Guidelines: Implementation of manual decode/encode for raw PCM
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
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

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface VoiceAssistantProps {
  onCommand: (command: string) => void;
  isLoggedIn: boolean;
  userName?: string;
  externalContext?: string;
  activeDocumentName?: string | null;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand, isLoggedIn, userName, externalContext, activeDocumentName }) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [transcript, setTranscript] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const navigateToFunction: FunctionDeclaration = {
    name: 'navigateTo',
    parameters: {
      type: Type.OBJECT,
      description: 'Navigates the user to a specific module or page within the MAC Studio application.',
      properties: {
        view: {
          type: Type.STRING,
          description: 'The ID of the view to navigate to.',
          enum: ['dashboard', 'photo', 'audio', 'scripts', 'meetings', 'projects'],
        },
      },
      required: ['view'],
    },
  };

  const startAssistant = useCallback(async () => {
    try {
      setIsActive(true);
      setStatus('Connecting...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Active');
            
            // Send initial context immediately
            sessionPromise.then((session) => {
              session.sendRealtimeInput({
                 text: `Greetings. I am the MAC Assistant. I have full knowledge of the NASENI 2026 Strategy. ${activeDocumentName ? `I am also synchronized with the active document: ${activeDocumentName}` : 'The workspace is ready'}.`
              });
            });

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'navigateTo') {
                  const view = (fc.args as any).view;
                  onCommand(view);
                  sessionPromise.then((session) => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: `Success. Navigated to ${view}` },
                      }
                    });
                  });
                }
              }
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              setIsSpeaking(true);
              setStatus('Speaking');
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputCtx, 24000, 1);
              
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }

            if (message.serverContent?.inputTranscription) {
              setTranscript(message.serverContent.inputTranscription.text);
            }
          },
          onerror: (e) => setStatus('Error'),
          onclose: () => {
            setIsActive(false);
            setStatus('Standby');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          tools: [{ functionDeclarations: [navigateToFunction] }],
          systemInstruction: `IDENTITY: You are the "MAC Studio AI Agent". You are an elite NASENI communications expert.

PERMANENT KNOWLEDGE (2026 STRATEGY):
${NASENI_2026_STRATEGY}

DYNAMIC CONTEXT:
${externalContext ? `USER DOCUMENT (${activeDocumentName}): ${externalContext}` : "No specific meeting document is loaded."}

CORE GUIDELINES:
1. You know EVERYTHING about the 2026 Media Strategy. If asked about priorities, phases, or narrative pillars, answer using the permanent knowledge above.
2. If asked about the specific document the user is working on, use the 'Dynamic Context' section.
3. VOICE: Professional, executive, Nigerian corporate tone. Friendly but authoritative.
4. MANDATORY: Respond ONLY in English. NEVER use Arabic or any other language.
5. Identify as being "Synced with the 2026 Strategy Engine".`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed');
      setIsActive(false);
    }
  }, [onCommand, isLoggedIn, userName, externalContext, activeDocumentName]);

  const stopAssistant = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    setStatus('Standby');
    for (const source of sourcesRef.current.values()) {
      source.stop();
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {isActive && (
        <div className="studio-glass p-5 rounded-[2.5rem] w-80 shadow-2xl animate-in slide-in-from-bottom-4 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSpeaking ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSpeaking ? 'bg-blue-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">{isSpeaking ? 'Agent Speaking' : status}</span>
            </div>
            {externalContext && (
               <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[8px] font-bold text-blue-400 uppercase">Context Synced</span>
               </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-300 italic leading-relaxed max-h-24 overflow-y-auto scrollbar-hide font-medium">
            {transcript || (activeDocumentName ? `Syncing with ${activeDocumentName}...` : "Consulting 2026 Strategy...")}
          </p>
        </div>
      )}
      <button
        onClick={isActive ? stopAssistant : startAssistant}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all duration-500 transform hover:scale-110 active:scale-95 group relative ${
          isActive 
            ? 'bg-red-500' 
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isActive ? (
          <span className="text-xl">⏹️</span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-2xl">🎙️</span>
            <span className="text-[8px] font-bold mt-1 text-white/60">MAC AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
