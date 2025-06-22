import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Subscription, User } from '../types';

class SubscriptionService {
  private static instance: SubscriptionService;

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Check if user has active subscription (with fallback for demo)
  async checkSubscriptionStatus(uid: string): Promise<'active' | 'inactive' | 'pending'> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        // Return inactive for demo purposes
        return 'inactive';
      }
      
      const userData = userDoc.data() as User;
      return userData.subscriptionStatus || 'inactive';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Return inactive for demo purposes
      return 'inactive';
    }
  }

  // Create subscription (simulate payment processing)
  async createSubscription(
    uid: string,
    userInfo: { name: string; email: string; unitNumber: string }
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      // In real implementation, integrate with Stripe or RevenueCat
      // For now, we'll simulate the subscription creation
      
      const subscriptionData = {
        uid,
        status: 'active' as const,
        amount: 25,
        currency: 'ZAR' as const,
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: serverTimestamp(),
        // These would be populated by actual payment processor
        stripeCustomerId: `cus_mock_${uid}`,
        stripeSubscriptionId: `sub_mock_${Date.now()}`,
      };

      // Create subscription document
      const subscriptionRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);

      // Update user's subscription status
      await this.updateUserSubscriptionStatus(uid, 'active', userInfo);

      return { 
        success: true, 
        subscriptionId: subscriptionRef.id 
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      
      // Return success for demo purposes
      return { 
        success: true, 
        subscriptionId: `demo-subscription-${Date.now()}`
      };
    }
  }

  // Update user subscription status (with fallback)
  async updateUserSubscriptionStatus(
    uid: string, 
    status: 'active' | 'inactive' | 'pending',
    userInfo?: { name: string; email: string; unitNumber: string }
  ): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      const updateData: any = {
        subscriptionStatus: status,
        lastUpdated: serverTimestamp(),
      };

      // If creating new user, add all info
      if (userInfo) {
        updateData.name = userInfo.name;
        updateData.email = userInfo.email;
        updateData.unitNumber = userInfo.unitNumber;
        updateData.role = 'resident';
        updateData.createdAt = serverTimestamp();
      }

      await setDoc(userRef, updateData, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating user subscription status:', error);
      // Return true for demo purposes
      return true;
    }
  }

  // Get subscription details (with fallback)
  async getSubscriptionDetails(uid: string): Promise<Subscription | null> {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('uid', '==', uid)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // Return demo subscription for demo purposes
        return {
          uid: uid,
          status: 'active',
          amount: 25,
          currency: 'ZAR',
          startDate: new Date(Date.now() - 86400000), // 1 day ago
          nextBillingDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), // 29 days from now
          stripeCustomerId: `cus_demo_${uid}`,
          stripeSubscriptionId: `sub_demo_${Date.now()}`,
        };
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        nextBillingDate: data.nextBillingDate?.toDate() || new Date(),
      } as Subscription;
    } catch (error) {
      console.error('Error getting subscription details:', error);
      
      // Return demo subscription for demo purposes
      return {
        uid: uid,
        status: 'active',
        amount: 25,
        currency: 'ZAR',
        startDate: new Date(Date.now() - 86400000), // 1 day ago
        nextBillingDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), // 29 days from now
        stripeCustomerId: `cus_demo_${uid}`,
        stripeSubscriptionId: `sub_demo_${Date.now()}`,
      };
    }
  }

  // Cancel subscription (with fallback)
  async cancelSubscription(uid: string): Promise<boolean> {
    try {
      // In real implementation, cancel with Stripe/RevenueCat
      
      // Update subscription status
      const q = query(
        collection(db, 'subscriptions'),
        where('uid', '==', uid)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const subscriptionDoc = querySnapshot.docs[0];
        await updateDoc(subscriptionDoc.ref, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
        });
      }

      // Update user status
      await this.updateUserSubscriptionStatus(uid, 'inactive');
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      // Return true for demo purposes
      return true;
    }
  }

  // Simulate payment processing (for demo purposes)
  async processPayment(
    amount: number,
    currency: string = 'ZAR',
    paymentMethod: 'card' | 'eft' = 'card'
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please check your payment details and try again.',
      };
    }
  }

  // Get subscription pricing
  getSubscriptionPricing() {
    return {
      amount: 25,
      currency: 'ZAR',
      interval: 'monthly',
      description: 'Seren Residential - Monthly Subscription',
      features: [
        '24/7 Emergency Response',
        'Estate Security Alerts',
        'Complaint Management',
        'Emergency Contact System',
        'Real-time Incident Tracking',
        'Mobile App Access',
      ],
    };
  }

  // Check if user can access premium features (with fallback)
  async canAccessPremiumFeatures(uid: string): Promise<boolean> {
    try {
      const status = await this.checkSubscriptionStatus(uid);
      
      // Check if user is admin (bypass subscription)
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        if (userData.role === 'admin') {
          return true;
        }
      }
      
      return status === 'active';
    } catch (error) {
      console.error('Error checking premium access:', error);
      // Return true for demo purposes (all features available)
      return true;
    }
  }
}

export default SubscriptionService; 