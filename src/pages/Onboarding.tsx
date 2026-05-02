import React, { useState } from 'react';
import { useHealth } from '../store/HealthStore';
import { useNavigate } from 'react-router-dom';

export function Onboarding() {
  const { completeOnboarding } = useHealth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [conditions, setConditions] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const handleNext = () => {
    if (step === 1 && !consentGiven) {
      setError('You must accept the terms and privacy policy to continue.');
      return;
    }
    setError('');
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = () => {
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
      setError('Please enter a valid weight between 20 and 500 kg.');
      return;
    }
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      setError('Please enter a valid height between 50 and 300 cm.');
      return;
    }

    try {
      completeOnboarding({
        name,
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        conditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
        consentGiven,
        dailyGoals: {
          steps: 10000,
          water: 2000
        }
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid data provided.');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#F4F7F9]">
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 shadow-sm flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
        
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to HealthAI Copilot</h1>
            <p className="text-center text-sm text-gray-500 mb-8 leading-relaxed">
              Your AI partner for understanding vitals, sleep, and identifying patterns. Before we start, please read our safety principles.
            </p>
            
            <div className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4 mb-6">
              <div className="flex gap-3">
                <span className="status-dot w-2 h-2 shrink-0 bg-blue-500 rounded-full mt-1.5"></span>
                <p className="text-sm text-gray-700">HealthAI is an intelligence engine, <strong>not a medical doctor</strong>. It cannot and will not diagnose conditions or prescribe medications.</p>
              </div>
              <div className="flex gap-3">
                <span className="status-dot w-2 h-2 shrink-0 bg-blue-500 rounded-full mt-1.5"></span>
                <p className="text-sm text-gray-700">Your data is processed locally in this MVP phase (syncing to canonical DB is strictly opt-in later).</p>
              </div>
              <div className="flex gap-3">
                <span className="status-dot w-2 h-2 shrink-0 bg-blue-500 rounded-full mt-1.5"></span>
                <p className="text-sm text-gray-700">Always consult your physician for medical decisions.</p>
              </div>
            </div>

            <label className="flex items-start gap-3 w-full cursor-pointer mb-6">
              <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded" 
                checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} />
              <span className="text-sm text-gray-700">I have read the disclaimer and consent to securely storing my provided health data for AI analysis.</span>
            </label>

            {error && <p className="text-red-500 text-xs font-semibold mb-4">{error}</p>}
            <button onClick={handleNext} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
              Acknowledge & Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full flex flex-col animate-in fade-in">
             <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Basic Health Profile</h1>
             <p className="text-center text-sm text-gray-500 mb-8">This static data allows the normalization engine to contextualize your vitals.</p>
             
             <div className="space-y-4 mb-6">
               <input type="text" placeholder="First Name" value={name} onChange={e => setName(e.target.value)}
                 className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none" />
               
               <div className="grid grid-cols-2 gap-4">
                 <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)}
                   className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none" />
                 <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)}
                   className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none" />
               </div>

               <input type="number" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)}
                   className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none" />
             </div>

             <button onClick={handleNext} disabled={!name || !age || !weight || !height} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50">
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="w-full flex flex-col animate-in fade-in">
             <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Evolving Context</h1>
             <p className="text-center text-sm text-gray-500 mb-8">List any conditions or general health goals so our agents can specialize.</p>
             
             <div className="space-y-4 mb-6">
               <textarea placeholder="e.g. Mild Asthma, Pre-diabetic, want to improve sleep... (Comma separated)" value={conditions} onChange={e => setConditions(e.target.value)}
                 className="w-full px-5 py-4 min-h-[120px] bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none resize-none" />
             </div>

             {error && <p className="text-red-500 text-xs font-semibold mb-4 text-center">{error}</p>}
             <button onClick={handleSubmit} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-sm shadow-blue-500/20">
              Initialize HealthAI Workspace
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
