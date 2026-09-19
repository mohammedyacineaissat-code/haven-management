import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Menu, Search, Bell, Loader2 } from 'lucide-react';
import { useNexiaStore } from '../../store/useNexiaStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { ManagerAuthScreen } from './ManagerAuthScreen';

const NexiaDashboard = lazy(() => import('./dashboard/NexiaDashboard').then(m => ({ default: m.NexiaDashboard })));
const PropertyModule = lazy(() => import('./poles/PropertyModule').then(m => ({ default: m.PropertyModule })));
const SecurityModule = lazy(() => import('./poles/SecurityModule').then(m => ({ default: m.SecurityModule })));
const CleaningModule = lazy(() => import('./poles/CleaningModule').then(m => ({ default: m.CleaningModule })));
const LaundryModule = lazy(() => import('./poles/LaundryModule').then(m => ({ default: m.LaundryModule })));
const HRModule = lazy(() => import('./poles/HRModule').then(m => ({ default: m.HRModule })));

interface ManagerAppProps {
  standalone?: boolean;
}

export const ManagerApp: React.FC<ManagerAppProps> = ({ standalone = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { managerProfile } = useNexiaStore();
  const { t, isRtl } = useLanguageStore();

  if (!managerProfile) {
    return <ManagerAuthScreen standalone={standalone} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
              NEXIA Manager
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input 
                type="text" 
                placeholder={t.nexia_manager.search_placeholder} 
                className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-shadow outline-none dark:text-white`}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-950"></span>
              </button>

              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className={`absolute top-full ${isRtl ? 'left-0' : 'right-0'} mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white">{t.nexia_manager.notifications}</h3>
                    </div>
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.nexia_manager.no_notifications}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<NexiaDashboard />} />
                <Route path="/property" element={<PropertyModule />} />
                <Route path="/security" element={<SecurityModule />} />
                <Route path="/cleaning" element={<CleaningModule />} />
                <Route path="/laundry" element={<LaundryModule />} />
                <Route path="/hr" element={<HRModule />} />
                <Route path="*" element={<NexiaDashboard />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};
