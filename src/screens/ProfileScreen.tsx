import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';


export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme, isDark, toggleTheme } = useTheme();

  // Mock user info - in real app, get from Auth context
  const mockUser = {
    uid: 'mock-user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    unitNumber: 'Unit 42',
    role: 'resident'
  };



  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // In real app, handle sign out
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          },
        },
      ]
    );
  };





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
              <Text style={[styles.title, { color: theme.text }]}>
                Profile
              </Text>
            </View>
          </GlassCard>

          {/* User Info Card with gradient */}
          <GlassCard intensity="medium" style={styles.userCard}>
            <LinearGradient
              colors={theme.gradientPrimary}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarContainer}>
                <Text style={[styles.avatarText, { color: theme.textInverse }]}>
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {mockUser.name}
              </Text>
              <Text style={[styles.userDetails, { color: theme.textSecondary }]}>
                {mockUser.unitNumber} • Seren Residential
              </Text>
              <Text style={[styles.userEmail, { color: theme.textTertiary }]}>
                {mockUser.email}
              </Text>
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation?.navigate?.('ResidentApproval')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="people" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Visitors
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => Alert.alert('Emergency Contacts', 'Feature coming soon!')}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="call" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Emergency
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => Alert.alert('Support', 'Contact support feature coming soon!')}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="help-circle" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Support
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => Alert.alert('Settings', 'Quick settings coming soon!')}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="settings" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Settings
            </Text>
            
            <GlassCard intensity="light" style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleTheme}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons 
                    name={isDark ? 'sunny' : 'moon'} 
                    size={20} 
                    color={theme.primary} 
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    Appearance
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                    {isDark ? 'Dark mode active' : 'Light mode active'}
                  </Text>
                </View>
                <View style={[styles.switchContainer, { backgroundColor: isDark ? theme.primary : theme.border }]}>
                  <View style={[
                    styles.switchThumb,
                    { 
                      backgroundColor: theme.textInverse,
                      transform: [{ translateX: isDark ? 18 : 2 }]
                    }
                  ]} />
                </View>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: theme.warning + '20' }]}>
                  <Ionicons name="notifications" size={20} color={theme.warning} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    Notifications
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                    Push notifications & alerts
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: theme.info + '20' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.info} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    Privacy & Security
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                    Data protection & location
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              About
            </Text>
            
            <GlassCard intensity="light" style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => Alert.alert('App Info', 'Seren Residential App v1.0.0\n\nBuilt for estate security and community management.')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="information-circle" size={20} color={theme.success} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    App Information
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                    Version 1.0.0
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => Alert.alert('Help', 'Help & support feature coming soon!')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="help-circle" size={20} color={theme.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    Help & Support
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                    FAQ, contact support
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.error, theme.error + '80']}
              style={styles.signOutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="log-out" size={20} color={theme.textInverse} />
              <Text style={[styles.signOutText, { color: theme.textInverse }]}>
                Sign Out
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
  },

  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  quickActionButton: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  menuCard: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  switchContainer: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  divider: {
    height: 1,
    marginLeft: 72,
    marginRight: 20,
  },
  signOutButton: {
    marginBottom: 20,
  },
  signOutGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});