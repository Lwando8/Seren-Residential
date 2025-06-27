import { 
  collection, 
  doc,
  getDoc,
  getDocs,
  addDoc, 
  updateDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Estate, EstateAdmin } from '../types';

class EstateService {
  private static instance: EstateService;

  public static getInstance(): EstateService {
    if (!EstateService.instance) {
      EstateService.instance = new EstateService();
    }
    return EstateService.instance;
  }

  // Get estate by code (for user registration)
  async getEstateByCode(code: string): Promise<Estate | null> {
    // For demo mode - return demo estates immediately for testing
    if (code.toUpperCase() === 'SEREN001' || code.toUpperCase() === 'DEMO') {
      console.log('Returning demo estate for code:', code);
      return {
        id: 'demo-estate-1',
        name: 'Seren Residential Estate',
        code: 'SEREN001',
        address: {
          street: '123 Estate Drive',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          country: 'South Africa'
        },
        contact: {
          phone: '+27 21 123 4567',
          email: 'admin@seren.com',
          emergencyContact: '+27 21 123 4568'
        },
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          theme: 'light'
        },
        features: {
          emergencyAlerts: true,
          complaintManagement: true,
          visitorManagement: true,
          announcements: true,
          events: true
        },
        subscription: {
          plan: 'premium',
          maxResidents: 500,
          monthlyFee: 25,
          currency: 'ZAR',
          billingDate: new Date(),
          status: 'active'
        },
        settings: {
          timezone: 'Africa/Johannesburg',
          language: 'en',
          currency: 'ZAR',
          dateFormat: 'DD/MM/YYYY'
        },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };
    }

    try {
      const q = query(
        collection(db, 'estates'),
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate() 
          : new Date(data.updatedAt),
        subscription: {
          ...data.subscription,
          billingDate: data.subscription.billingDate instanceof Timestamp 
            ? data.subscription.billingDate.toDate() 
            : new Date(data.subscription.billingDate)
        }
      } as Estate;
    } catch (error) {
      console.error('Error fetching estate by code:', error);
      return null;
    }
  }

  // Get estate by ID
  async getEstateById(estateId: string): Promise<Estate | null> {
    try {
      const docRef = doc(db, 'estates', estateId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate() 
          : new Date(data.updatedAt),
        subscription: {
          ...data.subscription,
          billingDate: data.subscription.billingDate instanceof Timestamp 
            ? data.subscription.billingDate.toDate() 
            : new Date(data.subscription.billingDate)
        }
      } as Estate;
    } catch (error) {
      console.error('Error fetching estate by ID:', error);
      return null;
    }
  }

  // Validate estate code format
  validateEstateCode(code: string): boolean {
    // Estate codes should be 6-10 characters, alphanumeric
    const regex = /^[A-Z0-9]{4,10}$/;
    return regex.test(code.toUpperCase());
  }

  // Create new estate (admin function)
  async createEstate(estateData: Omit<Estate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      // Check if estate code already exists
      const existing = await this.getEstateByCode(estateData.code);
      if (existing) {
        throw new Error('Estate code already exists');
      }

      const docRef = await addDoc(collection(db, 'estates'), {
        ...estateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating estate:', error);
      return null;
    }
  }

  // Update estate settings
  async updateEstate(estateId: string, updates: Partial<Estate>): Promise<boolean> {
    try {
      const docRef = doc(db, 'estates', estateId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating estate:', error);
      return false;
    }
  }

  // Get all estates (super admin function)
  async getAllEstates(): Promise<Estate[]> {
    try {
      const q = query(
        collection(db, 'estates'),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const estates: Estate[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        estates.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate() 
            : new Date(data.updatedAt),
          subscription: {
            ...data.subscription,
            billingDate: data.subscription.billingDate instanceof Timestamp 
              ? data.subscription.billingDate.toDate() 
              : new Date(data.subscription.billingDate)
          }
        } as Estate);
      });
      
      return estates;
    } catch (error) {
      console.error('Error fetching all estates:', error);
      return [];
    }
  }

  // Get estate statistics
  async getEstateStats(estateId: string): Promise<{
    totalResidents: number;
    activeComplaints: number;
    resolvedToday: number;
    monthlyRevenue: number;
  }> {
    try {
      // These would typically be aggregated from various collections
      // For now, returning mock data
      return {
        totalResidents: 125,
        activeComplaints: 8,
        resolvedToday: 3,
        monthlyRevenue: 3125
      };
    } catch (error) {
      console.error('Error fetching estate stats:', error);
      return {
        totalResidents: 0,
        activeComplaints: 0,
        resolvedToday: 0,
        monthlyRevenue: 0
      };
    }
  }
}

export default EstateService; 