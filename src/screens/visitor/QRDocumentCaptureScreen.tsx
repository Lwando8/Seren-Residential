import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';

const { width, height } = Dimensions.get('window');

interface QRDocumentCaptureScreenProps {
  navigation?: any;
  route?: {
    params?: {
      userType?: 'driver' | 'pedestrian';
      mode?: 'qr';
    };
  };
}

export default function QRDocumentCaptureScreen({ navigation, route }: QRDocumentCaptureScreenProps) {
  const { theme } = useTheme();
  const { estate } = useAuth();
  const userType = route?.params?.userType || 'pedestrian';
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentStep, setCurrentStep] = useState(userType === 'driver' ? 'vehicle' : 'id');
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (currentStep === 'vehicle') {
          setVehicleImage(photo.uri);
          setCurrentStep('id');
        } else {
          setIdImage(photo.uri);
        }
        
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (currentStep === 'vehicle') {
        setVehicleImage(result.assets[0].uri);
        setCurrentStep('id');
      } else {
        setIdImage(result.assets[0].uri);
      }
    }
  };

  const retakePhoto = (type: 'vehicle' | 'id') => {
    if (type === 'vehicle') {
      setVehicleImage(null);
      setCurrentStep('vehicle');
    } else {
      setIdImage(null);
      setCurrentStep('id');
    }
    setShowCamera(true);
  };

  const continueToNext = () => {
    if (userType === 'driver' && !vehicleImage) {
      Alert.alert('Missing Document', 'Please capture your vehicle license disc first.');
      return;
    }
    
    if (!idImage) {
      Alert.alert('Missing Document', 'Please capture your ID document.');
      return;
    }

    // Navigate to unit selection
    navigation?.navigate?.('UnitSelection', {
      userType,
      mode: 'qr',
      vehicleImage,
      idImage,
    });
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  if (hasCameraPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="camera-off" size={60} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            Please enable camera access in your device settings to continue.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          autoFocus={Camera.Constants.AutoFocus.on}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.cameraTitle}>
                {currentStep === 'vehicle' ? 'Scan Vehicle License Disc' : 'Scan ID Document'}
              </Text>
              
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setCameraType(
                  cameraType === CameraType.back ? CameraType.front : CameraType.back
                )}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraFrame}>
              <View style={styles.frameCorner} />
              <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
              <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
              <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
            </View>

            <View style={styles.cameraActions}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <Ionicons name="images" size={24} color="white" />
                <Text style={styles.galleryText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <View style={styles.placeholder} />
            </View>
          </View>
        </Camera>
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
            Document Capture
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <GlassCard style={styles.card}>
            <Text style={[styles.title, { color: theme.text }]}>
              {userType === 'driver' ? 'Driver Documentation' : 'Pedestrian Documentation'}
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Please capture clear photos of the required documents
            </Text>

            {userType === 'driver' && (
              <View style={styles.documentSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  1. Vehicle License Disc
                </Text>
                
                {vehicleImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: vehicleImage }} style={styles.capturedImage} />
                    <TouchableOpacity
                      style={[styles.retakeButton, { backgroundColor: theme.primary }]}
                      onPress={() => retakePhoto('vehicle')}
                    >
                      <Ionicons name="camera" size={16} color="white" />
                      <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.captureArea, { borderColor: theme.primary }]}
                    onPress={openCamera}
                  >
                    <Ionicons name="car" size={40} color={theme.primary} />
                    <Text style={[styles.captureText, { color: theme.primary }]}>
                      Tap to capture license disc
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.documentSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {userType === 'driver' ? '2. ID Document' : '1. ID Document'}
              </Text>
              
              {idImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: idImage }} style={styles.capturedImage} />
                  <TouchableOpacity
                    style={[styles.retakeButton, { backgroundColor: theme.primary }]}
                    onPress={() => retakePhoto('id')}
                  >
                    <Ionicons name="camera" size={16} color="white" />
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.captureArea, { borderColor: theme.primary }]}
                  onPress={openCamera}
                >
                  <Ionicons name="card" size={40} color={theme.primary} />
                  <Text style={[styles.captureText, { color: theme.primary }]}>
                    Tap to capture ID, Passport, or Driver's License
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Your documents are encrypted and stored securely
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: theme.primary },
                (userType === 'driver' && (!vehicleImage || !idImage)) || (!idImage) 
                  ? { opacity: 0.5 } : {}
              ]}
              onPress={continueToNext}
              disabled={
                (userType === 'driver' && (!vehicleImage || !idImage)) || (!idImage)
              }
            >
              <Text style={styles.continueButtonText}>Continue to Unit Selection</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
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
  documentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  captureArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  captureText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  retakeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cameraButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
  },
  cameraTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  cameraFrame: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 40,
    marginVertical: 60,
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  frameCornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 0,
  },
  frameCornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 0,
  },
  frameCornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  galleryButton: {
    alignItems: 'center',
    padding: 12,
  },
  galleryText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 48,
  },
  // Loading and error styles
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