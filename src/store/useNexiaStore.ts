import { createAuthSlice } from './slices/authSlice';
import { createBuildingSlice } from './slices/buildingSlice';
import { createFinanceSlice } from './slices/financeSlice';
import { createEmployeeSlice } from './slices/employeeSlice';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { 
  Incident, 
  Building, 
  BuildingNotice, 
  EmergencyContact, 
  StaffContact, 
  ResidentReport, 
  ResidentProfile, 
  ManagerProfile,
  FixedCharge,
  GrosTravauxProject,
  PaymentRecord,
  Employee,
  UserRole, 
  IncidentStatus 
} from '../types/building';
import { playAlertSound } from '../utils/audio';

import { 
  DEFAULT_BUILDINGS, 
  DEFAULT_BUILDING, 
  DEFAULT_FIXED_CHARGES, 
  DEFAULT_GROS_TRAVAUX, 
  STAFF_CONTACTS, 
  CONTRACTOR_CONTACTS 
} from './mockData';

// Load persisted accounts from storage if present
const getSavedRegisteredAccounts = (): ResidentProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedResidentSession = (): ResidentProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_resident_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getSavedRegisteredManagers = (): ManagerProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_managers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedManagerSession = (): ManagerProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_manager_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getSavedFixedCharges = (): Record<string, FixedCharge[]> => {
  if (typeof window === 'undefined') return DEFAULT_FIXED_CHARGES;
  try {
    const raw = localStorage.getItem('haven_fixed_charges');
    return raw ? JSON.parse(raw) : DEFAULT_FIXED_CHARGES;
  } catch {
    return DEFAULT_FIXED_CHARGES;
  }
};

const getSavedGrosTravaux = (): Record<string, GrosTravauxProject[]> => {
  if (typeof window === 'undefined') return DEFAULT_GROS_TRAVAUX;
  try {
    const raw = localStorage.getItem('haven_gros_travaux');
    return raw ? JSON.parse(raw) : DEFAULT_GROS_TRAVAUX;
  } catch {
    return DEFAULT_GROS_TRAVAUX;
  }
};

