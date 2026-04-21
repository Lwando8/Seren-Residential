# Seren Residential App - Project Structure

This document outlines the organization of the **Seren Residential Mobile App** built with React Native and Expo.

## 🏗️ Project Overview

```
seren-residential-app/               # React Native Expo App
├── 📱 Resident Mobile App
├── 🔥 Firebase Backend Integration
└── 📋 TypeScript Configuration
```

## 📱 Mobile App Structure

```
seren-residential-app/              # Main resident app (React Native + Expo)
├── App.tsx                        # Main app entry point with navigation
├── app.json                       # Expo configuration
├── package.json                   # Mobile app dependencies
├── index.ts                       # App index
├── tsconfig.json                  # TypeScript configuration
├── assets/                        # Static assets
│   ├── icon.png                  # App icon
│   ├── splash-icon.png           # Splash screen icon
│   ├── favicon.png               # Web favicon (if using web)
│   └── adaptive-icon.png         # Android adaptive icon
└── src/                          # Source code
    ├── components/               # Reusable UI components
    │   ├── GlassCard.tsx        # Glass morphism card component
    │   └── Screen.tsx           # Base screen wrapper with theme
    ├── context/                 # React contexts
    │   └── ThemeContext.tsx     # Theme and dark mode management
    ├── screens/                 # App screens (tab navigation)
    │   ├── auth/                # Authentication screens
    │   │   └── LoginScreen.tsx  # User login screen
    │   ├── dashboard/           # Dashboard components
    │   │   └── DashboardOverview.tsx # Home dashboard overview
    │   ├── HomeScreen.tsx       # Main home with quick actions
    │   ├── ComplaintsScreen.tsx # Estate infrastructure reports
    │   ├── PersonalComplaintsScreen.tsx # Personal resident complaints
    │   ├── CommunityScreen.tsx  # Community features & events
    │   ├── ProfileScreen.tsx    # User profile & app settings
    │   └── SubscriptionScreen.tsx # Premium subscription management
    ├── services/                # Business logic services
    │   ├── firebase.ts          # Firebase configuration & setup
    │   ├── AlertService.ts      # Emergency alert management
    │   ├── ComplaintService.ts  # Complaint submission & tracking
    │   └── SubscriptionService.ts # Subscription & payment logic
    ├── theme/                   # Design system
    │   └── colors.ts           # Color palette & theme definitions
    └── types/                   # TypeScript definitions
        └── index.ts            # App-wide type definitions
```

## 🔥 Firebase Integration

The app integrates with Firebase for backend services:

```
Firebase Collections:
├── users/                       # User profiles and auth data
├── complaints/                  # Infrastructure & personal complaints
├── subscriptions/               # Payment and subscription data
├── community_events/            # Community calendar & events
├── emergency_contacts/          # Estate emergency information
├── announcements/               # Estate announcements & updates
└── user_preferences/            # App settings & preferences
```

## 🎨 Design System

### Glass Morphism Components
- **GlassCard**: Reusable card component with frosted glass effect
- **Circular Buttons**: Navigation and action buttons with gradients
- **Theme Support**: Dark/light mode with automatic detection

### Color Scheme
```typescript
// Primary colors for different features
Reports: Blue gradients (#3B82F6 → #1E40AF)
Complaints: Orange/yellow gradients (#F59E0B → #D97706) 
Community: Green gradients (#10B981 → #059669)
Profile: Purple gradients (#8B5CF6 → #7C3AED)
```

## 🗂️ Screen Flow & Navigation

### Bottom Tab Navigation
```
Home Tab
├── Quick Actions (Reports, Complaints, Community)
├── Emergency Contacts
├── Weather Widget
└── Recent Announcements

Reports Tab
├── Infrastructure Issues
├── Submit New Report
├── View Report History
└── Status Tracking

Complaints Tab
├── Personal Complaints (Noise, Parking, Security)
├── Quick Actions (Noise, Parking, Security)
├── Submit with Photos
└── Complaint History

Community Tab
├── Estate Clubs & Activities
├── Events Calendar
├── Community Announcements
└── Social Features

Profile Tab
├── Personal Information
├── App Settings
├── Subscription Management
└── Support & Help
```

