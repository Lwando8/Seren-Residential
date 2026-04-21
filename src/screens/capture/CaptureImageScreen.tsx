import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import CaptureService from '../../services/CaptureService';

type RootStackParamList = {
  CaptureImage: {
    sessionData: {
      sessionId: string;
      residentInfo: {
        name: string;
        unitNumber: string;
      };
    };
    mode: string;
    availableCaptures: string[];
  };
  CaptureCompletion: {
    sessionData: any;
    completionData: any;
  };
};

type CaptureImageScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CaptureImage'
>;

type CaptureImageScreenRouteProp = RouteProp<RootStackParamList, 'CaptureImage'>;

interface Props {
  navigation: CaptureImageScreenNavigationProp;
  route: CaptureImageScreenRouteProp;
}

interface CaptureInfo {
  type: string;
  title: string;
  description: string;
  required: boolean;
  icon: string;
}

interface Capture {
  uri: string;
  type: string;
  timestamp: string;
}

const CaptureImageScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { sessionData, mode, availableCaptures } = route.params;
  const [captures, setCaptures] = useState<Record<string, Capture>>({});
  const [uploading, setUploading] = useState(false);
  const [currentUpload, setCurrentUpload] = useState<string | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'This app needs camera access to capture identification images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestPermissions },
        ]
      );
    }
  };

  const captureImage = async (captureType: string) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setCaptures((prev) => ({
          ...prev,
          [captureType]: {
            uri: image.uri,
            type: captureType,
            timestamp: new Date().toISOString(),
          },
        }));
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const removeCapture = (captureType: string) => {
    setCaptures((prev) => {
      const newCaptures = { ...prev };
      delete newCaptures[captureType];
      return newCaptures;
    });
  };

  const getRequiredCaptures = (): CaptureInfo[] => {
    if (mode === 'pedestrian') {
      return [
        {
          type: 'person',
          title: 'Person Identification',
          description: "Capture ID, Passport, or Driver's License",
          required: true,
          icon: 'id-card-outline',
        },
      ];
    } else {
      return [
        {
          type: 'person',
          title: 'Person Identification',
          description: "Capture ID, Passport, or Driver's License",
          required: true,
          icon: 'id-card-outline',
        },
        {
          type: 'vehicle',
          title: 'Vehicle Identification',
          description: 'Capture License Disc or License Plate',
          required: true,
          icon: 'car-outline',
        },
      ];
    }
  };

  const isComplete = (): boolean => {
    const requiredCaptures = getRequiredCaptures();
    return requiredCaptures.every((capture) => captures[capture.type]);
  };

  const uploadCaptures = async () => {
    if (!isComplete()) {
      Alert.alert(
        'Incomplete',
        'Please capture all required images before proceeding.'
      );
      return;
    }

    setUploading(true);
    setCurrentUpload('completing');

    try {
      // Upload each captured image
      const captureTypes = Object.keys(captures);
      for (const captureType of captureTypes) {
        setCurrentUpload(`uploading ${captureType}`);
        await CaptureService.uploadImage(
          sessionData.sessionId,
          captureType,
          captures[captureType].uri
        );
      }

      // Complete the session
      setCurrentUpload('completing');
      const response = await CaptureService.completeSession(
        sessionData.sessionId
      );

      if (response.success && response.data) {
        navigation.navigate('CaptureCompletion', {
          sessionData,
          completionData: response.data,
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to complete session');
      }
    } catch (error: any) {
      console.error('Error completing session:', error);
      Alert.alert('Error', 'Failed to complete session. Please try again.');
    } finally {
      setUploading(false);
      setCurrentUpload(null);
    }
  };

  const getProgress = (): number => {
    const requiredCaptures = getRequiredCaptures();
    const completedCount = requiredCaptures.filter(
      (capture) => captures[capture.type]
    ).length;
    return (completedCount / requiredCaptures.length) * 100;
  };

  const getUploadText = (): string => {
    if (currentUpload === 'completing') {
      return 'Completing session...';
    } else if (currentUpload?.startsWith('uploading')) {
      return `Uploading ${currentUpload.replace('uploading ', '')} image...`;
    }
    return 'Uploading images...';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resident Info */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Resident: {sessionData.residentInfo.name}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Unit {sessionData.residentInfo.unitNumber} • {mode} mode
          </Text>
        </Card>

        {/* Progress */}
        <Card>
          <Text style={[styles.progressTitle, { color: theme.text }]}>
            Capture Progress
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgress()}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {Math.round(getProgress())}% Complete
          </Text>
        </Card>

        {/* Capture Sections */}
        {getRequiredCaptures().map((captureInfo) => (
          <CaptureSection
            key={captureInfo.type}
            captureInfo={captureInfo}
            captured={captures[captureInfo.type]}
            onCapture={() => captureImage(captureInfo.type)}
            onRemove={() => removeCapture(captureInfo.type)}
            disabled={uploading}
            theme={theme}
          />
        ))}

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Complete Capture"
            onPress={uploadCaptures}
            loading={uploading}
            disabled={!isComplete() || uploading}
          />
          <Button
            title="Back to Mode Selection"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={uploading}
          />
        </View>
      </ScrollView>

      {uploading && <LoadingSpinner text={getUploadText()} overlay />}
    </SafeAreaView>
  );
};

