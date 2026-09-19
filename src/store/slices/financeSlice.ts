import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { FixedCharge, GrosTravauxProject, PaymentRecord } from '../../types/building';
import { StoreState } from '../storeTypes';
import { generateUUID } from './helpers';

export type FinanceSlice = Pick<StoreState, 
  'updateFinances' | 
  'addPayment' | 
  'removePayment' | 
  'addFixedCharge' | 
  'updateFixedCharge' | 
  'deleteFixedCharge' | 
  'markChargePaid' |
  'addGrosTravauxProject' |
  'updateGrosTravauxProject' |
  'toggleGrosTravauxAptPaid' |
  'deleteGrosTravauxProject' |
  'publishGrosTravauxNotice'
>;

export const createFinanceSlice: StateCreator<StoreState, [], [], FinanceSlice> = (set, get, api) => ({
  updateFinances: async (buildingId: string, monthlyCharge: number, paidApts: string[]) => {
    set(state => ({
      finances: {
        ...state.finances,
        [buildingId]: { monthlyCharge, paidApts }
      }
    }));

    try {
      const { error } = await supabase
        .from('finances')
        .upsert({
          building_id: buildingId,
          monthly_charge: monthlyCharge,
          paid_apts: paidApts,
          updated_at: new Date().toISOString()
        }, { onConflict: 'building_id' });

      if (error) console.error('DB finance upsert error:', error);
    } catch (err) {
      console.error('DB finance error:', err);
    }
  },

  addPayment: async (buildingId: string, payment: Omit<PaymentRecord, 'id' | 'buildingId' | 'date'>) => {
    const newPayment: PaymentRecord = {
      id: `pay-${generateUUID()}`,
      buildingId,
      ...payment,
      date: new Date().toISOString()
    };
    const current = get().paymentLedger[buildingId] || [];
    const updated = [...current, newPayment];
    const newMap = { ...get().paymentLedger, [buildingId]: updated };
    set({ paymentLedger: newMap });
    try {
      localStorage.setItem('haven_payment_ledger', JSON.stringify(newMap));
    } catch (e) {}
  },

  removePayment: async (buildingId: string, paymentId: string) => {
    const current = get().paymentLedger[buildingId] || [];
    const updated = current.filter(p => p.id !== paymentId);
    const newMap = { ...get().paymentLedger, [buildingId]: updated };
    set({ paymentLedger: newMap });
    try {
      localStorage.setItem('haven_payment_ledger', JSON.stringify(newMap));
    } catch (e) {}
  },

  addFixedCharge: async (buildingId: string, chargeData: Omit<FixedCharge, 'id' | 'buildingId' | 'updatedAt'>) => {
    const newCharge: FixedCharge = {
      id: `fc-${generateUUID()}`,
      buildingId,
      ...chargeData,
      updatedAt: new Date().toISOString()
    };
    const current = get().fixedCharges[buildingId] || [];
    const updated = [newCharge, ...current];
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  updateFixedCharge: async (buildingId: string, chargeId: string, updates: Partial<FixedCharge>) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.map(c => c.id === chargeId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  deleteFixedCharge: async (buildingId: string, chargeId: string) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.filter(c => c.id !== chargeId);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error deleting fixed charge:', e);
    }
  },

  markChargePaid: async (buildingId: string, chargeId: string, isPaid: boolean) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.map(c => c.id === chargeId ? { ...c, isPaidThisMonth: isPaid } : c);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  addGrosTravauxProject: async (buildingId: string, projectData: any) => {
    const bldg = get().buildings.find(b => b.id === buildingId) || get().buildings[0];
    const totalUnits = bldg?.totalUnits || 30;
    const perQuota = totalUnits > 0 ? Math.round(projectData.totalCost / totalUnits) : projectData.totalCost;

    const newProject: GrosTravauxProject = {
      id: `gt-${Date.now()}`,
      buildingId,
      ...projectData,
      perUnitQuota: perQuota,
      paidApts: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const current = get().grosTravauxProjects[buildingId] || [];
    const updated = [newProject, ...current];
    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  updateGrosTravauxProject: async (buildingId: string, projectId: string, updates: any) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const bldg = get().buildings.find(b => b.id === buildingId) || get().buildings[0];
    const totalUnits = bldg?.totalUnits || 30;

    const updated = current.map(p => {
      if (p.id !== projectId) return p;
      const nextTotalCost = updates.totalCost !== undefined ? updates.totalCost : p.totalCost;
      const nextQuota = totalUnits > 0 ? Math.round(nextTotalCost / totalUnits) : nextTotalCost;
      return {
        ...p,
        ...updates,
        perUnitQuota: nextQuota
      };
    });

    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  toggleGrosTravauxAptPaid: async (buildingId: string, projectId: string, aptNumber: string) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const cleanNum = aptNumber.trim();
    const updated = current.map(p => {
      if (p.id !== projectId) return p;
      const setApts = new Set(p.paidApts || []);
      if (setApts.has(cleanNum)) {
        setApts.delete(cleanNum);
      } else {
        setApts.add(cleanNum);
      }
      return { ...p, paidApts: Array.from(setApts) };
    });

    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  deleteGrosTravauxProject: async (buildingId: string, projectId: string) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const projectToDelete = current.find(p => p.id === projectId);
    const updated = current.filter(p => p.id !== projectId);
    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
    
    if (projectToDelete) {
      const expectedTitle = `🚨 APPEL DE FONDS : ${projectToDelete.title}`;
      const relatedNotice = get().notices.find(n => n.title === expectedTitle && n.buildingId === buildingId);
      if (relatedNotice) {
        await get().deleteNotice(relatedNotice.id);
      }
    }
  },

  publishGrosTravauxNotice: async (buildingId: string, projectId: string) => {
    const projects = get().grosTravauxProjects[buildingId] || [];
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const bldg = get().buildings.find(b => b.id === buildingId) || get().buildings[0];
    const totalUnits = bldg?.totalUnits || 30;

    const noticeContent = `${project.description}\n\n` +
      `📌 Coût Total du Projet : ${project.totalCost.toLocaleString()} DA\n` +
      `🏢 Quote-part par Appartement : ${project.perUnitQuota.toLocaleString()} DA\n` +
      `📅 Échéance prévue : ${project.deadline}\n` +
      (project.contractorName ? `👷 Entreprise retenue : ${project.contractorName} (${project.contractorPhone || 'N/A'})\n` : '') +
      `✅ Progression actuelle : ${project.paidApts.length}/${totalUnits} appartements ont versé leur cotisation.`;

    await get().addNotice({
      buildingId,
      title: `🚨 APPEL DE FONDS : ${project.title}`,
      content: noticeContent,
      category: 'expense',
      author: 'Bureau du Syndic (Gros Travaux)',
      isPinned: true,
      expenseDetails: {
        totalAmount: project.totalCost,
        perResidentAmount: project.perUnitQuota
      }
    });
  }
});
