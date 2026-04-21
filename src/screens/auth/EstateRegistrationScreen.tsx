import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EstateService from '../../services/EstateService';
import { Estate } from '../../types';

interface EstateRegistrationScreenProps {
  onEstateSelected: (estate: Estate) => void;
  onBack: () => void;
}

const EstateRegistrationScreen: React.FC<EstateRegistrationScreenProps> = ({
  onEstateSelected,
  onBack,
}) => {
  const [estateCode, setEstateCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validatedEstate, setValidatedEstate] = useState<Estate | null>(null);
  const [step, setStep] = useState<'code' | 'confirm'>('code');

  const estateService = EstateService.getInstance();

  const handleValidateEstate = async () => {
    if (!estateCode.trim()) {
      Alert.alert('Error', 'Please enter your estate code');
      return;
    }

    if (!estateService.validateEstateCode(estateCode)) {
      Alert.alert(
        'Invalid Code Format',
        'Estate codes should be 4-10 characters, letters and numbers only'
      );
      return;
    }

    setIsLoading(true);
    try {
      const estate = await estateService.getEstateByCode(estateCode);
      
      if (!estate) {
        Alert.alert(
          'Estate Not Found',
          'The estate code you entered was not found. Please check with your estate management for the correct code.'
        );
        return;
      }

      if (estate.subscription.status !== 'active') {
        Alert.alert(
          'Estate Inactive',
          'This estate\'s subscription is not active. Please contact your estate management.'
        );
        return;
      }

      setValidatedEstate(estate);
      setStep('confirm');
    } catch (error) {
      console.error('Error validating estate:', error);
      Alert.alert(
        'Validation Error',
        'Unable to validate estate code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEstate = () => {
    if (validatedEstate) {
      onEstateSelected(validatedEstate);
    }
  };

  const renderEstateCodeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Find Your Estate</Text>
        <Text style={styles.subtitle}>
          Enter the code provided by your estate management
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Estate Code</Text>
        <TextInput
          style={styles.input}
          value={estateCode}
          onChangeText={setEstateCode}
          placeholder="e.g., SEREN001"
          placeholderTextColor="rgba(255,255,255,0.5)"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={10}
        />
        <Text style={styles.inputHint}>
          Check your welcome letter or contact your estate office
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleValidateEstate}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Validating...</Text>
          ) : (
            <Text style={styles.buttonText}>Find Estate</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.helpContainer}>
        <Ionicons name="help-circle-outline" size={20} color="rgba(255,255,255,0.7)" />
        <Text style={styles.helpText}>
          Don't have an estate code? Contact your estate management office
        </Text>
      </View>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setStep('code')} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Your Estate</Text>
        <Text style={styles.subtitle}>
          Is this your residential estate?
        </Text>
      </View>

      {validatedEstate && (
        <View style={styles.estateCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.estateCardGradient}
          >
            <View style={styles.estateHeader}>
              <View style={styles.estateIcon}>
                <Ionicons name="business" size={32} color={validatedEstate.branding.primaryColor} />
              </View>
              <View style={styles.estateInfo}>
                <Text style={styles.estateName}>{validatedEstate.name}</Text>
                <Text style={styles.estateCode}>Code: {validatedEstate.code}</Text>
              </View>
            </View>

            <View style={styles.estateDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.detailText}>
                  {validatedEstate.address.city}, {validatedEstate.address.province}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.detailText}>{validatedEstate.contact.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.detailText, { color: '#10B981' }]}>
                  Active Subscription
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleConfirmEstate}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Yes, This is My Estate</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => setStep('code')}
      >
        <Text style={styles.secondaryButtonText}>Try Different Code</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {step === 'code' ? renderEstateCodeStep() : renderConfirmStep()}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  helpText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  estateCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  estateCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  estateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  estateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  estateInfo: {
    flex: 1,
  },
  estateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  estateCode: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  estateDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
  },
});

export default EstateRegistrationScreen; 