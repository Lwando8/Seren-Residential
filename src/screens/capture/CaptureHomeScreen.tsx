import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import CaptureService from '../../services/CaptureService';

type RootStackParamList = {
  CaptureHome: undefined;
  CaptureModeSelection: { sessionData: any };
  DeviceRegistration: undefined;
};

type CaptureHomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CaptureHome'
>;

interface Props {
  navigation: CaptureHomeScreenNavigationProp;
}

const CaptureHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoOTPs, setDemoOTPs] = useState<
    Array<{ otp: string; resident: string; unit: string; type: string }>
  >([]);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const health = await CaptureService.checkHealth();
      setDemoMode(health.demoMode || false);
      setDemoOTPs(health.demoOTPs || []);
    } catch (error: any) {
      console.warn('App initialization failed:', error.message);
      setDemoMode(true);
    } finally {
      setInitializing(false);
    }
  };

  const handleSearch = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter an OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await CaptureService.startSession(otp.trim());

      if (response.success && response.data) {
        navigation.navigate('CaptureModeSelection', {
          sessionData: response.data,
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to start session');
      }
    } catch (error: any) {
      Alert.alert(
        'Search Failed',
        error.message || 'Unable to search for OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectDemoOTP = (selectedOTP: string) => {
    setOtp(selectedOTP);
  };

  if (initializing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingSpinner text="Initializing..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Residential Access Control
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Image Capture System
            </Text>
          </View>

          {/* Demo Mode Info */}
          {demoMode && demoOTPs.length > 0 && (
            <Card>
              <View style={styles.demoHeader}>
                <Ionicons name="flask" size={20} color={theme.textInverse} />
                <Text style={[styles.demoTitle, { color: theme.textInverse }]}>
                  Demo Mode Active
                </Text>
              </View>
              <Text style={[styles.demoSubtitle, { color: theme.textInverse }]}>
                Try these sample OTPs:
              </Text>
              {demoOTPs.map((demo) => (
                <Button
                  key={demo.otp}
                  title={`${demo.otp} - ${demo.resident} (${demo.unit}) [${demo.type}]`}
                  variant="outline"
                  size="small"
                  onPress={() => selectDemoOTP(demo.otp)}
                  style={styles.demoButton}
                />
              ))}
            </Card>
          )}

          {/* OTP Input Card */}
          <Card>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Enter Visitor OTP
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Enter the One-Time-PIN provided by the visitor
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                One-Time-PIN (OTP)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                placeholderTextColor={theme.textTertiary}
                maxLength={10}
                keyboardType="default"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <Button
              title="Search Resident Info"
              onPress={handleSearch}
              loading={loading}
              disabled={!otp.trim() || loading}
            />
          </Card>

          {/* Status Info */}
          <Card>
            <Text style={[styles.statusTitle, { color: theme.text }]}>
              System Status
            </Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
                Mode:
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: demoMode ? theme.warning : theme.success },
                ]}
              >
                {demoMode ? 'Demo Mode' : 'Production Mode'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
                API:
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: demoMode ? theme.warning : theme.success },
                ]}
              >
                {demoMode ? 'Offline (Demo)' : 'Connected'}
              </Text>
            </View>
          </Card>

          {/* Instructions */}
          <Card>
            <Text style={[styles.instructionsTitle, { color: theme.text }]}>
              How to Use
            </Text>
            <View style={styles.instructionStep}>
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={theme.primary}
                style={styles.instructionIcon}
              />
              <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                Ask visitor for their One-Time-PIN (OTP)
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Ionicons
                name="search-outline"
                size={16}
                color={theme.primary}
                style={styles.instructionIcon}
              />
              <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                Enter the OTP and tap "Search"
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Ionicons
                name="settings-outline"
                size={16}
                color={theme.primary}
                style={styles.instructionIcon}
              />
              <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                Select capture mode (Pedestrian/Vehicle)
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Ionicons
                name="camera-outline"
                size={16}
                color={theme.primary}
                style={styles.instructionIcon}
              />
              <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                Capture required images
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={theme.primary}
                style={styles.instructionIcon}
              />
              <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                Complete the process
              </Text>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  demoSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  demoButton: {
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionIcon: {
    marginRight: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default CaptureHomeScreen;
