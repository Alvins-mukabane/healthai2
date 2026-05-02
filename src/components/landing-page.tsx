'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  HeartPulse, 
  ShieldCheck, 
  BrainCircuit, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Mic, 
  Camera,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/50 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-200">
              <HeartPulse className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">HealthAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link href="/auth/register" className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full border border-rose-100">
              <Sparkles className="text-rose-500 w-4 h-4" />
              <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Now with Gemini 2.0 Live</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter text-slate-900">
              Your AI Health <br /> <span className="text-rose-500 underline decoration-rose-200 underline-offset-8 italic">Copilot</span> for Everyday Life.
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
              Track vitals, analyze patterns, and discuss your wellbeing with a production-ready AI orchestration system built for trust and privacy.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/register" className="group bg-slate-900 text-white px-8 py-5 rounded-[2rem] text-lg font-bold hover:bg-black transition-all shadow-2xl shadow-slate-300 active:scale-95 flex items-center justify-center gap-3">
                Start Your Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-5 rounded-[2rem] text-lg font-bold border-2 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-3">
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-[3rem] p-4 shadow-2xl shadow-slate-200 border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" 
                alt="HealthAI Interface" 
                className="rounded-[2.5rem] w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 max-w-[200px] animate-bounce-slow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <Activity size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heart Rate</span>
                </div>
                <div className="text-2xl font-black text-slate-900">72 BPM</div>
                <div className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">Normal Range</div>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em]">Core Modules</h2>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">Everything you need to master your health data.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Orchestration", 
                desc: "Multi-agent system with specialized logic for symptoms, nutrition, and fitness.",
                icon: BrainCircuit,
                color: "bg-blue-500"
              },
              { 
                title: "Voice First", 
                desc: "Real-time conversation using Gemini 2.0 Live for a truly hands-free experience.",
                icon: Mic,
                color: "bg-emerald-500"
              },
              { 
                title: "Visual Log", 
                desc: "Capture and analyze physical symptoms or data through camera integration.",
                icon: Camera,
                color: "bg-amber-500"
              },
              { 
                title: "Pattern Engine", 
                desc: "Automatic detection of deviations and behavioral trends in your vitals.",
                icon: Activity,
                color: "bg-rose-500"
              },
              { 
                title: "Secure Auth", 
                desc: "Privacy-first infrastructure with medical consent and data encryption.",
                icon: ShieldCheck,
                color: "bg-indigo-500"
              },
              { 
                title: "Action Layer", 
                desc: "Direct behavior nudging to guide you toward your long-term health goals.",
                icon: CheckCircle2,
                color: "bg-slate-900"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200"
              >
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg transition-transform group-hover:scale-110`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-32">
        <div className="max-w-7xl mx-auto px-6 bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em]">Identity & Trust</h2>
              <p className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                Your Health Data is <br /> <span className="text-rose-500">None of Our Business.</span>
              </p>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                HealthAI is built on production-ready principles including encryption at rest, mandatory medical consent, and local data processing wherever possible.
              </p>
              <ul className="space-y-4">
                {["AES-256 Encryption", "HIPAA-Principled Storage", "Identity-first Isolation"].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold tracking-tight">
                    <CheckCircle2 className="text-emerald-500 w-5 h-5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                 <ShieldCheck className="text-white/10 w-96 h-96" />
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute inset-0 flex items-center justify-center"
                 >
                    <ShieldCheck className="text-rose-500 w-32 h-32 drop-shadow-2xl" />
                 </motion.div>
              </div>
            </div>
          </div>
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <defs>
                 <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                   <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                 </pattern>
               </defs>
               <rect width="100" height="100" fill="url(#grid)" />
             </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="p-2 bg-rose-500 rounded-xl">
                <HeartPulse className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">HealthAI</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">The AI Health Copilot for Everyday Life. Built for Agents Assemble 2026.</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal</h4>
              <ul className="space-y-2 text-sm font-bold text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project</h4>
              <ul className="space-y-2 text-sm font-bold text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Vercel</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center mt-20 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          Production Environment V1.0 Canonical
        </div>
      </footer>
    </div>
  );
}
