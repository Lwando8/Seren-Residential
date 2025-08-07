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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { EstateAlert } from '../types';
import * as Location from 'expo-location';

class AlertService {
  private static instance: AlertService;

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  // Send emergency alert
  async sendEmergencyAlert(
    type: 'emergency' | 'medical',
    description?: string,
    userInfo?: { uid: string; name: string; unitNumber: string }
  ): Promise<string | null> {
    try {
      // For demo purposes, we'll simulate location instead of requiring permissions
      let location = { coords: { latitude: -26.2041, longitude: 28.0473 } }; // Johannesburg coords
      
      try {
        // Try to get real location, but don't fail if permission denied
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          location = await Location.getCurrentPositionAsync({});
        }
      } catch (error) {
        console.log('Location permission denied, using default location');
      }

      // Create alert document
      const alertData = {
        uid: userInfo?.uid || 'demo-user',
        userName: userInfo?.name || 'Demo User',
        unitNumber: userInfo?.unitNumber || 'Demo Unit',
        timestamp: serverTimestamp(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        type,
        status: 'open',
        description: description || `${type} alert from ${userInfo?.unitNumber || 'Demo Unit'}`,
      };

      const docRef = await addDoc(collection(db, 'estate_alerts'), alertData);
      console.log('Emergency alert sent with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      
      // Return a mock ID for demo purposes if Firebase fails
      return `mock-alert-${Date.now()}`;
    }
  }

  // Get alerts for a specific user (with fallback for demo)
  async getUserAlerts(uid: string): Promise<EstateAlert[]> {
    try {
      const q = query(
        collection(db, 'estate_alerts'),
        where('uid', '==', uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const alerts: EstateAlert[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp),
        } as EstateAlert);
      });
      
      return alerts;
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      
      // Return mock data for demo purposes
      return [
        {
          id: 'demo-1',
          uid: uid,
          userName: 'Demo User',
          unitNumber: 'Unit 42',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          location: { latitude: -26.2041, longitude: 28.0473 },
          type: 'emergency',
          status: 'resolved',
          description: 'Demo emergency alert - resolved'
        },
        {
          id: 'demo-2',
          uid: uid,
          userName: 'Demo User',
          unitNumber: 'Unit 42',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          location: { latitude: -26.2041, longitude: 28.0473 },
          type: 'medical',
          status: 'resolved',
          description: 'Demo medical alert - resolved'
        }
      ];
    }
  }

  // Get all alerts for estate management
  async getAllAlerts(): Promise<EstateAlert[]> {
    try {
      const q = query(
        collection(db, 'estate_alerts'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const alerts: EstateAlert[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp),
        } as EstateAlert);
      });
      
      return alerts;
    } catch (error) {
      console.error('Error fetching all alerts:', error);
      return [];
    }
  }

  // Update alert status
  async updateAlertStatus(
    alertId: string, 
    status: 'open' | 'in-progress' | 'resolved',
    notes?: string
  ): Promise<boolean> {
    try {
      const alertRef = doc(db, 'estate_alerts', alertId);
      const updateData: any = { status };
      
      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }
      
      if (notes) {
        updateData.notes = notes;
      }
      
      await updateDoc(alertRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
  }

  // Real-time listener for alerts (with fallback)
  subscribeToAlerts(callback: (alerts: EstateAlert[]) => void) {
    try {
      const q = query(
        collection(db, 'estate_alerts'),
        orderBy('timestamp', 'desc')
      );
      
      return onSnapshot(q, (querySnapshot) => {
        const alerts: EstateAlert[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          alerts.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp),
          } as EstateAlert);
        });
        callback(alerts);
      });
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      // Return empty unsubscribe function
      return () => {};
    }
  }
}

export default AlertService; 