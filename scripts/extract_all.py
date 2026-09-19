import subprocess

# Get the original monolith from git
store = subprocess.check_output(['git', 'show', 'HEAD:src/store/useNexiaStore.ts'], encoding='utf-8')
lines = store.splitlines(True)

# 1. We know the slices ranges in lines.
# But instead of finding lines, let's just find the start and end indices of methods.

def find_idx(text):
    for i, line in enumerate(lines):
        if text in line:
            return i
    return -1

auth_start = find_idx("registerResident: async (accountData")
auth_end = find_idx("addBuilding: (buildingData") # End of auth (Wait, addBuilding is interface. Let's use the actual method)
if auth_end == -1 or auth_end < auth_start:
    auth_end = find_idx("addBuilding: async (buildingData")

building_start = find_idx("addBuilding: async (buildingData")
building_end = find_idx("updateFinances: async (buildingId")

finance_start = find_idx("updateFinances: async (buildingId")
finance_end = find_idx("addEmployee: async (employeeData")

employee_start = find_idx("addEmployee: async (employeeData")
employee_end = len(lines) - 1  # Before the last `}));`

# Create Auth Slice
auth_content = """import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { ResidentProfile, ManagerProfile } from '../../types/building';
import { StoreState } from '../storeTypes';
import { toAuthPassword, cleanDigits } from './helpers';

export type AuthSlice = Pick<StoreState, 
  'registerResident' | 
  'loginResidentWithCredentials' | 
  'loginResident' | 
  'logoutResident' | 
  'registerManager' | 
  'loginManager' | 
  'logoutManager'
>;

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get, api) => ({
"""
auth_methods = lines[auth_start:building_start]
# Fix implicit anys
fixed_auth = []
for l in auth_methods:
    l = l.replace('loginResidentWithCredentials: async (buildingId, aptNumber, passwordOrPhone)', 'loginResidentWithCredentials: async (buildingId: string, aptNumber: string, passwordOrPhone: string)')
    l = l.replace('loginResident: async (profile)', 'loginResident: async (profile: ResidentProfile)')
    l = l.replace('registerManager: async (data)', 'registerManager: async (data: any)')
    l = l.replace('loginManager: async (emailOrPhone, password)', 'loginManager: async (emailOrPhone: string, password: string)')
    l = l.replace('existing.some(m =>', 'existing.some((m: any) =>')
    l = l.replace('existing.filter(m =>', 'existing.filter((m: any) =>')
    l = l.replace('registeredAccounts.filter(a =>', 'registeredAccounts.filter((a: any) =>')
    l = l.replace('registeredAccounts.find(a =>', 'registeredAccounts.find((a: any) =>')
    l = l.replace('registeredManagers.some(m =>', 'registeredManagers.some((m: any) =>')
    l = l.replace('registeredManagers.find(m =>', 'registeredManagers.find((m: any) =>')
    fixed_auth.append(l)

# Strip trailing comma
if fixed_auth[-1].strip().endswith(','):
    fixed_auth[-1] = fixed_auth[-1].rsplit(',', 1)[0] + '\n'

with open('src/store/slices/authSlice.ts', 'w', encoding='utf-8') as f:
    f.write(auth_content)
    f.writelines(fixed_auth)
    f.write("});\n")


# Create Building Slice
building_content = """import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Incident, ResidentReport, BuildingNotice, Building } from '../../types/building';
import { StoreState } from '../storeTypes';
import { playAlertSound } from '../../utils/audio';

export type BuildingSlice = Pick<StoreState, 
  'addBuilding' |
  'removeBuilding' |
  'broadcastIncident' |
  'updateIncidentStatus' |
  'addTimelineNote' |
  'confirmRestoration' |
  'submitResidentReport' |
  'updateTicketStatus' |
  'addNotice' |
  'deleteNotice'
>;

export const createBuildingSlice: StateCreator<StoreState, [], [], BuildingSlice> = (set, get, api) => ({
"""
building_methods = lines[building_start:finance_start]
fixed_building = []
for l in building_methods:
    l = l.replace('addBuilding: async (buildingData)', 'addBuilding: async (buildingData: Omit<Building, "id">)')
    l = l.replace('removeBuilding: async (buildingId)', 'removeBuilding: async (buildingId: string)')
    l = l.replace('broadcastIncident: async (newIncident)', 'broadcastIncident: async (newIncident: any)')
    l = l.replace('updateIncidentStatus: async (incidentId, status, note)', 'updateIncidentStatus: async (incidentId: string, status: any, note?: string)')
    l = l.replace('addTimelineNote: async (incidentId, note)', 'addTimelineNote: async (incidentId: string, note: string)')
    l = l.replace('confirmRestoration: async (incidentId, isRestored)', 'confirmRestoration: async (incidentId: string, isRestored: boolean)')
    l = l.replace('submitResidentReport: async (report)', 'submitResidentReport: async (report: any)')
    l = l.replace('updateTicketStatus: async (ticketId, status)', 'updateTicketStatus: async (ticketId: string, status: any)')
    l = l.replace('addNotice: async (notice)', 'addNotice: async (notice: any)')
    l = l.replace('deleteNotice: async (noticeId)', 'deleteNotice: async (noticeId: string)')
    
    # Zustand `set` state implicit any fixes:
    l = l.replace('set(state =>', 'set((state: any) =>')
    l = l.replace('inc =>', '(inc: any) =>')
    l = l.replace('c =>', '(c: any) =>')
    l = l.replace('r =>', '(r: any) =>')
    l = l.replace('n =>', '(n: any) =>')
    l = l.replace('i =>', '(i: any) =>')
    l = l.replace('b =>', '(b: any) =>')
    
    fixed_building.append(l)

if fixed_building[-1].strip().endswith(','):
    fixed_building[-1] = fixed_building[-1].rsplit(',', 1)[0] + '\n'

with open('src/store/slices/buildingSlice.ts', 'w', encoding='utf-8') as f:
    f.write(building_content)
    f.writelines(fixed_building)
    f.write("});\n")

# Store
store_new = []
store_new.append("import { createAuthSlice } from './slices/authSlice';\n")
store_new.append("import { createBuildingSlice } from './slices/buildingSlice';\n")
store_new.append("import { createFinanceSlice } from './slices/financeSlice';\n")
store_new.append("import { createEmployeeSlice } from './slices/employeeSlice';\n")

for i in range(auth_start):
    l = lines[i]
    if 'export const useNexiaStore = create<BuildingState>((set, get)' in l:
        l = l.replace('(set, get)', '(set, get, api)')
    store_new.append(l)

store_new.append("  ...createAuthSlice(set, get, api),\n\n")
store_new.append("  ...createBuildingSlice(set, get, api),\n\n")
store_new.append("  ...createFinanceSlice(set, get, api),\n\n")
store_new.append("  ...createEmployeeSlice(set, get, api)\n")
store_new.append("}));\n")

with open('src/store/useNexiaStore.ts', 'w', encoding='utf-8') as f:
    f.writelines(store_new)

# Fix helpers.ts for authSlice
helpers = """export const toAuthPassword = (pwd: string): string => pwd.length >= 6 ? pwd : `${pwd}${'0'.repeat(6 - pwd.length)}`;
export const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
"""
with open('src/store/slices/helpers.ts', 'w', encoding='utf-8') as f:
    f.write(helpers)

print("Done generating from monolith.")
