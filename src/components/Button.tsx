import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'large',
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    // Size variants
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'medium') {
      baseStyle.push(styles.buttonMedium);
    } else {
      baseStyle.push(styles.buttonLarge);
    }

    // Color variants
    if (variant === 'secondary') {
      baseStyle.push({ backgroundColor: theme.secondary || theme.primary });
    } else if (variant === 'danger') {
      baseStyle.push({ backgroundColor: theme.error });
    } else if (variant === 'outline') {
      baseStyle.push({
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.primary,
      });
    } else {
      baseStyle.push({ backgroundColor: theme.primary });
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.push({
        backgroundColor: theme.disabled,
        opacity: 0.5,
      });
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    if (size === 'small') {
      baseStyle.push(styles.buttonTextSmall);
    } else if (size === 'medium') {
      baseStyle.push(styles.buttonTextMedium);
    } else {
      baseStyle.push(styles.buttonTextLarge);
    }

    if (variant === 'outline') {
      baseStyle.push({ color: theme.primary });
    } else {
      baseStyle.push({ color: theme.textInverse });
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? theme.primary : theme.textInverse}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSmall: {
    height: 36,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    height: 42,
    paddingHorizontal: 20,
  },
  buttonLarge: {
    height: 50,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  buttonTextMedium: {
    fontSize: 14,
  },
  buttonTextLarge: {
    fontSize: 16,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;
