import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../context/ThemeContext';
import VisitorService, { Visit, QRPass } from '../../services/VisitorService';
import GlassCard from '../../components/GlassCard';

interface VisitStatusScreenProps {
  navigation: any;
  route: {
    params: {
      visitId: string;
      guestName: string;
      residentName: string;
      unitNumber: string;
    };
  };
}

export default function VisitStatusScreen({ navigation, route }: VisitStatusScreenProps) {
  const { theme } = useTheme();
  const { visitId, guestName, residentName, unitNumber } = route.params;
  
  const [visit, setVisit] = useState<Visit | null>(null);
  const [qrPass, setQrPass] = useState<QRPass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const visitorService = VisitorService.getInstance();

  useEffect(() => {
    loadVisitStatus();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(loadVisitStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadVisitStatus = async () => {
    try {
      // In demo mode, simulate different states based on time
      const now = new Date();
      const timeElapsed = now.getTime() - (Date.now() - 30000); // Simulate 30s ago
      
      let status: 'pending' | 'granted' | 'denied' | 'expired' = 'pending';
      
      // Simulate approval after 30 seconds for demo
      if (timeElapsed > 30000) {
        status = 'granted';
      }

      const mockVisit: Visit = {
        id: visitId,
        mode: 'qr',
        type: 'pedestrian',
        idImageURL: 'mock_id_url',
        unitNumber,
        guestName,
        guestPhone: '+27123456789',
        selectedResidentUid: 'resident_001',
        selectedResidentName: residentName,
        estateId: 'demo_estate',
        timestamp: new Date(Date.now() - 60000),
        status,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      setVisit(mockVisit);

      // If approved, create mock QR pass
      if (status === 'granted') {
        const mockQrPass: QRPass = {
          id: 'qr_' + visitId,
          visitId,
          qrData: `visit:${visitId}:${now.getTime()}`,
          expiration: new Date(Date.now() + 2 * 60 * 60 * 1000),
          isUsed: false,
          createdAt: new Date(),
        };
        setQrPass(mockQrPass);
      }

      // In real app, would fetch from Firestore:
      // const visitDoc = await getDoc(doc(db, 'visits', visitId));
      // if (visitDoc.exists()) {
      //   const visitData = visitDoc.data() as Visit;
      //   setVisit({ ...visitData, id: visitDoc.id });
      //   
      //   if (visitData.status === 'granted' && visitData.mode === 'qr') {
      //     const qrPassQuery = query(
      //       collection(db, 'qr_passes'),
      //       where('visitId', '==', visitId)
      //     );
      //     const qrPassSnapshot = await getDocs(qrPassQuery);
      //     if (!qrPassSnapshot.empty) {
      //       const qrPassData = qrPassSnapshot.docs[0].data() as QRPass;
      //       setQrPass({ ...qrPassData, id: qrPassSnapshot.docs[0].id });
      //     }
      //   }
      // }

    } catch (error) {
      console.error('Error loading visit status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadVisitStatus();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time';
      case 'granted': return 'checkmark-circle';
      case 'denied': return 'close-circle';
      case 'expired': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.warning;
      case 'granted': return theme.success;
      case 'denied': return theme.error;
      case 'expired': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for approval from resident';
      case 'granted': return 'Access approved! Show QR code at gate';
      case 'denied': return 'Access denied by resident';
      case 'expired': return 'Visit request has expired';
      default: return 'Unknown status';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const shareQRCode = () => {
    if (!qrPass) return;
    
    Alert.alert(
      'Share QR Code',
      'QR code has been saved to your device. You can also share the link via SMS.',
      [
        { text: 'OK' },
        { 
          text: 'Send SMS', 
          onPress: () => {
            Alert.alert('SMS Sent', 'QR code link has been sent to your phone.');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading visit status...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!visit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={theme.error} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Visit Not Found
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            Unable to load visit information. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Visit Status
          </Text>

          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Status Card */}
          <GlassCard style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(visit.status) + '20' }
              ]}>
                <Ionicons 
                  name={getStatusIcon(visit.status)} 
                  size={32} 
                  color={getStatusColor(visit.status)} 
                />
              </View>
              
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: theme.text }]}>
                  {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                </Text>
                <Text style={[styles.statusMessage, { color: theme.textSecondary }]}>
                  {getStatusMessage(visit.status)}
                </Text>
              </View>
            </View>

            {visit.status === 'pending' && (
              <View style={styles.pendingInfo}>
                <Text style={[styles.pendingText, { color: theme.textSecondary }]}>
                  🔔 {residentName} has been notified and will respond shortly.
                </Text>
              </View>
            )}
          </GlassCard>

          {/* Visit Details */}
          <GlassCard style={styles.detailsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Visit Details
            </Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Guest Name:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {visit.guestName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="home" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Unit:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {visit.unitNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person-circle" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Resident:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {visit.selectedResidentName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Requested:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDateTime(visit.timestamp)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="alarm" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Expires:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDateTime(visit.expiresAt)}
              </Text>
            </View>
          </GlassCard>

          {/* QR Code Card (when approved) */}
          {visit.status === 'granted' && qrPass && (
            <GlassCard style={styles.qrCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Access QR Code
              </Text>
              
              <Text style={[styles.qrSubtitle, { color: theme.textSecondary }]}>
                Show this QR code at the estate gate
              </Text>

              <View style={styles.qrContainer}>
                <QRCode
                  value={qrPass.qrData}
                  size={200}
                  backgroundColor={'white'}
                  color={theme.text}
                />
              </View>

              <View style={styles.qrInfo}>
                <View style={styles.qrInfoRow}>
                  <Ionicons name="time" size={16} color={theme.warning} />
                  <Text style={[styles.qrInfoText, { color: theme.textSecondary }]}>
                    Valid until {formatTime(qrPass.expiration)}
                  </Text>
                </View>
                
                <View style={styles.qrInfoRow}>
                  <Ionicons name="shield-checkmark" size={16} color={theme.success} />
                  <Text style={[styles.qrInfoText, { color: theme.textSecondary }]}>
                    Single use only
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: theme.primary }]}
                onPress={shareQRCode}
              >
                <Ionicons name="share" size={20} color="white" />
                <Text style={styles.shareButtonText}>Share QR Code</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          {/* Instructions */}
          <GlassCard style={styles.instructionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Instructions
            </Text>
            
            {visit.status === 'pending' && (
              <View style={styles.instructions}>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Your request has been sent to {residentName}
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • They will receive a notification to approve your visit
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • This screen will update automatically when they respond
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Pull down to refresh manually
                </Text>
              </View>
            )}

            {visit.status === 'granted' && (
              <View style={styles.instructions}>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Present the QR code to the security guard at the gate
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • The code is valid for 2 hours from approval
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Save or share the QR code for offline access
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Contact {residentName} if you need assistance
                </Text>
              </View>
            )}

            {visit.status === 'denied' && (
              <View style={styles.instructions}>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Your visit request was not approved
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • Contact {residentName} directly if needed
                </Text>
                <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                  • You can submit a new request if circumstances change
                </Text>
              </View>
            )}
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
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  statusCard: {
    padding: 24,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 16,
    lineHeight: 22,
  },
  pendingInfo: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  detailsCard: {
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  qrCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  qrInfo: {
    width: '100%',
    marginBottom: 20,
  },
  qrInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  qrInfoText: {
    fontSize: 14,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsCard: {
    padding: 24,
    marginBottom: 20,
  },
  instructions: {
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 