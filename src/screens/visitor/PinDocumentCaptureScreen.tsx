import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/GlassCard';
import { VisitorService } from '../../services/VisitorService';

interface PinDocumentCaptureScreenProps {
  navigation: any;
  route: {
    params: {
      userType: 'driver' | 'pedestrian';
      mode: 'pin';
      pinValidation: {
        isValid: boolean;
        visitorInfo?: {
          name: string;
          purpose: string;
          unitNumber: string;
          validUntil: Date;
        };
      };
    };
  };
}

export default function PinDocumentCaptureScreen({ navigation, route }: PinDocumentCaptureScreenProps) {
  const { theme } = useTheme();
  const { estate } = useAuth();
  const { userType, pinValidation } = route.params;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureType, setCaptureType] = useState<'id' | 'license'>('id');
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [licenseDocument, setLicenseDocument] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleCameraCapture = async (uri: string) => {
    if (captureType === 'id') {
      setIdDocument(uri);
    } else {
      setLicenseDocument(uri);
    }
    setShowCamera(false);
  };

  const openImagePicker = async (type: 'id' | 'license') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'id') {
          setIdDocument(result.assets[0].uri);
        } else {
          setLicenseDocument(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const openCamera = (type: 'id' | 'license') => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to capture documents');
      return;
    }
    setCaptureType(type);
    setShowCamera(true);
  };

  const handleSubmit = async () => {
    // Validate required documents
    if (!idDocument) {
      Alert.alert('Missing Document', 'ID document is required');
      return;
    }

    if (userType === 'driver' && !licenseDocument) {
      Alert.alert('Missing Document', 'Vehicle license disc is required for drivers');
      return;
    }

    setIsSubmitting(true);
    try {
      const visitData = {
        mode: 'pin' as const,
        type: userType,
        estateId: estate?.id || 'demo-estate',
        guestInfo: {
          name: pinValidation.visitorInfo?.name || 'PIN Visitor',
          purpose: pinValidation.visitorInfo?.purpose || 'Visit',
          contactNumber: '',
          unitNumber: pinValidation.visitorInfo?.unitNumber || '',
        },
        documents: {
          idDocument,
          ...(userType === 'driver' && licenseDocument && { licenseDocument }),
        },
        residentInfo: {
          unitNumber: pinValidation.visitorInfo?.unitNumber || '',
        },
      };

      const visitId = await VisitorService.createVisit(visitData);
      
      // Navigate to visit status
      navigation.replace('VisitStatus', {
        visitId,
        mode: 'pin',
        type: userType,
      });
    } catch (error) {
      console.error('Visit creation error:', error);
      Alert.alert('Error', 'Failed to create visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeDocument = (type: 'id' | 'license') => {
    if (type === 'id') {
      setIdDocument(null);
    } else {
      setLicenseDocument(null);
    }
  };

  const renderDocumentCapture = (type: 'id' | 'license', document: string | null, label: string) => (
    <GlassCard style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Ionicons 
          name={type === 'id' ? 'card' : 'car'} 
          size={24} 
          color={theme.primary} 
        />
        <Text style={[styles.documentLabel, { color: theme.text }]}>
          {label}
        </Text>
      </View>

      {document ? (
        <View style={styles.documentPreview}>
          <Image source={{ uri: document }} style={styles.documentImage} />
          <View style={styles.documentActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => openCamera(type)}
            >
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.error }]}
              onPress={() => removeDocument(type)}
            >
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.captureActions}>
          <TouchableOpacity
            style={[styles.captureButton, { borderColor: theme.primary }]}
            onPress={() => openCamera(type)}
          >
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.captureButtonGradient}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.captureButtonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.captureButton, { borderColor: theme.border }]}
            onPress={() => openImagePicker(type)}
          >
            <View style={[styles.captureButtonGradient, { backgroundColor: theme.cardBackground }]}>
              <Ionicons name="images" size={24} color={theme.text} />
              <Text style={[styles.captureButtonText, { color: theme.text }]}>
                Choose from Gallery
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={CameraType.back}
          onBarCodeScanned={undefined}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraBackButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>
                Capture {captureType === 'id' ? 'ID Document' : 'License Disc'}
              </Text>
            </View>

            <View style={styles.captureFrame}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.captureCircle}
                onPress={async () => {
                  // In a real implementation, you would use camera.takePictureAsync()
                  // For demo purposes, we'll use a placeholder
                  const mockUri = `file://mock-${captureType}-${Date.now()}.jpg`;
                  await handleCameraCapture(mockUri);
                }}
              >
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
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
        </View>

        <ScrollView style={styles.content}>
          <GlassCard style={styles.infoCard}>
            <Text style={[styles.title, { color: theme.text }]}>
              Document Verification
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Please capture or upload the required documents
            </Text>

            {pinValidation.visitorInfo && (
              <View style={styles.visitorInfo}>
                <Text style={[styles.visitorName, { color: theme.primary }]}>
                  {pinValidation.visitorInfo.name}
                </Text>
                <Text style={[styles.visitorDetails, { color: theme.textSecondary }]}>
                  Purpose: {pinValidation.visitorInfo.purpose}
                </Text>
                <Text style={[styles.visitorDetails, { color: theme.textSecondary }]}>
                  Visiting: Unit {pinValidation.visitorInfo.unitNumber}
                </Text>
              </View>
            )}
          </GlassCard>

          {renderDocumentCapture('id', idDocument, 'ID Document (Required)')}
          
          {userType === 'driver' && renderDocumentCapture(
            'license', 
            licenseDocument, 
            'Vehicle License Disc (Required)'
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: (idDocument && (userType === 'pedestrian' || licenseDocument)) 
                  ? theme.primary 
                  : theme.border,
                opacity: (idDocument && (userType === 'pedestrian' || licenseDocument)) ? 1 : 0.5,
              }
            ]}
            onPress={handleSubmit}
            disabled={!idDocument || (userType === 'driver' && !licenseDocument) || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Complete Check-In</Text>
                <Ionicons name="checkmark" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  visitorInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  visitorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  visitorDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  documentCard: {
    padding: 20,
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  documentPreview: {
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  captureActions: {
    gap: 12,
  },
  captureButton: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cameraBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  captureFrame: {
    flex: 1,
    marginHorizontal: 40,
    marginVertical: 100,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  captureCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
  },
}); 