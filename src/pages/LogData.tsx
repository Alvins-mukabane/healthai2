import React, { useState } from 'react';
import { useHealth } from '../store/HealthStore';

export function LogData() {
  const { addVital, addSleep, dailyProgress, updateDailyProgress } = useHealth();
  
  const [activeTab, setActiveTab] = useState<'vitals' | 'sleep' | 'goals'>('vitals');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVitalsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hr = Number(formData.get('heartRate'));
    const sys = Number(formData.get('sysBp'));
    const dia = Number(formData.get('diaBp'));
    
    if (hr < 30 || hr > 250) return setErrorMsg('Heart rate must be between 30 and 250.');
    if (sys < 70 || sys > 250) return setErrorMsg('Systolic BP must be between 70 and 250.');
    if (dia < 40 || dia > 150) return setErrorMsg('Diastolic BP must be between 40 and 150.');
    if (dia >= sys) return setErrorMsg('Diastolic BP must be lower than Systolic BP.');

    setErrorMsg('');
    addVital({
      timestamp: new Date().toISOString(),
      heartRate: hr,
      sysBp: sys,
      diaBp: dia,
    });
    setSuccessMsg('Vitals securely logged.');
    e.currentTarget.reset();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSleepSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hrs = Number(formData.get('hours'));
    
    if (hrs < 0 || hrs > 24) return setErrorMsg('Sleep duration must be between 0 and 24 hours.');

    setErrorMsg('');
    addSleep({
      timestamp: new Date().toISOString(),
      hours: hrs,
      quality: formData.get('quality') as 'Poor' | 'Fair' | 'Good' | 'Excellent',
    });
    setSuccessMsg('Sleep securely logged.');
    e.currentTarget.reset();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleGoalsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const steps = Number(formData.get('steps'));
    const water = Number(formData.get('water'));
    
    if (steps < 0) return setErrorMsg('Steps cannot be negative.');
    if (water < 0) return setErrorMsg('Water intake cannot be negative.');

    setErrorMsg('');
    updateDailyProgress('steps', dailyProgress.steps + steps);
    updateDailyProgress('water', dailyProgress.water + water);
    setSuccessMsg('Goals progress updated.');
    e.currentTarget.reset();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto animate-in fade-in duration-500 w-full">
      <header className="mb-6 w-full text-center">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">Health Log Workspace</h1>
        <p className="text-sm text-gray-500 mt-1">Manual data ingestion to Canonical DB.</p>
      </header>

      <div className="w-full glass-card rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white/50 flex items-center justify-center">
            <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('vitals')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider ${activeTab === 'vitals' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`}
                >
                  Vitals Agent
                </button>
                <button 
                  onClick={() => setActiveTab('sleep')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider ${activeTab === 'sleep' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`}
                >
                  Sleep Agent
                </button>
                <button 
                  onClick={() => setActiveTab('goals')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider ${activeTab === 'goals' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`}
                >
                  Daily Goals
                </button>
            </div>
        </div>

        <div className="p-8 bg-white">
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 font-bold rounded-2xl text-[10px] uppercase tracking-widest border border-green-100 flex items-center gap-2">
              <span className="status-dot w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 font-bold rounded-2xl text-[10px] uppercase tracking-widest border border-red-100 flex items-center gap-2">
              <span className="status-dot w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
              {errorMsg}
            </div>
          )}

          {activeTab === 'vitals' ? (
            <form onSubmit={handleVitalsSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Heart Rate (BPM)</label>
                <input 
                  type="number" 
                  name="heartRate"
                  required
                  min="30" max="250"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none" 
                  placeholder="e.g. 72" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Systolic BP</label>
                  <input 
                    type="number" 
                    name="sysBp"
                    required
                    min="70" max="250"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none" 
                    placeholder="e.g. 120" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Diastolic BP</label>
                  <input 
                    type="number" 
                    name="diaBp"
                    required
                    min="40" max="150"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none" 
                    placeholder="e.g. 80" 
                  />
                </div>
              </div>
              <button className="w-full py-4 mt-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm">
                Commit to Canonical DB
              </button>
            </form>
          ) : activeTab === 'sleep' ? (
            <form onSubmit={handleSleepSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duration (Hours)</label>
                <input 
                  type="number" 
                  name="hours"
                  step="0.5"
                  required
                  min="0" max="24"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none" 
                  placeholder="e.g. 7.5" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quality</label>
                <select 
                  name="quality"
                  required
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none appearance-none"
                >
                  <option value="Poor">Poor</option>
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Excellent">Excellent</option>
                </select>
              </div>
              <button className="w-full py-4 mt-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm">
                Commit to Canonical DB
              </button>
            </form>
          ) : (
            <form onSubmit={handleGoalsSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Additional Steps</label>
                <input 
                  type="number" 
                  name="steps"
                  min="0"
                  defaultValue="0"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none" 
                  placeholder="e.g. 2000" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Additional Water (ml)</label>
                <input 
                  type="number" 
                  name="water"
                  min="0"
                  defaultValue="0"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none" 
                  placeholder="e.g. 250" 
                />
              </div>
              <button className="w-full py-4 mt-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm">
                Update Daily Progress
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