interface CaptureSectionProps {
  captureInfo: CaptureInfo;
  captured?: Capture;
  onCapture: () => void;
  onRemove: () => void;
  disabled: boolean;
  theme: any;
}

const CaptureSection: React.FC<CaptureSectionProps> = ({
  captureInfo,
  captured,
  onCapture,
  onRemove,
  disabled,
  theme,
}) => {
  return (
    <Card>
      <View style={styles.captureHeader}>
        <View style={styles.captureTitleContainer}>
          <Ionicons
            name={captureInfo.icon as any}
            size={20}
            color={theme.primary}
            style={styles.captureIcon}
          />
          <Text style={[styles.captureTitle, { color: theme.text }]}>
            {captureInfo.title}
          </Text>
        </View>
        {captureInfo.required && (
          <View style={[styles.requiredBadge, { backgroundColor: theme.warning }]}>
            <Text style={[styles.requiredText, { color: theme.textInverse }]}>
              Required
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.captureDescription, { color: theme.textSecondary }]}>
        {captureInfo.description}
      </Text>

      {captured ? (
        <View style={styles.capturedContainer}>
          <View
            style={[
              styles.capturedImageContainer,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Text style={[styles.capturedText, { color: theme.textSecondary }]}>
              Image captured successfully
            </Text>
          </View>
          <View style={styles.capturedActions}>
            <Button
              title="Re-capture"
              size="small"
              onPress={onCapture}
              disabled={disabled}
              style={styles.actionButton}
              icon={<Ionicons name="camera" size={14} color={theme.textInverse} />}
            />
            <Button
              title="Remove"
              variant="danger"
              size="small"
              onPress={onRemove}
              disabled={disabled}
              style={styles.actionButton}
            />
          </View>
          <View
            style={[
              styles.completedBadge,
              { backgroundColor: theme.success },
            ]}
          >
            <Ionicons name="checkmark" size={14} color={theme.textInverse} />
            <Text style={[styles.completedText, { color: theme.textInverse }]}>
              Captured
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.captureArea}>
          <View style={styles.captureAreaContent}>
            <Ionicons
              name="camera-outline"
              size={32}
              color={theme.textSecondary}
            />
            <Text style={[styles.captureAreaText, { color: theme.textSecondary }]}>
              Tap to open camera and capture {captureInfo.title.toLowerCase()}
            </Text>
          </View>
          <Button
            title={`Open Camera - ${captureInfo.type === 'person' ? 'ID' : 'Vehicle'}`}
            onPress={onCapture}
            disabled={disabled}
            icon={<Ionicons name="camera" size={16} color={theme.textInverse} />}
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  captureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  captureTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  captureIcon: {
    marginRight: 8,
  },
  captureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  requiredBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requiredText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  captureDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  capturedContainer: {
    position: 'relative',
  },
  capturedImageContainer: {
    height: 120,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  capturedText: {
    fontSize: 14,
  },
  capturedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  captureArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  captureAreaContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  captureAreaText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 12,
  },
});

export default CaptureImageScreen;
