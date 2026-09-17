import React, { useState } from 'react';
import { useNexiaStore } from '../../../store/useNexiaStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Users, Plus, Phone, Search, Building2, Briefcase, FileText, Trash2, Edit2 } from 'lucide-react';
import { Employee } from '../../../types/building';

export const HRModule = () => {
  const employees = useNexiaStore(state => state.employees);
  const buildings = useNexiaStore(state => state.buildings);
  const { addEmployee, updateEmployee, deleteEmployee } = useNexiaStore();
  const { t } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.phone}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'gardien': return 'Gardien de sécurité';
      case 'cleaner': return 'Agent de nettoyage';
      case 'technician': return 'Technicien de maintenance';
      case 'manager': return 'Gérant / Superviseur';
      case 'laundry_operator': return 'Opérateur Blanchisserie';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'gardien': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'cleaner': return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400';
      case 'technician': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      case 'manager': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
      case 'laundry_operator': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            Ressources Humaines (RH)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Gérez vos employés, agents de sécurité, techniciens et nettoyeurs.
          </p>
        </div>

        <button className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/20">
          <Plus className="w-4 h-4" />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Effectif</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{employees.length}</h3>
          </div>
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        
        {/* Monthly Payroll Estimate */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between md:col-span-2">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Masse Salariale Estimée (Mois)</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {employees.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString()} DA
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher un employé..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <select 
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tous les postes</option>
            <option value="gardien">Gardiens de sécurité</option>
            <option value="cleaner">Agents de nettoyage</option>
            <option value="technician">Techniciens</option>
            <option value="manager">Gérants</option>
            <option value="laundry_operator">Opérateurs Blanchisserie</option>
          </select>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employé</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Poste</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contrat & Salaire</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Affectation</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEmployees.map(emp => {
                const assignedBuilding = buildings.find(b => b.id === emp.buildingId);
                
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">CIN: {emp.cin || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {emp.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleColor(emp.role)}`}>
                        {getRoleLabel(emp.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white font-mono">
                        {emp.salary.toLocaleString()} DA
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">
                        <FileText className="w-3 h-3" />
                        {emp.contractType}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {assignedBuilding ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Building2 className="w-4 h-4 text-emerald-500" />
                          {assignedBuilding.name}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Non affecté</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Voulez-vous vraiment supprimer cet employé ?')) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Aucun employé trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
