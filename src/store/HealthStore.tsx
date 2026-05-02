import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataNormalizationEngine, HealthProfile, VitalsData, SleepData } from '../lib/validation';

export type { HealthProfile };

export type ConsentPreferences = {
  analyticalData: boolean;
  thirdPartySharing: boolean;
  aiProcessing: boolean;
  pushNotifications: boolean;
};

export type ConsentHistoryItem = {
  timestamp: string;
  action: 'opt_in' | 'opt_out';
  dataType: keyof ConsentPreferences | 'integrations';
  details: string;
};

export type SyncHistoryItem = {
  timestamp: string;
  source: string;
  status: 'success' | 'error';
  message: string;
};

export type IntegrationPreferences = {
  heartRate: boolean;
  bloodPressure: boolean;
  sleep: boolean;
};

export type DashboardPreferences = {
  showHeartRate: boolean;
  showBloodPressure: boolean;
  showSleep: boolean;
};

export type DailyProgress = {
  steps: number;
  water: number;
};

type HealthContextType = {
  hasOnboarded: boolean;
  completeOnboarding: (profile: HealthProfile) => void;
  profile: HealthProfile | null;
  setProfile: (profile: HealthProfile) => void;
  dailyProgress: DailyProgress;
  updateDailyProgress: (key: keyof DailyProgress, value: number) => void;
  vitals: Omit<VitalsData, "id"|"source">[];
  addVital: (data: Partial<VitalsData> & { source?: 'manual' | 'apple_healthkit' | 'google_fit' | 'fitbit' }) => void;
  sleep: Omit<SleepData, "id"|"source">[];
  addSleep: (data: Partial<SleepData> & { source?: 'manual' | 'apple_healthkit' | 'google_fit' | 'fitbit' }) => void;
  generateContextString: () => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  consentPreferences: ConsentPreferences;
  updateConsent: (key: keyof ConsentPreferences, value: boolean) => void;
  consentHistory: ConsentHistoryItem[];
  recordConsentAction: (action: 'opt_in' | 'opt_out', dataType: ConsentHistoryItem['dataType'], details: string) => void;
  syncHistory: SyncHistoryItem[];
  integrationPreferences: Record<string, IntegrationPreferences>;
  updateIntegrationPreference: (source: string, key: keyof IntegrationPreferences, value: boolean) => void;
  syncWearableData: (source: 'apple_healthkit' | 'google_fit' | 'fitbit') => Promise<void>;
  dashboardPreferences: DashboardPreferences;
  updateDashboardPreference: (key: keyof DashboardPreferences, value: boolean) => void;
  customAgentPrompts: Record<string, string>;
  updateCustomAgentPrompt: (agentId: string, prompt: string) => void;
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('health_onboarded') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('health_dark_mode') === 'true';
  });

  const [consentPreferences, setConsentPreferences] = useState<ConsentPreferences>(() => {
    const saved = localStorage.getItem('health_consent_prefs');
    return saved ? JSON.parse(saved) : { analyticalData: true, thirdPartySharing: false, aiProcessing: true, pushNotifications: false };
  });

  const [consentHistory, setConsentHistory] = useState<ConsentHistoryItem[]>(() => {
    const saved = localStorage.getItem('health_consent_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>(() => {
    const saved = localStorage.getItem('health_sync_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [integrationPreferences, setIntegrationPreferences] = useState<Record<string, IntegrationPreferences>>(() => {
    const saved = localStorage.getItem('health_integration_prefs');
    return saved ? JSON.parse(saved) : {};
  });

  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences>(() => {
    const saved = localStorage.getItem('health_dash_prefs');
    return saved ? JSON.parse(saved) : { showHeartRate: true, showBloodPressure: true, showSleep: true };
  });

  const [customAgentPrompts, setCustomAgentPrompts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('health_custom_prompts');
    return saved ? JSON.parse(saved) : {};
  });

  const updateCustomAgentPrompt = (agentId: string, prompt: string) => {
    setCustomAgentPrompts(prev => {
      const updated = { ...prev, [agentId]: prompt };
      if (!prompt) delete updated[agentId];
      localStorage.setItem('health_custom_prompts', JSON.stringify(updated));
      return updated;
    });
  };

  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const saved = localStorage.getItem('health_daily_progress');
    const today = new Date().toISOString().split('T')[0];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        return { steps: parsed.steps || 0, water: parsed.water || 0 };
      }
    }
    return { steps: 0, water: 0 };
  });

  const updateDailyProgress = (key: keyof DailyProgress, value: number) => {
    setDailyProgress(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('health_daily_progress', JSON.stringify({ ...next, date: new Date().toISOString().split('T')[0] }));
      return next;
    });
  };

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('health_dark_mode', String(next));
      return next;
    });
  };

  const recordConsentAction = (action: 'opt_in' | 'opt_out', dataType: ConsentHistoryItem['dataType'], details: string) => {
    setConsentHistory(prev => {
      const updated = [{ timestamp: new Date().toISOString(), action, dataType, details }, ...prev];
      localStorage.setItem('health_consent_history', JSON.stringify(updated));
      return updated;
    });
  };

  const updateConsent = (key: keyof ConsentPreferences, value: boolean) => {
    setConsentPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('health_consent_prefs', JSON.stringify(updated));
      return updated;
    });
    recordConsentAction(value ? 'opt_in' : 'opt_out', key, `Updated preference for ${key}`);
  };

  const updateDashboardPreference = (key: keyof DashboardPreferences, value: boolean) => {
    setDashboardPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('health_dash_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const updateIntegrationPreference = (source: string, key: keyof IntegrationPreferences, value: boolean) => {
    setIntegrationPreferences(prev => {
      const sourcePrefs = prev[source] || { heartRate: true, bloodPressure: true, sleep: true };
      const updated = { ...prev, [source]: { ...sourcePrefs, [key]: value } };
      localStorage.setItem('health_integration_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const syncWearableData = async (source: 'apple_healthkit' | 'google_fit' | 'fitbit') => {
    // Mock processing step delays
    recordConsentAction('opt_in', 'integrations', `Starting data sync for ${source}`);
    await new Promise(r => setTimeout(r, 1000));
    
    // Check user preferences for this integration
    const prefs = integrationPreferences[source] || { heartRate: true, bloodPressure: true, sleep: true };
    
    // Simulate failing randomly (1 in ~5 chance for demo purposes)
    if (Math.random() < 0.2) {
      const errorMessage = `Failed to connect with ${source === 'apple_healthkit' ? 'Apple Health' : source === 'google_fit' ? 'Google Fit' : 'Fitbit'} API. ${Math.random() < 0.5 ? 'Token expired.' : 'Network timeout.'}`;
      setSyncHistory(prev => {
        const next = [{ timestamp: new Date().toISOString(), source, status: 'error' as const, message: errorMessage }, ...prev].slice(0, 50);
        localStorage.setItem('health_sync_history', JSON.stringify(next));
        return next;
      });
      throw new Error(errorMessage);
    }
    
    // Simulate generating incoming payload from a wearable
    if (prefs.heartRate || prefs.bloodPressure) {
        const mockIncomingVitals: any = {};
        if (prefs.heartRate) mockIncomingVitals.heartRate = 65 + Math.floor(Math.random() * 20);
        if (prefs.bloodPressure) {
            mockIncomingVitals.sysBp = 110 + Math.floor(Math.random() * 15);
            mockIncomingVitals.diaBp = 70 + Math.floor(Math.random() * 10);
        }
        addVital({ ...mockIncomingVitals, source });
    }
    
    if (prefs.sleep) {
        const mockIncomingSleep = {
            hours: 6 + Math.random() * 3,
            quality: ['Good', 'Fair', 'Excellent'][Math.floor(Math.random()*3)] as "Good" | "Fair" | "Excellent"
        };
        addSleep({ ...mockIncomingSleep, source });
    }
    
    recordConsentAction('opt_in', 'integrations', `Completed successful data sync for ${source}`);
    setSyncHistory(prev => {
      const next = [{ timestamp: new Date().toISOString(), source, status: 'success' as const, message: `Successfully synced data from ${source}` }, ...prev].slice(0, 50);
      localStorage.setItem('health_sync_history', JSON.stringify(next));
      return next;
    });
  };

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
Dashboard Configuration: The user is currently displaying: ${[
  dashboardPreferences.showHeartRate ? 'Heart Rate' : '',
  dashboardPreferences.showBloodPressure ? 'Blood Pressure' : '',
  dashboardPreferences.showSleep ? 'Sleep' : ''
].filter(Boolean).join(', ') || 'No metrics'}.
Allowed Processing: ${consentPreferences.aiProcessing ? 'AI Agent Processing enabled' : 'Strict Local only'}.
    `.trim();
  };

  return (
    <HealthContext.Provider value={{ hasOnboarded, completeOnboarding, profile, setProfile, dailyProgress, updateDailyProgress, vitals, addVital, sleep, addSleep, generateContextString, isDarkMode, toggleDarkMode, consentPreferences, updateConsent, consentHistory, recordConsentAction, syncHistory, integrationPreferences, updateIntegrationPreference, syncWearableData, dashboardPreferences, updateDashboardPreference, customAgentPrompts, updateCustomAgentPrompt }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) throw new Error('useHealth must be used within a HealthProvider');
  return context;
}