const getSavedPaymentLedger = (): Record<string, PaymentRecord[]> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('haven_payment_ledger');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const getSavedEmployees = (): Employee[] => {
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

// Normalize clean strings
const cleanStr = (val?: string) => (val || '').trim().toLowerCase();
const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
const cleanApt = (val?: string) => (val || '').trim().toLowerCase().replace(/^apt\s*/i, '');
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
// Ensure password meets Supabase Auth's 6-char minimum by padding if needed
const toAuthPassword = (pwd: string): string => pwd.length >= 6 ? pwd : `${pwd}${'0'.repeat(6 - pwd.length)}`;

interface BuildingState {
  currentRole: UserRole;
  userApartment: string;
  residentProfile: ResidentProfile | null;
  registeredAccounts: ResidentProfile[];
  managerProfile: ManagerProfile | null;
  registeredManagers: ManagerProfile[];
  buildings: Building[];
  activeBuildingId: string;
  residentHomeBuildingId: string;
  activeIncidents: Incident[];
  resolvedIncidents: Incident[];
  notices: BuildingNotice[];
  staffContacts: StaffContact[];
  contractorContacts: EmergencyContact[];
  residentReports: ResidentReport[];
  finances: Record<string, { monthlyCharge: number, paidApts: string[] }>;
  paymentLedger: Record<string, PaymentRecord[]>;
  fixedCharges: Record<string, FixedCharge[]>;
  grosTravauxProjects: Record<string, GrosTravauxProject[]>;
  employees: Employee[];
  unreadAlertCount: number;
  soundEnabled: boolean;
  isLoading: boolean;
  
  // Actions
  initializeData: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setActiveBuilding: (buildingId: string) => void;
  registerResident: (accountData: ResidentProfile) => Promise<{ success: boolean; message?: string }>;
  loginResidentWithCredentials: (buildingId: string, aptNumber: string, passwordOrPhone: string) => Promise<{ success: boolean; message?: string }>;
  loginResident: (profile: ResidentProfile) => Promise<void>;
  logoutResident: () => void;
  registerManager: (data: { name: string; emailOrPhone: string; password: string; agencyName?: string }) => Promise<{ success: boolean; message?: string }>;
  loginManager: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutManager: () => void;
  toggleSound: () => void;
  clearUnreadAlerts: () => void;
  
  // Database Actions
  addBuilding: (buildingData: Omit<Building, 'id'>) => Promise<void>;
  removeBuilding: (buildingId: string) => Promise<void>;
  broadcastIncident: (newIncident: any) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => Promise<void>;
  addTimelineNote: (incidentId: string, note: string) => Promise<void>;
  confirmRestoration: (incidentId: string, isRestored: boolean) => Promise<void>;
  submitResidentReport: (report: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: 'pending' | 'in_review' | 'resolved') => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  updateFinances: (buildingId: string, monthlyCharge: number, paidApts: string[]) => Promise<void>;
  addPayment: (buildingId: string, payment: Omit<PaymentRecord, 'id' | 'date' | 'buildingId'>) => Promise<void>;
  removePayment: (buildingId: string, paymentId: string) => Promise<void>;

  // Operating Budget & Fixed Charges Actions
  addFixedCharge: (buildingId: string, charge: Omit<FixedCharge, 'id' | 'buildingId'>) => Promise<void>;
  updateFixedCharge: (buildingId: string, chargeId: string, updates: Partial<FixedCharge>) => Promise<void>;
  deleteFixedCharge: (buildingId: string, chargeId: string) => Promise<void>;
  markChargePaid: (buildingId: string, chargeId: string, isPaid: boolean) => Promise<void>;

  addEmployee: (employeeData: Omit<Employee, 'id' | 'joinedAt'>) => Promise<void>;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;

  // Gros Travaux (Major Works & Exceptional Levies) Actions
  addGrosTravauxProject: (buildingId: string, project: Omit<GrosTravauxProject, 'id' | 'buildingId' | 'createdAt' | 'paidApts' | 'perUnitQuota'>) => Promise<void>;
  updateGrosTravauxProject: (buildingId: string, projectId: string, updates: Partial<GrosTravauxProject>) => Promise<void>;
  toggleGrosTravauxAptPaid: (buildingId: string, projectId: string, aptNumber: string) => Promise<void>;
  deleteGrosTravauxProject: (buildingId: string, projectId: string) => Promise<void>;
  publishGrosTravauxNotice: (buildingId: string, projectId: string) => Promise<void>;
}

const initialSavedProfile = getSavedResidentSession();
const initialSavedManager = getSavedManagerSession();

// Guard to prevent multiple realtime subscriptions
let realtimeSubscribed = false;

export const useNexiaStore = create<BuildingState>((set, get, api) => ({
  currentRole: 'resident',
  userApartment: initialSavedProfile ? `Apt ${initialSavedProfile.aptNumber} (Étage ${initialSavedProfile.floor})` : '',
  residentProfile: initialSavedProfile,
  registeredAccounts: getSavedRegisteredAccounts(),
  managerProfile: initialSavedManager,
  registeredManagers: getSavedRegisteredManagers(),
  buildings: DEFAULT_BUILDINGS,
  activeBuildingId: initialSavedProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  residentHomeBuildingId: initialSavedProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  activeIncidents: [],
  resolvedIncidents: [],
  notices: [],
  staffContacts: STAFF_CONTACTS,
  contractorContacts: CONTRACTOR_CONTACTS,
  residentReports: [],
  finances: {},
  paymentLedger: getSavedPaymentLedger(),
  fixedCharges: getSavedFixedCharges(),
  grosTravauxProjects: getSavedGrosTravaux(),
  employees: getSavedEmployees(),
  unreadAlertCount: 0,
  soundEnabled: true,
  isLoading: false,

  initializeData: async () => {
    try {
      // Load buildings
      const { data: bData, error: bError } = await supabase.from('buildings').select('*');
      if (!bError && bData && bData.length > 0) {
        const formattedBuildings: Building[] = bData.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address,
          totalUnits: b.total_units || 30,
          towers: Array.isArray(b.towers) ? b.towers : (b.towers ? [b.towers] : ['Tour A']),
          status: b.status || 'operational'
        }));
        
        const currentActive = get().activeBuildingId;
        const exists = formattedBuildings.some(b => b.id === currentActive);
        set({
          buildings: formattedBuildings,
          activeBuildingId: exists ? currentActive : formattedBuildings[0].id
        });
      }

      // Validate active session with backend — skip in Capacitor (no backend server)
      const isCapacitor = typeof window !== 'undefined' && (
        !!(window as any).Capacitor || 
        window.location.protocol === 'capacitor:' ||
        window.location.hostname === 'localhost' && window.location.protocol === 'https:'
      );
      const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
      if (token && !isCapacitor) {
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.success && meData.profile) {
              const currentBldg = get().buildings.find(b => b.id === meData.profile.buildingId) || get().buildings[0] || DEFAULT_BUILDING;
              set({
                residentProfile: meData.profile,
                userApartment: `Apt ${meData.profile.aptNumber} (Étage ${meData.profile.floor})`,
                residentHomeBuildingId: meData.profile.buildingId,
                activeBuildingId: currentBldg.id
              });
            }
          }
        } catch {
          // Fallback to local profile
        }
      }

      // Fetch incidents
      const { data: incData, error: incErr } = await supabase.from('incidents').select(`*, incident_timelines(*), incident_confirmations(*)`);
      if (!incErr && incData && incData.length > 0) {
        const active: Incident[] = [];
        const resolved: Incident[] = [];

        incData.forEach(inc => {
          const formatted: Incident = {
            id: inc.id,
            buildingId: inc.building_id,
            category: inc.category || 'water',
            severity: inc.severity || 'warning',
            title: inc.title,
            description: inc.description,
            location: inc.location,
            affectedUnits: inc.affected_units || 'Tous',
            status: inc.status || 'reported',
            reportedAt: new Date(inc.reported_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estimatedRestorationTime: inc.estimated_restoration_time || 'Sous peu',
            etaCountdownMinutes: inc.eta_countdown_minutes || 0,
            requiresResidentConfirmation: inc.requires_resident_confirmation ?? (inc.category === 'water'),
            timeline: (inc.incident_timelines || []).map((t: any) => ({
              id: t.id, 
              status: t.status, 
              label: t.label || t.status, 
              timestamp: new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              note: t.note, 
              author: t.author || 'Bureau du Syndic'
            })),
            confirmations: (inc.incident_confirmations || []).map((c: any) => ({
              apartment: c.unit_id || 'Résident', 
              isRestored: c.is_restored, 
              timestamp: c.created_at
            }))
          };

          if (inc.status === 'resolved') resolved.push(formatted);
          else active.push(formatted);
        });

        set({ activeIncidents: active, resolvedIncidents: resolved });
      }

      // Fetch notices
      const { data: nData, error: nErr } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (!nErr && nData && nData.length > 0) {
        set({
          notices: nData.map(n => ({
            id: n.id,
            buildingId: n.building_id,
            title: n.title,
            content: n.content,
            category: n.category || 'info',
            author: n.author || 'Bureau du Syndic',
            date: new Date(n.created_at).toLocaleDateString(),
            isPinned: Boolean(n.is_pinned),
            expenseDetails: n.total_amount ? {
              totalAmount: Number(n.total_amount),
              perResidentAmount: Number(n.per_resident_amount)
            } : undefined
          }))
        });
      }

      // Fetch tickets
      const { data: tData, error: tErr } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (!tErr && tData && tData.length > 0) {
        set({
          residentReports: tData.map(t => ({
            id: t.id,
            buildingId: t.building_id,
            category: t.category || 'general',
            location: t.location,
            description: t.description,
            photoUrl: t.photo_url,
            status: t.status || 'pending',
            submittedBy: t.submitted_by || 'Résident',
            submittedAt: new Date(t.created_at).toLocaleDateString()
          }))
        });
      }

      // Fetch residents (excluding manager accounts)
      const { data: resData, error: resErr } = await supabase
        .from('residents')
        .select('*')
        .neq('building_id', 'manager');

      if (!resErr && resData && resData.length > 0) {
        set({
          registeredAccounts: resData.map(r => ({
            id: r.id,
            lastName: r.last_name,
            firstName: r.first_name,
            buildingId: r.building_id,
            floor: r.floor,
            aptNumber: r.apt_number,
            phone: r.phone,
            password: r.password,
            joinedAt: r.joined_at
          }))
        });
      }

      // Fetch managers from Supabase
      try {
        const { data: mgrData, error: mgrErr } = await supabase
          .from('residents')
          .select('*')
          .eq('building_id', 'manager');

        const remoteManagers: ManagerProfile[] = (!mgrErr && mgrData && mgrData.length > 0)
          ? mgrData.map(m => ({
              id: m.id,
              name: m.first_name,
              emailOrPhone: m.phone || m.apt_number.replace('MANAGER:', ''),
              password: m.password,
              agencyName: m.last_name !== 'Syndic' ? m.last_name : '',
              createdAt: m.created_at || new Date().toISOString()
            }))
          : [];

        const existingLocal = get().registeredManagers;
        const mergedManagers = [...remoteManagers];
        existingLocal.forEach(localM => {
          if (!mergedManagers.some(m => m.emailOrPhone.toLowerCase() === localM.emailOrPhone.toLowerCase())) {
            mergedManagers.push(localM);
          }
        });

        // Automatically push any local manager to Supabase if not yet in Supabase
        for (const localM of existingLocal) {
          if (!remoteManagers.some(rm => rm.emailOrPhone.toLowerCase() === localM.emailOrPhone.toLowerCase())) {
            try {
              const syncUUID = (localM.id && localM.id.length === 36 && !localM.id.startsWith('mgr-')) 
                ? localM.id 
                : generateUUID();
              await supabase.from('residents').upsert({
                id: syncUUID,
                first_name: localM.name,
                last_name: localM.agencyName || 'Syndic',
                building_id: 'manager',
                floor: 'Bureau',
                apt_number: `MANAGER:${localM.emailOrPhone.trim().toLowerCase()}`,
                phone: localM.emailOrPhone,
                password: localM.password,
                joined_at: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
              });
              console.info('Synced existing local manager to Supabase:', localM.name);
            } catch (syncErr) {
              console.warn('Sync manager to Supabase note:', syncErr);
            }
          }
        }

        set({ registeredManagers: mergedManagers });
        try {
          localStorage.setItem('haven_registered_managers', JSON.stringify(mergedManagers));
        } catch {
          // Ignore
        }
      } catch (err) {
        console.warn('Failed to sync remote managers from Supabase:', err);
      }

      // Fetch finances
      const { data: finData, error: finErr } = await supabase.from('finances').select('*');
      if (!finErr && finData && finData.length > 0) {
        const financesMap: Record<string, { monthlyCharge: number, paidApts: string[] }> = {};
        finData.forEach(f => {
          financesMap[f.building_id] = {
            monthlyCharge: Number(f.monthly_charge) || 2500,
            paidApts: Array.isArray(f.paid_apts) ? f.paid_apts : []
          };
        });
        set({ finances: financesMap });
      }
    } catch (err) {
      console.info('State initialized clean; Supabase sync available:', err);
    }

    // Subscribe to realtime changes safely (only once)
    if (!realtimeSubscribed) {
      realtimeSubscribed = true;
      try {
        supabase.channel('haven:changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
            get().initializeData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            get().initializeData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
            get().initializeData();
          })
          .subscribe();
      } catch {
        realtimeSubscribed = false; // Allow retry on failure
      }
    }
  },

  setRole: (role: UserRole) => set({ currentRole: role }),

  setActiveBuilding: (buildingId: string) => {
    set({ activeBuildingId: buildingId });
  },

  ...createAuthSlice(set, get, api),

  toggleSound: () => set((state: any) => ({ soundEnabled: !state.soundEnabled })),

  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),

  ...createBuildingSlice(set, get, api),

  ...createFinanceSlice(set, get, api),

  ...createEmployeeSlice(set, get, api)
}));
