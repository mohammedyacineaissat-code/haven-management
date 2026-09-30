import { StateCreator } from 'zustand';
import { Employee } from '../../types/building';
import { StoreState } from '../storeTypes';
import { generateUUID } from './helpers';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export type EmployeeSlice = Pick<StoreState, 'addEmployee' | 'updateEmployee' | 'deleteEmployee'>;

export const createEmployeeSlice: StateCreator<StoreState, [], [], EmployeeSlice> = (set, get, api) => ({
  addEmployee: async (employeeData: Omit<Employee, 'id' | 'joinedAt'>) => {
    const newEmp: Employee = {
      id: `emp-${generateUUID()}`,
      joinedAt: new Date().toISOString(),
      ...employeeData
    };
    const updated = [...get().employees, newEmp];
    set({ employees: updated });
    try {
      localStorage.setItem('haven_employees', JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('employees').insert({
          id: newEmp.id,
          first_name: newEmp.firstName,
          last_name: newEmp.lastName,
          role: newEmp.role,
          phone: newEmp.phone,
          cin: newEmp.cin,
          salary: newEmp.salary,
          contract_type: newEmp.contractType,
          building_id: newEmp.buildingId,
          status: newEmp.status,
          joined_at: newEmp.joinedAt
        });
      } catch (err) {
        console.debug('Failed to sync employee to Supabase', err);
      }
    }
  },

  updateEmployee: async (employeeId: string, updates: Partial<Employee>) => {
    const updated = get().employees.map(e => e.id === employeeId ? { ...e, ...updates } : e);
    set({ employees: updated });
    try {
      localStorage.setItem('haven_employees', JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.firstName !== undefined) payload.first_name = updates.firstName;
        if (updates.lastName !== undefined) payload.last_name = updates.lastName;
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.cin !== undefined) payload.cin = updates.cin;
        if (updates.salary !== undefined) payload.salary = updates.salary;
        if (updates.contractType !== undefined) payload.contract_type = updates.contractType;
        if (updates.buildingId !== undefined) payload.building_id = updates.buildingId;
        if (updates.status !== undefined) payload.status = updates.status;
        
        await supabase.from('employees').update(payload).eq('id', employeeId);
      } catch (err) {
        console.debug('Failed to update employee in Supabase', err);
      }
    }
  },

  deleteEmployee: async (employeeId: string) => {
    const updated = get().employees.filter(e => e.id !== employeeId);
    set({ employees: updated });
    try {
      localStorage.setItem('haven_employees', JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('employees').delete().eq('id', employeeId);
      } catch (err) {
        console.debug('Failed to delete employee from Supabase', err);
      }
    }
  }
});
