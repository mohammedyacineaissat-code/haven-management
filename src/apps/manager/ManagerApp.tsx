import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../../components/layout/Sidebar';
import { List, MagnifyingGlass, Bell, CircleNotch } from '@phosphor-icons/react';
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

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export const ManagerApp: React.FC<ManagerAppProps> = ({ standalone = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { managerProfile } = useNexiaStore();
  const { t, isRtl } = useLanguageStore();
  const location = useLocation();

  if (!managerProfile) {
    return <ManagerAuthScreen standalone={standalone} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50/50 dark:bg-[#090C15] overflow-hidden font-sans relative">
      
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-brand-500/10 dark:bg-brand-500/10 blur-[120px] animate-mesh-slow"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 dark:bg-sky-500/10 blur-[120px] animate-mesh-slower"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] animate-mesh-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="h-20 bg-transparent flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 relative">
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-b border-white/50 dark:border-white/5"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <List weight="duotone" className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
              NEXIA Manager
            </h2>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative hidden md:block">
              <MagnifyingGlass weight="duotone" className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} />
              <input 
                type="text" 
                placeholder={t.nexia_manager.search_placeholder} 
                className={`${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-white/10 rounded-full text-sm w-72 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-500/10 shadow-apple-glass transition-all outline-none dark:text-white backdrop-blur-md`}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell weight="duotone" className="w-5 h-5" />
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
              <div className="flex items-center justify-center h-64 text-brand-500">
                <CircleNotch weight="duotone" className="w-8 h-8 animate-spin" />
              </div>
            }>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageWrapper><NexiaDashboard /></PageWrapper>} />
                  <Route path="/property" element={<PageWrapper><PropertyModule /></PageWrapper>} />
                  <Route path="/security" element={<PageWrapper><SecurityModule /></PageWrapper>} />
                  <Route path="/cleaning" element={<PageWrapper><CleaningModule /></PageWrapper>} />
                  <Route path="/laundry" element={<PageWrapper><LaundryModule /></PageWrapper>} />
                  <Route path="/hr" element={<PageWrapper><HRModule /></PageWrapper>} />
                  <Route path="*" element={<PageWrapper><NexiaDashboard /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};
