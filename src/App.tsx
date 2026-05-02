import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Copilot } from './pages/Copilot';
import { LogData } from './pages/LogData';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { HealthProvider, useHealth } from './store/HealthStore';

function MainLayout() {
  const { hasOnboarded } = useHealth();


  if (!hasOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex bg-[#F4F7F9] dark:bg-zinc-950 min-h-screen font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto h-screen flex flex-col gap-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/log" element={<LogData />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <Router>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<MainLayout />} />
        </Routes>
      </Router>
    </HealthProvider>
  );
}

