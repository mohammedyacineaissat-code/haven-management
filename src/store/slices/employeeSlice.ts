import { StateCreator } from 'zustand';
import { Employee } from '../../types/building';
import { StoreState } from '../storeTypes';
import { generateUUID } from './helpers';
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
  },

  updateEmployee: async (employeeId: string, updates: Partial<Employee>) => {
    const updated = get().employees.map(e => e.id === employeeId ? { ...e, ...updates } : e);
    set({ employees: updated });
    try {
      localStorage.setItem('haven_employees', JSON.stringify(updated));
    } catch (e) {}
  },

  deleteEmployee: async (employeeId: string) => {
    const updated = get().employees.filter(e => e.id !== employeeId);
    set({ employees: updated });
    try {
      localStorage.setItem('haven_employees', JSON.stringify(updated));
    } catch (e) {}
  }
});
