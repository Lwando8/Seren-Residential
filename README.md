# 🏘️ Seren Residential - Estate Security Platform

A comprehensive residential estate management and emergency response application built with React Native and Firebase. Designed for secure estates with subscription-based premium features.

## 🚀 Features

### 🔔 Emergency Alert System
- **SOS Emergency Button** - Life-threatening situations with priority response
- **Medical Emergency Alerts** - Health emergencies with automated response
- **Real-time Location Sharing** - GPS coordinates sent to control room
- **Alert Status Tracking** - Monitor response status (Open → In Progress → Resolved)
- **Response Time Monitoring** - Track emergency response times

### 📢 Estate Complaints System
- **Complaint Categories** - Noise, Parking, Maintenance, Security, Pets, Garbage, Other
- **Image Upload Support** - Visual evidence for complaints
- **Real-time Status Updates** - Track complaint resolution progress
- **Complaint History** - View all submitted complaints
- **Estate Management Integration** - Direct routing to management team

### 💳 Subscription Management
- **R25/Month Premium Subscription** - Affordable monthly pricing
- **Payment Processing** - Secure card payments (Stripe integration ready)
- **Subscription Status Tracking** - Active, Inactive, Pending states
- **Premium Feature Access Control** - Feature gating for non-subscribers
- **Admin Role Bypass** - Admins access all features without subscription

### 🏠 Estate Information
- **24/7 Control Room Monitoring** - Professional security oversight
- **Emergency Contact Directory** - Quick access to essential contacts
- **Estate Security Status** - Real-time security monitoring display
- **Unit Management** - Resident unit tracking and verification

### 🎨 User Experience
- **Light/Dark Theme Toggle** - Customizable interface
- **Intuitive Navigation** - Tab-based navigation with clear icons
- **Real-time Updates** - Live status updates for alerts and complaints
- **Accessibility** - Following React Native accessibility guidelines

## 🏗️ Technical Architecture

### Frontend (React Native)
- **Expo SDK** - Cross-platform development framework
- **TypeScript** - Type-safe development
- **Firebase SDK** - Real-time database and authentication
- **Navigation** - React Navigation v6 with tab navigation
- **State Management** - React Context for theme and user state
- **UI Components** - Custom components with consistent design system

### Backend (Firebase)
```
📁 Firestore Collections:
├── users/              # User profiles and subscription status
├── estate_alerts/      # Emergency and medical alerts
├── complaints/         # Estate complaints and issues
├── subscriptions/      # Payment and subscription data
└── assignments/        # Alert assignments to security staff
```

### Services Layer
- **AlertService** - Emergency alert management
- **ComplaintService** - Complaint submission and tracking
- **SubscriptionService** - Payment and subscription handling
- **Firebase Config** - Centralized Firebase configuration

## 📱 App Structure

```
src/
├── components/         # Reusable UI components
│   └── Screen.tsx     # Base screen wrapper
├── context/           # React Context providers
│   └── ThemeContext.tsx
├── screens/           # Application screens
│   ├── HomeScreen.tsx          # Emergency alerts and estate info
│   ├── ComplaintsScreen.tsx    # Complaint submission and tracking
│   ├── ContactsScreen.tsx      # Emergency contacts
│   ├── ProfileScreen.tsx       # User profile and settings
│   └── SubscriptionScreen.tsx  # Subscription management
├── services/          # Business logic services
│   ├── firebase.ts
│   ├── AlertService.ts
│   ├── ComplaintService.ts
│   └── SubscriptionService.ts
├── theme/            # Design system
│   └── colors.ts
└── types/            # TypeScript definitions
    └── index.ts
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Firebase project with Firestore enabled

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

3. **Configure Firebase**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Firebase Authentication
   - Enable Firebase Storage
   - Update `src/services/firebase.ts` with your config:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go
   - **Web**: Press `w` to open in browser

## 🔐 Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can create alerts, admins can read all
    match /estate_alerts/{alertId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Similar rules for complaints
    match /complaints/{complaintId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Subscriptions - users can read their own, admins can read all
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## 💰 Subscription System

### Pricing
- **Free Plan**: Basic emergency contacts
- **Premium Plan**: R25/month
  - Emergency alert system
  - Medical emergency alerts
  - Complaint management
  - Real-time tracking
  - Priority support

### Payment Integration
Ready for integration with:
- **Stripe** - Credit/debit card processing
- **RevenueCat** - Subscription management
- **PayFast** - South African payment gateway

## 🎯 User Roles

### Resident
- Submit emergency alerts
- File complaints
- View personal alert/complaint history
- Manage subscription
- Access emergency contacts

### Admin
- View all alerts and complaints
- Assign incidents to security staff
- Update alert/complaint status
- Access control room dashboard
- Bypass subscription requirements

## 🚀 Deployment

### Mobile App Deployment
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Submit to app stores
npx expo submit
```

### Web Dashboard (Future)
The control room dashboard will be a separate React web application for estate management and security teams.

## 🔄 Development Workflow

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Git hooks for pre-commit checks

### Testing Strategy
- Unit tests for services
- Integration tests for Firebase
- E2E tests for critical flows
- Manual testing on multiple devices

## 📊 Analytics & Monitoring

### Metrics Tracked
- Emergency response times
- Complaint resolution rates
- User engagement
- Subscription conversion rates
- App performance metrics

## 🌟 Future Enhancements

### Phase 2 Features
- Multi-estate management
- Visitor access control
- Biometric integration
- IoT device connectivity
- Advanced reporting dashboard

### Integrations
- CCTV system integration
- Access control systems
- Intercom systems
- Smart home devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Seren Residential estates.

## 📞 Support

For technical support or questions:
- **Email**: support@serenresidential.co.za
- **Phone**: +27 11 123 4567
- **Hours**: 24/7 Emergency Support

---

**Seren Residential** - Professional Estate Security Platform
*Keeping South African estates safe, secure, and connected.* 