import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import VisitorService from '../../services/VisitorService';
import NotificationService from '../../services/NotificationService';
import GlassCard from '../../components/GlassCard';

interface VisitorCheckInScreenProps {
  navigation: any;
  route: {
    params?: {
      mode?: 'pin' | 'qr';
      pin?: string;
    };
  };
}

export default function VisitorCheckInScreen({ navigation, route }: VisitorCheckInScreenProps) {
  const { theme } = useTheme();
  const { user, estate } = useAuth();
  const [mode, setMode] = useState<'pin' | 'qr' | null>(route.params?.mode || null);
  const [userType, setUserType] = useState<'driver' | 'pedestrian' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pinValidation, setPinValidation] = useState<any>(null);

  const visitorService = VisitorService.getInstance();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // If PIN provided in route params, validate it
    if (route.params?.pin) {
      validatePin(route.params.pin);
    }
  }, [route.params?.pin]);

  const validatePin = async (pin: string) => {
    setIsLoading(true);
    try {
      const result = await visitorService.validatePINWithEstateMate(pin, estate?.id || '');
      if (result.valid) {
        setPinValidation(result);
        setMode('pin');
        Alert.alert(
          'PIN Validated',
          `Welcome ${result.visitorInfo?.name || 'Visitor'}! Please select your type.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Invalid PIN',
          'The PIN you entered is not valid or has expired.',
          [
            { text: 'Try Again', onPress: () => navigation.goBack() },
            { text: 'Use QR Mode', onPress: () => setMode('qr') }
          ]
        );
      }
    } catch (error) {
      console.error('Error validating PIN:', error);
      Alert.alert('Error', 'Failed to validate PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSelection = (selectedMode: 'pin' | 'qr') => {
    setMode(selectedMode);
    if (selectedMode === 'pin') {
      // Navigate to PIN entry screen
      navigation.navigate('PinEntry', {
        onPinEntered: async (pin: string) => {
          const validation = await validatePin(pin);
          if (validation && validation.isValid) {
            // PIN is valid, go back to this screen to show user type selection
            navigation.goBack();
          }
        }
      });
    }
  };

  const handleUserTypeSelection = (type: 'driver' | 'pedestrian') => {
    setUserType(type);
    
    // Navigate to appropriate next screen based on mode and type
    if (mode === 'pin') {
      navigation.navigate('PinDocumentCapture', {
        userType: type,
        mode: 'pin',
        pinValidation,
      });
    } else {
      navigation.navigate('QRDocumentCapture', {
        userType: type,
        mode: 'qr',
      });
    }
  };

  const renderWelcomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <GlassCard style={styles.welcomeCard}>
          <View style={styles.logoContainer}>
            <Ionicons name="people" size={60} color={theme.primary} />
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>
            Welcome to {estate?.name || 'Seren Residential'}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Please select your check-in method
          </Text>

          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, { 
                backgroundColor: theme.glass,
                borderColor: theme.border,
              }]}
              onPress={() => handleModeSelection('pin')}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
                <Ionicons name="keypad" size={24} color="white" />
              </View>
              <Text style={[styles.modeTitle, { color: theme.text }]}>PIN Entry</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>
                I have a PIN code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, { 
                backgroundColor: theme.glass,
                borderColor: theme.border,
              }]}
              onPress={() => handleModeSelection('qr')}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
                <Ionicons name="qr-code" size={24} color="white" />
              </View>
              <Text style={[styles.modeTitle, { color: theme.text }]}>QR Request</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>
                Request access
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Both methods are secure and monitored for safety
            </Text>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );

  const renderUserTypeSelection = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setMode(null)}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <GlassCard style={styles.welcomeCard}>
          <Text style={[styles.title, { color: theme.text }]}>
            {mode === 'pin' ? 'PIN Validated!' : 'Request Access'}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Are you arriving as a driver or pedestrian?
          </Text>

          {pinValidation && (
            <View style={styles.validationInfo}>
              <Text style={[styles.guestName, { color: theme.primary }]}>
                Welcome, {pinValidation.visitorInfo?.name}!
              </Text>
              <Text style={[styles.purpose, { color: theme.textSecondary }]}>
                Purpose: {pinValidation.visitorInfo?.purpose}
              </Text>
            </View>
          )}

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, { 
                backgroundColor: theme.glass,
                borderColor: theme.border,
              }]}
              onPress={() => handleUserTypeSelection('driver')}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
                <Ionicons name="car" size={24} color="white" />
              </View>
              <Text style={[styles.typeTitle, { color: theme.text }]}>Driver</Text>
              <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>
                By vehicle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, { 
                backgroundColor: theme.glass,
                borderColor: theme.border,
              }]}
              onPress={() => handleUserTypeSelection('pedestrian')}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
                <Ionicons name="walk" size={24} color="white" />
              </View>
              <Text style={[styles.typeTitle, { color: theme.text }]}>Pedestrian</Text>
              <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>
                On foot
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Validating PIN...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary]}
        style={styles.gradient}
      >
        {!mode ? renderWelcomeScreen() : renderUserTypeSelection()}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  welcomeCard: {
    padding: 30,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modeContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 30,
  },
  modeButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  validationInfo: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  purpose: {
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 