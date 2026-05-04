import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../store/HealthStore';
import { chatWithHealthCopilot } from '../lib/gemini';
import { Send, User, ImagePlus, X, Mic, Camera as CameraIcon, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { SPECIALIST_AGENTS } from '../lib/agents';
import { LiveVoiceModal } from '../components/LiveVoiceModal';
import { CameraModal } from '../components/CameraModal';


type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
};

export function Copilot() {
  const { generateContextString, updateDashboardPreference, customAgentPrompts, updateCustomAgentPrompt } = useHealth();
  
  const defaultHistories = Object.keys(SPECIALIST_AGENTS).reduce((acc, key) => {
    const agent = (SPECIALIST_AGENTS as any)[key];
    acc[agent.id] = [{
      id: 'welcome-' + agent.id,
      role: 'model',
      content: `Welcome to the **${agent.name}**. I've analyzed your sleep patterns and vitals from your recent logs. How can I help you today?`
    }];
    return acc;
  }, {} as Record<string, Message[]>);

  const [activeAgentId, setActiveAgentId] = useState('symptom_agent');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState('');
  
  const activeAgentKey = Object.keys(SPECIALIST_AGENTS).find(k => (SPECIALIST_AGENTS as any)[k].id === activeAgentId) || 'Symptom';
  const activeAgentData = (SPECIALIST_AGENTS as any)[activeAgentKey];

  const openSettingsModal = () => {
    setEditingPrompt(customAgentPrompts[activeAgentId] || activeAgentData.systemPrompt);
    setIsSettingsModalOpen(true);
  };

  const saveCustomPrompt = () => {
    updateCustomAgentPrompt(activeAgentId, editingPrompt);
    setIsSettingsModalOpen(false);
  };

  const resetCustomPrompt = () => {
    updateCustomAgentPrompt(activeAgentId, '');
    setIsSettingsModalOpen(false);
  };

  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('health_copilot_histories');
    return saved ? JSON.parse(saved) : defaultHistories;
  });

  const messages = chatHistories[activeAgentId] || [];

  const updateActiveAgentMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setChatHistories(prev => {
      const current = prev[activeAgentId] || [];
      const updatedVal = typeof newMessages === 'function' ? newMessages(current) : newMessages;
      const next = { ...prev, [activeAgentId]: updatedVal };
      localStorage.setItem('health_copilot_histories', JSON.stringify(next));
      return next;
    });
  };
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts: Record<string, string[]> = {
    symptom_agent: ["Why am I tired?", "Analyze my heart rate trends", "Muscle fatigue after workouts"],
    nutrition_agent: ["Analyze my calorie intake", "Optimization for longevity", "Hydration consistency"],
    fitness_agent: ["Recovery score analysis", "Overtraining risk?", "Active minutes trend"],
    risk_agent: ["Biometric baseline deviations", "Longevity risk forecast", "HRV stability check"],
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAgentChange = (newAgentId: string) => {
    setActiveAgentId(newAgentId);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          url: URL.createObjectURL(file),
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg = input.trim() || (selectedImage ? "Analyze this image." : "");
    setInput('');
    
    updateActiveAgentMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userMsg,
      imageUrl: selectedImage?.url 
    }]);
    
    setIsLoading(true);

    const imageToSend = selectedImage;
    setSelectedImage(null);

    try {
      const historyMsg = messages
          .filter(m => !m.id.startsWith('welcome-'))
          .map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })) as { role: 'user'|'model', parts: any[]}[];

      const response = await chatWithHealthCopilot(
        userMsg, 
        historyMsg, 
        generateContextString(), 
        activeAgentKey, 
        imageToSend?.base64, 
        imageToSend?.mimeType,
        customAgentPrompts[activeAgentId]
      );
      
      let replyContent = response.text || "";

      if (response.action) {
        if (response.action.name === 'updateDashboard') {
          const args = response.action.args;
          if (args.showHeartRate !== undefined) updateDashboardPreference('showHeartRate', args.showHeartRate);
          if (args.showBloodPressure !== undefined) updateDashboardPreference('showBloodPressure', args.showBloodPressure);
          if (args.showSleep !== undefined) updateDashboardPreference('showSleep', args.showSleep);
        }
      }

      updateActiveAgentMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: replyContent }]);
    } catch (error) {
      console.error(error);
      updateActiveAgentMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center animate-in fade-in duration-500">
      <div className="w-full max-w-3xl flex flex-col glass-card rounded-3xl overflow-hidden shrink-0 shadow-sm h-full max-h-[850px]">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
          <div className="flex gap-2 bg-gray-100/50 dark:bg-zinc-900/50 p-1 rounded-xl overflow-x-auto max-w-full hide-scrollbar">
             {Object.values(SPECIALIST_AGENTS).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentChange(agent.id)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all shrink-0",
                    activeAgentId === agent.id ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-zinc-700" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  {agent.name.split(' ')[0]}
                </button>
             ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={openSettingsModal}
              className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg shadow-sm"
              title="Customize Agent Prompt"
            >
              <Settings size={14} />
            </button>
            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase min-w-max">v1.2 Agentic Mode</span>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50/30 dark:bg-zinc-950/30 min-h-0">
          {messages.map((message) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id} 
              className={cn("flex gap-3", message.role === 'user' ? "flex-row-reverse" : "")}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                message.role === 'user' ? "bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400" : "bg-blue-600 text-white"
              )}>
                {message.role === 'user' ? <User size={16} /> : <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
              
              <div className="flex flex-col gap-2 max-w-[80%]">
                  {message.imageUrl && (
                      <img src={message.imageUrl} alt="Uploaded" className="w-48 h-48 object-cover rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800" />
                  )}
                  <div className={cn(
                    "rounded-2xl p-4 shadow-sm text-sm leading-relaxed",
                    message.role === 'user' 
                      ? "bg-blue-600 text-white" 
                      : "bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-800 dark:text-gray-200 markdown-body inline-block"
                  )}>
                    {message.role === 'model' ? (
                      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 shadow-sm flex items-center gap-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="text-xs text-blue-500 font-medium tracking-wide">Reasoning via {((SPECIALIST_AGENTS as any)[activeAgentId]?.name || 'Agent')}...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 shrink-0">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 hide-scrollbar">
            {(suggestedPrompts[activeAgentId] || []).map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-bold rounded-xl border border-gray-200 dark:border-zinc-800 transition-all whitespace-nowrap uppercase tracking-wider"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
            {selectedImage && (
              <div className="relative w-16 h-16 ml-2 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img src={selectedImage.url} alt="To upload" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-0 right-0 bg-black/50 p-0.5 rounded-bl-md hover:bg-black/70">
                  <X size={12} className="text-white" />
                </button>
              </div>
            )}
            <div className="relative">
                <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Analyze my symptom, log, or upload an image..."
                className="w-full bg-gray-100 dark:bg-zinc-900 rounded-2xl pl-24 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                disabled={isLoading}
                />
                
                <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                  type="button"
                  onClick={() => setIsVoiceMode(true)}
                  className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 rounded-full"
                  disabled={isLoading}
                  title="Voice Mode"
                  >
                  <Mic size={18} />
                  </button>
                  <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  disabled={isLoading}
                  title="Upload Content"
                  >
                  <ImagePlus size={18} />
                  </button>
                  <button
                  type="button"
                  onClick={() => setIsCameraMode(true)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  disabled={isLoading}
                  title="Take Photo"
                  >
                  <CameraIcon size={18} />
                  </button>
                </div>

                <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute right-2 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:shadow-none transition-all hover:bg-blue-700"
                >
                <Send size={16} className={cn(isLoading && "opacity-50", "ml-0.5")} />
                </button>
            </div>
          </form>
          <div className="mt-3 text-center">
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
               Notice: HealthAI is not a diagnostic tool. Consult your doctor for medical decisions.
             </p>
          </div>
        </div>
      </div>
      
      {isVoiceMode && (
        <LiveVoiceModal onClose={() => setIsVoiceMode(false)} agentId={activeAgentId} />
      )}

      {isCameraMode && (
        <CameraModal 
          onClose={() => setIsCameraMode(false)} 
          onCapture={(base64, mimeType) => {
            setSelectedImage({ url: base64, base64, mimeType });
            setIsCameraMode(false);
          }} 
        />
      )}

      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-zinc-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-gray-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Customize Prompt: {activeAgentData.name}</h2>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-medium">
                Override the default system instructions for this specific agent. This completely replaces the default prompt and changes how it analyzes physiological data.
              </p>
              <textarea
                value={editingPrompt}
                onChange={(e) => setEditingPrompt(e.target.value)}
                spellCheck={false}
                className="w-full h-80 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-sm font-mono text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none custom-scrollbar shadow-inner"
              ></textarea>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
              <button 
                onClick={resetCustomPrompt}
                className="px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              >
                Reset to Default
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveCustomPrompt}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center border-b-2 border-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
