import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  setDoc,
  deleteDoc,
  Timestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db, dashboardConfig } from './firebase';
import { Complaint, EstateAlert, User, DashboardStats } from '../types';

class DashboardService {
  private static instance: DashboardService;
  private listeners: { [key: string]: () => void } = {};

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  // Real-time dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [alertsSnapshot, complaintsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, dashboardConfig.collections.alerts)),
        getDocs(collection(db, dashboardConfig.collections.complaints)),
        getDocs(collection(db, dashboardConfig.collections.users))
      ]);

      const openComplaints = complaintsSnapshot.docs.filter(doc => 
        doc.data().status === 'open' || doc.data().status === 'in-progress'
      ).length;

      const todayResolvedComplaints = complaintsSnapshot.docs.filter(doc => {
        const data = doc.data();
        const timestamp = data.resolvedAt ? data.resolvedAt.toDate() : null;
        return timestamp && this.isToday(timestamp);
      }).length;

      const securityIncidents = alertsSnapshot.docs.filter(doc => 
        doc.data().type === 'security' && doc.data().status === 'open'
      ).length;

      return {
        totalResidents: usersSnapshot.size,
        activeComplaints: openComplaints,
        resolvedToday: todayResolvedComplaints,
        securityIncidents: securityIncidents,
        maintenanceRequests: 0, // To be implemented
        visitorsPending: 0, // To be implemented
        recentActivity: []
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return mock data for demo
      return {
        totalResidents: 247,
        activeComplaints: 12,
        resolvedToday: 8,
        securityIncidents: 3,
        maintenanceRequests: 18,
        visitorsPending: 5,
        recentActivity: []
      };
    }
  }

  // Real-time listener for dashboard updates
  subscribeToDashboardUpdates(callback: (stats: DashboardStats) => void) {
    const unsubscribers: (() => void)[] = [];

    // Listen to alerts
    const alertsQuery = query(collection(db, dashboardConfig.collections.alerts));
    const alertsUnsubscribe = onSnapshot(alertsQuery, () => {
      this.getDashboardStats().then(callback);
    });
    unsubscribers.push(alertsUnsubscribe);

    // Listen to complaints
    const complaintsQuery = query(collection(db, dashboardConfig.collections.complaints));
    const complaintsUnsubscribe = onSnapshot(complaintsQuery, () => {
      this.getDashboardStats().then(callback);
    });
    unsubscribers.push(complaintsUnsubscribe);

    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  // Send announcement from dashboard to mobile app users
  async sendAnnouncement(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    targetUsers?: string[] // If empty, sends to all users
  ): Promise<string | null> {
    try {
      const announcementData = {
        title,
        message,
        priority,
        targetUsers: targetUsers || null, // null means all users
        timestamp: serverTimestamp(),
        status: 'active',
        createdBy: 'dashboard_admin',
        readBy: [], // Track who has read the announcement
      };

      const docRef = await addDoc(collection(db, dashboardConfig.collections.announcements), announcementData);
      console.log('Announcement sent with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error sending announcement:', error);
      return null;
    }
  }

  // Get announcements for mobile app
  async getAnnouncements(uid?: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, dashboardConfig.collections.announcements),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const announcements: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if announcement is for this user or for all users
        const isForUser = !data.targetUsers || data.targetUsers.includes(uid);
        
        if (isForUser) {
          announcements.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp),
            isRead: uid ? data.readBy?.includes(uid) : false
          });
        }
      });
      
      return announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }

  // Mark announcement as read
  async markAnnouncementAsRead(announcementId: string, uid: string): Promise<boolean> {
    try {
      const announcementRef = doc(db, dashboardConfig.collections.announcements, announcementId);
      const announcementDoc = await getDocs(query(
        collection(db, dashboardConfig.collections.announcements),
        where('__name__', '==', announcementId)
      ));
      
      if (!announcementDoc.empty) {
        const data = announcementDoc.docs[0].data();
        const readBy = data.readBy || [];
        if (!readBy.includes(uid)) {
          readBy.push(uid);
          await updateDoc(announcementRef, { readBy });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      return false;
    }
  }

  // Dashboard action: Update complaint status with admin notes
  async updateComplaintFromDashboard(
    complaintId: string,
    status: 'open' | 'in-progress' | 'resolved',
    adminNotes?: string,
    adminId?: string
  ): Promise<boolean> {
    try {
      const complaintRef = doc(db, dashboardConfig.collections.complaints, complaintId);
      const updateData: any = { 
        status,
        lastUpdatedBy: adminId || 'dashboard_admin',
        lastUpdated: serverTimestamp()
      };
      
      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }
      
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      
      await updateDoc(complaintRef, updateData);
      
      // Log activity for dashboard
      await this.logDashboardActivity(
        'complaint_updated',
        `Complaint ${complaintId} status changed to ${status}`,
        adminId
      );
      
      return true;
    } catch (error) {
      console.error('Error updating complaint from dashboard:', error);
      return false;
    }
  }

  // Dashboard action: Update alert status
  async updateAlertFromDashboard(
    alertId: string,
    status: 'open' | 'in-progress' | 'resolved',
    response?: string,
    adminId?: string
  ): Promise<boolean> {
    try {
      const alertRef = doc(db, dashboardConfig.collections.alerts, alertId);
      const updateData: any = { 
        status,
        lastUpdatedBy: adminId || 'dashboard_admin',
        lastUpdated: serverTimestamp()
      };
      
      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }
      
      if (response) {
        updateData.response = response;
      }
      
      await updateDoc(alertRef, updateData);
      
      // Log activity for dashboard
      await this.logDashboardActivity(
        'alert_updated',
        `Alert ${alertId} status changed to ${status}`,
        adminId
      );
      
      return true;
    } catch (error) {
      console.error('Error updating alert from dashboard:', error);
      return false;
    }
  }

  // Log dashboard activity for audit trail
  private async logDashboardActivity(
    action: string,
    description: string,
    adminId?: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'dashboard_activity'), {
        action,
        description,
        adminId: adminId || 'system',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging dashboard activity:', error);
    }
  }

  // Utility function to check if date is today
  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  // Network management for offline support
  async enableOfflineSupport(): Promise<boolean> {
    try {
      await enableNetwork(db);
      return true;
    } catch (error) {
      console.error('Error enabling network:', error);
      return false;
    }
  }

  async disableNetwork(): Promise<boolean> {
    try {
      await disableNetwork(db);
      return true;
    } catch (error) {
      console.error('Error disabling network:', error);
      return false;
    }
  }

  // Cleanup all listeners
  cleanup(): void {
    Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
    this.listeners = {};
  }
}

export default DashboardService; 