import React, { useState } from 'react';
import { 
  Droplets, 
  MapPin, 
  Users, 
  Clock, 
  Search,
  Plus,
  ClipboardCheck,
  CheckCircle2
} from 'lucide-react';

import { useNexiaStore } from '../../../store/useNexiaStore';

export const CleaningModule = () => {
  const [activeTab, setActiveTab] = useState<'sites' | 'planning' | 'inventory'>('sites');
  
  const buildings = useNexiaStore(state => state.buildings);
  const employees = useNexiaStore(state => state.employees);
  const cleaners = employees.filter(e => e.role === 'cleaner');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = buildings.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-2">
            <Droplets className="w-6 h-6 text-amber-500" />
            Nettoyage & Hygiène
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Gestion des plannings d'entretien, traçabilité des interventions et stocks produits.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4" />
          Nouveau Contrat
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-800/80">
        {[
          { id: 'sites', label: 'Contrats Actifs', icon: MapPin },
          { id: 'planning', label: 'Interventions', icon: ClipboardCheck },
          { id: 'inventory', label: 'Stocks FDS', icon: Clock },
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
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Liste des Contrats</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-shadow outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBuildings.map(building => {
                const assignedCleaners = cleaners.filter(c => c.buildingId === building.id);
                return (
                  <div key={building.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors group cursor-pointer bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                        <Droplets className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-500 transition-colors line-clamp-1">{building.name}</h4>
                    <div className="flex flex-col gap-1 text-sm text-slate-500 mt-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {assignedCleaners.length} Agent(s)
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Quotidien (Matin/Soir)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Suivi des Interventions</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tâche</th>
                    <th className="px-4 py-3 font-semibold">Site</th>
                    <th className="px-4 py-3 font-semibold">Équipe</th>
                    <th className="px-4 py-3 font-semibold">Heure</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {cleaners.map(cleaner => {
                    const assignedBuilding = buildings.find(b => b.id === cleaner.buildingId);
                    return (
                      <tr key={cleaner.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Nettoyage quotidien</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{assignedBuilding ? assignedBuilding.name : 'Non affecté'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{cleaner.firstName} {cleaner.lastName}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">08:00 - 16:00</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            cleaner.status === 'active' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {cleaner.status === 'active' ? 'En cours' : 'Congé'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {cleaners.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Aucun agent de nettoyage enregistré.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Gestion des stocks</h3>
            <p className="text-slate-500 max-w-md">L'inventaire des Fiches de Données de Sécurité (FDS) et des produits de nettoyage arrive bientôt.</p>
          </div>
        )}
      </div>
    </div>
  );
};
