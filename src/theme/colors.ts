export const lightTheme = {
  // Base colors - soft, elegant tones
  background: '#f8f9fb',
  backgroundSecondary: '#ffffff',
  card: 'rgba(255, 255, 255, 0.7)',
  cardSecondary: 'rgba(255, 255, 255, 0.5)',
  
  // Glass effects
  glass: 'rgba(255, 255, 255, 0.25)',
  glassStrong: 'rgba(255, 255, 255, 0.4)',
  glassOverlay: 'rgba(255, 255, 255, 0.15)',
  
  // Text colors - refined hierarchy
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  
  // Brand colors - sophisticated palette
  primary: '#6366f1', // Indigo
  primaryLight: '#a5b4fc',
  primaryDark: '#4338ca',
  
  // Status colors - refined emergency palette
  emergency: '#ef4444',
  emergencyLight: '#fca5a5',
  hospital: '#10b981',
  hospitalLight: '#86efac',
  security: '#3b82f6',
  securityLight: '#93c5fd',
  
  // System colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Borders and dividers
  border: 'rgba(0, 0, 0, 0.08)',
  borderSecondary: 'rgba(0, 0, 0, 0.05)',
  divider: 'rgba(0, 0, 0, 0.06)',
  
  // Shadows and elevation
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowStrong: 'rgba(0, 0, 0, 0.15)',
  
  // Gradients
  gradientPrimary: ['#6366f1', '#8b5cf6'],
  gradientSecondary: ['#f3f4f6', '#ffffff'],
  gradientEmergency: ['#ef4444', '#dc2626'],
  gradientSuccess: ['#10b981', '#059669'],
  
  // Interactive states
  hover: 'rgba(0, 0, 0, 0.05)',
  pressed: 'rgba(0, 0, 0, 0.1)',
  disabled: 'rgba(0, 0, 0, 0.3)',
};

export const darkTheme = {
  // Base colors - deep, luxurious tones
  background: '#0a0a0b',
  backgroundSecondary: '#1a1a1b',
  card: 'rgba(255, 255, 255, 0.08)',
  cardSecondary: 'rgba(255, 255, 255, 0.05)',
  
  // Glass effects
  glass: 'rgba(255, 255, 255, 0.1)',
  glassStrong: 'rgba(255, 255, 255, 0.15)',
  glassOverlay: 'rgba(0, 0, 0, 0.3)',
  
  // Text colors - refined hierarchy
  text: '#ffffff',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  textInverse: '#1a1a1a',
  
  // Brand colors - vibrant in dark mode
  primary: '#818cf8',
  primaryLight: '#c7d2fe',
  primaryDark: '#6366f1',
  
  // Status colors - enhanced for dark mode
  emergency: '#f87171',
  emergencyLight: '#fca5a5',
  hospital: '#34d399',
  hospitalLight: '#86efac',
  security: '#60a5fa',
  securityLight: '#93c5fd',
  
  // System colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Borders and dividers
  border: 'rgba(255, 255, 255, 0.1)',
  borderSecondary: 'rgba(255, 255, 255, 0.05)',
  divider: 'rgba(255, 255, 255, 0.08)',
  
  // Shadows and elevation
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',
  
  // Gradients
  gradientPrimary: ['#818cf8', '#a78bfa'],
  gradientSecondary: ['#374151', '#1f2937'],
  gradientEmergency: ['#f87171', '#ef4444'],
  gradientSuccess: ['#34d399', '#10b981'],
  
  // Interactive states
  hover: 'rgba(255, 255, 255, 0.05)',
  pressed: 'rgba(255, 255, 255, 0.1)',
  disabled: 'rgba(255, 255, 255, 0.3)',
};

export type Theme = typeof lightTheme; 