'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HeartPulse, 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  Settings, 
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  user: any;
  signOutAction: () => void;
}

export default function Sidebar({ user, signOutAction }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Health Copilot', href: '/copilot', icon: MessageSquare },
    { name: 'Log Data', href: '/log', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col hidden lg:flex shrink-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="p-2 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200">
          <HeartPulse className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">HealthAI</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all group",
                isActive 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-slate-100 mt-8">
        <div className="bg-slate-50 rounded-3xl p-6 mb-6">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                <User size={20} className="text-slate-900" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">Premium Member</p>
              </div>
           </div>
           <button 
             onClick={() => signOutAction()}
             className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors uppercase tracking-widest"
           >
             <LogOut size={14} /> Sign Out
           </button>
        </div>

        <div className="flex items-center justify-center gap-4 px-4 text-slate-400">
          <button className="hover:text-slate-900 transition-colors"><ShieldCheck size={18} /></button>
          <button className="hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest">Help</button>
          <button className="hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest">Legal</button>
        </div>
      </div>
    </aside>
  );
}
