'use server'

import { createClient } from './server'

export async function updateHealthProfile(userId: string, data: any) {
  const supabase = await createClient()
  
  // Clean data to only include valid columns
  const allowedColumns = ['age', 'gender', 'weight_kg', 'height_cm', 'conditions', 'medications', 'allergies', 'goals']
  const filteredData: any = {}
  Object.keys(data).forEach(key => {
    if (allowedColumns.includes(key)) {
      filteredData[key] = data[key]
    }
  })

  const { error } = await supabase
    .from('health_profiles')
    .upsert({ user_id: userId, ...filteredData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  
  if (error) throw error
  return { success: true }
}

export async function logVital(userId: string, data: { type: string, value: number, unit?: string, source?: string }) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('vitals_logs')
    .insert([{ user_id: userId, ...data, recorded_at: new Date().toISOString() }])
  
  if (error) throw error
  return { success: true }
}

export async function logSymptom(userId: string, data: { symptom: string, severity: number, notes?: string }) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('symptom_logs')
    .insert([{ user_id: userId, ...data, recorded_at: new Date().toISOString() }])
  
  if (error) throw error
  return { success: true }
}

export async function getHealthProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return data
}

export async function getRecentVitals(userId: string, limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vitals_logs')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}
