import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface CommunityClub {
  id: string;
  name: string;
  description: string;
  members: number;
  category: 'fitness' | 'social' | 'hobby' | 'family' | 'business';
  icon: keyof typeof Ionicons.glyphMap;
  organizer: string;
  nextMeeting?: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  category: 'fitness' | 'social' | 'hobby' | 'family' | 'business';
  clubId?: string;
  isAttending: boolean;
}

const mockClubs: CommunityClub[] = [
  {
    id: '1',
    name: 'Morning Joggers',
    description: 'Early morning running group for fitness enthusiasts',
    members: 23,
    category: 'fitness',
    icon: 'fitness',
    organizer: 'Sarah Johnson',
    nextMeeting: 'Tomorrow 6:00 AM'
  },
  {
    id: '2',
    name: 'Book Club',
    description: 'Monthly book discussions and literary conversations',
    members: 15,
    category: 'hobby',
    icon: 'library',
    organizer: 'Michael Chen',
    nextMeeting: 'This Saturday 2:00 PM'
  },
  {
    id: '3',
    name: 'Family BBQ Group',
    description: 'Weekend family gatherings and community BBQs',
    members: 31,
    category: 'family',
    icon: 'people',
    organizer: 'Lisa Williams',
    nextMeeting: 'Sunday 4:00 PM'
  },
  {
    id: '4',
    name: 'Tennis Club',
    description: 'Weekly tennis matches and tournaments',
    members: 18,
    category: 'fitness',
    icon: 'tennisball',
    organizer: 'David Martinez',
    nextMeeting: 'Wednesday 7:00 PM'
  },
];

const mockEvents: CommunityEvent[] = [
  {
    id: '1',
    title: 'Community Yoga Session',
    description: 'Relaxing morning yoga in the garden area',
    date: 'Tomorrow',
    time: '7:00 AM',
    location: 'Garden Pavilion',
    organizer: 'Sarah Johnson',
    attendees: 12,
    maxAttendees: 20,
    category: 'fitness',
    clubId: '1',
    isAttending: true
  },
  {
    id: '2',
    title: 'Monthly Book Discussion',
    description: 'Discussing "The Seven Husbands of Evelyn Hugo"',
    date: 'This Saturday',
    time: '2:00 PM',
    location: 'Community Hall',
    organizer: 'Michael Chen',
    attendees: 8,
    maxAttendees: 15,
    category: 'hobby',
    clubId: '2',
    isAttending: false
  },
  {
    id: '3',
    title: 'Weekend Family BBQ',
    description: 'Bring your family for food, games, and fun',
    date: 'This Sunday',
    time: '4:00 PM',
    location: 'Pool Area',
    organizer: 'Lisa Williams',
    attendees: 24,
    category: 'family',
    clubId: '3',
    isAttending: true
  },
  {
    id: '4',
    title: 'Tennis Tournament',
    description: 'Singles and doubles matches for all skill levels',
    date: 'Next Wednesday',
    time: '7:00 PM',
    location: 'Tennis Courts',
    organizer: 'David Martinez',
    attendees: 16,
    maxAttendees: 32,
    category: 'fitness',
    clubId: '4',
    isAttending: false
  },
];

