import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Estate } from '../types';
import EstateService from './EstateService';

class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Register new user with estate association
  async registerUser(
    email: string,
    password: string,
    userData: {
      name: string;
      phone?: string;
      unitNumber: string;
      estate: Estate;
      emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
      };
    }
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });

      // Create user document with estate association
      const user: User = {
        uid: firebaseUser.uid,
        name: userData.name,
        email: email,
        phone: userData.phone,
        estateId: userData.estate.id,
        estateCode: userData.estate.code,
        unitNumber: userData.unitNumber,
        subscriptionStatus: 'active',
        role: 'resident',
        emergencyContact: userData.emergencyContact,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Save user document to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      console.log('User registered successfully:', user.uid);
      return { success: true, user };

    } catch (error: any) {
      console.error('Error registering user:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Sign in user and verify estate association
  async signInUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user document
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        return { success: false, error: 'User profile not found. Please contact support.' };
      }

      const userData = userDoc.data();
      const user: User = {
        ...userData,
        createdAt: userData.createdAt instanceof Timestamp 
          ? userData.createdAt.toDate() 
          : new Date(userData.createdAt),
        lastLogin: userData.lastLogin instanceof Timestamp 
          ? userData.lastLogin.toDate() 
          : new Date(userData.lastLogin)
      } as User;

      // Verify user is active
      if (!user.isActive) {
        await signOut(auth);
        return { success: false, error: 'Your account has been deactivated. Please contact your estate management.' };
      }

      // Verify estate is still active
      const estateService = EstateService.getInstance();
      const estate = await estateService.getEstateById(user.estateId);
      
      if (!estate || !estate.isActive || estate.subscription.status !== 'active') {
        await signOut(auth);
        return { success: false, error: 'Your estate subscription is not active. Please contact your estate management.' };
      }

      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: serverTimestamp()
      });

      console.log('User signed in successfully:', user.uid);
      return { success: true, user };

    } catch (error: any) {
      console.error('Error signing in user:', error);
      
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Sign out user
  async signOutUser(): Promise<boolean> {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      return true;
    } catch (error) {
      console.error('Error signing out user:', error);
      return false;
    }
  }

  // Get user by ID
  async getUserById(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Timestamp 
          ? userData.createdAt.toDate() 
          : new Date(userData.createdAt),
        lastLogin: userData.lastLogin instanceof Timestamp 
          ? userData.lastLogin.toDate() 
          : new Date(userData.lastLogin)
      } as User;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(
    uid: string,
    updates: Partial<Omit<User, 'uid' | 'estateId' | 'estateCode' | 'createdAt'>>
  ): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        lastLogin: serverTimestamp()
      });
      
      console.log('User profile updated successfully:', uid);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Get users by estate (admin function)
  async getUsersByEstate(estateId: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('estateId', '==', estateId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          ...userData,
          createdAt: userData.createdAt instanceof Timestamp 
            ? userData.createdAt.toDate() 
            : new Date(userData.createdAt),
          lastLogin: userData.lastLogin instanceof Timestamp 
            ? userData.lastLogin.toDate() 
            : new Date(userData.lastLogin)
        } as User);
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users by estate:', error);
      return [];
    }
  }

  // Check if email exists in estate
  async checkEmailExistsInEstate(email: string, estateId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email),
        where('estateId', '==', estateId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  // Validate unit number format
  validateUnitNumber(unitNumber: string): boolean {
    // Unit numbers should be 1-10 characters, can include letters, numbers, and common separators
    const regex = /^[A-Za-z0-9\-\/\.]{1,10}$/;
    return regex.test(unitNumber);
  }

  // Get current authenticated user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen for auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

export default UserService; 