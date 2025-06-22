import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import AlertService from '../services/AlertService';
import { EstateAlert } from '../types';

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<EstateAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const alertService = AlertService.getInstance();

  // Mock user info - in real app, get from Auth context
  const mockUser = {
    uid: 'mock-user-123',
    name: 'John Doe',
    unitNumber: 'Unit 42'
  };

  useEffect(() => {
    loadRecentAlerts();
  }, []);

  const loadRecentAlerts = async () => {
    try {
      const alerts = await alertService.getUserAlerts(mockUser.uid);
      setRecentAlerts(alerts.slice(0, 3)); // Show only recent 3 alerts
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleSecurityAlert = () => {
    Alert.alert(
      '🛡️ SECURITY ALERT',
      'This will send a security alert to estate control room. Use for suspicious activity, break-ins, or security concerns.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SECURITY ALERT',
          style: 'destructive',
          onPress: () => sendAlert('security'),
        },
      ]
    );
  };

  const handleComplaintsAlert = () => {
    Alert.alert(
      '📝 FILE COMPLAINT',
      'Report noise complaints, maintenance issues, or community concerns.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'FILE COMPLAINT',
          onPress: () => Alert.alert('Complaints', 'Complaints feature coming soon!'),
        },
      ]
    );
  };

  const handleReportsAlert = () => {
    Alert.alert(
      '📊 SUBMIT REPORT',
      'Submit incident reports, maintenance requests, or general feedback.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SUBMIT REPORT',
          onPress: () => Alert.alert('Reports', 'Reports feature coming soon!'),
        },
      ]
    );
  };

  const sendAlert = async (type: 'security' | 'emergency' | 'medical') => {
    if (isEmergencyActive) return;

    setIsEmergencyActive(true);
    setIsLoading(true);

    try {
      const alertId = await alertService.sendEmergencyAlert(
        type,
        `${type} alert from ${mockUser.unitNumber} - immediate response required`,
        mockUser
      );

      if (alertId) {
        const alertType = type === 'security' ? 'Security' : type === 'emergency' ? 'SOS' : 'Medical';
        Alert.alert(
          `🚨 ${alertType.toUpperCase()} ALERT SENT`,
          `${alertType} alert has been sent to estate security from ${mockUser.unitNumber}.\n\n🚨 Priority Response: IMMEDIATE\n📍 Location: Shared with control room\n\n⏱️ Security response dispatched`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                setIsEmergencyActive(false);
                loadRecentAlerts();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to send alert. Please try again or call security directly.');
        setIsEmergencyActive(false);
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      Alert.alert('Error', 'Failed to send alert. Please try again or call security directly.');
      setIsEmergencyActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'warning';
      case 'medical': return 'medical';
      case 'security': return 'shield-checkmark';
      default: return 'alert';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'open': return theme.emergency;
      case 'in-progress': return '#ff9500';
      case 'resolved': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const formatAlertTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Elegant color schemes
  const securityGradient = isDark 
    ? ['#1e293b', '#334155'] 
    : ['#f1f5f9', '#e2e8f0'];
  
  const complaintsGradient = isDark 
    ? ['#0f172a', '#1e293b'] 
    : ['#f8fafc', '#f1f5f9'];
  
  const reportsGradient = isDark 
    ? ['#111827', '#1f2937'] 
    : ['#f9fafb', '#f3f4f6'];

  return (
    <Screen>
      <LinearGradient
        colors={isDark ? ['#0a0a0b', '#1a1a1b'] : ['#f8f9fb', '#ffffff']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header with glass effect */}
          <GlassCard intensity="light" style={styles.headerCard}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: theme.text }]}>
                  Good Morning 👋
                </Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>
                  {mockUser.unitNumber} • Seren Residential
                </Text>
              </View>
              <TouchableOpacity onPress={toggleTheme} style={[styles.themeButton, { backgroundColor: theme.glass }]}>
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={22}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Status Bar with glass effect */}
          <GlassCard intensity="light" style={styles.statusCard}>
            <View style={styles.statusBar}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                  Control Room Active
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, { color: theme.textInverse }]}>
                  24/7
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Main Action Buttons */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Security Services
            </Text>
            
            {/* Main Security Button - Large Circular */}
            <View style={styles.mainButtonContainer}>
              <TouchableOpacity
                onPress={handleSecurityAlert}
                disabled={isEmergencyActive || isLoading}
                activeOpacity={0.9}
                style={[styles.mainButton, { opacity: (isEmergencyActive || isLoading) ? 0.7 : 1 }]}
              >
                <LinearGradient
                  colors={securityGradient}
                  style={styles.mainButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.mainButtonBorder, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    {isLoading ? (
                      <ActivityIndicator size="large" color={theme.text} />
                    ) : (
                      <>
                        <View style={[styles.mainButtonIconContainer, { backgroundColor: theme.primary + '20' }]}>
                          <Ionicons name="shield-checkmark" size={36} color={theme.primary} />
                        </View>
                        <Text style={[styles.mainButtonText, { color: theme.text }]}>
                          Security Alert
                        </Text>
                        <Text style={[styles.mainButtonSubtext, { color: theme.textSecondary }]}>
                          Immediate Response
                        </Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Secondary Buttons Row */}
            <View style={styles.secondaryButtonsContainer}>
              {/* Complaints Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleComplaintsAlert}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={complaintsGradient}
                  style={styles.secondaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.secondaryButtonBorder, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                    <View style={[styles.secondaryButtonIconContainer, { backgroundColor: theme.warning + '15' }]}>
                      <Ionicons name="document-text" size={24} color={theme.warning} />
                    </View>
                    <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                      Complaints
                    </Text>
                    <Text style={[styles.secondaryButtonSubtext, { color: theme.textSecondary }]}>
                      File Issue
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Reports Button */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReportsAlert}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={reportsGradient}
                  style={styles.secondaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.secondaryButtonBorder, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                    <View style={[styles.secondaryButtonIconContainer, { backgroundColor: theme.info + '15' }]}>
                      <Ionicons name="bar-chart" size={24} color={theme.info} />
                    </View>
                    <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                      Reports
                    </Text>
                    <Text style={[styles.secondaryButtonSubtext, { color: theme.textSecondary }]}>
                      Submit Report
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity with enhanced glass cards */}
          {recentAlerts.length > 0 && (
            <View style={styles.alertsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Activity
              </Text>
              {recentAlerts.map((alert) => (
                <GlassCard key={alert.id} intensity="medium" style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertIconContainer}>
                      <Ionicons
                        name={getAlertTypeIcon(alert.type)}
                        size={20}
                        color={getAlertStatusColor(alert.status)}
                      />
                    </View>
                    <View style={styles.alertInfo}>
                      <Text style={[styles.alertType, { color: theme.text }]}>
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                      </Text>
                      <Text style={[styles.alertTime, { color: theme.textSecondary }]}>
                        {formatAlertTime(alert.timestamp)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getAlertStatusColor(alert.status) }]}>
                      <Text style={[styles.statusBadgeText, { color: theme.textInverse }]}>
                        {alert.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.alertDescription, { color: theme.textSecondary }]}>
                    {alert.description}
                  </Text>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Estate Info with glass effect */}
          <GlassCard intensity="light" style={styles.estateInfoCard}>
            <Text style={[styles.estateTitle, { color: theme.text }]}>
              Estate Information
            </Text>
            <View style={styles.estateInfo}>
              <View style={styles.estateInfoItem}>
                <Ionicons name="location" size={16} color={theme.primary} />
                <Text style={[styles.estateInfoText, { color: theme.textSecondary }]}>
                  Seren Residential Estate
                </Text>
              </View>
              <View style={styles.estateInfoItem}>
                <Ionicons name="call" size={16} color={theme.primary} />
                <Text style={[styles.estateInfoText, { color: theme.textSecondary }]}>
                  Emergency: 10111
                </Text>
              </View>
              <View style={styles.estateInfoItem}>
                <Ionicons name="time" size={16} color={theme.primary} />
                <Text style={[styles.estateInfoText, { color: theme.textSecondary }]}>
                  Security: 24/7 Active
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerCard: {
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  mainButtonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainButton: {
    width: 200,
    height: 200,
  },
  mainButtonGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    padding: 3,
  },
  mainButtonBorder: {
    flex: 1,
    borderRadius: 97,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainButtonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  mainButtonSubtext: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 140,
    height: 140,
  },
  secondaryButtonGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 2,
  },
  secondaryButtonBorder: {
    flex: 1,
    borderRadius: 68,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  secondaryButtonSubtext: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  alertsSection: {
    marginBottom: 32,
  },
  alertCard: {
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  estateInfoCard: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  estateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  estateInfo: {
    gap: 12,
  },
  estateInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estateInfoText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 