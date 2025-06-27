import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import EstateRegistrationScreen from './EstateRegistrationScreen';
import UserRegistrationScreen from './UserRegistrationScreen';
import { Estate } from '../../types';
import { useAuth } from '../../context/AuthContext';

const AuthFlowScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'estate-registration' | 'user-registration'>('welcome');
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null);
  const { setDemoUser } = useAuth();

  const handleStartRegistration = () => {
    setCurrentScreen('estate-registration');
  };

  const handleEstateSelected = (estate: Estate) => {
    setSelectedEstate(estate);
    setCurrentScreen('user-registration');
  };

  const handleUseDemoUser = () => {
    Alert.alert(
      'Demo User',
      'Setting up demo user for Seren Estate...',
      [
        {
          text: 'Continue',
          onPress: () => setDemoUser(),
        },
      ]
    );
  };

  if (currentScreen === 'estate-registration') {
    return (
      <EstateRegistrationScreen
        onEstateSelected={handleEstateSelected}
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  if (currentScreen === 'user-registration' && selectedEstate) {
    return (
      <UserRegistrationScreen
        estate={selectedEstate}
        onBack={() => setCurrentScreen('estate-registration')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.logo}
              >
                <Ionicons name="home" size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Seren Residential</Text>
            <Text style={styles.subtitle}>Multi-Tenant Platform</Text>
            <Text style={styles.description}>
              Your residential estate app that serves multiple communities with complete data isolation and customization.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartRegistration}>
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.buttonGradient}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Test Estate Registration</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleUseDemoUser}>
              <View style={styles.secondaryButtonContent}>
                <Ionicons name="flash-outline" size={24} color="#3B82F6" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Quick Demo User</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>🧪 Testing Features:</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• Estate code validation</Text>
              <Text style={styles.featureItem}>• Multi-tenant data isolation</Text>
              <Text style={styles.featureItem}>• Estate-specific branding</Text>
              <Text style={styles.featureItem}>• User registration flow</Text>
            </View>
          </View>

          <View style={styles.testCodes}>
            <Text style={styles.testCodesTitle}>Test Estate Codes:</Text>
            <View style={styles.codesList}>
              <View style={styles.codeItem}>
                <Text style={styles.codeText}>SEREN001</Text>
                <Text style={styles.codeDescription}>Seren Residential Estate</Text>
              </View>
              <View style={styles.codeItem}>
                <Text style={styles.codeText}>DEMO</Text>
                <Text style={styles.codeDescription}>Demo Estate</Text>
              </View>
              <View style={styles.codeItem}>
                <Text style={styles.codeText}>INVALID</Text>
                <Text style={styles.codeDescription}>Test invalid code</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8B5CF6',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  testInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  testTitle: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  testCodes: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  testCodesTitle: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  codesList: {
    gap: 8,
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  codeDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});

export default AuthFlowScreen; 