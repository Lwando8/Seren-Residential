import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import ComplaintService from '../services/ComplaintService';
import { Complaint, ComplaintType } from '../types';

export default function PersonalComplaintsScreen() {
  const { theme, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<ComplaintType | null>(null);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const complaintService = ComplaintService.getInstance();

  useEffect(() => {
    loadUserComplaints();
  }, []);

  const loadUserComplaints = async () => {
    try {
      setIsLoading(true);
      const complaints = await complaintService.getUserComplaints('demo-user');
      setUserComplaints(complaints);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const complaintTypes = [
    { 
      type: 'noise' as ComplaintType, 
      label: 'Noise Complaint', 
      icon: 'volume-high',
      description: 'Loud music, parties, construction noise',
      color: '#FF6B6B'
    },
    { 
      type: 'parking' as ComplaintType, 
      label: 'Parking Issue', 
      icon: 'car',
      description: 'Someone parked in your bay, blocked access',
      color: '#4ECDC4'
    },
    { 
      type: 'security' as ComplaintType, 
      label: 'Security Concern', 
      icon: 'shield-checkmark',
      description: 'Suspicious activity, broken security features',
      color: '#45B7D1'
    },
    { 
      type: 'maintenance' as ComplaintType, 
      label: 'Maintenance', 
      icon: 'construct',
      description: 'Broken fixtures, plumbing, electrical issues',
      color: '#96CEB4'
    },
    { 
      type: 'pets' as ComplaintType, 
      label: 'Pet Issue', 
      icon: 'paw',
      description: 'Unleashed pets, pet waste, barking',
      color: '#FFEAA7'
    },
    { 
      type: 'garbage' as ComplaintType, 
      label: 'Garbage/Waste', 
      icon: 'trash',
      description: 'Improper disposal, overflowing bins',
      color: '#DDA0DD'
    },
    { 
      type: 'other' as ComplaintType, 
      label: 'Other', 
      icon: 'ellipsis-horizontal',
      description: 'Any other residential concern',
      color: '#A8A8A8'
    }
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo to your complaint',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const submitComplaint = async () => {
    if (!selectedType || !description.trim()) {
      Alert.alert('Error', 'Please select a complaint type and provide a description.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userInfo = {
        uid: 'demo-user',
        name: 'Demo User',
        unitNumber: 'Unit 42'
      };

      const complaintId = await complaintService.submitComplaint(
        selectedType,
        description,
        selectedImage || undefined,
        userInfo
      );

      if (complaintId) {
        Alert.alert(
          'Success',
          'Your complaint has been submitted successfully. You will receive updates on its status.',
          [{ text: 'OK', onPress: resetForm }]
        );
        await loadUserComplaints();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setDescription('');
    setSelectedImage(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return theme.error;
      case 'in-progress': return theme.warning;
      case 'resolved': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  const getComplaintTypeInfo = (type: ComplaintType) => {
    return complaintTypes.find(ct => ct.type === type) || complaintTypes[complaintTypes.length - 1];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (showForm) {
    return (
      <Screen>
        <LinearGradient
          colors={isDark ? ['#0a0a0b', '#1a1a1b'] : ['#f8f9fb', '#ffffff']}
          style={styles.container}
        >
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {/* Header */}
            <GlassCard intensity="light" style={styles.headerCard}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowForm(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                  <Text style={[styles.title, { color: theme.text }]}>
                    Submit Complaint
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Report an issue in your community
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Complaint Type Selection */}
            <GlassCard intensity="medium" style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                What type of complaint would you like to report?
              </Text>
              
              <View style={styles.typeGrid}>
                {complaintTypes.map((type) => (
                  <TouchableOpacity
                    key={type.type}
                    onPress={() => setSelectedType(type.type)}
                    style={[
                      styles.typeCard,
                      { borderColor: selectedType === type.type ? type.color : 'transparent' }
                    ]}
                  >
                    <LinearGradient
                      colors={selectedType === type.type 
                        ? [type.color + '20', type.color + '10'] 
                        : isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)']
                      }
                      style={styles.typeCardGradient}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={24}
                        color={selectedType === type.type ? type.color : theme.textSecondary}
                      />
                      <Text style={[
                        styles.typeLabel,
                        { color: selectedType === type.type ? theme.text : theme.textSecondary }
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={[styles.typeDescription, { color: theme.textTertiary }]}>
                        {type.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* Description Input */}
            <GlassCard intensity="medium" style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Describe the issue
              </Text>
              <TextInput
                style={[
                  styles.descriptionInput,
                  { 
                    color: theme.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                ]}
                placeholder="Please provide details about the complaint..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </GlassCard>

            {/* Photo Upload */}
            <GlassCard intensity="medium" style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Add Photo (Optional)
              </Text>
              
              {selectedImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    style={styles.removeImageButton}
                  >
                    <Ionicons name="close" size={20} color={theme.textInverse} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={showImageOptions} style={styles.photoButton}>
                  <LinearGradient
                    colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)']}
                    style={styles.photoButtonGradient}
                  >
                    <Ionicons name="camera" size={24} color={theme.textSecondary} />
                    <Text style={[styles.photoButtonText, { color: theme.textSecondary }]}>
                      Add Photo
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </GlassCard>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submitComplaint}
              disabled={!selectedType || !description.trim() || isSubmitting}
              style={[
                styles.submitButton,
                { opacity: (!selectedType || !description.trim() || isSubmitting) ? 0.5 : 1 }
              ]}
            >
              <LinearGradient
                colors={theme.gradientPrimary}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.textInverse} />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color={theme.textInverse} />
                    <Text style={[styles.submitButtonText, { color: theme.textInverse }]}>
                      Submit Complaint
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
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
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header */}
          <GlassCard intensity="light" style={styles.headerCard}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  My Complaints
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Lodge and track your complaints
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowForm(true)}
                style={[styles.newComplaintButton, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="add" size={24} color={theme.textInverse} />
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard intensity="medium" style={styles.quickActionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Complaints
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedType('noise');
                  setShowForm(true);
                }}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF4757']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="volume-high" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Noise
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectedType('parking');
                  setShowForm(true);
                }}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="car" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Parking
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSelectedType('security');
                  setShowForm(true);
                }}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={['#45B7D1', '#3742FA']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="shield-checkmark" size={20} color="white" />
                </LinearGradient>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  Security
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* User Complaints */}
          <View style={styles.complaintsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
              Your Complaints
            </Text>
            
            {isLoading ? (
              <GlassCard intensity="light" style={styles.loadingCard}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Loading your complaints...
                </Text>
              </GlassCard>
            ) : userComplaints.length === 0 ? (
              <GlassCard intensity="light" style={styles.emptyCard}>
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No Complaints Yet
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Tap the + button to submit your first complaint
                  </Text>
                </View>
              </GlassCard>
            ) : (
              userComplaints.map((complaint) => {
                const typeInfo = getComplaintTypeInfo(complaint.type);
                return (
                  <GlassCard key={complaint.id} intensity="medium" style={styles.complaintCard}>
                    <View style={styles.complaintHeader}>
                      <View style={styles.complaintIconContainer}>
                        <View style={[styles.complaintIcon, { backgroundColor: typeInfo.color + '20' }]}>
                          <Ionicons
                            name={typeInfo.icon as any}
                            size={20}
                            color={typeInfo.color}
                          />
                        </View>
                        <View style={styles.complaintTitleContainer}>
                          <Text style={[styles.complaintTitle, { color: theme.text }]}>
                            {typeInfo.label}
                          </Text>
                          <Text style={[styles.complaintDate, { color: theme.textSecondary }]}>
                            {formatDate(complaint.timestamp)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.statusContainer}>
                        <View style={[
                          styles.statusLight,
                          { backgroundColor: getStatusColor(complaint.status) }
                        ]} />
                        <Text style={[styles.statusText, { color: getStatusColor(complaint.status) }]}>
                          {getStatusText(complaint.status)}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.complaintDescription, { color: theme.textSecondary }]}>
                      {complaint.description}
                    </Text>

                    {complaint.imageURL && (
                      <Image source={{ uri: complaint.imageURL }} style={styles.complaintImage} />
                    )}
                  </GlassCard>
                );
              })
            )}
          </View>
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
  headerTitle: {
    flex: 1,
    marginLeft: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  newComplaintButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsCard: {
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
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
  sectionCard: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    borderWidth: 2,
    borderRadius: 16,
  },
  typeCardGradient: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButton: {
    alignSelf: 'flex-start',
  },
  photoButtonGradient: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: 20,
  },
  submitButtonGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  complaintsSection: {
    gap: 16,
    paddingBottom: 20,
  },
  loadingCard: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyCard: {
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  complaintCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  complaintIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  complaintTitleContainer: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  complaintDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statusLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  complaintDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  complaintImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 8,
  },
}); 