
export type Branch = 'Dammam' | 'Al Khobar';

export interface Device {
  id: string;
  name: string;
  modelNumber: string;
  serialNumber: string;
  branch: Branch;
  department: string;
  room: string;
  installationDate: string;
  checklist: {
    installationReport: boolean;
    sfdaApproval: boolean;
    ppmPlanAdded: boolean;
    warrantyStatus: boolean;
  };
  sfdaDocUrl?: string;
  warrantyExpiry?: string;
  status: 'Complete' | 'Pending' | 'Attention';
}

export interface Quotation {
  id: string;
  equipmentName: string;
  modelNumber: string;
  companyName: string;
  engineerName: string;
  engineerMobile: string;
  price: number;
  date: string;
  fileUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  branch: Branch;
  department: string;
  room: string;
  equipmentName: string;
  description: string;
  status: 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  serviceReport: boolean;
}

export interface PPMSchedule {
  id: string;
  equipmentName: string;
  branch: Branch;
  month: string; // e.g., "January"
  status: 'Pending' | 'Completed';
}

export interface DropdownOptions {
  equipment: string[];
  departments: string[];
  rooms: string[];
  companies: string[];
  engineers: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
}
