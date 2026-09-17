import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Clock, 
  AlertTriangle,
  Search,
  Plus,
  Video
} from 'lucide-react';

import { useNexiaStore } from '../../../store/useNexiaStore';
import { useLanguageStore } from '../../../store/useLanguageStore';

export const SecurityModule = () => {
  const [activeTab, setActiveTab] = useState<'sites' | 'planning' | 'cctv'>('sites');
  
  const buildings = useNexiaStore(state => state.buildings);
  const employees = useNexiaStore(state => state.employees);
  const { t } = useLanguageStore();
  const guards = employees.filter(e => e.role === 'gardien');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = buildings.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            {t.security_module.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {t.security_module.subtitle}
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4" />
          {t.security_module.new_site}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-800/80">
        {[
          { id: 'sites', label: t.security_module.tab_sites, icon: MapPin },
          { id: 'planning', label: t.security_module.tab_planning, icon: Clock },
          { id: 'cctv', label: t.security_module.tab_cctv, icon: Video },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-100' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 scale-95 hover:scale-100'
              }
            `}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-amber-500' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
        {activeTab === 'sites' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.security_module.site_list_title}</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={t.security_module.search_placeholder} 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-shadow outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBuildings.map(building => {
                const assignedGuards = guards.filter(g => g.buildingId === building.id);
                const hasAlert = building.status === 'alert';
                return (
                  <div key={building.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors group cursor-pointer bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${hasAlert ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      {hasAlert && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> {t.security_module.incident}
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors line-clamp-1">{building.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="w-4 h-4" />
                      {assignedGuards.length} {t.security_module.agents_deployed}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{t.security_module.planning_title}</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t.security_module.col_agent}</th>
                    <th className="px-4 py-3 font-semibold">{t.security_module.col_site}</th>
                    <th className="px-4 py-3 font-semibold">{t.security_module.col_schedule}</th>
                    <th className="px-4 py-3 font-semibold">{t.security_module.col_status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {guards.map(guard => {
                    const assignedBuilding = buildings.find(b => b.id === guard.buildingId);
                    return (
                      <tr key={guard.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                            {guard.firstName.charAt(0)}{guard.lastName.charAt(0)}
                          </div>
                          {guard.firstName} {guard.lastName}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {assignedBuilding ? assignedBuilding.name : t.security_module.status_reserve}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {guard.status === 'active' ? '08:00 - 16:00' : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            guard.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {guard.status === 'active' ? t.security_module.status_on_duty : t.security_module.status_off}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {guards.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">{t.security_module.no_agents}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cctv' && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t.security_module.cctv_wip_title}</h3>
            <p className="text-slate-500 max-w-md">{t.security_module.cctv_wip_desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};
