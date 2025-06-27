import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';

interface PinEntryScreenProps {
  navigation: any;
  route: {
    params: {
      onPinEntered: (pin: string) => Promise<void>;
    };
  };
}

export default function PinEntryScreen({ navigation, route }: PinEntryScreenProps) {
  const { theme } = useTheme();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { onPinEntered } = route.params;

  const handleNumberPress = (number: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter at least 4 digits');
      return;
    }

    setIsLoading(true);
    try {
      await onPinEntered(pin);
    } catch (error) {
      console.error('PIN validation error:', error);
      Alert.alert('Error', 'Failed to validate PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['clear', '0', 'backspace']
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.keypadButton, { borderColor: theme.border }]}
                onPress={() => {
                  if (item === 'clear') {
                    handleClear();
                  } else if (item === 'backspace') {
                    handleBackspace();
                  } else {
                    handleNumberPress(item);
                  }
                }}
              >
                <LinearGradient
                  colors={[theme.cardBackground, theme.backgroundSecondary]}
                  style={styles.keypadButtonGradient}
                >
                  {item === 'backspace' ? (
                    <Ionicons name="backspace" size={24} color={theme.text} />
                  ) : item === 'clear' ? (
                    <Text style={[styles.keypadButtonText, { color: theme.error }]}>
                      Clear
                    </Text>
                  ) : (
                    <Text style={[styles.keypadButtonText, { color: theme.text }]}>
                      {item}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

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

        <View style={styles.content}>
          <GlassCard style={styles.pinCard}>
            <View style={styles.logoContainer}>
              <Ionicons name="keypad" size={60} color={theme.primary} />
            </View>
            
            <Text style={[styles.title, { color: theme.text }]}>
              Enter PIN Code
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Please enter the PIN provided by your host
            </Text>

            <View style={styles.pinDisplay}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: index < pin.length ? theme.primary : theme.border,
                      borderColor: theme.border,
                    }
                  ]}
                />
              ))}
            </View>

            {renderKeypad()}

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: pin.length >= 4 ? theme.primary : theme.border,
                  opacity: pin.length >= 4 ? 1 : 0.5,
                }
              ]}
              onPress={handleSubmit}
              disabled={pin.length < 4 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Validate PIN</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </GlassCard>
        </View>
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
    justifyContent: 'center',
  },
  pinCard: {
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  keypad: {
    marginBottom: 24,
  },
  keypadRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    overflow: 'hidden',
  },
  keypadButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 