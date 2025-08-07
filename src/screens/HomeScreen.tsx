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
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AlertService from '../services/AlertService';

import { EstateAlert, RootTabParamList, RootStackParamList } from '../types';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'> & StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, estate, signOut } = useAuth();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<EstateAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const alertService = AlertService.getInstance();

  useEffect(() => {
    loadRecentAlerts();
  }, []);

  const loadRecentAlerts = async () => {
    if (!user) return;
    try {
      const alerts = await alertService.getUserAlerts(user.uid);
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

  const navigateToReports = () => {
    navigation.navigate('Reports');
  };

  const navigateToComplaints = () => {
    navigation.navigate('PersonalComplaints');
  };

  const navigateToCommunity = () => {
    navigation.navigate('Community');
  };

  const navigateToChat = () => {
    navigation.navigate('Chat');
  };

  const sendAlert = async (type: 'security' | 'emergency' | 'medical') => {
    if (isEmergencyActive) return;

    setIsEmergencyActive(true);
    setIsLoading(true);

    try {
      const alertId = await alertService.sendEmergencyAlert(
        type,
        `${type} alert from ${user?.unitNumber} - immediate response required`,
        user
      );

      if (alertId) {
        const alertType = type === 'security' ? 'Security' : type === 'emergency' ? 'SOS' : 'Medical';
        Alert.alert(
          `🚨 ${alertType.toUpperCase()} ALERT SENT`,
          `${alertType} alert has been sent to ${estate?.name} security from ${user?.unitNumber}.\n\n🚨 Priority Response: IMMEDIATE\n📍 Location: Shared with control room\n\n⏱️ Security response dispatched`,
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

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.name?.split(' ')[0] || 'Resident';
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${firstName}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${firstName}`;
    } else if (hour >= 17 && hour < 21) {
      return `Good evening, ${firstName}`;
    } else {
      return `Good evening, ${firstName}`;
    }
  };

  // Elegant color schemes
  const securityGradient = isDark 
    ? ['#1e293b', '#334155'] 
    : ['#f1f5f9', '#e2e8f0'];

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
                  {getTimeBasedGreeting()}
                </Text>
                <Text style={[styles.unitText, { color: theme.textSecondary }]}>
                  {user?.unitNumber} • {estate?.name}
                </Text>
              </View>
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

          {/* Main Action Section */}
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

            {/* Quick Actions Carousel */}
            <GlassCard intensity="medium" style={styles.circularActionsContainer}>
              <Text style={[styles.circularActionsTitle, { color: theme.text }]}>
                Quick Actions
              </Text>
              
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.carouselContainer}
                contentContainerStyle={styles.carouselContent}
              >
                {/* Visitor Management Button */}
                <TouchableOpacity
                  style={styles.carouselButton}
                  onPress={() => navigation.navigate('VisitorCheckIn')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselButtonIcon, { backgroundColor: theme.primary }]}>
                    <Ionicons name="people" size={22} color="white" />
                  </View>
                  <Text style={[styles.carouselButtonText, { color: theme.text }]}>
                    Visitors
                  </Text>
                </TouchableOpacity>

                {/* Reports Button */}
                <TouchableOpacity
                  style={styles.carouselButton}
                  onPress={navigateToReports}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselButtonIcon, { backgroundColor: theme.info }]}>
                    <Ionicons name="bar-chart" size={22} color="white" />
                  </View>
                  <Text style={[styles.carouselButtonText, { color: theme.text }]}>
                    Reports
                  </Text>
                </TouchableOpacity>

                {/* Complaints Button */}
                <TouchableOpacity
                  style={styles.carouselButton}
                  onPress={navigateToComplaints}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselButtonIcon, { backgroundColor: theme.warning }]}>
                    <Ionicons name="document-text" size={22} color="white" />
                  </View>
                  <Text style={[styles.carouselButtonText, { color: theme.text }]}>
                    Issues
                  </Text>
                </TouchableOpacity>

                {/* Community Button */}
                <TouchableOpacity
                  style={styles.carouselButton}
                  onPress={navigateToCommunity}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselButtonIcon, { backgroundColor: theme.success }]}>
                    <Ionicons name="people-circle" size={22} color="white" />
                  </View>
                  <Text style={[styles.carouselButtonText, { color: theme.text }]}>
                    Social
                  </Text>
                </TouchableOpacity>

                {/* Chat Button */}
                <TouchableOpacity
                  style={styles.carouselButton}
                  onPress={navigateToChat}
                  activeOpacity={0.7}
                >
                  <View style={[styles.carouselButtonIcon, { backgroundColor: '#9333ea' }]}>
                    <Ionicons name="chatbubbles" size={22} color="white" />
                  </View>
                  <Text style={[styles.carouselButtonText, { color: theme.text }]}>
                    Chat
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </GlassCard>
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
                <Ionicons name="time" size={16} color={theme.textSecondary} />
                <Text style={[styles.estateInfoText, { color: theme.textSecondary }]}>
                  Security: 24/7 Active Monitoring
                </Text>
              </View>
              <View style={styles.estateInfoItem}>
                <Ionicons name="call" size={16} color={theme.textSecondary} />
                <Text style={[styles.estateInfoText, { color: theme.textSecondary }]}>
                  Emergency: +27 11 234 5678
                </Text>
              </View>
              <View style={styles.estateInfoItem}>
                <Ionicons name="mail" size={16} color={theme.textSecondary} />
                <Text style={[styles.estateInfoText, { color: theme.textSecondary }]}>
                  Management: info@serenresidential.co.za
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
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    marginBottom: 24,
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
  // Circular Quick Actions Styles
  circularActionsContainer: {
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  circularActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  carouselContainer: {
    marginTop: 16,
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 24,
  },
  carouselButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  carouselButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  carouselButtonText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 60,
    lineHeight: 14,
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