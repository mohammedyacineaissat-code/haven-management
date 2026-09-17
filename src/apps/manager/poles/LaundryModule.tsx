import React, { useState } from 'react';
import { 
  Shirt, 
  MapPin, 
  Truck, 
  Clock, 
  Search,
  Plus,
  PackageCheck,
  Building2,
  Calendar
} from 'lucide-react';

import { useNexiaStore } from '../../../store/useNexiaStore';

const mockBatches = [
  { id: 'BL-2024-089', client: 'Hôtel Le Méridien', type: 'Draps & Serviettes', weight: '125 kg', status: 'washing', time: '10:30' },
  { id: 'BL-2024-090', client: 'Hôtel Royal', type: 'Uniformes Staff', weight: '45 kg', status: 'ironing', time: '11:45' },
  { id: 'BL-2024-091', client: 'Clinique Al-Shifa', type: 'Draps Médicaux', weight: '150 kg', status: 'delivered', time: '08:00' },
  { id: 'BL-2024-092', client: 'Hôtel Le Méridien', type: 'Nappes Restaurant', weight: '80 kg', status: 'collected', time: '14:00' },
];

export const LaundryModule = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'batches' | 'logistics'>('batches');
  
  const buildings = useNexiaStore(state => state.buildings);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredBuildings = buildings.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-2">
            <Shirt className="w-6 h-6 text-amber-500" />
            Blanchisserie Pro
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Suivi des lots hôteliers/cliniques, du ramassage à la livraison.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4" />
          Nouveau Lot
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-800/80">
        {[
          { id: 'batches', label: 'Suivi des Lots', icon: PackageCheck },
          { id: 'clients', label: 'Clients B2B', icon: Building2 },
          { id: 'logistics', label: 'Tournées & Logistique', icon: Truck },
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
        
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Lots en cours de traitement</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">N° Lot</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Type de Linge</th>
                    <th className="px-4 py-3 font-semibold">Poids</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold">Heure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {mockBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{batch.id}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{batch.client}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{batch.type}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{batch.weight}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          batch.status === 'collected' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          batch.status === 'washing' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400' :
                          batch.status === 'ironing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}>
                          {batch.status === 'collected' ? 'Collecté' : 
                           batch.status === 'washing' ? 'En Lavage' : 
                           batch.status === 'ironing' ? 'Repassage' : 'Livré'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{batch.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Carnet Clients B2B</h3>
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
              {filteredBuildings.map(building => (
                <div key={building.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors group cursor-pointer bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-amber-500 transition-colors line-clamp-1">{building.name}</h4>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <Shirt className="w-4 h-4 text-slate-400" />
                    Volume Moyen: {Math.floor(Math.random() * 200) + 50} kg/jour
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tournées & Flotte</h3>
            <p className="text-slate-500 max-w-md">L'optimisation des tournées de ramassage/livraison et la gestion de la flotte de camions seront disponibles prochainement.</p>
          </div>
        )}

      </div>
    </div>
  );
};
