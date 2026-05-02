import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard-content';
import Sidebar from '@/components/sidebar';
import { signOut } from './auth/actions';
import { getHealthProfile, getRecentVitals } from '@/lib/supabase/actions';

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  const profile = await getHealthProfile(user.id);
  const recentVitals = await getRecentVitals(user.id);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar user={user} signOutAction={signOut} />
      <main className="flex-1 p-8 overflow-y-auto h-full flex flex-col gap-8 custom-scrollbar">
        <DashboardContent user={user} profile={profile} recentVitals={recentVitals || []} />
      </main>
    </div>
  );
}
