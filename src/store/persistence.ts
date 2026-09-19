import { ResidentProfile, ManagerProfile, FixedCharge, GrosTravauxProject, PaymentRecord, Employee } from '../types/building';
import { DEFAULT_FIXED_CHARGES, DEFAULT_GROS_TRAVAUX } from './mockData';

export const getSavedRegisteredAccounts = (): ResidentProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getSavedResidentSession = (): ResidentProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_resident_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getSavedRegisteredManagers = (): ManagerProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_managers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getSavedManagerSession = (): ManagerProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_manager_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getSavedFixedCharges = (): Record<string, FixedCharge[]> => {
  if (typeof window === 'undefined') return DEFAULT_FIXED_CHARGES;
  try {
    const raw = localStorage.getItem('haven_fixed_charges');
    return raw ? JSON.parse(raw) : DEFAULT_FIXED_CHARGES;
  } catch {
    return DEFAULT_FIXED_CHARGES;
  }
};

export const getSavedGrosTravaux = (): Record<string, GrosTravauxProject[]> => {
  if (typeof window === 'undefined') return DEFAULT_GROS_TRAVAUX;
  try {
    const raw = localStorage.getItem('haven_gros_travaux');
    return raw ? JSON.parse(raw) : DEFAULT_GROS_TRAVAUX;
  } catch {
    return DEFAULT_GROS_TRAVAUX;
  }
};

export const getSavedPaymentLedger = (): Record<string, PaymentRecord[]> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('haven_payment_ledger');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getSavedEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_employees');
    return raw ? JSON.parse(raw) : [
      { id: 'emp-1', firstName: 'Ahmed', lastName: 'Benali', role: 'gardien', phone: '0555123456', cin: '109876543', salary: 35000, contractType: 'CDI', buildingId: 'bldg-1', status: 'active', joinedAt: '2025-01-10' },
      { id: 'emp-2', firstName: 'Karim', lastName: 'Ziani', role: 'gardien', phone: '0770987654', cin: '209876543', salary: 35000, contractType: 'CDI', buildingId: 'bldg-1', status: 'active', joinedAt: '2025-02-15' },
      { id: 'emp-3', firstName: 'Fatima', lastName: 'Saidi', role: 'cleaner', phone: '0666112233', cin: '309876543', salary: 28000, contractType: 'CDD', buildingId: 'bldg-2', status: 'active', joinedAt: '2025-03-01' },
      { id: 'emp-4', firstName: 'Yassine', lastName: 'Brahimi', role: 'technician', phone: '0555998877', cin: '409876543', salary: 45000, contractType: 'CDI', status: 'active', joinedAt: '2024-11-20' },
    ];
  } catch {
    return [];
  }
};
