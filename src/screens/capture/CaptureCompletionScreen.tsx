import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';

type RootStackParamList = {
  CaptureCompletion: {
    sessionData: {
      sessionId: string;
      residentInfo: {
        name: string;
        unitNumber: string;
      };
    };
    completionData: {
      sessionId: string;
      residentInfo: {
        name: string;
        unitNumber: string;
      };
      mode: string;
      totalCaptures: number;
      completedAt: string;
      captures: {
        person?: { timestamp: string };
        vehicle?: { timestamp: string };
      };
    };
  };
  CaptureHome: undefined;
};

type CaptureCompletionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CaptureCompletion'
>;

type CaptureCompletionScreenRouteProp = RouteProp<
  RootStackParamList,
  'CaptureCompletion'
>;

interface Props {
  navigation: CaptureCompletionScreenNavigationProp;
  route: CaptureCompletionScreenRouteProp;
}

const CaptureCompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { sessionData, completionData } = route.params;

  const handleStartNew = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CaptureHome' }],
    });
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusIcon = (hasCapture: boolean) => {
    return hasCapture ? (
      <Ionicons name="checkmark-circle" size={16} color={theme.success} />
    ) : (
      <Ionicons name="close-circle" size={16} color={theme.error} />
    );
  };

  const getStatusText = (hasCapture: boolean): string => {
    return hasCapture ? 'Completed' : 'Pending';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Ionicons
            name="checkmark-circle-outline"
            size={64}
            color={theme.success}
          />
          <Text style={[styles.successTitle, { color: theme.success }]}>
            Capture Complete!
          </Text>
          <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
            All required images have been captured and processed
          </Text>
        </View>

        {/* Session Summary */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Capture Summary
          </Text>
          <View style={[styles.summaryContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <SummaryRow
              label="Session ID"
              value={completionData.sessionId}
              theme={theme}
            />
            <SummaryRow
              label="Resident"
              value={completionData.residentInfo.name}
              theme={theme}
            />
            <SummaryRow
              label="Unit Number"
              value={completionData.residentInfo.unitNumber}
              theme={theme}
            />
            <SummaryRow
              label="Capture Mode"
              value={
                completionData.mode.charAt(0).toUpperCase() +
                completionData.mode.slice(1)
              }
              theme={theme}
            />
            <SummaryRow
              label="Total Captures"
              value={completionData.totalCaptures.toString()}
              theme={theme}
            />
            <SummaryRow
              label="Completed At"
              value={formatDateTime(completionData.completedAt)}
              theme={theme}
            />
          </View>
        </Card>

        {/* Captures Status */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Captured Images
          </Text>
          <View style={styles.capturesContainer}>
            <CaptureStatusRow
              type="Person Identification"
              hasCapture={!!completionData.captures.person}
              details={completionData.captures.person}
              theme={theme}
            />

            {completionData.mode === 'vehicle' && (
              <CaptureStatusRow
                type="Vehicle Identification"
                hasCapture={!!completionData.captures.vehicle}
                details={completionData.captures.vehicle}
                theme={theme}
              />
            )}
          </View>
        </Card>

        {/* Additional Information */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Additional Information
          </Text>
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • Images have been securely encrypted and stored
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • All data is linked to the resident and session
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • Access control logs have been updated
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • Session has been completed successfully
            </Text>
          </View>
        </Card>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Start New Capture"
            onPress={handleStartNew}
            style={styles.startButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text }]}>
            Thank you for using Seren Capture
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>
            Residential Access Control System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  theme: any;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, theme }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
      {label}:
    </Text>
    <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
  </View>
);

interface CaptureStatusRowProps {
  type: string;
  hasCapture: boolean;
  details?: { timestamp: string };
  theme: any;
}

const CaptureStatusRow: React.FC<CaptureStatusRowProps> = ({
  type,
  hasCapture,
  details,
  theme,
}) => {
  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <View
      style={[
        styles.captureRow,
        { backgroundColor: theme.backgroundSecondary },
      ]}
    >
      <View style={styles.captureInfo}>
        <Text style={[styles.captureType, { color: theme.text }]}>{type}</Text>
        {details && (
          <Text style={[styles.captureDetails, { color: theme.textSecondary }]}>
            Captured: {formatDateTime(details.timestamp)}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.captureStatus,
          {
            backgroundColor: hasCapture ? theme.success : theme.warning,
            opacity: hasCapture ? 1 : 0.7,
          },
        ]}
      >
        <View style={styles.captureStatusContent}>
          {hasCapture ? (
            <Ionicons name="checkmark" size={14} color={theme.textInverse} />
          ) : (
            <Ionicons name="close" size={14} color={theme.textInverse} />
          )}
          <Text style={[styles.captureStatusText, { color: theme.textInverse }]}>
            {hasCapture ? 'Completed' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
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
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    borderRadius: 10,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  capturesContainer: {
    gap: 12,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  captureInfo: {
    flex: 1,
  },
  captureType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  captureDetails: {
    fontSize: 12,
  },
  captureStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  captureStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoContainer: {
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 24,
  },
  startButton: {
    marginVertical: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
  },
});

export default CaptureCompletionScreen;
