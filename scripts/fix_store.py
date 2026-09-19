import sys

filename = 'src/store/useNexiaStore.ts'

with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if 'setRole: (role: UserRole) => set(' in line:
        skip = True
        
    if not skip:
        new_lines.append(line)
        if 'import { playAlertSound }' in line:
            new_lines.append("import { createAuthSlice } from './slices/authSlice';\n")
            new_lines.append("import { createBuildingSlice } from './slices/buildingSlice';\n")
            new_lines.append("import { createFinanceSlice } from './slices/financeSlice';\n")
            new_lines.append("import { createEmployeeSlice } from './slices/employeeSlice';\n")

# Append the sliced exports
new_lines.append("  ...createAuthSlice(set, get, api),\n\n")
new_lines.append("  toggleSound: () => set((state: any) => ({ soundEnabled: !state.soundEnabled })),\n\n")
new_lines.append("  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),\n\n")
new_lines.append("  ...createBuildingSlice(set, get, api),\n\n")
new_lines.append("  ...createFinanceSlice(set, get, api),\n\n")
new_lines.append("  ...createEmployeeSlice(set, get, api)\n")
new_lines.append("}));\n")

with open(filename, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done')
