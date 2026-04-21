import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import CaptureService from '../../services/CaptureService';

type RootStackParamList = {
  CaptureModeSelection: {
    sessionData: {
      sessionId: string;
      residentInfo: {
        name: string;
        unitNumber: string;
        phone?: string;
        email?: string;
      };
    };
  };
  CaptureImage: {
    sessionData: any;
    mode: string;
    availableCaptures: string[];
  };
};

type CaptureModeSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CaptureModeSelection'
>;

type CaptureModeSelectionScreenRouteProp = RouteProp<
  RootStackParamList,
  'CaptureModeSelection'
>;

interface Props {
  navigation: CaptureModeSelectionScreenNavigationProp;
  route: CaptureModeSelectionScreenRouteProp;
}

interface Mode {
  id: string;
  title: string;
  description: string;
  details: string;
  captures: string[];
  icon: string;
}

const CaptureModeSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { sessionData } = route.params;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modes: Mode[] = [
    {
      id: 'pedestrian',
      title: 'Pedestrian',
      description: 'Capture ID/Passport only',
      details: 'For visitors arriving on foot',
      captures: ['Person Identification'],
      icon: 'walk-outline',
    },
    {
      id: 'vehicle',
      title: 'Vehicle',
      description: 'Capture ID + Vehicle',
      details: 'For visitors arriving by vehicle',
      captures: ['Person Identification', 'Vehicle License'],
      icon: 'car-outline',
    },
  ];

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

  const handleProceed = async () => {
    if (!selectedMode) {
      Alert.alert('Error', 'Please select a capture mode');
      return;
    }

    setLoading(true);

    try {
      const response = await CaptureService.setCaptureMode(
        sessionData.sessionId,
        selectedMode
      );

      if (response.success && response.data) {
        navigation.navigate('CaptureImage', {
          sessionData,
          mode: selectedMode,
          availableCaptures: response.data.availableCaptures || [],
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to set capture mode');
      }
    } catch (error: any) {
      Alert.alert(
        'Setup Failed',
        error.message || 'Unable to set capture mode. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resident Info Card */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Resident Information
          </Text>
          <View style={[styles.residentInfo, { backgroundColor: theme.backgroundSecondary }]}>
            <InfoRow label="Name" value={sessionData.residentInfo.name} theme={theme} />
            <InfoRow
              label="Unit Number"
              value={sessionData.residentInfo.unitNumber}
              theme={theme}
            />
            <InfoRow
              label="Phone"
              value={sessionData.residentInfo.phone || 'N/A'}
              theme={theme}
            />
            <InfoRow
              label="Email"
              value={sessionData.residentInfo.email || 'N/A'}
              theme={theme}
            />
          </View>
        </Card>

        {/* Mode Selection */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Select Capture Mode
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Choose the type of visitor and required captures
          </Text>

          <View style={styles.modesContainer}>
            {modes.map((mode) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                selected={selectedMode === mode.id}
                onSelect={() => handleModeSelect(mode.id)}
                theme={theme}
              />
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Proceed to Capture"
            onPress={handleProceed}
            loading={loading}
            disabled={!selectedMode || loading}
          />
          <Button
            title="Back to Home"
            variant="outline"
            onPress={handleGoBack}
            disabled={loading}
          />
        </View>
      </ScrollView>

      {loading && (
        <LoadingSpinner text="Setting up capture mode..." overlay />
      )}
    </SafeAreaView>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  theme: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, theme }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}:</Text>
    <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
  </View>
);

interface ModeCardProps {
  mode: Mode;
  selected: boolean;
  onSelect: () => void;
  theme: any;
}

const ModeCard: React.FC<ModeCardProps> = ({ mode, selected, onSelect, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.modeCard,
        {
          borderColor: selected ? theme.primary : theme.border,
          backgroundColor: selected ? theme.primary : theme.card,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.modeHeader}>
        <View style={styles.modeTitleContainer}>
          <Ionicons
            name={mode.icon as any}
            size={24}
            color={selected ? theme.textInverse : theme.primary}
            style={styles.modeIcon}
          />
          <Text
            style={[
              styles.modeTitle,
              {
                color: selected ? theme.textInverse : theme.text,
              },
            ]}
          >
            {mode.title}
          </Text>
        </View>
        <Text
          style={[
            styles.modeDescription,
            {
              color: selected ? theme.textInverse : theme.textSecondary,
              opacity: selected ? 0.9 : 1,
            },
          ]}
        >
          {mode.description}
        </Text>
      </View>

      <Text
        style={[
          styles.modeDetails,
          {
            color: selected ? theme.textInverse : theme.textSecondary,
            opacity: selected ? 0.8 : 1,
          },
        ]}
      >
        {mode.details}
      </Text>

      <View style={styles.capturesContainer}>
        <Text
          style={[
            styles.capturesTitle,
            {
              color: selected ? theme.textInverse : theme.text,
            },
          ]}
        >
          Required Captures:
        </Text>
        {mode.captures.map((capture, index) => (
          <Text
            key={index}
            style={[
              styles.captureItem,
              {
                color: selected ? theme.textInverse : theme.textSecondary,
                opacity: selected ? 0.9 : 1,
              },
            ]}
          >
            • {capture}
          </Text>
        ))}
      </View>

      {selected && (
        <View
          style={[
            styles.selectedIndicator,
            { backgroundColor: theme.success },
          ]}
        >
          <Ionicons name="checkmark" size={16} color={theme.textInverse} />
          <Text style={[styles.selectedText, { color: theme.textInverse }]}>
            Selected
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  residentInfo: {
    borderRadius: 10,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  modesContainer: {
    gap: 12,
  },
  modeCard: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    position: 'relative',
  },
  modeHeader: {
    marginBottom: 12,
  },
  modeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeIcon: {
    marginRight: 8,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeDescription: {
    fontSize: 14,
  },
  modeDetails: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  capturesContainer: {
    marginBottom: 8,
  },
  capturesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  captureItem: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 12,
  },
});

export default CaptureModeSelectionScreen;
