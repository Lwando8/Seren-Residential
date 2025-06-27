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
import { Estate, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface UserRegistrationScreenProps {
  estate: Estate;
  onBack: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  unitNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

const UserRegistrationScreen: React.FC<UserRegistrationScreenProps> = ({
  estate,
  onBack,
}) => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    unitNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Please enter your full name';
    if (!formData.email.trim()) return 'Please enter your email address';
    if (!formData.email.includes('@')) return 'Please enter a valid email address';
    if (!formData.password) return 'Please enter a password';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.phone.trim()) return 'Please enter your phone number';
    if (!formData.unitNumber.trim()) return 'Please enter your unit number';
    
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(
        formData.email,
        formData.password,
        {
          name: formData.name,
          phone: formData.phone,
          unitNumber: formData.unitNumber,
          estate: estate,
          emergencyContact: formData.emergencyContactName ? {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
          } : undefined,
        }
      );

      if (result.success) {
        Alert.alert(
          'Registration Successful!',
          `Welcome to ${estate.name}! Your account has been created.`,
          [{ text: 'Continue', onPress: () => {} }]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Registration Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>
                Register for {estate.name}
              </Text>
            </View>

            <View style={styles.estateInfo}>
              <Ionicons name="business" size={20} color={estate.branding.primaryColor} />
              <Text style={styles.estateText}>
                {estate.name} • {estate.code}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    placeholder="John Doe"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="john@example.com"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => updateFormData('phone', value)}
                    placeholder="+27 81 123 4567"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Unit Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.unitNumber}
                    onChangeText={(value) => updateFormData('unitNumber', value)}
                    placeholder="A101"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Security</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    placeholder="Re-enter your password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.emergencyContactName}
                    onChangeText={(value) => updateFormData('emergencyContactName', value)}
                    placeholder="Jane Doe"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.emergencyContactPhone}
                    onChangeText={(value) => updateFormData('emergencyContactPhone', value)}
                    placeholder="+27 81 987 6543"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.emergencyContactRelationship}
                    onChangeText={(value) => updateFormData('emergencyContactRelationship', value)}
                    placeholder="Spouse, Parent, Sibling, etc."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                By creating an account, you agree to the estate's terms of service and privacy policy.
              </Text>
            </View>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  estateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
  },
  estateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
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
  disclaimer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UserRegistrationScreen; 