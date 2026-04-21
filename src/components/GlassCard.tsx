import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  variant?: 'card' | 'overlay' | 'button';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'medium',
  variant = 'card',
}) => {
  const { theme, isDark } = useTheme();
  
  const getBlurIntensity = () => {
    switch (intensity) {
      case 'light': return isDark ? 10 : 15;
      case 'medium': return isDark ? 20 : 25;
      case 'strong': return isDark ? 35 : 40;
      default: return isDark ? 20 : 25;
    }
  };

  const getBackgroundColor = () => {
    switch (intensity) {
      case 'light': return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)';
      case 'medium': return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)';
      case 'strong': return isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)';
      default: return theme.glass;
    }
  };

  const getBorderColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)';
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      shadowColor: theme.shadow,
    },
    variant === 'button' && styles.button,
    variant === 'overlay' && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  button: {
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
  },
  overlay: {
    borderRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowRadius: 32,
    shadowOpacity: 0.15,
  },
});

export default GlassCard;