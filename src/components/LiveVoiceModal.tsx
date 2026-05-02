import React, { useState, useEffect, useRef } from 'react';
import { ai } from '@/lib/gemini';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, X, Activity, Loader2 } from 'lucide-react';
import { pcmEncode, pcmDecode } from '@/lib/audio-utils';
import { useHealth } from '@/store/HealthStore';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
}

export function LiveVoiceModal({ isOpen, onClose, agentId }: LiveVoiceModalProps) {
  if (!isOpen) return null;
  const { generateContextString } = useHealth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<string>('');

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback queue
  const playQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const startLive = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        audioContextRef.current = new window.AudioContext({ sampleRate: 16000 });
        const ctx = audioContextRef.current;

        sourceRef.current = ctx.createMediaStreamSource(stream);
        processorRef.current = ctx.createScriptProcessor(4096, 1, 1);
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              setIsConnecting(false);
              
              processorRef.current!.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const base64Data = pcmEncode(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };

              sourceRef.current!.connect(processorRef.current!);
              processorRef.current!.connect(ctx.destination);
              
              // Send initial context context
              sessionPromise.then(session => {
                 session.sendToolResponse({
                    functionResponses: [] // placeholder to force first message or we can send text
                 });
                 // To force reasoning with context, just send the context as text:
                 session.sendRealtimeInput({
                   text: "Hello! System context: " + generateContextString()
                 });
              });
            },
            onmessage: (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                  if (part.inlineData && part.inlineData.data) {
                     const floatArr = pcmDecode(part.inlineData.data);
                     playAudio(floatArr);
                  }
                  if (part.text) {
                     setTranscription((prev) => prev + " " + part.text);
                  }
                }
              }
              if (message.serverContent?.interrupted) {
                 playQueueRef.current = [];
                 isPlayingRef.current = false;
              }
            },
            onclose: () => {
              setIsConnected(false);
            },
            onerror: (err) => {
              console.error("Live API Error:", err);
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
            },
            systemInstruction: "You are the HealthAI Voice Copilot. Be very conversational and brief. Remember to act safely, don't diagnose, don't prescribe.",
          }
        });

        sessionRef.current = await sessionPromise;

      } catch (err) {
        console.error("Microphone or API error:", err);
        setIsConnecting(false);
      }
    };

    startLive();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (processorRef.current) processorRef.current.disconnect();
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []); // eslint-disable-line

  const playAudio = (audioData: Float32Array) => {
    playQueueRef.current.push(audioData);
    if (!isPlayingRef.current) {
       processPlayQueue();
    }
  };

  const processPlayQueue = () => {
    if (!playQueueRef.current.length || !audioContextRef.current) {
       isPlayingRef.current = false;
       return;
    }
    isPlayingRef.current = true;
    const audioData = playQueueRef.current.shift()!;
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const buffer = audioCtx.createBuffer(1, audioData.length, 16000);
    buffer.copyToChannel(audioData as any, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    
    // Gapless playback calc
    const now = audioCtx.currentTime;
    if (startTimeRef.current < now) {
      startTimeRef.current = now;
    }
    source.start(startTimeRef.current);
    startTimeRef.current += buffer.duration;

    source.onended = () => {
      processPlayQueue();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 p-2 rounded-full">
           <X size={18} />
        </button>

        <div className="mb-12 mt-6 flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${isConnected ? 'bg-blue-600/20 shadow-[0_0_40px_rgba(37,99,235,0.3)] animate-pulse' : 'bg-zinc-800'}`}>
                {isConnecting ? (
                   <Loader2 className="animate-spin text-blue-500" size={48} />
                ) : (
                   <Activity size={48} className={isConnected && !isMuted ? "text-blue-500" : "text-zinc-600"} />
                )}
            </div>
            <h2 className="text-white font-bold text-xl mt-8">Voice Copilot</h2>
            <p className="text-zinc-400 text-sm mt-2">{isConnecting ? 'Connecting to intelligence...' : (isConnected ? 'Listening...' : 'Disconnected')}</p>
        </div>

        <div className="w-full max-h-32 overflow-y-auto mb-8 px-4 text-center">
             <p className="text-zinc-300 text-sm leading-relaxed italic">{transcription || "..."}</p>
        </div>

        <div className="flex gap-4">
           {isConnected && (
               <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
               >
                   {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
               </button>
           )}
           <button onClick={onClose} className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition">
               <X size={24} />
           </button>
        </div>
      </div>
    </div>
  );
}
