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

export interface StoreState {
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
  initializeData: (skipSync?: boolean) => Promise<void>;
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
