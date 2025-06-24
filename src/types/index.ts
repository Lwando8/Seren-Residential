// User types
export interface User {
  uid: string;
  name: string;
  email: string;
  unitNumber: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  role: 'resident' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

// Alert types
export interface EstateAlert {
  id: string;
  uid: string;
  userName: string;
  unitNumber: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'emergency' | 'medical';
  status: 'open' | 'in-progress' | 'resolved';
  description?: string;
  assignedTo?: string;
  notes?: string;
  resolvedAt?: Date;
}

// Complaint types
export interface Complaint {
  id: string;
  uid: string;
  userName: string;
  unitNumber: string;
  type: ComplaintType;
  description: string;
  imageURL?: string;
  timestamp: Date;
  status: 'open' | 'in-progress' | 'resolved';
  assignedTo?: string;
  notes?: string;
  resolvedAt?: Date;
}

export type ComplaintType = 
  | 'noise'
  | 'parking'
  | 'maintenance'
  | 'security'
  | 'pets'
  | 'garbage'
  | 'other';

// Assignment types
export interface Assignment {
  id: string;
  alertId: string;
  assignedTo: string;
  assignedBy: string;
  timestamp: Date;
  status: 'assigned' | 'accepted' | 'completed';
  notes?: string;
}

// Subscription types
export interface Subscription {
  uid: string;
  status: 'active' | 'inactive' | 'cancelled' | 'pending';
  amount: number;
  currency: 'ZAR';
  startDate: Date;
  nextBillingDate: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Community types
export interface CommunityClub {
  id: string;
  name: string;
  description: string;
  members: number;
  category: 'fitness' | 'social' | 'hobby' | 'family' | 'business';
  icon: string;
  organizer: string;
  nextMeeting?: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  category: 'fitness' | 'social' | 'hobby' | 'family' | 'business';
  clubId?: string;
  isAttending: boolean;
}

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Reports: undefined;
  PersonalComplaints: undefined;
  Community: undefined;
  Profile: undefined;
};

// User and Authentication Types
export interface DashboardUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'security' | 'manager'
  permissions: string[]
  lastLogin: Date
  avatar?: string
}

export interface AuthState {
  user: DashboardUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Resident Types (from mobile app)
export interface Resident {
  id: string
  name: string
  email: string
  phone: string
  unitNumber: string
  moveInDate: Date
  subscriptionStatus: 'active' | 'inactive' | 'pending'
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  avatar?: string
  isActive: boolean
}

// Complaint Types (from mobile app)
export interface Complaint {
  id: string
  residentId: string
  residentName: string
  type: 'noise' | 'parking' | 'security' | 'maintenance' | 'pets' | 'garbage' | 'other'
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  imageURL?: string
  location?: string
  adminNotes?: string
}

// Security Report Types
export interface SecurityIncident {
  id: string
  type: 'breach' | 'suspicious' | 'emergency' | 'maintenance' | 'visitor'
  title: string
  description: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  reportedBy: string
  assignedOfficer?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  evidence?: {
    type: 'image' | 'video' | 'document'
    url: string
    description?: string
  }[]
  witnesses?: string[]
  actionsTaken?: string[]
}

// Estate Infrastructure Types
export interface InfrastructureReport {
  id: string
  category: 'electrical' | 'plumbing' | 'security' | 'landscaping' | 'roads' | 'amenities'
  title: string
  description: string
  location: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'reported' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  reportedBy: string
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
  scheduledDate?: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
  imageURLs?: string[]
  contractorInfo?: {
    name: string
    contact: string
    company: string
  }
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalResidents: number
  activeComplaints: number
  resolvedToday: number
  securityIncidents: number
  maintenanceRequests: number
  visitorsPending: number
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'complaint' | 'incident' | 'maintenance' | 'visitor' | 'system'
  title: string
  description: string
  timestamp: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  residentName?: string
  location?: string
}

// Visitor Management Types
export interface Visitor {
  id: string
  name: string
  phone: string
  purpose: string
  hostResident: string
  vehicleDetails?: {
    make: string
    model: string
    color: string
    licensePlate: string
  }
  expectedArrival: Date
  actualArrival?: Date
  departure?: Date
  status: 'expected' | 'arrived' | 'departed' | 'denied'
  securityNotes?: string
  approvedBy?: string
  createdAt: Date
}

// Chart and Analytics Types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

export interface TimeSeriesData {
  date: string
  complaints: number
  incidents: number
  maintenance: number
  visitors: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and Search Types
export interface FilterOptions {
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string[]
  priority?: string[]
  type?: string[]
  assignedTo?: string[]
  location?: string[]
}

export interface SearchParams {
  query?: string
  filters?: FilterOptions
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
} 