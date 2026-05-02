import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../store/HealthStore';
import { Activity, Smartphone, Watch, Plus, Check, Loader2, Heart, Terminal as TerminalIcon, ShieldCheck, FileText, User, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

type Wearable = 'apple_healthkit' | 'google_fit' | 'samsung_health' | 'fitbit';

const INTEGRATIONS = [
  { id: 'apple_healthkit', name: 'Apple HealthKit', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  { id: 'google_fit', name: 'Google Fit', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'samsung_health', name: 'Samsung Health', icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 'fitbit', name: 'Fitbit', icon: Watch, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
] as const;

export function Settings() {
  const { profile, setProfile, vitals, sleep, consentPreferences, updateConsent, consentHistory, syncWearableData, syncHistory, integrationPreferences, updateIntegrationPreference } = useHealth();
  const [connecting, setConnecting] = useState<Wearable | null>(null);
  const [connected, setConnected] = useState<Wearable[]>(['google_fit']);
  const [syncState, setSyncState] = useState<Record<string, { status: 'idle' | 'syncing' | 'success' | 'error', message?: string }>>({});
  
  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['HealthAI Terminal v1.2', 'Type "help" for commands.']);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleConnect = async (id: Wearable) => {
    if (connected.includes(id)) {
      setConnected(prev => prev.filter(w => w !== id));
      setTerminalHistory(prev => [...prev, `> Disconnected ${id}`]);
      setSyncState(prev => ({ ...prev, [id]: { status: 'idle' } }));
      return;
    }
    
    setConnecting(id);
    setSyncState(prev => ({ ...prev, [id]: { status: 'syncing' } }));
    setTerminalHistory(prev => [...prev, `> Initiating OAuth flow for ${id}...`]);
    
    // Attempt sync
    try {
      if (id !== 'samsung_health') {
        await syncWearableData(id as 'apple_healthkit' | 'google_fit' | 'fitbit');
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!connected.includes(id)) setConnected(prev => [...prev, id]);
      setSyncState(prev => ({ ...prev, [id]: { status: 'success' } }));
      setTerminalHistory(prev => [...prev, `> Successfully authenticated with ${id}`, `> Pipeline initialized & mocked historical data synced.`]);
    } catch (err: any) {
      setSyncState(prev => ({ ...prev, [id]: { status: 'error', message: err.message } }));
      setTerminalHistory(prev => [...prev, `> Error syncing ${id}: ${err.message}`]);
    } finally {
      setConnecting(null);
    }
  };

  const executeCommand = (cmd: string) => {
    const args = cmd.trim().toLowerCase().split(' ');
    const command = args[0];
    
    let response = '';
    switch (command) {
      case 'help':
        response = 'Commands: help, clear, status, sync [device], reset-onboarding';
        break;
      case 'clear':
        setTerminalHistory([]);
        return;
      case 'status':
        response = `Profile: ${profile?.name} | Vitals: ${vitals.length} | Sleep: ${sleep.length}`;
        break;
      case 'sync':
        response = args[1] ? `Forcing manual sync with ${args[1]}...` : 'Please specify a device';
        if (args[1] === 'apple_healthkit' || args[1] === 'google_fit' || args[1] === 'fitbit') {
           syncWearableData(args[1] as any);
        }
        break;
      case 'reset-onboarding':
        localStorage.removeItem('health_onboarded');
        response = 'Onboarding flag cleared. Reload application to restart setup.';
        break;
      default:
        response = `Command not found: ${command}`;
    }
    
    setTerminalHistory(prev => [...prev, `user@healthai:~$ ${cmd}`, response]);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    executeCommand(terminalInput);
    setTerminalInput('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 flex flex-col min-h-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Settings & Rules Engine</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage data pipelines, wearbles, and security compliance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Settings */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col gap-6 lg:col-span-2">
           <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                 <User className="text-purple-500" size={24} />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Profile</h2>
                  <p className="text-sm text-gray-500">Manage your avatar and personal details</p>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
             <div className="relative">
               {profile?.avatarUrl ? (
                 <img src={profile.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-gray-100 dark:bg-zinc-800" />
               ) : (
                 <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm">
                   <User size={32} className="text-gray-400" />
                 </div>
               )}
               <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl cursor-pointer hover:bg-blue-700 shadow-sm border-2 border-white dark:border-zinc-950 transition-colors">
                  <Camera size={14} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && profile) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile({ ...profile, avatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
               </label>
             </div>
             <div className="flex-1 space-y-3">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Display Name</label>
                 <input 
                   type="text" 
                   value={profile?.name || ''} 
                   onChange={(e) => {
                     if(profile) {
                       setProfile({ ...profile, name: e.target.value });
                     }
                   }}
                   className="w-full sm:max-w-xs px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                 />
               </div>
             </div>
           </div>
        </div>

        {/* Consent Management System */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col gap-6 row-span-2">
           <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                 <ShieldCheck className="text-green-500" size={24} />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Consent & Privacy</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Granular control over your health data flows.</p>
              </div>
           </div>

           <div className="space-y-4">
             <ConsentToggle 
                title="Analytical Data Sync" 
                description="Allow HealthAI to store normalized vitals and metrics for trend processing."
                enabled={consentPreferences.analyticalData}
                onToggle={(v) => updateConsent('analyticalData', v)}
             />
             <ConsentToggle 
                title="AI Agent Processing" 
                description="Allow passing your context string securely to LLM agents (Gemini) for Copilot reasoning."
                enabled={consentPreferences.aiProcessing}
                onToggle={(v) => updateConsent('aiProcessing', v)}
             />
             <ConsentToggle 
                title="Push Notifications" 
                description="Receive alerts for important health insights or reminders to log data."
                enabled={consentPreferences.pushNotifications}
                onToggle={(v) => {
                  if (v) {
                    if (window.confirm("Simulating push notification permission prompt: Allow notifications?")) {
                      updateConsent('pushNotifications', v);
                    }
                  } else {
                    updateConsent('pushNotifications', v);
                  }
                }}
             />
             <ConsentToggle 
                title="Third-Party De-identified Sharing" 
                description="Opt-in to sharing anonymized metrics with research partners. Strict HIPAA scope."
                enabled={consentPreferences.thirdPartySharing}
                onToggle={(v) => updateConsent('thirdPartySharing', v)}
             />
           </div>

           <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                 <FileText size={16} className="text-gray-400" /> Consent Audit Log
               </h3>
               <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {consentHistory.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs p-3 rounded-lg bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/50">
                        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                           <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                           <span className={cn("px-2 font-bold uppercase", item.action === 'opt_in' ? "text-green-500" : "text-amber-500")}>
                             {item.action.replace('_', ' ')}
                           </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{item.details}</p>
                    </div>
                  ))}
                  {consentHistory.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No logged events yet.</p>}
               </div>
           </div>
        </div>

        {/* Integrations Card */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Watch size={20} className="text-blue-600" /> Web APIs & Wearables
          </h2>
          <div className="space-y-4">
            {INTEGRATIONS.map((integration) => {
              const isConnected = connected.includes(integration.id);
              const isConnecting = connecting === integration.id;
              const status = syncState[integration.id];
              
              return (
                <div key={integration.id} className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center relative", integration.bg)}>
                        <integration.icon size={20} className={integration.color} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{integration.name}</h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {status?.status === 'syncing' ? <span className="text-blue-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Syncing in progress...</span> :
                           status?.status === 'success' ? <span className="text-green-500 font-medium">Connected & Synced</span> :
                           status?.status === 'error' ? <span className="text-red-500 font-medium" title={status.message}>Sync Failed</span> :
                           isConnected ? <span className="text-gray-700 dark:text-gray-300">Connected</span> : 'Not connected'}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleConnect(integration.id)}
                      disabled={isConnecting}
                      className={cn(
                        "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2",
                        isConnected 
                          ? "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 hover:border-red-200" 
                          : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                      )}
                    >
                      {isConnecting ? <Loader2 size={14} className="animate-spin" /> : (
                        isConnected ? 'Disconnect' : 'Connect'
                      )}
                    </button>
                  </div>
                  
                  {isConnected && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={integrationPreferences[integration.id]?.heartRate ?? true} onChange={(e) => updateIntegrationPreference(integration.id, 'heartRate', e.target.checked)} className="form-checkbox h-3 w-3 text-blue-600 rounded" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Heart Rate</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={integrationPreferences[integration.id]?.bloodPressure ?? true} onChange={(e) => updateIntegrationPreference(integration.id, 'bloodPressure', e.target.checked)} className="form-checkbox h-3 w-3 text-blue-600 rounded" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Blood Pressure</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={integrationPreferences[integration.id]?.sleep ?? true} onChange={(e) => updateIntegrationPreference(integration.id, 'sleep', e.target.checked)} className="form-checkbox h-3 w-3 text-blue-600 rounded" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Sleep</span>
                      </label>
                    </div>
                  )}
                  {status?.status === 'error' && status.message && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-xs text-red-600 dark:text-red-400">
                      {status.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Developer Terminal */}
        <div className="glass-card rounded-3xl shadow-sm overflow-hidden flex flex-col h-[300px]">
           <div className="bg-gray-900 dark:bg-zinc-950 px-4 py-3 border-b border-gray-800 dark:border-zinc-900 flex items-center gap-2 shrink-0">
             <TerminalIcon size={16} className="text-gray-400" />
             <span className="text-xs font-mono text-gray-400">Data Normalization Terminal</span>
           </div>
           <div className="bg-black flex-1 p-4 overflow-y-auto font-mono text-sm shadow-inner flex flex-col">
              <div className="flex-1 space-y-1 mb-4 text-green-400/90">
                 {terminalHistory.map((line, i) => (
                   <div key={i} className="break-words max-w-full">{line}</div>
                 ))}
                 <div ref={terminalEndRef} />
              </div>
              
              <form onSubmit={handleTerminalSubmit} className="flex gap-2 text-green-400 shrink-0">
                 <span className="text-green-500 select-none">user@healthai:~$</span>
                 <input 
                   type="text" 
                   value={terminalInput}
                   onChange={(e) => setTerminalInput(e.target.value)}
                   className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono focus:ring-0 p-0"
                   spellCheck="false"
                   autoComplete="off"
                 />
              </form>
           </div>
        </div>

        {/* Sync History Log */}
        <div className="glass-card rounded-3xl shadow-sm overflow-hidden flex flex-col h-[300px] lg:col-span-2">
           <div className="bg-white dark:bg-zinc-950 px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2 shrink-0">
             <Activity size={18} className="text-blue-500" />
             <span className="font-bold text-gray-900 dark:text-gray-100">Sync History</span>
           </div>
           <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-zinc-900/30 custom-scrollbar relative">
              <div className="absolute left-8 top-6 bottom-6 w-px bg-gray-200 dark:bg-zinc-800"></div>
              
              <div className="space-y-6">
                {syncHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center relative z-10 py-10">No sync attempts yet.</p>
                ) : (
                  syncHistory.map((log, idx) => (
                    <div key={idx} className="flex gap-4 relative z-10">
                      <div className={cn("w-4 h-4 rounded-full mt-1 shrink-0 border-2 items-center justify-center flex bg-white dark:bg-zinc-900", 
                        log.status === 'success' ? 'border-green-500' : 'border-red-500'
                      )}>
                        {log.status === 'success' ? <Check size={10} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-100">{log.source.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className={cn("text-sm", log.status === 'success' ? "text-gray-600 dark:text-gray-400" : "text-red-600 dark:text-red-400")}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function ConsentToggle({ title, description, enabled, onToggle }: { title: string, description: string, enabled: boolean, onToggle: (val: boolean) => void }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-100 dark:border-zinc-800/50">
       <button 
          onClick={() => onToggle(!enabled)}
          className={cn(
             "w-12 h-6 rounded-full shrink-0 transition-colors relative flex items-center mt-1 outline-none",
             enabled ? "bg-green-500" : "bg-gray-300 dark:bg-zinc-700"
          )}
       >
          <div className={cn(
             "w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute border border-gray-200 dark:border-zinc-800/50",
             enabled ? "translate-x-6" : "translate-x-1"
          )} />
       </button>
       <div>
         <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200">{title}</h4>
         <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
       </div>
    </div>
  );
}
