import React, { useMemo, useState } from 'react';
import { useHealth } from '../store/HealthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { X, Sparkles, PlusCircle, MessageSquare, Watch, Settings as SettingsIcon } from 'lucide-react';

export function Dashboard() {
  const { profile, vitals, sleep, dashboardPreferences, updateDashboardPreference, dailyProgress } = useHealth();
  const [guideDismissed, setGuideDismissed] = useState(() => localStorage.getItem('health_guide_dismissed') === 'true');
  const [showSettings, setShowSettings] = useState(false);

  const dismissGuide = () => {
    setGuideDismissed(true);
    localStorage.setItem('health_guide_dismissed', 'true');
  };

  const formattedSleep = useMemo(() => {
    return sleep.map(s => {
      let qualityScore = 2; // Default Fair
      if (s.quality === 'Excellent') qualityScore = 3;
      if (s.quality === 'Good') qualityScore = 2;
      if (s.quality === 'Fair') qualityScore = 1;
      
      return {
        ...s,
        displayDate: format(parseISO(s.timestamp), 'MMM dd'),
        qualityScore
      };
    });
  }, [sleep]);

  const recentVitals = [...vitals].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return (
    <div className="w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-500 h-full">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-100 dark:bg-zinc-800" />
          ) : (
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
              {profile?.name?.[0] || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Intelligence Dashboard</h1>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                  FHIR Ready
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-900/30">
                  A2A Active
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.name}.</p>
          </div>
        </div>
        <div className="flex gap-2 relative">
            <button className="p-2 relative text-gray-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm focus:outline-none group">
               <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
               {/* Tooltip for the bell */}
               <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] p-4 hidden group-focus-within:block group-hover:block transition-all animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">Recent Notifications</h3>
                   <span className="text-[10px] text-blue-600 font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded">1 NEW</span>
                 </div>
                 <div className="space-y-3">
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                      <p className="text-[11px] text-blue-900 dark:text-blue-100 font-medium leading-relaxed">System Insight: Your heart rate HRV trend is increasing. This indicates good recovery.</p>
                      <p className="text-[9px] text-blue-500 mt-1 font-bold">2 MINUTES AGO</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">Daily Goal Met: You've reached 100% of your water intake goal!</p>
                      <p className="text-[9px] text-gray-400 mt-1 font-bold">3 HOURS AGO</p>
                    </div>
                 </div>
               </div>
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm focus:outline-none"
            >
               <SettingsIcon size={18} />
            </button>
            <button className="px-4 py-2 text-xs font-bold text-gray-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">View Raw Logs</button>
            <button className="px-4 py-2 text-xs font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-colors shadow-sm">Generate Report</button>
            
            {showSettings && (
              <div className="absolute top-12 right-0 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Dashboard Customization</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                     <span className="text-sm text-gray-700 dark:text-gray-300">Heart Rate Card</span>
                     <input type="checkbox" checked={dashboardPreferences.showHeartRate} onChange={(e) => updateDashboardPreference('showHeartRate', e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                     <span className="text-sm text-gray-700 dark:text-gray-300">Blood Pressure Card</span>
                     <input type="checkbox" checked={dashboardPreferences.showBloodPressure} onChange={(e) => updateDashboardPreference('showBloodPressure', e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                     <span className="text-sm text-gray-700 dark:text-gray-300">Sleep Card</span>
                     <input type="checkbox" checked={dashboardPreferences.showSleep} onChange={(e) => updateDashboardPreference('showSleep', e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                  </label>
                </div>
              </div>
            )}
        </div>
      </header>

      {!guideDismissed && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative flex flex-col md:flex-row gap-6 shrink-0 border border-white/10">
           <button onClick={dismissGuide} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white">
              <X size={16} />
           </button>
           <div className="flex-1">
             <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-blue-200" />
                <h2 className="text-xl font-bold">Getting Started with HealthAI</h2>
             </div>
             <p className="text-blue-100 text-sm mb-6 max-w-xl leading-relaxed">
               Welcome to your personal health intelligence hub. Here are three quick ways to start capturing value from your data pipelines immediately.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/settings" className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all group">
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Watch size={16} />
                   </div>
                   <h3 className="font-semibold text-sm mb-1">1. Connect Wearables</h3>
                   <p className="text-xs text-blue-200">Sync HealthKit or Google Fit in Settings.</p>
                </Link>
                <Link to="/log" className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all group">
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <PlusCircle size={16} />
                   </div>
                   <h3 className="font-semibold text-sm mb-1">2. Log Manual Data</h3>
                   <p className="text-xs text-blue-200">Manually add your baseline vitals and sleep.</p>
                </Link>
                <Link to="/copilot" className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all group">
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <MessageSquare size={16} />
                   </div>
                   <h3 className="font-semibold text-sm mb-1">3. Talk to Copilot</h3>
                   <p className="text-xs text-blue-200">Upload a symptom image or use live voice.</p>
                </Link>
             </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 shrink-0">
        {dashboardPreferences.showHeartRate && (
          <div className="glass-card p-5 rounded-3xl flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Heart Rate</span>
              <span className="text-[10px] text-green-500 font-bold bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded">STABLE</span>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-3xl font-light text-gray-900 dark:text-gray-100">{recentVitals?.heartRate || '--'}</span>
              <span className="text-sm text-gray-400 font-medium">bpm</span>
            </div>
          </div>
        )}
        {dashboardPreferences.showBloodPressure && (
          <div className="glass-card p-5 rounded-3xl flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Blood Pressure</span>
              <span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">NORMAL</span>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-3xl font-light text-gray-900 dark:text-gray-100">{recentVitals ? `${recentVitals.sysBp}/${recentVitals.diaBp}` : '--/--'}</span>
              <span className="text-sm text-gray-400 font-medium">mmHg</span>
            </div>
          </div>
        )}
        {dashboardPreferences.showSleep && (
          <div className="glass-card p-5 rounded-3xl flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Sleep (7d)</span>
              <span className="text-[10px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded">LOW</span>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-3xl font-light text-gray-900 dark:text-gray-100">
                {sleep.length > 0 ? (sleep.reduce((acc, curr) => acc + curr.hours, 0) / sleep.length).toFixed(1) : '--'}
              </span>
              <span className="text-sm text-gray-400 font-medium">hours</span>
            </div>
          </div>
        )}

        {/* Daily Goals Progress */}
        <div className="glass-card p-5 rounded-3xl flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Steps</span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", 
              (dailyProgress?.steps || 0) >= (profile?.dailyGoals?.steps || 10000) ? "text-green-500 bg-green-50 dark:bg-green-500/10" : "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
            )}>
              {Math.min(100, Math.round(((dailyProgress?.steps || 0) / (profile?.dailyGoals?.steps || 10000)) * 100))}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-3xl font-light text-gray-900 dark:text-gray-100">{dailyProgress?.steps || 0}</span>
            <span className="text-sm text-gray-400 font-medium">/ {profile?.dailyGoals?.steps || 10000}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Water</span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", 
              (dailyProgress?.water || 0) >= (profile?.dailyGoals?.water || 2000) ? "text-green-500 bg-green-50 dark:bg-green-500/10" : "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
            )}>
              {Math.min(100, Math.round(((dailyProgress?.water || 0) / (profile?.dailyGoals?.water || 2000)) * 100))}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-3xl font-light text-gray-900 dark:text-gray-100">{dailyProgress?.water || 0}</span>
            <span className="text-sm text-gray-400 font-medium">/ {profile?.dailyGoals?.water || 2000} ml</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 glass-card p-8 rounded-3xl flex flex-col min-h-0">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Biometric Pattern Analysis</h2>
            <p className="text-sm text-gray-400">Rolling deviation from canonical baseline</p>
          </div>
          <div className="flex-1 min-h-0 flex gap-8 flex-col lg:flex-row">
            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Sleep Duration (hrs)</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedSleep} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                      dx={-10}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{payload[0].value} Hours</p>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 font-medium italic">Duration logged via {payload[0].payload.source}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#3b82f6' }}
                      activeDot={{ r: 6, fill: '#1d4ed8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Sleep Quality Trend</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedSleep} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                      dx={-10}
                      domain={[0, 4]}
                      ticks={[1, 2, 3]}
                      tickFormatter={(val) => val === 1 ? 'Fair' : val === 2 ? 'Good' : val === 3 ? 'Excellent' : ''}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = payload[0].value;
                          const quality = val === 1 ? 'Fair' : val === 2 ? 'Good' : val === 3 ? 'Excellent' : 'Poor';
                          return (
                            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 italic">{quality} Quality</p>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 font-medium">Metric score: {val}/3</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="qualityScore" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#8b5cf6' }}
                      activeDot={{ r: 6, fill: '#7c3aed' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[400px] flex flex-col shrink-0 min-h-0">
          <div className="glass-card p-6 rounded-3xl flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insight Feed</h2>
              <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 font-medium">v1.2 Canonical</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40">
                    <div className="p-2 bg-blue-500 rounded-xl text-white shrink-0 mt-1 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
                            Predictive Insight: Based on your logs, your sleep duration dropped.
                        </p>
                        <Link 
                            to="/copilot"
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors inline-block mt-2 tracking-wide uppercase">
                            Discuss with Copilot &rarr;
                        </Link>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
