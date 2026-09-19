const fs = require('fs');
const path = require('path');

const bSlicePath = path.join(__dirname, '../src/store/slices/buildingSlice.ts');
let content = fs.readFileSync(bSlicePath, 'utf-8');

content = content.replace(/= \(set, get\) => \(\{/g, "= (set, get, api) => ({");

content = content.replace(/addTimelineNote: async \(incidentId, note\)/g, "addTimelineNote: async (incidentId: string, note: string)");
content = content.replace(/updateIncidentStatus: async \(incidentId, status, note\)/g, "updateIncidentStatus: async (incidentId: string, status: any, note?: string)");
content = content.replace(/confirmRestoration: async \(incidentId, isRestored\)/g, "confirmRestoration: async (incidentId: string, isRestored: boolean)");
content = content.replace(/submitResidentReport: async \(report\)/g, "submitResidentReport: async (report: any)");
content = content.replace(/updateTicketStatus: async \(ticketId, status\)/g, "updateTicketStatus: async (ticketId: string, status: any)");
content = content.replace(/addNotice: async \(notice\)/g, "addNotice: async (notice: any)");
content = content.replace(/deleteNotice: async \(noticeId: string\)/g, "deleteNotice: async (noticeId: string)");

// Fix state, inc, c, r, n implicitly any
content = content.replace(/set\(state =>/g, "set((state: any) =>");
content = content.replace(/activeIncidents\.map\(inc =>/g, "activeIncidents.map((inc: any) =>");
content = content.replace(/\(confirmations || \[\]\)\.filter\(c =>/g, "(confirmations || []).filter((c: any) =>");
content = content.replace(/residentReports\.map\(r =>/g, "residentReports.map((r: any) =>");
content = content.replace(/notices\.filter\(n =>/g, "notices.filter((n: any) =>");

fs.writeFileSync(bSlicePath, content);
console.log('buildingSlice types fixed');
