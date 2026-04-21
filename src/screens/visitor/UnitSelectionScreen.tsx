import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import UserService from '../../services/UserService';
import VisitorService from '../../services/VisitorService';
import NotificationService from '../../services/NotificationService';
import GlassCard from '../../components/GlassCard';

interface Resident {
  uid: string;
  firstName: string;
  lastName: string;
  unitNumber: string;
  phoneNumber: string;
  isActive: boolean;
}

interface UnitSelectionScreenProps {
  navigation: any;
  route: {
    params: {
      userType: 'driver' | 'pedestrian';
      mode: 'qr';
      vehicleImage?: string;
      idImage: string;
    };
  };
}

export default function UnitSelectionScreen({ navigation, route }: UnitSelectionScreenProps) {
  const { theme } = useTheme();
  const { estate } = useAuth();
  const { userType, vehicleImage, idImage } = route.params;

  const [unitNumber, setUnitNumber] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userService = UserService.getInstance();
  const visitorService = VisitorService.getInstance();
  const notificationService = NotificationService.getInstance();

  const searchResidents = async (unit: string) => {
    if (!unit.trim() || unit.length < 1) {
      setResidents([]);
      return;
    }

    setIsLoading(true);
    try {
      // In demo mode, return mock residents
      const mockResidents: Resident[] = [
        {
          uid: 'resident_001',
          firstName: 'John',
          lastName: 'Smith',
          unitNumber: unit,
          phoneNumber: '+27123456789',
          isActive: true,
        },
        {
          uid: 'resident_002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          unitNumber: unit,
          phoneNumber: '+27987654321',
          isActive: true,
        },
      ];

      // Filter based on unit number for demo
      const filteredResidents = mockResidents.filter(r => 
        r.unitNumber.toLowerCase().includes(unit.toLowerCase())
      );

      setResidents(filteredResidents);

      // In a real app, you would search Firestore:
      // const estateResidents = await userService.getResidentsByUnit(estate?.id || '', unit);
      // setResidents(estateResidents);

    } catch (error) {
      console.error('Error searching residents:', error);
      Alert.alert('Error', 'Failed to search for residents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnitSearch = (text: string) => {
    setUnitNumber(text);
    setSelectedResident(null);
    searchResidents(text);
  };

  const selectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setUnitNumber(resident.unitNumber);
  };

  const submitVisitRequest = async () => {
    if (!selectedResident) {
      Alert.alert('Select Resident', 'Please select a resident to request access from.');
      return;
    }

    if (!guestName.trim()) {
      Alert.alert('Enter Name', 'Please enter your full name.');
      return;
    }

    if (!guestPhone.trim()) {
      Alert.alert('Enter Phone', 'Please enter your phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert image URIs to blobs for upload
      const idImageBlob = await uriToBlob(idImage);
      let vehicleImageBlob: Blob | undefined;
      
      if (vehicleImage) {
        vehicleImageBlob = await uriToBlob(vehicleImage);
      }

      // Create visit request
      const visitRequest = {
        mode: 'qr' as const,
        type: userType,
        vehicleImage: vehicleImageBlob,
        idImage: idImageBlob,
        unitNumber: selectedResident.unitNumber,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        selectedResidentUid: selectedResident.uid,
        selectedResidentName: `${selectedResident.firstName} ${selectedResident.lastName}`,
        estateId: estate?.id || '',
      };

      const result = await visitorService.createVisit(visitRequest);

      if (result.success && result.visitId) {
        // Send notification to resident
        await notificationService.sendVisitorRequestNotification(
          selectedResident.uid,
          guestName.trim(),
          result.visitId,
          selectedResident.unitNumber
        );

        Alert.alert(
          'Request Sent!',
          `Your visit request has been sent to ${selectedResident.firstName} ${selectedResident.lastName}. They will be notified to approve your access.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VisitStatus', { 
                visitId: result.visitId,
                guestName: guestName.trim(),
                residentName: `${selectedResident.firstName} ${selectedResident.lastName}`,
                unitNumber: selectedResident.unitNumber,
              })
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create visit request. Please try again.');
      }

    } catch (error) {
      console.error('Error submitting visit request:', error);
      Alert.alert('Error', 'Failed to submit visit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    return await response.blob();
  };

  const renderResident = ({ item }: { item: Resident }) => (
    <TouchableOpacity
      style={[
        styles.residentCard,
        { 
          borderColor: selectedResident?.uid === item.uid ? theme.primary : theme.border,
          backgroundColor: selectedResident?.uid === item.uid 
            ? `${theme.primary}20` 
            : theme.backgroundSecondary
        }
      ]}
      onPress={() => selectResident(item)}
    >
      <View style={styles.residentInfo}>
        <View style={styles.residentHeader}>
          <Text style={[styles.residentName, { color: theme.text }]}>
            {item.firstName} {item.lastName}
          </Text>
          {selectedResident?.uid === item.uid && (
            <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
          )}
        </View>
        <Text style={[styles.residentUnit, { color: theme.textSecondary }]}>
          Unit {item.unitNumber}
        </Text>
        <Text style={[styles.residentPhone, { color: theme.textSecondary }]}>
          {item.phoneNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Select Resident
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <GlassCard style={styles.card}>
            <Text style={[styles.title, { color: theme.text }]}>
              Request Access
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter the unit number to find residents
            </Text>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Unit Number
              </Text>
              <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                <Ionicons name="home" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter unit number (e.g., A101)"
                  placeholderTextColor={theme.textSecondary}
                  value={unitNumber}
                  onChangeText={handleUnitSearch}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Searching for residents...
                </Text>
              </View>
            )}

            {residents.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Select Resident
                </Text>
                <FlatList
                  data={residents}
                  keyExtractor={(item) => item.uid}
                  renderItem={renderResident}
                  scrollEnabled={false}
                  style={styles.residentsList}
                />
              </View>
            )}

            {unitNumber.length > 0 && residents.length === 0 && !isLoading && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={40} color={theme.textSecondary} />
                <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                  No residents found for unit "{unitNumber}"
                </Text>
                <Text style={[styles.noResultsSubtext, { color: theme.textSecondary }]}>
                  Please check the unit number and try again
                </Text>
              </View>
            )}

            {selectedResident && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Your Information
                </Text>
                
                <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                  <Ionicons name="person" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.textSecondary}
                    value={guestName}
                    onChangeText={setGuestName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                  <Ionicons name="call" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={theme.textSecondary}
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: theme.primary },
                    (!guestName.trim() || !guestPhone.trim()) && { opacity: 0.5 }
                  ]}
                  onPress={submitVisitRequest}
                  disabled={!guestName.trim() || !guestPhone.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Send Request</Text>
                      <Ionicons name="send" size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                The resident will receive a notification to approve your visit
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  card: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  residentsList: {
    maxHeight: 300,
  },
  residentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  residentInfo: {
    flex: 1,
  },
  residentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  residentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  residentUnit: {
    fontSize: 14,
    marginBottom: 2,
  },
  residentPhone: {
    fontSize: 14,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
}); 