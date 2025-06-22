import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { useTheme } from '../context/ThemeContext';
import SubscriptionService from '../services/SubscriptionService';
import { Subscription } from '../types';

interface SubscriptionScreenProps {
  onBack: () => void;
}

export default function SubscriptionScreen({ onBack }: SubscriptionScreenProps) {
  const { theme } = useTheme();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'pending'>('inactive');
  const [subscriptionDetails, setSubscriptionDetails] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const subscriptionService = SubscriptionService.getInstance();
  
  // Mock user info - in real app, get from Auth context
  const mockUser = {
    uid: 'mock-user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    unitNumber: 'Unit 42'
  };

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      setIsLoading(true);
      const status = await subscriptionService.checkSubscriptionStatus(mockUser.uid);
      setSubscriptionStatus(status);
      
      if (status === 'active') {
        const details = await subscriptionService.getSubscriptionDetails(mockUser.uid);
        setSubscriptionDetails(details);
      }
    } catch (error) {
      console.error('Error loading subscription info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!validatePaymentForm()) return;

    setIsProcessing(true);

    try {
      // Process payment first
      const paymentResult = await subscriptionService.processPayment(25, 'ZAR', 'card');
      
      if (!paymentResult.success) {
        Alert.alert('Payment Failed', paymentResult.error || 'Payment processing failed');
        return;
      }

      // Create subscription
      const subscriptionResult = await subscriptionService.createSubscription(
        mockUser.uid,
        {
          name: mockUser.name,
          email: mockUser.email,
          unitNumber: mockUser.unitNumber,
        }
      );

      if (subscriptionResult.success) {
        Alert.alert(
          '🎉 Subscription Active!',
          'Welcome to Seren Residential Premium!\n\nYour subscription is now active and you have full access to all features.',
          [
            {
              text: 'Great!',
              onPress: () => {
                setShowPaymentForm(false);
                loadSubscriptionInfo();
              }
            }
          ]
        );
      } else {
        Alert.alert('Subscription Error', subscriptionResult.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: confirmCancelSubscription,
        },
      ]
    );
  };

  const confirmCancelSubscription = async () => {
    try {
      setIsProcessing(true);
      const success = await subscriptionService.cancelSubscription(mockUser.uid);
      
      if (success) {
        Alert.alert(
          'Subscription Cancelled',
          'Your subscription has been cancelled. You will continue to have access until the end of your current billing period.',
          [{ text: 'OK', onPress: loadSubscriptionInfo }]
        );
      } else {
        Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePaymentForm = () => {
    if (!cardNumber || cardNumber.length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return false;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const pricing = subscriptionService.getSubscriptionPricing();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading subscription information...
          </Text>
        </View>
      </Screen>
    );
  }

  if (showPaymentForm) {
    return (
      <Screen>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowPaymentForm(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>
              Payment Details
            </Text>
          </View>

          <View style={[styles.pricingCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.pricingAmount, { color: theme.text }]}>
              R{pricing.amount}
            </Text>
            <Text style={[styles.pricingInterval, { color: theme.textSecondary }]}>
              per month
            </Text>
          </View>

          <View style={styles.paymentForm}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Card Information
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Card Number"
              placeholderTextColor={theme.textSecondary}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
            
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="MM/YY"
                placeholderTextColor={theme.textSecondary}
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="numeric"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="CVV"
                placeholderTextColor={theme.textSecondary}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Cardholder Name"
              placeholderTextColor={theme.textSecondary}
              value={cardHolder}
              onChangeText={setCardHolder}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              { 
                backgroundColor: theme.primary,
                opacity: isProcessing ? 0.7 : 1 
              }
            ]}
            onPress={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="card" size={20} color="#fff" />
                <Text style={styles.subscribeButtonText}>
                  Subscribe for R{pricing.amount}/month
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            Subscription
          </Text>
        </View>

        {subscriptionStatus === 'active' ? (
          // Active Subscription View
          <View>
            <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
              <View style={styles.statusHeader}>
                <Ionicons name="checkmark-circle" size={32} color={theme.hospital} />
                <Text style={[styles.statusTitle, { color: theme.text }]}>
                  Premium Active
                </Text>
              </View>
              <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
                You have full access to all Seren Residential features
              </Text>
              
              {subscriptionDetails && (
                <View style={styles.subscriptionInfo}>
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    Next billing: {subscriptionDetails.nextBillingDate.toLocaleDateString()}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    Amount: R{subscriptionDetails.amount}/{subscriptionDetails.currency}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.emergency }]}
              onPress={handleCancelSubscription}
              disabled={isProcessing}
            >
              <Text style={[styles.cancelButtonText, { color: theme.emergency }]}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Inactive Subscription View
          <View>
            <View style={[styles.pricingCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.pricingTitle, { color: theme.text }]}>
                Seren Residential Premium
              </Text>
              <View style={styles.pricingDetails}>
                <Text style={[styles.pricingAmount, { color: theme.text }]}>
                  R{pricing.amount}
                </Text>
                <Text style={[styles.pricingInterval, { color: theme.textSecondary }]}>
                  per month
                </Text>
              </View>
            </View>

            <View style={[styles.featuresCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.featuresTitle, { color: theme.text }]}>
                Premium Features
              </Text>
              {pricing.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={20} color={theme.hospital} />
                  <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowPaymentForm(true)}
            >
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.subscribeButtonText}>
                Start Premium Subscription
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  subscriptionInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  pricingCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pricingDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pricingAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  pricingInterval: {
    fontSize: 16,
    marginLeft: 8,
  },
  featuresCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  paymentForm: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 