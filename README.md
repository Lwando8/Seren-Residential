# 📱 Seren Residential App

A comprehensive React Native mobile application for residential estate management, providing residents with convenient access to community services, complaint filing, subscription management, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seren-residential-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run the app**
   - Scan QR code with Expo Go app
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web preview

---

## 📱 App Features

### 🏠 Home Dashboard
- Quick access to core features
- Estate announcements and updates
- Weather information
- Emergency contacts

### 📋 Reports & Complaints
- **Infrastructure Reports:** Report issues with lighting, gates, pools, etc.
- **Personal Complaints:** File noise, parking, security complaints
- Photo upload capability
- Real-time status tracking
- Historical complaint view

### 👥 Community
- Estate clubs and activities
- Community events calendar
- Social features and announcements
- Meeting schedules

### 💳 Subscription Management
- View current subscription plan
- Payment history
- Billing information
- Plan upgrade options

### 👤 Profile
- Personal information management
- App settings and preferences
- Account security
- Support and help

---

## 🎨 Design Features

- **Glass Morphism UI:** Modern glass-effect design
- **Circular Action Buttons:** Intuitive navigation
- **Dark/Light Theme Support:** Automatic theme detection
- **Responsive Design:** Optimized for all screen sizes
- **Smooth Animations:** Enhanced user experience

---

## 🔧 Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation (Bottom Tabs)
- **Styling:** StyleSheet with LinearGradient
- **Backend:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Image Handling:** Expo Image Picker
- **Notifications:** Expo Notifications
- **Location:** Expo Location

---

## 🗂️ Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── GlassCard.tsx       # Glass morphism card component
│   └── Screen.tsx          # Base screen wrapper
├── context/                # React context providers
│   └── ThemeContext.tsx    # Theme management
├── screens/                # App screens
│   ├── auth/               # Authentication screens
│   ├── dashboard/          # Dashboard components
│   ├── HomeScreen.tsx      # Main home screen
│   ├── ComplaintsScreen.tsx # Infrastructure reports
│   ├── PersonalComplaintsScreen.tsx # Personal complaints
│   ├── CommunityScreen.tsx # Community features
│   ├── SubscriptionScreen.tsx # Subscription management
│   └── ProfileScreen.tsx   # User profile
├── services/               # Business logic & API
│   ├── firebase.ts         # Firebase configuration
│   ├── ComplaintService.ts # Complaint management
│   ├── SubscriptionService.ts # Subscription logic
│   └── AlertService.ts     # Alert utilities
├── theme/                  # Design system
│   └── colors.ts           # Color definitions
└── types/                  # TypeScript definitions
    └── index.ts            # Type definitions
```

---

## 🔥 Firebase Integration

The app uses Firebase for backend services:

- **Firestore:** Real-time database for complaints, reports, and user data
- **Authentication:** User login and account management
- **Storage:** Image uploads for complaint attachments
- **Cloud Functions:** Background processing (if needed)

### Firebase Configuration
Ensure your `src/services/firebase.ts` is properly configured with your Firebase project credentials.

---

## 🧪 Testing

### Manual Testing Checklist

**✅ Navigation**
- [ ] Bottom tab navigation works
- [ ] Screen transitions are smooth
- [ ] Back navigation functions properly

**✅ Features**
- [ ] Complaint submission works
- [ ] Photo upload functions
- [ ] Status updates reflect correctly
- [ ] Community events display
- [ ] Profile updates save

**✅ UI/UX**
- [ ] Glass morphism effects render correctly
- [ ] Circular buttons are properly spaced
- [ ] Dark/light theme switching works
- [ ] Responsive design on different screen sizes

**✅ Performance**
- [ ] App loads quickly
- [ ] Smooth scrolling and animations
- [ ] No memory leaks
- [ ] Efficient image loading

---

## 🚀 Deployment

### Expo Build Service (EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

4. **Build for Android**
   ```bash
   eas build --platform android
   ```

### App Store Distribution
- Follow Expo's guide for App Store submission
- Ensure all app store requirements are met
- Configure app icons and splash screens

---

## 🆘 Troubleshooting

### Common Issues

**Metro bundler errors:**
```bash
npx expo start --clear
```

**iOS Simulator not opening:**
```bash
# Check Xcode installation
xcrun simctl list devices
```

**Android build issues:**
```bash
# Clear cache
npx expo start --clear
cd android && ./gradlew clean
```

**Package conflicts:**
```bash
# Reset packages
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

For technical support or feature requests:
- **Issues:** Create GitHub issue with detailed description
- **Documentation:** Check Expo and React Native docs
- **Community:** Join React Native community forums

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Compatibility:** iOS 13+, Android 8+, Expo SDK 53 