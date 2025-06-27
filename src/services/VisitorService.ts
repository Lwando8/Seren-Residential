import { 
  collection, 
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Visit {
  id: string;
  mode: 'pin' | 'qr';
  type: 'driver' | 'pedestrian';
  vehicleImageURL?: string;
  idImageURL: string;
  unitNumber: string;
  guestName: string;
  guestPhone: string;
  selectedResidentUid: string;
  selectedResidentName: string;
  estateId: string;
  timestamp: Date;
  status: 'pending' | 'granted' | 'expired' | 'denied';
  pinCode?: string; // For PIN-based visits
  expiresAt: Date;
}

export interface QRPass {
  id: string;
  visitId: string;
  qrData: string;
  expiration: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface VisitRequest {
  mode: 'pin' | 'qr';
  type: 'driver' | 'pedestrian';
  vehicleImage?: Blob;
  idImage: Blob;
  unitNumber: string;
  guestName: string;
  guestPhone: string;
  selectedResidentUid: string;
  selectedResidentName: string;
  estateId: string;
  pinCode?: string;
}

class VisitorService {
  private static instance: VisitorService;

  public static getInstance(): VisitorService {
    if (!VisitorService.instance) {
      VisitorService.instance = new VisitorService();
    }
    return VisitorService.instance;
  }

  // Create a new visit request
  async createVisit(visitRequest: VisitRequest): Promise<{ success: boolean; visitId?: string; error?: string }> {
    try {
      // Upload images to Firebase Storage
      const idImageURL = await this.uploadImage(visitRequest.idImage, 'id-documents');
      let vehicleImageURL: string | undefined;
      
      if (visitRequest.vehicleImage) {
        vehicleImageURL = await this.uploadImage(visitRequest.vehicleImage, 'vehicle-documents');
      }

      // Create visit document
      const visit = {
        mode: visitRequest.mode,
        type: visitRequest.type,
        vehicleImageURL,
        idImageURL,
        unitNumber: visitRequest.unitNumber,
        guestName: visitRequest.guestName,
        guestPhone: visitRequest.guestPhone,
        selectedResidentUid: visitRequest.selectedResidentUid,
        selectedResidentName: visitRequest.selectedResidentName,
        estateId: visitRequest.estateId,
        timestamp: serverTimestamp(),
        status: 'pending',
        pinCode: visitRequest.pinCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      const docRef = await addDoc(collection(db, 'visits'), visit);
      
      console.log('Visit created successfully:', docRef.id);
      return { success: true, visitId: docRef.id };

    } catch (error) {
      console.error('Error creating visit:', error);
      return { success: false, error: 'Failed to create visit request. Please try again.' };
    }
  }

  // Upload image to Firebase Storage with encryption placeholder
  private async uploadImage(imageBlob: Blob, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const imageRef = ref(storage, fileName);
    
    // TODO: Add encryption here before upload
    const snapshot = await uploadBytes(imageRef, imageBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }

  // Get pending visits for a resident
  async getPendingVisitsForResident(residentUid: string, estateId: string): Promise<Visit[]> {
    try {
      const q = query(
        collection(db, 'visits'),
        where('selectedResidentUid', '==', residentUid),
        where('estateId', '==', estateId),
        where('status', '==', 'pending'),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const visits: Visit[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
          expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt),
        } as Visit);
      });

      return visits;
    } catch (error) {
      console.error('Error fetching pending visits:', error);
      return [];
    }
  }

  // Approve or deny a visit
  async updateVisitStatus(
    visitId: string, 
    status: 'granted' | 'denied', 
    residentUid: string
  ): Promise<{ success: boolean; qrPassId?: string; error?: string }> {
    try {
      // Update visit status
      await updateDoc(doc(db, 'visits', visitId), {
        status,
        approvedAt: serverTimestamp(),
        approvedBy: residentUid,
      });

      let qrPassId: string | undefined;

      // If granted, create QR pass for QR-based visits
      if (status === 'granted') {
        const visitDoc = await getDoc(doc(db, 'visits', visitId));
        const visitData = visitDoc.data();

        if (visitData?.mode === 'qr') {
          qrPassId = await this.createQRPass(visitId);
        }
      }

      console.log(`Visit ${status}:`, visitId);
      return { success: true, qrPassId };

    } catch (error) {
      console.error('Error updating visit status:', error);
      return { success: false, error: 'Failed to update visit status. Please try again.' };
    }
  }

  // Create QR pass for approved visit
  private async createQRPass(visitId: string): Promise<string> {
    const qrData = `visit:${visitId}:${Date.now()}`;
    const expiration = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    const qrPass = {
      visitId,
      qrData,
      expiration,
      isUsed: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'qr_passes'), qrPass);
    return docRef.id;
  }

  // Get QR pass by ID
  async getQRPass(passId: string): Promise<QRPass | null> {
    try {
      const docRef = doc(db, 'qr_passes', passId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        expiration: data.expiration instanceof Timestamp ? data.expiration.toDate() : new Date(data.expiration),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      } as QRPass;

    } catch (error) {
      console.error('Error fetching QR pass:', error);
      return null;
    }
  }

  // Mark QR pass as used
  async useQRPass(passId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'qr_passes', passId), {
        isUsed: true,
        usedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error marking QR pass as used:', error);
      return false;
    }
  }

  // Get visit history for estate
  async getVisitHistory(estateId: string, limit: number = 50): Promise<Visit[]> {
    try {
      const q = query(
        collection(db, 'visits'),
        where('estateId', '==', estateId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const visits: Visit[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
          expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt),
        } as Visit);
      });

      return visits.slice(0, limit);
    } catch (error) {
      console.error('Error fetching visit history:', error);
      return [];
    }
  }

  // Validate PIN with EstateMate API (placeholder)
  async validatePINWithEstateMate(pin: string, estateId: string): Promise<{ valid: boolean; visitorInfo?: any }> {
    try {
      // TODO: Implement actual EstateMate API integration
      console.log('Validating PIN with EstateMate:', pin);
      
      // Placeholder response
      if (pin === '1234') {
        return {
          valid: true,
          visitorInfo: {
            name: 'John Doe',
            purpose: 'Delivery',
            expectedTime: new Date(),
          }
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error validating PIN:', error);
      return { valid: false };
    }
  }

  // Send SMS with QR code link (placeholder)
  async sendQRCodeSMS(phoneNumber: string, qrPassId: string): Promise<boolean> {
    try {
      // TODO: Implement Twilio/Vonage SMS integration
      const qrCodeLink = `https://yourapp.com/qr/${qrPassId}`;
      
      console.log(`Sending SMS to ${phoneNumber}: Your visitor pass: ${qrCodeLink}`);
      
      // Placeholder - return success
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Clean up expired visits and QR passes
  async cleanupExpiredItems(): Promise<void> {
    try {
      const now = new Date();
      
      // TODO: Implement cleanup logic for expired visits and QR passes
      console.log('Cleaning up expired items at:', now);
      
    } catch (error) {
      console.error('Error cleaning up expired items:', error);
    }
  }
}

export default VisitorService; 