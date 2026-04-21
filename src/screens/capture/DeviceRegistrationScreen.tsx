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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

type RootStackParamList = {
  DeviceRegistration: undefined;
  CaptureHome: undefined;
};

type DeviceRegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DeviceRegistration'
>;

interface Props {
  navigation: DeviceRegistrationScreenNavigationProp;
}

interface Site {
  id: string;
  name: string;
  location?: string;
  companyName?: string;
  companyId?: string;
}

const DeviceRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      // For now, using demo sites
      // In production, this would fetch from Firebase or API
      const demoSites: Site[] = [
        {
          id: 'site1',
          name: 'Main Gate',
          location: 'Entrance',
          companyName: 'Seren Estate',
        },
        {
          id: 'site2',
          name: 'Guardhouse',
          location: 'Main Building',
          companyName: 'Seren Estate',
        },
      ];
      setSites(demoSites);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sites');
    } finally {
      setInitializing(false);
    }
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
  };

  const handleRegisterDevice = async () => {
    if (!selectedSite) {
      Alert.alert('Error', 'Please select a site');
      return;
    }

    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }

    setLoading(true);
    try {
      // In production, this would register with Firebase/API
      // For now, just simulate registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Device registered successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            navigation.replace('CaptureHome');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to register device');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingSpinner text="Loading sites..." />
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
              Device Registration
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Register this device with a site
            </Text>
          </View>

          {/* Device Name Input */}
          <Card>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Device Name
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Enter a name for this device (e.g., "Gate 1 Camera", "Guardhouse
              Tablet")
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder="Enter device name"
                placeholderTextColor={theme.textTertiary}
                maxLength={50}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </Card>

          {/* Site Selection */}
          <Card>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Select Site
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Choose the site where this device will be used
            </Text>

            {sites.length === 0 ? (
              <Text style={[styles.noSitesText, { color: theme.textSecondary }]}>
                No active sites available
              </Text>
            ) : (
              sites.map((site) => (
                <TouchableOpacity
                  key={site.id}
                  style={[
                    styles.siteItem,
                    {
                      borderColor:
                        selectedSite?.id === site.id
                          ? theme.primary
                          : theme.border,
                      backgroundColor:
                        selectedSite?.id === site.id
                          ? theme.primaryLight + '20'
                          : theme.card,
                    },
                  ]}
                  onPress={() => handleSiteSelect(site)}
                >
                  <View style={styles.siteInfo}>
                    <Text style={[styles.siteName, { color: theme.text }]}>
                      {site.name}
                    </Text>
                    {site.location && (
                      <Text style={[styles.siteLocation, { color: theme.textSecondary }]}>
                        {site.location}
                      </Text>
                    )}
                    {site.companyName && (
                      <Text style={[styles.siteCompany, { color: theme.textSecondary }]}>
                        Company: {site.companyName}
                      </Text>
                    )}
                  </View>
                  {selectedSite?.id === site.id && (
                    <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
                      <Text style={[styles.checkmarkText, { color: theme.textInverse }]}>
                        ✓
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </Card>

          {/* Registration Button */}
          <Card>
            <Button
              title="Register Device"
              onPress={handleRegisterDevice}
              loading={loading}
              disabled={!selectedSite || !deviceName.trim() || loading}
            />
          </Card>

          {/* Selected Site Summary */}
          {selectedSite && (
            <Card>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Registration Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Site:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {selectedSite.name}
                </Text>
              </View>
              {selectedSite.location && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Location:
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {selectedSite.location}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Device:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {deviceName || 'Not specified'}
                </Text>
              </View>
            </Card>
          )}
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
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  noSitesText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderWidth: 2,
    borderRadius: 10,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  siteLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  siteCompany: {
    fontSize: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeviceRegistrationScreen;
