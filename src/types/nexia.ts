export type NexiaPole = 'security' | 'property' | 'cleaning' | 'laundry';

export type ClientType = 'b2b' | 'b2c';

export interface NexiaClient {
  id: string;
  name: string;
  type: ClientType;
  email: string;
  phone: string;
  activePoles: NexiaPole[]; // Services this client subscribes to
  createdAt: string;
}

export interface NexiaEmployee {
  id: string;
  name: string;
  role: 'guard' | 'cleaner' | 'technician' | 'manager';
  pole: NexiaPole;
  status: 'active' | 'on_leave' | 'inactive';
}

export type InterventionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface NexiaIntervention {
  id: string;
  clientId: string;
  pole: NexiaPole;
  title: string;
  description: string;
  status: InterventionStatus;
  assignedEmployeeId?: string;
  scheduledAt?: string;
  completedAt?: string;
  cost?: number; // In DA (Algerian Dinar)
}

// B2B specific interfaces
export interface LaundryBatch {
  id: string;
  clientId: string; // e.g., Hotel ID
  weightKg: number;
  status: 'collected' | 'washing' | 'ironing' | 'delivered';
  date: string;
}

export interface SecurityShift {
  id: string;
  clientId: string; // e.g., AADL Site
  guardId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed';
}

// Global Financial Summary
export interface NexiaFinancials {
  totalRevenue: number;
  revenueByPole: Record<NexiaPole, number>;
  pendingInvoices: number;
}
