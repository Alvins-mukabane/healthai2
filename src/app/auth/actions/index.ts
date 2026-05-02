'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  return redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const consent = formData.get('consent') as string

  if (consent !== 'on') {
    return redirect('/auth/register?error=' + encodeURIComponent('You must accept the medical disclaimer.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return redirect('/auth/register?error=' + encodeURIComponent(error.message))
  }

  // Manually sync to public.users if signup was successful
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: data.user.id, 
          email: data.user.email, 
          full_name: fullName 
        }
      ])
    
    if (profileError) {
      console.error('Error creating public user record:', profileError)
      // We don't necessarily want to fail the whole signup if the public record fails, 
      // but in production we should handle this better (e.g. triggers).
    }
  }

  return redirect('/auth/login?message=' + encodeURIComponent('Check your email to confirm your account.'))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/auth/login')
}
