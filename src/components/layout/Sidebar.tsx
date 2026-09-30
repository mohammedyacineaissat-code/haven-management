import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNexiaStore } from '../../store/useNexiaStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Buildings, ShieldCheck, Drop, TShirt, SquaresFour, Users, Gear, SignOut, List, X } from '@phosphor-icons/react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useLanguageStore();
  const { managerProfile, logoutManager } = useNexiaStore();

  const navItems = [
    { id: 'dashboard', path: '/', label: t.nexia_manager.module_dashboard, icon: SquaresFour },
    { id: 'property', path: '/property', label: t.nexia_manager.module_property, icon: Buildings },
    { id: 'hr', path: '/hr', label: t.nexia_manager.module_hr, icon: Users },
    { id: 'security', path: '/security', label: t.nexia_manager.module_security, icon: ShieldCheck },
    { id: 'cleaning', path: '/cleaning', label: t.nexia_manager.module_cleaning, icon: Drop },
    { id: 'laundry', path: '/laundry', label: t.nexia_manager.module_laundry, icon: TShirt },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 left-0 z-50 h-screen lg:h-[calc(100vh-2rem)] w-72 
        lg:my-4 lg:ml-4 rounded-none lg:rounded-[2.5rem] overflow-hidden
        bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl 
        border-r lg:border border-white/60 dark:border-white/10 
        shadow-apple lg:shadow-apple-lg dark:shadow-apple-dark
        flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/40 dark:border-white/5 shrink-0 relative z-10">
          <div className="flex items-center gap-3 w-full">
            <img src="/assets/logo.png" alt="NEXIA Solution Logo" className="w-40 h-auto object-contain drop-shadow-sm" />
          </div>
          <button aria-label={t.common?.close || 'Close'} onClick={() => setIsOpen(false)} className="lg:hidden p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <X weight="duotone" className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-5 space-y-1 relative z-10">
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.nexia_manager.sidebar_section_title || 'Pôles d\'activité'}</div>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 text-left group relative overflow-hidden ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-apple-glass dark:shadow-apple-glass-dark font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:translate-x-1 font-medium'
                }`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full"></div>}
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-500 drop-shadow-sm' : ''}`} />
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-5 border-t border-white/40 dark:border-white/5 shrink-0 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl relative z-10">
          <div className="flex items-center justify-between mb-5 px-2">
            <ThemeToggle />
            <LanguageSwitcher compact />
          </div>
          
          <div className="flex items-center gap-3 p-3.5 rounded-[1.5rem] bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-white/10 shadow-apple-glass dark:shadow-apple-glass-dark backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center shrink-0 shadow-glow-brand">
              <Users weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {managerProfile?.name || 'Sofiane Bencheikh'}
              </p>
              <p className="text-xs text-slate-500 truncate">Gérant</p>
            </div>
            <button 
              onClick={logoutManager}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <SignOut weight="duotone" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
