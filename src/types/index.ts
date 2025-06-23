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