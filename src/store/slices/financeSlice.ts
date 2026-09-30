import { StateCreator } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('payments').insert({
          id: newPayment.id,
          building_id: newPayment.buildingId,
          amount: newPayment.amount,
          apartment: newPayment.aptNumber,
          payment_method: newPayment.method,
          period: newPayment.period,
          date: newPayment.date
        });
      } catch (err) {
        console.debug('Failed to sync payment to Supabase', err);
      }
    }
  },

  removePayment: async (buildingId: string, paymentId: string) => {
    const current = get().paymentLedger[buildingId] || [];
    const updated = current.filter(p => p.id !== paymentId);
    const newMap = { ...get().paymentLedger, [buildingId]: updated };
    set({ paymentLedger: newMap });
    try {
      localStorage.setItem('haven_payment_ledger', JSON.stringify(newMap));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('payments').delete().eq('id', paymentId);
      } catch (err) {
        console.debug('Failed to delete payment from Supabase', err);
      }
    }
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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('fixed_charges').insert({
          id: newCharge.id,
          building_id: newCharge.buildingId,
          title: newCharge.title,
          category: newCharge.category,
          amount: newCharge.monthlyAmount,
          frequency: newCharge.frequency,
          payee: newCharge.payee,
          notes: newCharge.notes,
          is_paid_this_month: newCharge.isPaidThisMonth,
          updated_at: newCharge.updatedAt
        });
      } catch (err) {
        console.debug('Failed to sync fixed charge to Supabase', err);
      }
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

    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.monthlyAmount !== undefined) payload.amount = updates.monthlyAmount;
        if (updates.frequency !== undefined) payload.frequency = updates.frequency;
        if (updates.payee !== undefined) payload.payee = updates.payee;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.isPaidThisMonth !== undefined) payload.is_paid_this_month = updates.isPaidThisMonth;
        payload.updated_at = new Date().toISOString();
        
        await supabase.from('fixed_charges').update(payload).eq('id', chargeId);
      } catch (err) {
        console.debug('Failed to update fixed charge in Supabase', err);
      }
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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('fixed_charges').delete().eq('id', chargeId);
      } catch (err) {
        console.debug('Failed to delete fixed charge from Supabase', err);
      }
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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('fixed_charges').update({ is_paid_this_month: isPaid, updated_at: new Date().toISOString() }).eq('id', chargeId);
      } catch (err) {
        console.debug('Failed to update fixed charge status in Supabase', err);
      }
    }
  },

  addGrosTravauxProject: async (buildingId: string, projectData: Omit<GrosTravauxProject, 'id' | 'buildingId' | 'createdAt' | 'paidApts' | 'perUnitQuota'>) => {
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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('gros_travaux').insert({
          id: newProject.id,
          building_id: newProject.buildingId,
          title: newProject.title,
          description: newProject.description,
          total_cost: newProject.totalCost,
          per_unit_quota: newProject.perUnitQuota,
          deadline: newProject.deadline,
          contractor_name: newProject.contractorName,
          contractor_phone: newProject.contractorPhone,
          paid_apts: newProject.paidApts,
          status: newProject.status,
          created_at: newProject.createdAt
        });
      } catch (err) {
        console.debug('Failed to sync gros travaux to Supabase', err);
      }
    }
  },

  updateGrosTravauxProject: async (buildingId: string, projectId: string, updates: Partial<GrosTravauxProject>) => {
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

    if (isSupabaseConfigured) {
      try {
        const p = updated.find(proj => proj.id === projectId);
        if (p) {
          const payload: any = {};
          if (updates.title !== undefined) payload.title = updates.title;
          if (updates.description !== undefined) payload.description = updates.description;
          if (updates.totalCost !== undefined) {
            payload.total_cost = updates.totalCost;
            payload.per_unit_quota = p.perUnitQuota;
          }
          if (updates.deadline !== undefined) payload.deadline = updates.deadline;
          if (updates.contractorName !== undefined) payload.contractor_name = updates.contractorName;
          if (updates.contractorPhone !== undefined) payload.contractor_phone = updates.contractorPhone;
          if (updates.status !== undefined) payload.status = updates.status;
          
          await supabase.from('gros_travaux').update(payload).eq('id', projectId);
        }
      } catch (err) {
        console.debug('Failed to update gros travaux in Supabase', err);
      }
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

    if (isSupabaseConfigured) {
      try {
        const p = updated.find(proj => proj.id === projectId);
        if (p) {
          await supabase.from('gros_travaux').update({ paid_apts: p.paidApts }).eq('id', projectId);
        }
      } catch (err) {
        console.debug('Failed to update gros travaux paid_apts in Supabase', err);
      }
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
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from('gros_travaux').delete().eq('id', projectId);
      } catch (err) {
        console.debug('Failed to delete gros travaux from Supabase', err);
      }
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
