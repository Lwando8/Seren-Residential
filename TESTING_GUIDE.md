# 🧪 Seren Residential - Testing Guide

## 📁 Project Structure

We now have **two separate projects** for better organization and testing:

### 1. **🏠 Main Mobile App** (`seren-residential-fresh`)
- **Location**: `/Users/lwando/Projects/seren-residential-fresh`
- **Type**: React Native (Expo) mobile application
- **Purpose**: Resident-facing mobile app for estate management

### 2. **🖥️ Dashboard** (`seren-dashboard`)
- **Location**: `/Users/lwando/Projects/seren-dashboard`
- **Type**: React web application
- **Purpose**: Admin dashboard for estate management

## 🚀 Quick Start Testing

### **Step 1: Start the Mobile App**
```bash
cd /Users/lwando/Projects/seren-residential-fresh
npm start
```
- Scan QR code with Expo Go app
- Or press `i` for iOS simulator
- Or press `a` for Android emulator

### **Step 2: Start the Dashboard**
```bash
cd /Users/lwando/Projects/seren-dashboard
npm install  # First time only
npm start
```
- Open browser to `http://localhost:3000`

## 🎯 Testing Scenarios

### **Scenario 1: Emergency Alert Testing**
1. **From Mobile App:**
   - Open the app
   - Go to Home Screen
   - Press the 🚨 SOS button
   - Confirm emergency alert

2. **From Dashboard:**
   - Open dashboard in browser
   - Click "Test Emergency Alert" button
   - Verify alert appears in mobile app

### **Scenario 2: Complaint Submission**
1. **From Mobile App:**
   - Go to Reports/Complaints screen
   - Fill out complaint form
   - Attach image (optional)
   - Submit complaint

2. **From Dashboard:**
   - Check "Recent Activity" for new complaint
   - Update complaint status
   - Add admin notes
   - Verify mobile app reflects changes

### **Scenario 3: Announcement System**
1. **From Dashboard:**
   - Send announcement with different priorities
   - Test welcome message
   - Test maintenance notice

2. **From Mobile App:**
   - Check if announcements appear
   - Verify priority levels display correctly
   - Test notification handling

## 📱 Mobile App Testing Checklist

### **🏠 Home Screen**
- [ ] App loads with glass-morphism design
- [ ] Theme toggle works (light/dark mode)
- [ ] "Good Morning" greeting displays correctly
- [ ] Control room status shows "Active"
- [ ] Emergency buttons are visible and functional

### **🚨 Emergency Features**
- [ ] SOS Button sends emergency alert
- [ ] Medical Alert button works
- [ ] Security Alert button works
- [ ] Alert confirmation messages appear
- [ ] Location permissions work (if on real device)

### **📊 Reports/Complaints**
- [ ] Different complaint types available
- [ ] Image attachment works (camera/gallery)
- [ ] Form validation works correctly
- [ ] Submit complaint functionality
- [ ] Complaint history loads

### **📝 Personal Complaints**
- [ ] Personal complaints history loads
- [ ] Status indicators work (Open/In Progress/Resolved)
- [ ] Complaint details show correctly
- [ ] Time stamps are accurate

### **👥 Community & Profile**
- [ ] Community features load
- [ ] Profile settings work
- [ ] Theme switching works
- [ ] Navigation flows properly

## 🖥️ Dashboard Testing Checklist

### **📊 Dashboard Overview**
- [ ] Statistics display correctly
- [ ] Connection status shows properly
- [ ] Real-time updates work
- [ ] Activity feed updates

### **📢 Announcement System**
- [ ] Send announcements to mobile app
- [ ] Different priority levels work
- [ ] Form validation works
- [ ] Announcements appear in activity feed

### **🛠️ Complaint Management**
- [ ] Update complaint statuses
- [ ] Add admin notes
- [ ] Search/filter complaints
- [ ] Real-time complaint updates

### **🚨 Alert Management**
- [ ] Handle emergency alerts
- [ ] Update alert statuses
- [ ] Add response details
- [ ] Alert tracking works

## 🔧 Technical Testing

### **Firebase Integration**
- [ ] Data syncs between mobile app and dashboard
- [ ] Real-time updates work
- [ ] Offline functionality works
- [ ] Error handling works

### **Performance Testing**
- [ ] App loads quickly
- [ ] Smooth navigation
- [ ] Image uploads work
- [ ] Memory usage is reasonable

### **Cross-Platform Testing**
- [ ] iOS simulator works
- [ ] Android emulator works
- [ ] Web version works (if enabled)
- [ ] Real device testing (recommended)

## 🐛 Common Issues & Solutions

### **Mobile App Issues**
```
Issue: App won't load
Solution: Clear Metro cache with `npx expo start -c`

Issue: Firebase warnings
Solution: Normal in development - app has fallback functionality

Issue: Camera/Location not working
Solution: Enable permissions in device settings for Expo Go
```

### **Dashboard Issues**
```
Issue: Dashboard won't start
Solution: Check if port 3000 is available, or use `npm start -- --port 3001`

Issue: No connection to Firebase
Solution: Check Firebase configuration and network connection

Issue: Styling issues
Solution: Clear browser cache and refresh
```

## ✅ Success Criteria

**Both applications are working correctly when:**
- [ ] Mobile app loads without crashes
- [ ] Dashboard loads in browser
- [ ] Emergency alerts can be sent from both apps
- [ ] Complaints can be submitted and managed
- [ ] Announcements work between both apps
- [ ] Real-time communication works
- [ ] Data persists and syncs correctly
- [ ] UI looks polished on both platforms

## 🎉 Testing Complete!

Once you've completed all the above tests, both your mobile app and dashboard should be working independently while maintaining communication through Firebase. This separation allows for:

- **Independent Development**: Work on each project separately
- **Better Testing**: Test each application in isolation
- **Cleaner Codebase**: No mixing of mobile and web code
- **Easier Deployment**: Deploy each application separately

---

**Happy Testing! 🚀** 