'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Activity, Info, MessageSquare, ArrowRight } from 'lucide-react';

interface DashboardContentProps {
  user: any;
  profile: any;
  recentVitals: any[];
}

export default function DashboardContent({ user, profile, recentVitals }: DashboardContentProps) {
  const formattedVitals = useMemo(() => {
    return [...recentVitals]
      .reverse()
      .map(v => ({
        ...v,
        displayDate: format(new Date(v.recorded_at), 'MMM dd HH:mm'),
        val: parseFloat(v.value)
      }));
  }, [recentVitals]);

  const latestHeartRate = recentVitals.find(v => v.type === 'heart_rate')?.value || '--';
  const latestSteps = recentVitals.find(v => v.type === 'steps')?.value || '--';

  return (
    <div className="w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-500 h-full overflow-hidden">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {user.displayName || user.email}.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">View Raw Logs</button>
            <button className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all shadow-sm">Generate Report</button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Heart Rate</span>
            <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-lg tracking-wider">STABLE</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-4xl font-light text-slate-900 tracking-tighter">{latestHeartRate}</span>
            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">bpm</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Steps</span>
            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-lg tracking-wider">ACTIVE</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-4xl font-light text-slate-900 tracking-tighter">{latestSteps}</span>
            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">steps</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Completion</span>
            <span className="text-[10px] text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg tracking-wider">PENDING</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-4xl font-light text-slate-900 tracking-tighter">
              {profile ? '80' : '20'}
            </span>
            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">%</span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Biometric Pattern Analysis</h2>
              <p className="text-sm text-slate-400 font-medium">Visualization of your recent health trends</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
              <Activity size={20} />
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            {formattedVitals.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedVitals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#0f172a" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#0f172a' }}
                    activeDot={{ r: 8, fill: '#0f172a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-sm text-slate-400 font-medium italic">Log some vitals to see your trends.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-[380px] flex flex-col shrink-0 gap-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">AI Health Copilot</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Ready to discuss your recent trends or symptoms?
              </p>
              <Link 
                href="/copilot"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
              >
                Start Session <ArrowRight size={16} />
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
               <MessageSquare size={160} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Insight Feed</h2>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                <Info size={18} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 group hover:bg-blue-50 transition-colors">
                    <p className="text-sm text-blue-900 leading-relaxed font-bold mb-3">
                        {recentVitals.length > 0 
                          ? "Pattern Detected: Your heart rate is slightly elevated compared to your baseline."
                          : "Welcome to HealthAI! Introduce yourself to the Copilot to start your journey."}
                    </p>
                    <Link 
                        href="/copilot"
                        className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                        Learn more <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