export default function CommunityScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'clubs' | 'events'>('events');
  const [events, setEvents] = useState(mockEvents);

  const handleJoinClub = (club: CommunityClub) => {
    Alert.alert(
      `Join ${club.name}?`,
      `Connect with ${club.members} members and participate in group activities.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Club',
          onPress: () => {
            Alert.alert('Success!', `You've joined ${club.name}. You'll receive notifications about upcoming activities.`);
          },
        },
      ]
    );
  };

  const handleEventAction = (event: CommunityEvent) => {
    const isAttending = event.isAttending;
    const action = isAttending ? 'Leave' : 'Join';
    
    Alert.alert(
      `${action} Event?`,
      `${action} "${event.title}" on ${event.date} at ${event.time}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: () => {
            setEvents(prev => prev.map(e => 
              e.id === event.id 
                ? { 
                    ...e, 
                    isAttending: !isAttending,
                    attendees: isAttending ? e.attendees - 1 : e.attendees + 1
                  }
                : e
            ));
            Alert.alert('Success!', `You've ${isAttending ? 'left' : 'joined'} the event.`);
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return ['#10b981', '#059669'];
      case 'social':
        return ['#8b5cf6', '#7c3aed'];
      case 'hobby':
        return ['#f59e0b', '#d97706'];
      case 'family':
        return ['#ef4444', '#dc2626'];
      case 'business':
        return ['#3b82f6', '#2563eb'];
      default:
        return [theme.primary, theme.primary];
    }
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'fitness':
        return 'fitness';
      case 'social':
        return 'people';
      case 'hobby':
        return 'color-palette';
      case 'family':
        return 'home';
      case 'business':
        return 'briefcase';
      default:
        return 'star';
    }
  };

  return (
    <Screen>
      <LinearGradient
        colors={isDark 
          ? ['#0f172a', '#1e293b', '#334155'] 
          : ['#f8fafc', '#f1f5f9', '#e2e8f0']
        }
        style={styles.background}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <GlassCard variant="card" intensity="medium" style={styles.headerCard}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                Community Hub
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Connect with neighbors and join activities
              </Text>
            </View>
          </GlassCard>

          {/* Tab Selector */}
          <GlassCard variant="card" intensity="light" style={styles.tabContainer}>
            <View style={styles.tabSelector}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'events' && [styles.activeTab, { backgroundColor: theme.primary }]
                ]}
                onPress={() => setActiveTab('events')}
              >
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={activeTab === 'events' ? '#fff' : theme.textSecondary} 
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'events' ? '#fff' : theme.textSecondary }
                ]}>
                  Events
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'clubs' && [styles.activeTab, { backgroundColor: theme.primary }]
                ]}
                onPress={() => setActiveTab('clubs')}
              >
                <Ionicons 
                  name="people-circle" 
                  size={20} 
                  color={activeTab === 'clubs' ? '#fff' : theme.textSecondary} 
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'clubs' ? '#fff' : theme.textSecondary }
                ]}>
                  Clubs
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Content */}
          {activeTab === 'events' ? (
            <View style={styles.eventsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Upcoming Events
              </Text>
              {events.map((event) => (
                <GlassCard key={event.id} variant="card" intensity="medium" style={styles.eventCard}>
                  <LinearGradient
                    colors={getCategoryColor(event.category)}
                    style={styles.eventGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.eventHeader}>
                      <View style={styles.eventIconContainer}>
                        <Ionicons name={getCategoryIcon(event.category)} size={24} color="#fff" />
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventOrganizer}>by {event.organizer}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.attendButton,
                          { backgroundColor: event.isAttending ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)' }
                        ]}
                        onPress={() => handleEventAction(event)}
                      >
                        <Ionicons 
                          name={event.isAttending ? "checkmark" : "add"} 
                          size={16} 
                          color={event.isAttending ? "#fff" : "#000"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                  
                  <View style={styles.eventDetails}>
                    <Text style={[styles.eventDescription, { color: theme.textSecondary }]}>
                      {event.description}
                    </Text>
                    
                    <View style={styles.eventMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={16} color={theme.textTertiary} />
                        <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                          {event.date} at {event.time}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={16} color={theme.textTertiary} />
                        <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                          {event.location}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={16} color={theme.textTertiary} />
                        <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                          {event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attending
                        </Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </View>
          ) : (
            <View style={styles.clubsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Community Clubs
              </Text>
              {mockClubs.map((club) => (
                <GlassCard key={club.id} variant="card" intensity="medium" style={styles.clubCard}>
                  <View style={styles.clubHeader}>
                    <LinearGradient
                      colors={getCategoryColor(club.category)}
                      style={styles.clubIconContainer}
                    >
                      <Ionicons name={club.icon} size={28} color="#fff" />
                    </LinearGradient>
                    <View style={styles.clubInfo}>
                      <Text style={[styles.clubName, { color: theme.text }]}>
                        {club.name}
                      </Text>
                      <Text style={[styles.clubDescription, { color: theme.textSecondary }]}>
                        {club.description}
                      </Text>
                      <Text style={[styles.clubOrganizer, { color: theme.textTertiary }]}>
                        Organized by {club.organizer}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.clubStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="people" size={16} color={theme.primary} />
                      <Text style={[styles.statText, { color: theme.textSecondary }]}>
                        {club.members} members
                      </Text>
                    </View>
                    {club.nextMeeting && (
                      <View style={styles.statItem}>
                        <Ionicons name="time" size={16} color={theme.primary} />
                        <Text style={[styles.statText, { color: theme.textSecondary }]}>
                          {club.nextMeeting}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.joinButton, { borderColor: theme.primary }]}
                    onPress={() => handleJoinClub(club)}
                  >
                    <Text style={[styles.joinButtonText, { color: theme.primary }]}>
                      Join Club
                    </Text>
                  </TouchableOpacity>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Info Card */}
          <GlassCard variant="card" intensity="light" style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {activeTab === 'events' 
                ? 'Join events to connect with your neighbors and build community relationships.'
                : 'Create lasting friendships by joining clubs that match your interests and hobbies.'
              }
            </Text>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    marginBottom: 20,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  tabContainer: {
    marginBottom: 24,
  },
  tabSelector: {
    flexDirection: 'row',
    padding: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  eventsSection: {
    marginBottom: 24,
  },
  eventCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventGradient: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  eventOrganizer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  attendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetails: {
    padding: 20,
  },
  eventDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  eventMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    marginLeft: 8,
  },
  clubsSection: {
    marginBottom: 24,
  },
  clubCard: {
    padding: 20,
    marginBottom: 16,
  },
  clubHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  clubIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clubDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  clubOrganizer: {
    fontSize: 12,
  },
  clubStats: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  joinButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
}); 