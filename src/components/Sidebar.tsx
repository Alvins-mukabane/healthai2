import { Link, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, PlusCircle, LayoutDashboard, Settings, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import React from 'react';
import { useHealth } from '../store/HealthStore';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Copilot', path: '/copilot', icon: MessageSquare },
  { name: 'Log Data', path: '/log', icon: PlusCircle },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode, profile } = useHealth();

  return (
    <div className="w-64 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full sticky top-0 shrink-0 transition-colors">
      <div className="h-16 flex items-center px-6 shrink-0 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">HealthAI <span className="text-blue-500 font-medium">Copilot</span></h1>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                isActive 
                  ? "bg-[#EBF5FF] dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900"
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mx-4 mb-4 flex items-center justify-between border border-gray-100 dark:border-zinc-800 rounded-2xl">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Appearance</span>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="p-4 m-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl text-[10px] text-blue-800 dark:text-blue-400 tracking-wide">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">MVP Phase 1</p>
          <span className="status-dot w-2 h-2 bg-green-500 rounded-full"></span>
        </div>
        <p className="text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-medium">Local storage active. DB disabled.</p>
      </div>
      <div className="mt-auto border-t border-gray-100 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-3 px-2">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-xl object-cover shadow-sm bg-gray-100 dark:bg-zinc-800" />
          ) : (
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-sm">
              {profile?.name?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{profile?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider font-bold">Pro Member</p>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            <span className="status-dot w-2 h-2 bg-green-500 rounded-full"></span>
            Orchestrator: Active
        </div>
      </div>
    </div>
  );
}
