import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'visitor_request' | 'visitor_approved' | 'visitor_denied';
  visitId: string;
  guestName: string;
  unitNumber: string;
  timestamp: string;
}

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push notification token:', token);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('visitor-notifications', {
          name: 'Visitor Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Save push token to user document
  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        pushToken: token,
        tokenUpdatedAt: new Date(),
      });
      console.log('Push token saved for user:', userId);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(
    userId: string, 
    title: string, 
    body: string, 
    data?: NotificationData
  ): Promise<boolean> {
    try {
      // Get user's push token
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData?.pushToken) {
        console.log('No push token found for user:', userId);
        return false;
      }

      // In a real app, you would send this to your backend or Firebase Cloud Functions
      // which would then send the push notification using Firebase Admin SDK
      const message = {
        to: userData.pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
        channelId: 'visitor-notifications',
      };

      console.log('Would send push notification:', message);
      
      // Placeholder for actual push notification sending
      // await fetch('https://exp.host/--/api/v2/push/send', {
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/json',
      //     'Accept-encoding': 'gzip, deflate',
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(message),
      // });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send visitor request notification to resident
  async sendVisitorRequestNotification(
    residentUid: string, 
    guestName: string, 
    visitId: string,
    unitNumber: string
  ): Promise<boolean> {
    const title = '🔔 Visitor Request';
    const body = `${guestName} is requesting access to unit ${unitNumber}`;
    
    const data: NotificationData = {
      type: 'visitor_request',
      visitId,
      guestName,
      unitNumber,
      timestamp: new Date().toISOString(),
    };

    return this.sendNotificationToUser(residentUid, title, body, data);
  }

  // Send visitor approved notification to guest (via SMS or app if they have it)
  async sendVisitorApprovedNotification(visitId: string, guestName: string): Promise<boolean> {
    const title = '✅ Access Granted';
    const body = `${guestName}, your visitor request has been approved!`;
    
    const data: NotificationData = {
      type: 'visitor_approved',
      visitId,
      guestName,
      unitNumber: '',
      timestamp: new Date().toISOString(),
    };

    console.log('Visitor approved notification:', { title, body, data });
    return true; // Placeholder
  }

  // Send visitor denied notification to guest
  async sendVisitorDeniedNotification(visitId: string, guestName: string): Promise<boolean> {
    const title = '❌ Access Denied';
    const body = `${guestName}, your visitor request has been denied.`;
    
    const data: NotificationData = {
      type: 'visitor_denied',
      visitId,
      guestName,
      unitNumber: '',
      timestamp: new Date().toISOString(),
    };

    console.log('Visitor denied notification:', { title, body, data });
    return true; // Placeholder
  }

  // Schedule local notification as fallback
  async scheduleLocalNotification(
    title: string, 
    body: string, 
    data?: any, 
    delaySeconds: number = 0
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        priority: Notifications.AndroidImportance.HIGH,
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });

    return notificationId;
  }

  // Handle notification responses
  setupNotificationHandlers(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Handle notifications received while app is running
    if (onNotificationReceived) {
      Notifications.addNotificationReceivedListener(onNotificationReceived);
    }

    // Handle notification responses (user tapped notification)
    if (onNotificationResponse) {
      Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Get notification permissions status
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Request permissions if not granted
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
}

export default NotificationService; 