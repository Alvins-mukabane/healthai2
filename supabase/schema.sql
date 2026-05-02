-- HealthAI Initial Schema

-- 1. Users table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Health Profiles (Dynamic & Evolving)
CREATE TABLE IF NOT EXISTS public.health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  conditions TEXT[], -- Array of known medical conditions
  medications TEXT[], -- Array of current medications
  allergies TEXT[],
  goals TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vitals Logs (Time-series data)
CREATE TABLE IF NOT EXISTS public.vitals_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'heart_rate', 'blood_pressure', 'sleep_hours', 'steps'
  value DECIMAL NOT NULL,
  unit TEXT,
  source TEXT DEFAULT 'manual', -- 'manual', 'apple_health', 'google_fit'
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Symptoms Logs
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  duration_minutes INTEGER,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only read/write their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own health profile" ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health profile" ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health profile" ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vitals" ON public.vitals_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vitals" ON public.vitals_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
