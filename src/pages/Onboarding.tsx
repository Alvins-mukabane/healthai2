import React, { useState } from 'react';
import { useHealth } from '../store/HealthStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Sparkles, Brain, Zap, ArrowRight, CheckCircle2, Lock, FileText, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const handleNext = () => {
    if (step === 3 && (!consentGiven || !privacyAgreed)) {
      setError('You must accept the data usage terms and privacy policy to continue.');
      return;
    }
    setError('');
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
      setError('Please enter a valid weight (kg).');
      return;
    }
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      setError('Please enter a valid height (cm).');
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

  const philosophySteps = [
    { icon: <ShieldCheck className="text-blue-500" />, label: 'Trust', desc: 'Secure, local-first data architecture.' },
    { icon: <Database className="text-indigo-500" />, label: 'Data', desc: 'Normalized biometric wearable sync.' },
    { icon: <Sparkles className="text-purple-500" />, label: 'Insights', desc: 'Agentic pattern recognition.' },
    { icon: <Zap className="text-amber-500" />, label: 'Automation', desc: 'Proactive intervention alerts.' },
    { icon: <Brain className="text-rose-500" />, label: 'Intelligence', desc: 'Personalized longevity strategies.' },
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/50">
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`flex-1 transition-all duration-500 ${s <= step ? (s === 5 ? 'bg-blue-600' : 'bg-blue-500') : 'bg-gray-100'}`}
            />
          ))}
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
                  <Sparkles className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">Meet your AI Health Copilot</h1>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed max-w-md">
                  HealthAI isn't just a tracker. It's a proactive intelligence engine designed to orchestrate your wellness data into longevity.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                    <CheckCircle2 className="text-blue-500 mb-2" size={20} />
                    <h3 className="font-bold text-sm text-zinc-800">Agentic Reasoning</h3>
                    <p className="text-xs text-zinc-500 mt-1">Specialized agents analyze your sleep, nutrition, and risk factors.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                    <CheckCircle2 className="text-blue-500 mb-2" size={20} />
                    <h3 className="font-bold text-sm text-zinc-800">Interoperable</h3>
                    <p className="text-xs text-zinc-500 mt-1">Native FHIR & MCP support for clinical system integration.</p>
                  </div>
                </div>
                <button 
                  onClick={handleNext} 
                  className="w-full py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group"
                >
                  Explore the Philosophy <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <h2 className="text-2xl font-bold text-zinc-900 mb-2 text-center">The Intelligence Cycle</h2>
                <p className="text-zinc-500 text-center mb-10">Our philosophy drives every bit of analysis we perform.</p>
                
                <div className="space-y-4 mb-10 relative">
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100 hidden md:block"></div>
                  {philosophySteps.map((p, i) => (
                    <motion.div 
                      key={p.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm relative z-10"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-zinc-50">
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-800 flex items-center gap-2">
                          {p.label}
                          <span className="text-[10px] text-zinc-300 font-mono">STEP {i+1}</span>
                        </h4>
                        <p className="text-sm text-zinc-500">{p.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-zinc-600 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Back</button>
                  <button onClick={handleNext} className="flex-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Understood</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Lock className="text-amber-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6 text-center">Privacy & Compliance</h2>
                
                <div className="bg-zinc-900 rounded-3xl p-6 text-zinc-300 space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <h4 className="flex items-center gap-2 text-white font-bold text-sm">
                    <FileText size={16} /> Data Disclosure Agreement
                  </h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    HealthAI Orchestrator collects high-fidelity biometric data including heart rate, sleep architecture, and movement patterns. By utilizing our AI Copilot, you acknowledge:
                  </p>
                  <ul className="text-xs space-y-3 opacity-90">
                    <li className="flex gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                      <span><strong>HIPAA-Aligned Logic</strong>: We follow data de-identification and transmission standards consistent with HIPAA principles. Your data is your property.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                      <span><strong>AI Processing</strong>: Anonymous biometric strings are processed via Google Gemini for pattern recognition and proactive insight generation.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                      <span><strong>No Medical Advice</strong>: Our copilot is for informational orchestration. It is not a substitute for clinical diagnostics or medical practitioners.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 mb-8">
                  <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} />
                    <span className="text-sm font-medium text-zinc-700">I consent to AI analysis of my biometric data.</span>
                  </label>
                  <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={privacyAgreed} onChange={e => setPrivacyAgreed(e.target.checked)} />
                    <span className="text-sm font-medium text-zinc-700">I agree to the Privacy Policy and Terms of Use.</span>
                  </label>
                </div>

                {error && <p className="text-red-500 text-xs font-semibold mb-4 text-center">{error}</p>}
                
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-zinc-600 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Back</button>
                  <button onClick={handleNext} className="flex-2 py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Acknowledge & Continue</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <UserCircle2 className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2 text-center">Bio-Metric Identity</h2>
                <p className="text-zinc-500 text-center mb-8 text-sm">We need a baseline to calibrate our normalization algorithms.</p>
                
                <div className="space-y-4 mb-10">
                  <div className="relative">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm outline-none transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Age</label>
                      <input type="number" placeholder="Enter age" value={age} onChange={e => setAge(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Weight (KG)</label>
                      <input type="number" placeholder="Enter kg" value={weight} onChange={e => setWeight(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5 text-left col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Height (CM)</label>
                      <input type="number" placeholder="Enter cm" value={height} onChange={e => setHeight(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-zinc-600 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Back</button>
                  <button onClick={handleNext} className="flex-2 py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Next</button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Brain className="text-rose-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2 text-center">Clinical Context</h2>
                <p className="text-zinc-500 text-center mb-8 text-sm">Provide context to help our agents specialize your health insights.</p>
                
                <div className="space-y-4 mb-10">
                  <textarea 
                    placeholder="e.g. History of Hypertension, training for marathon, chronic fatigue... (Comma separated)" 
                    value={conditions} 
                    onChange={e => setConditions(e.target.value)}
                    className="w-full px-6 py-5 min-h-[160px] bg-gray-50 border border-gray-100 rounded-[2rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm outline-none resize-none transition-all" 
                  />
                  <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100 text-left">
                    <p className="text-[10px] text-rose-800 leading-relaxed font-medium">
                      Note: This data is used by the AI engine to filter and weigh insights. It is stored with maximum priority on local-first encryption.
                    </p>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-semibold mb-4 text-center">{error}</p>}
                
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-zinc-600 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all">Back</button>
                  <button onClick={handleSubmit} className="flex-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/30">
                    Initialize Orchestrator
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 pb-8 flex items-center justify-center gap-1.5 opacity-30 select-none">
          <div className={`w-1.5 h-1.5 rounded-full ${step >= 1 ? 'bg-zinc-900' : 'bg-gray-200'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${step >= 2 ? 'bg-zinc-900' : 'bg-gray-200'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${step >= 3 ? 'bg-zinc-900' : 'bg-gray-200'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${step >= 4 ? 'bg-zinc-900' : 'bg-gray-200'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${step >= 5 ? 'bg-zinc-900' : 'bg-gray-200'}`}></div>
        </div>

      </div>
    </div>
  );
}
