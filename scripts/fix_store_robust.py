import subprocess

store = subprocess.check_output(['git', 'show', 'HEAD:src/store/useNexiaStore.ts'], text=True)
lines = store.splitlines(True)
new_lines = []
skip = False
for line in lines:
    if 'setRole: (role: UserRole) => set(' in line:
        skip = True
        
    if not skip:
        l = line
        if 'export const useNexiaStore = create<BuildingState>((set, get)' in l:
            l = l.replace('(set, get)', '(set, get, api)')
        new_lines.append(l)
        if 'import { playAlertSound }' in l:
            new_lines.append("import { createAuthSlice } from './slices/authSlice';\n")
            new_lines.append("import { createBuildingSlice } from './slices/buildingSlice';\n")
            new_lines.append("import { createFinanceSlice } from './slices/financeSlice';\n")
            new_lines.append("import { createEmployeeSlice } from './slices/employeeSlice';\n")

new_lines.append("  ...createAuthSlice(set, get, api),\n\n")
new_lines.append("  toggleSound: () => set((state: any) => ({ soundEnabled: !state.soundEnabled })),\n\n")
new_lines.append("  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),\n\n")
new_lines.append("  ...createBuildingSlice(set, get, api),\n\n")
new_lines.append("  ...createFinanceSlice(set, get, api),\n\n")
new_lines.append("  ...createEmployeeSlice(set, get, api)\n")
new_lines.append("}));\n")

with open('src/store/useNexiaStore.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
