import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Estate } from '../types';
import UserService from '../services/UserService';
import EstateService from '../services/EstateService';

interface AuthState {
  user: User | null;
  estate: Estate | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<boolean>;
  register: (
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
  ) => Promise<{ success: boolean; error?: string }>;
  // For testing - set demo user
  setDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    estate: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const userService = UserService.getInstance();
  const estateService = EstateService.getInstance();

  useEffect(() => {
    // For testing the registration flow, we'll skip auto-login
    // and just set loading to false to show the auth flow
    const timer = setTimeout(() => {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 1000);

    return () => clearTimeout(timer);

    // Uncomment this for real Firebase authentication:
    /*
    // Listen for auth state changes
    const unsubscribe = userService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile
        const user = await userService.getUserById(firebaseUser.uid);
        if (user) {
          const estate = await estateService.getEstateById(user.estateId);
          setAuthState({
            user,
            estate,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            estate: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        // User is signed out
        setAuthState({
          user: null,
          estate: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return unsubscribe;
    */
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const result = await userService.signInUser(email, password);
    
    if (result.success && result.user) {
      const estate = await estateService.getEstateById(result.user.estateId);
      setAuthState({
        user: result.user,
        estate,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    return result;
  };

  const signOut = async () => {
    const success = await userService.signOutUser();
    if (success) {
      setAuthState({
        user: null,
        estate: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
    return success;
  };

  const register = async (
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
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // For demo mode, simulate registration success
    try {
      const demoUser: User = {
        uid: `demo-${Date.now()}`,
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

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAuthState({
        user: demoUser,
        estate: userData.estate,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true, user: demoUser };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // For testing purposes - set a demo user
  const setDemoUser = () => {
    const demoEstate: Estate = {
      id: 'estate-demo-001',
      name: 'Seren Residential Demo',
      code: 'SEREN001',
      address: {
        street: '123 Demo Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        country: 'South Africa'
      },
      contactInfo: {
        phone: '+27 21 123 4567',
        email: 'admin@serenresidential.com',
        website: 'https://serenresidential.com'
      },
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        features: ['complaints', 'announcements', 'maintenance', 'security', 'communication']
      },
      settings: {
        allowGuestRegistration: true,
        requireAdminApproval: false,
        maintenanceHours: {
          start: '08:00',
          end: '17:00'
        },
        emergencyContacts: [
          { name: 'Security', phone: '+27 21 123 4567', type: 'security' },
          { name: 'Maintenance', phone: '+27 21 123 4568', type: 'maintenance' }
        ]
      },
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    const demoUser: User = {
      uid: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@seren.com',
      phone: '+27 81 123 4567',
      estateId: demoEstate.id,
      estateCode: demoEstate.code,
      unitNumber: 'A101',
      subscriptionStatus: 'active',
      role: 'resident',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+27 81 987 6543',
        relationship: 'Spouse'
      },
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    setAuthState({
      user: demoUser,
      estate: demoEstate,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        signIn,
        signOut,
        register,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 