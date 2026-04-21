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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Complaint, ComplaintType } from '../types';

class ComplaintService {
  private static instance: ComplaintService;

  public static getInstance(): ComplaintService {
    if (!ComplaintService.instance) {
      ComplaintService.instance = new ComplaintService();
    }
    return ComplaintService.instance;
  }

  // Submit a new complaint
  async submitComplaint(
    type: ComplaintType,
    description: string,
    imageUri?: string,
    userInfo?: { uid: string; name: string; unitNumber: string; estateId: string }
  ): Promise<string | null> {
    try {
      let imageURL: string | undefined;

      // Upload image if provided
      if (imageUri) {
        imageURL = await this.uploadImage(imageUri);
      }

      // Create complaint document with estate isolation
      const complaintData = {
        uid: userInfo?.uid || 'demo-user',
        estateId: userInfo?.estateId || 'demo-estate-1',
        userName: userInfo?.name || 'Demo User',
        unitNumber: userInfo?.unitNumber || 'Demo Unit',
        type,
        description,
        imageURL,
        timestamp: serverTimestamp(),
        status: 'open' as const,
      };

      const docRef = await addDoc(collection(db, 'complaints'), complaintData);
      console.log('Complaint submitted with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      // Return a mock ID for demo purposes if Firebase fails
      return `mock-complaint-${Date.now()}`;
    }
  }

  // Upload image to Firebase Storage (with fallback)
  private async uploadImage(imageUri: string): Promise<string | null> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const filename = `complaints/${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      // For demo purposes, return the original URI
      return imageUri;
    }
  }

  // Get complaints for a specific user (with fallback)
  async getUserComplaints(uid: string, estateId?: string): Promise<Complaint[]> {
    try {
      let q;
      
      if (estateId) {
        // Filter by both user and estate for data isolation
        q = query(
          collection(db, 'complaints'),
          where('uid', '==', uid),
          where('estateId', '==', estateId),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Fallback to just user ID
        q = query(
          collection(db, 'complaints'),
          where('uid', '==', uid),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const complaints: Complaint[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        complaints.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp),
        } as Complaint);
      });
      
      return complaints;
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      
      // Return mock data for demo purposes
      return [
        {
          id: 'demo-complaint-1',
          uid: uid,
          estateId: estateId || 'demo-estate-1',
          userName: 'Demo User',
          unitNumber: 'Unit 42',
          type: 'noise',
          description: 'Demo noise complaint - loud music after hours',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          status: 'in-progress'
        },
        {
          id: 'demo-complaint-2',
          uid: uid,
          estateId: estateId || 'demo-estate-1',
          userName: 'Demo User',
          unitNumber: 'Unit 42',
          type: 'parking',
          description: 'Demo parking issue - visitor parking blocked',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          status: 'resolved'
        }
      ];
    }
  }

  // Get all complaints for a specific estate
  async getAllComplaints(estateId?: string): Promise<Complaint[]> {
    try {
      let q;
      
      if (estateId) {
        // Filter by estate for data isolation
        q = query(
          collection(db, 'complaints'),
          where('estateId', '==', estateId),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Fallback to all complaints (super admin only)
        q = query(
          collection(db, 'complaints'),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const complaints: Complaint[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        complaints.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp),
        } as Complaint);
      });
      
      return complaints;
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      return [];
    }
  }

  // Update complaint status
  async updateComplaintStatus(
    complaintId: string, 
    status: 'open' | 'in-progress' | 'resolved',
    notes?: string
  ): Promise<boolean> {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      const updateData: any = { status };
      
      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }
      
      if (notes) {
        updateData.notes = notes;
      }
      
      await updateDoc(complaintRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      return false;
    }
  }

  // Real-time listener for complaints (with fallback)
  subscribeToComplaints(callback: (complaints: Complaint[]) => void) {
    try {
      const q = query(
        collection(db, 'complaints'),
        orderBy('timestamp', 'desc')
      );
      
      return onSnapshot(q, (querySnapshot) => {
        const complaints: Complaint[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          complaints.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp),
          } as Complaint);
        });
        callback(complaints);
      });
    } catch (error) {
      console.error('Error subscribing to complaints:', error);
      // Return empty unsubscribe function
      return () => {};
    }
  }

  // Get complaint types for dropdown
  getComplaintTypes(): { label: string; value: ComplaintType }[] {
    return [
      { label: 'Noise Complaint', value: 'noise' },
      { label: 'Parking Issue', value: 'parking' },
      { label: 'Maintenance Request', value: 'maintenance' },
      { label: 'Security Concern', value: 'security' },
      { label: 'Pet Issue', value: 'pets' },
      { label: 'Garbage/Waste', value: 'garbage' },
      { label: 'Other', value: 'other' },
    ];
  }
}

export default ComplaintService; 