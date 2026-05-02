"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { redirect, useRouter } from 'next/navigation';
import DashboardContent from '@/components/dashboard-content';
import Sidebar from '@/components/sidebar';
import { signOut } from './auth/actions';
import { getHealthProfile, getRecentVitals } from '@/lib/firebase/actions';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/login');
      } else {
        setUser(currentUser);
        // Fetch data
        const [prof, recVitals] = await Promise.all([
          getHealthProfile(currentUser.uid),
          getRecentVitals(currentUser.uid)
        ]);
        setProfile(prof);
        setVitals(recVitals || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar user={user} signOutAction={signOut} />
      <main className="flex-1 p-8 overflow-y-auto h-full flex flex-col gap-8 custom-scrollbar">
        <DashboardContent user={user} profile={profile} recentVitals={vitals} />
      </main>
    </div>
  );
}
