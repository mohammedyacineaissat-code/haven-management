import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNexiaStore } from '../../store/useNexiaStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { 
  Building2, 
  ShieldCheck, 
  Droplets, 
  Shirt, 
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
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
    { id: 'dashboard', path: '/', label: t.nexia_manager.module_dashboard, icon: LayoutDashboard },
    { id: 'property', path: '/property', label: t.nexia_manager.module_property, icon: Building2 },
    { id: 'hr', path: '/hr', label: t.nexia_manager.module_hr, icon: Users },
    { id: 'security', path: '/security', label: t.nexia_manager.module_security, icon: ShieldCheck },
    { id: 'cleaning', path: '/cleaning', label: t.nexia_manager.module_cleaning, icon: Droplets },
    { id: 'laundry', path: '/laundry', label: t.nexia_manager.module_laundry, icon: Shirt },
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
        fixed lg:static top-0 left-0 z-50 h-screen w-72 
        bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 w-full">
            <img src="/assets/logo.png" alt="NEXIA Solution Logo" className="w-44 h-auto object-contain" />
          </div>
          <button aria-label={t.common?.close || 'Close'} onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pôles d'activité</div>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500 dark:text-amber-600' : ''}`} />
                    <span className="text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            <LanguageSwitcher compact />
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
