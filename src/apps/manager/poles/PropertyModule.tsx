import React, { useState } from 'react';
import { useNexiaStore } from '../../../store/useNexiaStore';
import { FinancesBoard } from '../../../components/manager/FinancesBoard';
import { FixedChargesTab } from '../../../components/manager/FixedChargesTab';
import { GrosTravauxTab } from '../../../components/manager/GrosTravauxTab';
import { NoticeBoard } from '../../../components/notices/NoticeBoard';
import { AddFixedChargeModal } from '../../../components/manager/AddFixedChargeModal';
import { AddGrosTravauxModal } from '../../../components/manager/AddGrosTravauxModal';
import { AddAnnouncementModal } from '../../../components/manager/AddAnnouncementModal';
import { AddBuildingModal } from '../../../components/manager/AddBuildingModal';
import { 
  Building2, 
  MapPin, 
  Calculator, 
  Wallet, 
  Wrench,
  Megaphone,
  Plus
} from 'lucide-react';

export const PropertyModule = () => {
  const { buildings, activeBuildingId, setActiveBuilding } = useNexiaStore();
  const [activeTab, setActiveTab] = useState<'finances' | 'fixed_charges' | 'gros_travaux' | 'notices'>('finances');
  
  // Modals state
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
  const [isFixedChargeModalOpen, setIsFixedChargeModalOpen] = useState(false);
  const [isGrosTravauxModalOpen, setIsGrosTravauxModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const activeBuilding = buildings.find(b => b.id === activeBuildingId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Building Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Pôle Immobilier & Syndic
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Gestion des copropriétés, conciergerie Airbnb, et suivi des charges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={activeBuildingId}
              onChange={(e) => setActiveBuilding(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none cursor-pointer appearance-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setIsAddBuildingModalOpen(true)}
            className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-105 transition-transform"
            title="Ajouter un immeuble"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-800/80">
        {[
          { id: 'finances', label: 'Bilan & Recouvrement', icon: Calculator },
          { id: 'fixed_charges', label: 'Charges Fixes', icon: Wallet },
          { id: 'gros_travaux', label: 'Gros Travaux', icon: Wrench },
          { id: 'notices', label: 'Affichage & Alertes', icon: Megaphone },
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

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
        {activeTab === 'finances' && <FinancesBoard />}
        {activeTab === 'fixed_charges' && activeBuilding && (
          <FixedChargesTab 
            buildingId={activeBuilding.id} 
            totalUnits={activeBuilding.totalUnits} 
            currentMonthlyCharge={0} 
          />
        )}
        {activeTab === 'gros_travaux' && activeBuilding && (
          <GrosTravauxTab 
            buildingId={activeBuilding.id} 
            totalUnits={activeBuilding.totalUnits} 
          />
        )}
        {activeTab === 'notices' && (
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Tableau d'affichage virtuel</h3>
              <button 
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:-translate-y-0.5 transition-transform"
              >
                Nouvelle Annonce
              </button>
            </div>
            <NoticeBoard />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddBuildingModal isOpen={isAddBuildingModalOpen} onClose={() => setIsAddBuildingModalOpen(false)} />
      {activeBuilding && (
        <AddAnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} />
      )}
    </div>
  );
};
