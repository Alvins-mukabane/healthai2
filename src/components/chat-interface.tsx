'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Mic, Camera, Sparkles, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { CameraModal } from './CameraModal';
import { LiveVoiceModal } from './LiveVoiceModal';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatInterface({ user }: { user: User }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: `Hello ${user.user_metadata?.full_name?.split(' ')[0] || 'there'}! I'm your HealthAI Copilot. How can I help you with your health goals today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'model', content: `**Error:** ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
        router.refresh();
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "_Sorry, I'm having trouble connecting right now._" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-slate-200 bg-white/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Health Copilot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Reasoning</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
                <Sparkles size={18} />
            </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex w-full ${message.role === 'user' ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] flex flex-col ${message.role === 'user' ? "items-end" : "items-start"}`}>
                  <div className={`rounded-[2rem] px-6 py-4 text-sm shadow-sm prose prose-slate max-w-none ${
                    message.role === 'user' 
                      ? "bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-200" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  }`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest px-2">
                    {message.role === 'user' ? 'You' : 'Copilot'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex justify-start"
            >
              <div className="bg-white border border-slate-100 rounded-[2rem] rounded-tl-none px-6 py-4 flex gap-1.5 shadow-sm items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                <button 
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <Camera size={20} />
                </button>
                <button 
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <Mic size={20} />
                </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your health..."
              className="w-full bg-white border border-slate-200 rounded-[2rem] pl-28 pr-16 py-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-xl shadow-slate-200/50 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <Sparkles size={12} className="text-amber-500" /> Advanced Reasoning Enabled
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <Paperclip size={12} /> HIPAA-Compliant Encryption
              </div>
          </div>
        </div>
      </div>

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={(img) => console.log('captured', img)} />
      <LiveVoiceModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} agentId="health_copilot" />
    </div>
  );
}