## 🛠️ Technology Stack

### Core Technologies
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **Navigation**: React Navigation v6 (Bottom Tabs)
- **Styling**: StyleSheet with LinearGradient effects
- **State Management**: React Context API

### Expo Features Used
- **expo-linear-gradient**: Glass morphism effects
- **expo-image-picker**: Photo uploads for complaints
- **expo-notifications**: Push notifications
- **expo-location**: Location services
- **expo-constants**: App configuration
- **expo-linking**: Deep linking support

### Backend & Services
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (image uploads)
- **Real-time**: Firestore real-time listeners

## 📋 Key Features

### Complaint Management
```typescript
// Complaint types supported
Infrastructure Reports:
├── Lighting Issues
├── Gate Motor Problems  
├── Pool Filter Issues
├── Plumbing Problems
├── Electrical Issues
├── Garden Maintenance
└── General Maintenance

Personal Complaints:
├── Noise Violations
├── Parking Issues
├── Security Concerns
├── Maintenance Requests
├── Pet Violations
├── Garbage Issues
└── Other Complaints
```

### User Experience Features
- **Real-time Status Updates**: Live complaint tracking
- **Photo Attachments**: Visual complaint documentation
- **Push Notifications**: Status change alerts
- **Offline Support**: Cached data for offline viewing
- **Auto Dark Mode**: Theme based on system preferences

## 🚀 Development Workflow

### Running the App
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platforms
npx expo start --ios          # iOS Simulator
npx expo start --android      # Android Emulator  
npx expo start --web          # Web browser
```

### Building for Production
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure builds
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

## 🔒 Security & Data Privacy

### Authentication Flow
1. **Firebase Auth**: Email/password authentication
2. **User Profiles**: Stored in Firestore with role-based access
3. **Secure Routes**: Protected screens require authentication
4. **Data Validation**: Input validation and sanitization

### Data Privacy
- **Local Storage**: Minimal sensitive data cached
- **Image Uploads**: Secure Firebase Storage with access rules
- **User Permissions**: Location and camera permissions requested
- **GDPR Compliance**: User data deletion and export support

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13+
- **Features**: Full feature parity
- **Distribution**: App Store via EAS Build

### Android  
- **Minimum Version**: Android 8+ (API 26)
- **Features**: Full feature parity
- **Distribution**: Google Play Store via EAS Build

### Web (Optional)
- **Support**: Expo Web support available
- **Features**: Limited (mobile-optimized)
- **Use Case**: Development testing

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Navigation between all tabs works
- [ ] Complaint submission with photos
- [ ] Real-time status updates
- [ ] Theme switching (dark/light)
- [ ] Offline functionality
- [ ] Push notification handling

### Performance Considerations
- [ ] App startup time < 3 seconds
- [ ] Smooth 60fps animations
- [ ] Efficient image loading and caching
- [ ] Memory usage optimization
- [ ] Battery usage optimization

## 📦 Dependencies Overview

### Core Dependencies
```json
{
  "expo": "~53.0.12",
  "react": "19.0.0", 
  "react-native": "0.79.4",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/bottom-tabs": "^6.0.0"
}
```

### Firebase Dependencies
```json
{
  "@react-native-firebase/app": "22.2.1",
  "@react-native-firebase/auth": "22.2.1", 
  "@react-native-firebase/firestore": "22.2.1",
  "@react-native-firebase/storage": "22.2.1"
}
```

### Expo Features
```json
{
  "expo-linear-gradient": "^14.1.5",
  "expo-image-picker": "~16.1.4",
  "expo-notifications": "~0.31.3",
  "expo-location": "~18.1.5"
}
```

---

**Last Updated**: December 2024  
**App Version**: 1.0.0  
**Expo SDK**: 53.0.0 