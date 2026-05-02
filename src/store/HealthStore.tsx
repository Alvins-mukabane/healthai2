"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataNormalizationEngine, HealthProfile, VitalsData, SleepData } from '@/lib/validation';

export type { HealthProfile };

type HealthContextType = {
  hasOnboarded: boolean;
  completeOnboarding: (profile: HealthProfile) => void;
  profile: HealthProfile | null;
  setProfile: (profile: HealthProfile) => void;
  vitals: Omit<VitalsData, "id"|"source">[];
  addVital: (data: Partial<VitalsData> & { source?: 'manual' | 'apple_healthkit' | 'google_fit' | 'fitbit' }) => void;
  sleep: Omit<SleepData, "id"|"source">[];
  addSleep: (data: Partial<SleepData> & { source?: 'manual' | 'apple_healthkit' | 'google_fit' | 'fitbit' }) => void;
  generateContextString: () => string;
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('health_onboarded') === 'true';
  });

  const [profile, setProfileState] = useState<HealthProfile | null>(() => {
    const saved = localStorage.getItem('health_profile');
    if (saved) {
      try { return DataNormalizationEngine.ingestProfile(JSON.parse(saved)); }
      catch(e) { return null; }
    }
    return null;
  });

  const [vitals, setVitals] = useState<any[]>(() => {
    const saved = localStorage.getItem('health_vitals');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [sleep, setSleep] = useState<any[]>(() => {
    const saved = localStorage.getItem('health_sleep');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const completeOnboarding = (newProfile: HealthProfile) => {
    try {
      const validated = DataNormalizationEngine.ingestProfile(newProfile);
      setProfileState(validated);
      setHasOnboarded(true);
      localStorage.setItem('health_onboarded', 'true');
      localStorage.setItem('health_profile', JSON.stringify(validated));
    } catch(e) {
      console.error(e);
      throw e;
    }
  }

  const setProfile = (newProfile: HealthProfile) => {
    const validated = DataNormalizationEngine.ingestProfile(newProfile);
    setProfileState(validated);
    localStorage.setItem('health_profile', JSON.stringify(validated));
  }

  useEffect(() => {
    localStorage.setItem('health_vitals', JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem('health_sleep', JSON.stringify(sleep));
  }, [sleep]);

  const addVital = (data: any) => {
    try {
        const validated = DataNormalizationEngine.ingestVitals({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            source: 'manual',
            ...data
        });
        setVitals(prev => [...prev, validated]);
    } catch (err) {
        console.error("Failed to add vital", err);
    }
  };

  const addSleep = (data: any) => {
    try {
        const validated = DataNormalizationEngine.ingestSleep({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            source: 'manual',
            ...data
        });
        setSleep(prev => [...prev, validated]);
    } catch (err) {
        console.error("Failed to add sleep", err);
    }
  };

  const generateContextString = () => {
    if (!profile) return 'No user context available.';
    return `
User: ${profile.name}, Age: ${profile.age}, Weight: ${profile.weight}kg, Height: ${profile.height}cm.
Conditions: ${profile.conditions?.join(', ') || 'None reported'}.
Recent Vitals (last 3): ${JSON.stringify(vitals.slice(-3).map(v => ({ date: v.timestamp.split('T')[0], hr: v.heartRate, bp: v.sysBp + "/" + v.diaBp })))}
Recent Sleep (last 3): ${JSON.stringify(sleep.slice(-3).map(s => ({ date: s.timestamp.split('T')[0], hours: s.hours, quality: s.quality })))}
    `.trim();
  };

  return (
    <HealthContext.Provider value={{ hasOnboarded, completeOnboarding, profile, setProfile, vitals, addVital, sleep, addSleep, generateContextString }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) throw new Error('useHealth must be used within a HealthProvider');
  return context;
}
