import { createAuthSlice } from './slices/authSlice';
import { createBuildingSlice } from './slices/buildingSlice';
import { createFinanceSlice } from './slices/financeSlice';
import { createEmployeeSlice } from './slices/employeeSlice';
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Incident, 
  Building, 
  BuildingNotice, 
  ResidentProfile, 
  ManagerProfile,
  UserRole 
} from '../types/building';
import { StoreState } from './storeTypes';
import { playAlertSound } from '../utils/audio';
import { generateUUID } from './slices/helpers';

import { 
  DEFAULT_BUILDINGS, 
  DEFAULT_BUILDING, 
  DEFAULT_FIXED_CHARGES, 
  DEFAULT_GROS_TRAVAUX, 
  STAFF_CONTACTS, 
  CONTRACTOR_CONTACTS 
} from './mockData';

import {
  getSavedRegisteredAccounts,
  getSavedResidentSession,
  getSavedRegisteredManagers,
  getSavedManagerSession,
  getSavedFixedCharges,
  getSavedGrosTravaux,
  getSavedPaymentLedger,
  getSavedEmployees
} from './persistence';

const initialSavedProfile = getSavedResidentSession();
const initialSavedManager = getSavedManagerSession();

// Guard to prevent multiple realtime subscriptions
let realtimeSubscribed = false;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

// --- Helpers for targeted realtime partial updates ---
const formatIncident = (inc: any): Incident => ({
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
});

const formatNotice = (n: any): BuildingNotice => ({
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
});

export const useNexiaStore = create<StoreState>((set, get, api) => ({
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
    if (!isSupabaseConfigured) {
      // Running in local-only mode — no Supabase queries
      return;
    }

    set({ isLoading: true });

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
          const formatted = formatIncident(inc);
          if (inc.status === 'resolved') resolved.push(formatted);
          else active.push(formatted);
        });

        set({ activeIncidents: active, resolvedIncidents: resolved });
      }

      // Fetch notices
      const { data: nData, error: nErr } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (!nErr && nData && nData.length > 0) {
        set({ notices: nData.map(formatNotice) });
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
              password: '',
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
    } finally {
      set({ isLoading: false });
    }

    // Subscribe to realtime changes safely (only once)
    // Uses targeted partial fetches instead of re-calling initializeData
    // to prevent infinite loops (initializeData writes → triggers change → calls initializeData).
    if (!realtimeSubscribed && isSupabaseConfigured) {
      realtimeSubscribed = true;
      try {
        realtimeChannel = supabase.channel('haven:changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, async () => {
            // Targeted: only refetch incidents
            try {
              const { data: incData, error: incErr } = await supabase.from('incidents').select(`*, incident_timelines(*), incident_confirmations(*)`);
              if (!incErr && incData) {
                const active: Incident[] = [];
                const resolved: Incident[] = [];
                incData.forEach(inc => {
                  const formatted = formatIncident(inc);
                  if (inc.status === 'resolved') resolved.push(formatted);
                  else active.push(formatted);
                });
                set({ activeIncidents: active, resolvedIncidents: resolved });
              }
            } catch { /* silent */ }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, async () => {
            // Targeted: only refetch tickets
            try {
              const { data: tData, error: tErr } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
              if (!tErr && tData) {
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
            } catch { /* silent */ }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, async () => {
            // Targeted: only refetch notices
            try {
              const { data: nData, error: nErr } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
              if (!nErr && nData) {
                set({ notices: nData.map(formatNotice) });
              }
            } catch { /* silent */ }
          })
          .subscribe();
      } catch {
        realtimeSubscribed = false; // Allow retry on failure
      }
    }
  },

  cleanupData: () => {
    if (realtimeSubscribed && realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeSubscribed = false;
      realtimeChannel = null;
    }
  },

  setRole: (role: UserRole) => set({ currentRole: role }),

  setActiveBuilding: (buildingId: string) => {
    set({ activeBuildingId: buildingId });
  },

  ...createAuthSlice(set, get, api),

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),

  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),

  ...createBuildingSlice(set, get, api),

  ...createFinanceSlice(set, get, api),

  ...createEmployeeSlice(set, get, api)
}));
