import sys

store_file = 'src/store/useNexiaStore.ts'
slice_file = 'src/store/slices/buildingSlice.ts'

with open(store_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_building = False
building_methods = []

for line in lines:
    if 'addBuilding: async (buildingData' in line:
        in_building = True
    if 'updateFinances: async' in line:
        in_building = False
        
    if in_building:
        building_methods.append(line)

# Create buildingSlice.ts
header = """import { StateCreator } from 'zustand';
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

footer = """});
"""

# Let's fix some implicit any types inside building_methods
fixed_methods = []
for line in building_methods:
    l = line
    if 'addBuilding: async (buildingData)' in l:
        l = l.replace('addBuilding: async (buildingData)', 'addBuilding: async (buildingData: any)')
    elif 'broadcastIncident: async (newIncident)' in l:
        l = l.replace('broadcastIncident: async (newIncident)', 'broadcastIncident: async (newIncident: any)')
    elif 'updateIncidentStatus: async (incidentId, status, note)' in l:
        l = l.replace('updateIncidentStatus: async (incidentId, status, note)', 'updateIncidentStatus: async (incidentId: string, status: any, note?: string)')
    elif 'addTimelineNote: async (incidentId, note)' in l:
        l = l.replace('addTimelineNote: async (incidentId, note)', 'addTimelineNote: async (incidentId: string, note: string)')
    elif 'confirmRestoration: async (incidentId, isRestored)' in l:
        l = l.replace('confirmRestoration: async (incidentId, isRestored)', 'confirmRestoration: async (incidentId: string, isRestored: boolean)')
    elif 'submitResidentReport: async (report)' in l:
        l = l.replace('submitResidentReport: async (report)', 'submitResidentReport: async (report: any)')
    elif 'updateTicketStatus: async (ticketId, status)' in l:
        l = l.replace('updateTicketStatus: async (ticketId, status)', 'updateTicketStatus: async (ticketId: string, status: any)')
    elif 'addNotice: async (notice)' in l:
        l = l.replace('addNotice: async (notice)', 'addNotice: async (notice: any)')
    elif 'deleteNotice: async (noticeId)' in l:
        l = l.replace('deleteNotice: async (noticeId)', 'deleteNotice: async (noticeId: string)')
    
    # Zustand `set` state implicit any fixes:
    if 'set(state =>' in l:
        l = l.replace('set(state =>', 'set((state: any) =>')
    if 'inc =>' in l:
        l = l.replace('inc =>', '(inc: any) =>')
    if 'c =>' in l:
        l = l.replace('c =>', '(c: any) =>')
    if 'r =>' in l:
        l = l.replace('r =>', '(r: any) =>')
    if 'n =>' in l:
        l = l.replace('n =>', '(n: any) =>')
    if 'i =>' in l:
        l = l.replace('i =>', '(i: any) =>')
    
    # Remove the trailing comma from the last method if needed (updateFinances isn't included so the last one might have a comma)
    fixed_methods.append(l)

# Make sure the last line doesn't have a trailing comma before closing object
if fixed_methods and fixed_methods[-1].strip().endswith(','):
    fixed_methods[-1] = fixed_methods[-1].rsplit(',', 1)[0] + '\n'

with open(slice_file, 'w', encoding='utf-8') as f:
    f.write(header)
    f.writelines(fixed_methods)
    f.write(footer)

print("buildingSlice.ts extracted successfully!")
