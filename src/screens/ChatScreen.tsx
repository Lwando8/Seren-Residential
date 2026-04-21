import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/ChatService';
import { SecurityIncident, SecurityMessage } from '../types';

export default function ChatScreen() {
  const { theme, isDark } = useTheme();
  const { user, estate } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [messages, setMessages] = useState<SecurityMessage[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const chatService = ChatService.getInstance();

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    if (selectedIncident) {
      loadMessages(selectedIncident.id);
      // Set up real-time listener for new messages
      const unsubscribe = chatService.subscribeToIncidentMessages(selectedIncident.id, (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      });
      return unsubscribe;
    }
  }, [selectedIncident]);

  const loadIncidents = async () => {
    if (!user || !estate) return;
    
    setIsLoading(true);
    try {
      const userIncidents = await chatService.getUserIncidents(user.uid, estate.id);
      setIncidents(userIncidents);
    } catch (error) {
      console.error('Error loading incidents:', error);
      Alert.alert('Error', 'Failed to load chat communications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (incidentId: string) => {
    try {
      const incidentMessages = await chatService.getIncidentMessages(incidentId);
      setMessages(incidentMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedIncident || !user) return;
    
    setIsSending(true);
    try {
      await chatService.sendMessage(
        selectedIncident.id,
        user.uid,
        user.name,
        'resident',
        newMessage.trim()
      );
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const createNewIncident = async (title: string, description: string, type: SecurityIncident['type'], priority: SecurityIncident['priority']) => {
    if (!user || !estate) return;
    
    setIsLoading(true);
    try {
      const incidentId = await chatService.createIncident({
        title,
        description,
        type,
        priority,
        residentId: user.uid,
        residentName: user.name,
        unitNumber: user.unitNumber,
        estateId: estate.id,
      });
      
      await loadIncidents();
      setShowNewIncidentForm(false);
      
      // Select the newly created incident
      const newIncident = incidents.find(inc => inc.id === incidentId);
      if (newIncident) {
        setSelectedIncident(newIncident);
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      Alert.alert('Error', 'Failed to create incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'security': return theme.warning;
      case 'management': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'security_alert': return 'shield-checkmark';
      case 'maintenance_request': return 'construct';
      case 'complaint_follow_up': return 'document-text';
      case 'general_inquiry': return 'help-circle';
      default: return 'alert-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return theme.emergency;
      case 'high': return '#ff6b35';
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return theme.emergency;
      case 'acknowledged': return theme.warning;
      case 'in_progress': return theme.info;
      case 'resolved': return theme.success;
      case 'closed': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <LinearGradient
          colors={isDark ? ['#0a0a0b', '#1a1a1b'] : ['#f8f9fb', '#ffffff']}
          style={styles.container}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading chat...
            </Text>
          </View>
        </LinearGradient>
      </Screen>
    );
  }

  return (
    <Screen>
      <LinearGradient
        colors={isDark ? ['#0a0a0b', '#1a1a1b'] : ['#f8f9fb', '#ffffff']}
        style={styles.container}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {!selectedIncident ? (
            // Incidents List
            <View style={styles.roomsContainer}>
              <GlassCard intensity="light" style={styles.headerCard}>
                <View style={styles.header}>
                  <Text style={[styles.headerTitle, { color: theme.text }]}>
                    Chat
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                    Direct communication with estate management
                  </Text>
                </View>
              </GlassCard>

              {/* New Incident Button */}
              <TouchableOpacity
                onPress={() => setShowNewIncidentForm(true)}
                activeOpacity={0.7}
                style={styles.newIncidentButton}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primary + 'cc']}
                  style={styles.newIncidentGradient}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.newIncidentText}>
                    Report New Issue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <ScrollView style={styles.roomsList} showsVerticalScrollIndicator={false}>
                {incidents.map((incident) => (
                  <TouchableOpacity
                    key={incident.id}
                    onPress={() => setSelectedIncident(incident)}
                    activeOpacity={0.7}
                  >
                    <GlassCard intensity="medium" style={styles.incidentCard}>
                      <View style={styles.incidentHeader}>
                        <View style={[styles.incidentIcon, { backgroundColor: getPriorityColor(incident.priority) + '20' }]}>
                          <Ionicons
                            name={getIncidentIcon(incident.type)}
                            size={24}
                            color={getPriorityColor(incident.priority)}
                          />
                        </View>
                        <View style={styles.incidentInfo}>
                          <Text style={[styles.incidentTitle, { color: theme.text }]}>
                            {incident.title}
                          </Text>
                          <Text style={[styles.incidentDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                            {incident.lastMessage?.message || incident.description}
                          </Text>
                          <View style={styles.incidentMeta}>
                            <Text style={[styles.incidentTime, { color: theme.textSecondary }]}>
                              {formatTimestamp(incident.updatedAt)}
                            </Text>
                            {incident.assignedOfficer && (
                              <Text style={[styles.assignedOfficer, { color: theme.info }]}>
                                • {incident.assignedOfficer}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.incidentStatus}>
                          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(incident.priority) }]}>
                            <Text style={[styles.priorityText, { color: 'white' }]}>
                              {incident.priority.toUpperCase()}
                            </Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                            <Text style={[styles.statusText, { color: 'white' }]}>
                              {incident.status.replace('_', ' ').toUpperCase()}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                        </View>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
                
                {incidents.length === 0 && (
                  <GlassCard intensity="light" style={styles.emptyState}>
                    <Ionicons name="shield-checkmark" size={48} color={theme.textSecondary} />
                    <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                      No Active Incidents
                    </Text>
                    <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                      You don't have any active conversations. Tap "Report New Issue" to start chatting with estate management.
                    </Text>
                  </GlassCard>
                )}
              </ScrollView>
            </View>
          ) : (
            // Incident Communication Interface
            <View style={styles.chatContainer}>
              {/* Incident Header */}
              <GlassCard intensity="light" style={styles.chatHeader}>
                <View style={styles.chatHeaderContent}>
                  <TouchableOpacity
                    onPress={() => setSelectedIncident(null)}
                    style={styles.backButton}
                  >
                    <Ionicons name="chevron-back" size={24} color={theme.primary} />
                  </TouchableOpacity>
                  <View style={[styles.incidentIcon, { backgroundColor: getPriorityColor(selectedIncident.priority) + '20' }]}>
                    <Ionicons
                      name={getIncidentIcon(selectedIncident.type)}
                      size={20}
                      color={getPriorityColor(selectedIncident.priority)}
                    />
                  </View>
                  <View style={styles.chatHeaderInfo}>
                    <Text style={[styles.chatRoomName, { color: theme.text }]}>
                      {selectedIncident.title}
                    </Text>
                    <View style={styles.incidentStatusRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIncident.status) }]}>
                        <Text style={[styles.statusText, { color: 'white' }]}>
                          {selectedIncident.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.chatRoomStatus, { color: theme.textSecondary }]}>
                        {selectedIncident.assignedOfficer || 'Awaiting assignment'}
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>

              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToBottom}
              >
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageContainer,
                      message.senderId === user?.uid ? styles.ownMessage : styles.otherMessage
                    ]}
                  >
                    <GlassCard
                      intensity={message.type === 'system_notification' ? "light" : 
                               message.senderId === user?.uid ? "medium" : "light"}
                      style={[
                        styles.messageBubble,
                        message.type === 'system_notification' ? 
                          { backgroundColor: theme.info + '15', borderLeftWidth: 3, borderLeftColor: theme.info } :
                        message.type === 'status_update' ?
                          { backgroundColor: theme.warning + '15', borderLeftWidth: 3, borderLeftColor: theme.warning } :
                        message.senderId === user?.uid ? 
                          { backgroundColor: theme.primary + '20' } : 
                          { backgroundColor: theme.surface + '40' }
                      ]}
                    >
                      {(message.senderId !== user?.uid && message.type !== 'system_notification') && (
                        <View style={styles.messageHeader}>
                          <Text style={[styles.senderName, { color: getRoleColor(message.senderRole) }]}>
                            {message.senderName}
                          </Text>
                          <Text style={[styles.senderRole, { color: theme.textSecondary }]}>
                            {message.senderRole.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {message.type === 'system_notification' && (
                        <View style={[styles.messageHeader, { marginBottom: 8 }]}>
                          <Ionicons name="information-circle" size={16} color={theme.info} />
                          <Text style={[styles.senderName, { color: theme.info, marginLeft: 8 }]}>
                            System Notification
                          </Text>
                        </View>
                      )}
                      {message.type === 'status_update' && (
                        <View style={[styles.messageHeader, { marginBottom: 8 }]}>
                          <Ionicons name="checkmark-circle" size={16} color={theme.warning} />
                          <Text style={[styles.senderName, { color: theme.warning, marginLeft: 8 }]}>
                            Status Update
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.messageText, { color: theme.text }]}>
                        {message.message}
                      </Text>
                      <Text style={[styles.messageTime, { color: theme.textSecondary }]}>
                        {formatTimestamp(message.timestamp)}
                      </Text>
                    </GlassCard>
                  </View>
                ))}
              </ScrollView>

              {/* Message Input */}
              <GlassCard intensity="medium" style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.messageInput, { 
                      color: theme.text,
                      backgroundColor: theme.surface + '20',
                      borderColor: theme.border
                    }]}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.textSecondary}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    style={[
                      styles.sendButton,
                      { backgroundColor: theme.primary },
                      (!newMessage.trim() || isSending) && { opacity: 0.5 }
                    ]}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="send" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  roomsContainer: {
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  roomsList: {
    flex: 1,
  },
  newIncidentButton: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  newIncidentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  newIncidentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  incidentCard: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  incidentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  incidentDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  incidentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incidentTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  assignedOfficer: {
    fontSize: 12,
    fontWeight: '600',
  },
  incidentStatus: {
    alignItems: 'flex-end',
    gap: 6,
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  incidentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  roomCard: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  roomMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roomTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatHeader: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatRoomName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatRoomStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  senderRole: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
  },
  inputContainer: {
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});