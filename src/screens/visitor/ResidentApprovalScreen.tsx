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
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import VisitorService, { Visit } from '../../services/VisitorService';
import NotificationService from '../../services/NotificationService';
import GlassCard from '../../components/GlassCard';

interface ResidentApprovalScreenProps {
  navigation: any;
  route?: {
    params?: {
      visitId?: string;
    };
  };
}

export default function ResidentApprovalScreen({ navigation, route }: ResidentApprovalScreenProps) {
  const { theme } = useTheme();
  const { user, estate } = useAuth();
  const [pendingVisits, setPendingVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingVisitId, setProcessingVisitId] = useState<string | null>(null);

  const visitorService = VisitorService.getInstance();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadPendingVisits();

    // Set up notification handlers
    const handleNotificationReceived = (notification: any) => {
      console.log('Notification received:', notification);
      if (notification.request.content.data.type === 'visitor_request') {
        loadPendingVisits();
      }
    };

    const handleNotificationResponse = (response: any) => {
      console.log('Notification response:', response);
      if (response.notification.request.content.data.type === 'visitor_request') {
        const visitId = response.notification.request.content.data.visitId;
        // Navigate to specific visit or refresh list
        loadPendingVisits();
      }
    };

    notificationService.setupNotificationHandlers(
      handleNotificationReceived,
      handleNotificationResponse
    );
  }, []);

  const loadPendingVisits = async () => {
    if (!user?.uid || !estate?.id) return;

    try {
      const visits = await visitorService.getPendingVisitsForResident(user.uid, estate.id);
      setPendingVisits(visits);
    } catch (error) {
      console.error('Error loading pending visits:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPendingVisits();
  };

  const handleVisitAction = async (visitId: string, action: 'granted' | 'denied', guestName: string) => {
    if (!user?.uid) return;

    setProcessingVisitId(visitId);
    try {
      const result = await visitorService.updateVisitStatus(visitId, action, user.uid);
      
      if (result.success) {
        // Send notification to guest
        if (action === 'granted') {
          await notificationService.sendVisitorApprovedNotification(visitId, guestName);
          
          // If QR pass was created, send SMS
          if (result.qrPassId) {
            // Get visit details to get guest phone
            const visit = pendingVisits.find(v => v.id === visitId);
            if (visit?.guestPhone) {
              await visitorService.sendQRCodeSMS(visit.guestPhone, result.qrPassId);
            }
          }
        } else {
          await notificationService.sendVisitorDeniedNotification(visitId, guestName);
        }

        Alert.alert(
          action === 'granted' ? 'Access Granted' : 'Access Denied',
          action === 'granted' 
            ? `${guestName}'s visit has been approved. They will receive a QR code via SMS.`
            : `${guestName}'s visit request has been denied.`,
          [{ text: 'OK' }]
        );

        // Refresh the list
        loadPendingVisits();
      } else {
        Alert.alert('Error', result.error || 'Failed to update visit status.');
      }
    } catch (error) {
      console.error('Error updating visit status:', error);
      Alert.alert('Error', 'Failed to update visit status. Please try again.');
    } finally {
      setProcessingVisitId(null);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${formatTime(date)}`;
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const renderVisitRequest = ({ item }: { item: Visit }) => (
    <GlassCard style={styles.visitCard}>
      <View style={styles.visitHeader}>
        <View style={styles.visitorInfo}>
          <Text style={[styles.guestName, { color: theme.text }]}>
            {item.guestName}
          </Text>
          <Text style={[styles.visitDetails, { color: theme.textSecondary }]}>
            {item.type === 'driver' ? '🚗 Driver' : '🚶 Pedestrian'} • Unit {item.unitNumber}
          </Text>
          <Text style={[styles.visitTime, { color: theme.textSecondary }]}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.statusBadge}>
          <Ionicons name="time" size={16} color={theme.warning} />
          <Text style={[styles.statusText, { color: theme.warning }]}>
            Pending
          </Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <Ionicons name="call" size={16} color={theme.textSecondary} />
        <Text style={[styles.phoneNumber, { color: theme.textSecondary }]}>
          {item.guestPhone}
        </Text>
      </View>

      {item.mode === 'qr' && (
        <View style={styles.documentsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Documents Provided:
          </Text>
          
          <View style={styles.documentsList}>
            {item.vehicleImageURL && (
              <View style={styles.documentItem}>
                <Ionicons name="car" size={16} color={theme.primary} />
                <Text style={[styles.documentText, { color: theme.textSecondary }]}>
                  Vehicle License Disc
                </Text>
              </View>
            )}
            
            <View style={styles.documentItem}>
              <Ionicons name="card" size={16} color={theme.primary} />
              <Text style={[styles.documentText, { color: theme.textSecondary }]}>
                ID Document
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.denyButton,
            { borderColor: theme.error },
            processingVisitId === item.id && { opacity: 0.5 }
          ]}
          onPress={() => handleVisitAction(item.id, 'denied', item.guestName)}
          disabled={processingVisitId === item.id}
        >
          {processingVisitId === item.id ? (
            <ActivityIndicator size="small" color={theme.error} />
          ) : (
            <>
              <Ionicons name="close" size={20} color={theme.error} />
              <Text style={[styles.actionButtonText, { color: theme.error }]}>
                Deny
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.approveButton,
            { backgroundColor: theme.primary },
            processingVisitId === item.id && { opacity: 0.5 }
          ]}
          onPress={() => handleVisitAction(item.id, 'granted', item.guestName)}
          disabled={processingVisitId === item.id}
        >
          {processingVisitId === item.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                Approve
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading visitor requests...
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Visitor Requests
          </Text>

          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {pendingVisits.length === 0 ? (
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          >
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people" size={60} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Pending Requests
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                You don't have any visitor requests at the moment. You'll be notified when someone requests access.
              </Text>
            </GlassCard>
          </ScrollView>
        ) : (
          <FlatList
            data={pendingVisits}
            keyExtractor={(item) => item.id}
            renderItem={renderVisitRequest}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  visitCard: {
    padding: 20,
    marginBottom: 16,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitorInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visitDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  visitTime: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  phoneNumber: {
    fontSize: 14,
  },
  documentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  documentsList: {
    gap: 6,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  denyButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  approveButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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