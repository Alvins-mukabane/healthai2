import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import ChatInterface from '@/components/chat-interface';
import { signOut } from '../auth/actions';

export default async function CopilotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar user={user} signOutAction={signOut} />
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <ChatInterface user={user} />
      </main>
    </div>
  );
}
