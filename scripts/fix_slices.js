const fs = require('fs');
const path = require('path');

const slicesDir = path.join(__dirname, '../src/store/slices');
const slices = ['authSlice.ts', 'buildingSlice.ts', 'employeeSlice.ts', 'financeSlice.ts'];

for (const slice of slices) {
  let content = fs.readFileSync(path.join(slicesDir, slice), 'utf-8');
  
  if (slice === 'employeeSlice.ts' || slice === 'financeSlice.ts') {
    content = content.replace(/from '\.\.\/types\/building'/g, "from '../../types/building'");
    content = content.replace(/from '\.\.\/lib\/supabase'/g, "from '../../lib/supabase'");
    content = content.replace(/from '\.\/storeTypes'/g, "from '../storeTypes'");
  }

  content = content.replace(/= \(set, get\) => \(\{/g, "= (set, get, api) => ({");
  
  content = content.replace(/addTimelineNote: async \(incidentId, note\)/g, "addTimelineNote: async (incidentId: string, note: string)");
  content = content.replace(/updateIncidentStatus: async \(incidentId, status, note\)/g, "updateIncidentStatus: async (incidentId: string, status: any, note?: string)");
  content = content.replace(/confirmRestoration: async \(incidentId, isRestored\)/g, "confirmRestoration: async (incidentId: string, isRestored: boolean)");
  content = content.replace(/addEmployee: async \(employeeData\)/g, "addEmployee: async (employeeData: any)");
  content = content.replace(/updateEmployee: async \(employeeId, updates\)/g, "updateEmployee: async (employeeId: string, updates: any)");
  content = content.replace(/deleteEmployee: async \(employeeId\)/g, "deleteEmployee: async (employeeId: string)");
  content = content.replace(/updateFinances: async \(buildingId: string, monthlyCharge: number, paidApts: string\[\]\)/g, "updateFinances: async (buildingId: string, monthlyCharge: number, paidApts: string[])");
  content = content.replace(/addPayment: async \(buildingId, payment\)/g, "addPayment: async (buildingId: string, payment: any)");
  content = content.replace(/removePayment: async \(buildingId, paymentId\)/g, "removePayment: async (buildingId: string, paymentId: string)");
  content = content.replace(/addFixedCharge: async \(buildingId, chargeData\)/g, "addFixedCharge: async (buildingId: string, chargeData: any)");
  content = content.replace(/updateFixedCharge: async \(buildingId, chargeId, updates\)/g, "updateFixedCharge: async (buildingId: string, chargeId: string, updates: any)");
  content = content.replace(/deleteFixedCharge: async \(buildingId, chargeId\)/g, "deleteFixedCharge: async (buildingId: string, chargeId: string)");
  content = content.replace(/markChargePaid: async \(buildingId, chargeId, isPaid\)/g, "markChargePaid: async (buildingId: string, chargeId: string, isPaid: boolean)");
  content = content.replace(/addGrosTravauxProject: async \(buildingId, projectData\)/g, "addGrosTravauxProject: async (buildingId: string, projectData: any)");
  content = content.replace(/updateGrosTravauxProject: async \(buildingId, projectId, updates\)/g, "updateGrosTravauxProject: async (buildingId: string, projectId: string, updates: any)");
  content = content.replace(/toggleGrosTravauxAptPaid: async \(buildingId, projectId, aptNumber\)/g, "toggleGrosTravauxAptPaid: async (buildingId: string, projectId: string, aptNumber: string)");
  content = content.replace(/deleteGrosTravauxProject: async \(buildingId, projectId\)/g, "deleteGrosTravauxProject: async (buildingId: string, projectId: string)");
  content = content.replace(/publishGrosTravauxNotice: async \(buildingId, projectId\)/g, "publishGrosTravauxNotice: async (buildingId: string, projectId: string)");
  content = content.replace(/submitResidentReport: async \(report\)/g, "submitResidentReport: async (report: any)");
  content = content.replace(/updateTicketStatus: async \(ticketId, status\)/g, "updateTicketStatus: async (ticketId: string, status: any)");
  content = content.replace(/addNotice: async \(notice\)/g, "addNotice: async (notice: any)");
  content = content.replace(/deleteNotice: async \(noticeId: string\)/g, "deleteNotice: async (noticeId: string)");
  
  fs.writeFileSync(path.join(slicesDir, slice), content);
}

const storePath = path.join(__dirname, '../src/store/useNexiaStore.ts');
let storeContent = fs.readFileSync(storePath, 'utf-8');
storeContent = storeContent.replace(/createAuthSlice\(set, get\)/g, "createAuthSlice(set, get, api)");
storeContent = storeContent.replace(/createBuildingSlice\(set, get\)/g, "createBuildingSlice(set, get, api)");
storeContent = storeContent.replace(/createFinanceSlice\(set, get\)/g, "createFinanceSlice(set, get, api)");
storeContent = storeContent.replace(/createEmployeeSlice\(set, get\)/g, "createEmployeeSlice(set, get, api)");

if (!storeContent.includes('createEmployeeSlice')) {
  storeContent = storeContent.replace(/\.\.\.createBuildingSlice\(set, get, api\),/g, "...createBuildingSlice(set, get, api),\n\n  ...createEmployeeSlice(set, get, api),");
}

fs.writeFileSync(storePath, storeContent);
console.log('done!');
