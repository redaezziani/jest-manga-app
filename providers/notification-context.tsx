import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from '../utils/push-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isLoading: boolean;
  permissionStatus: Notifications.PermissionStatus | null;
  registerForNotifications: () => Promise<void>;
  sendLocalNotification: (notification: NotificationData) => Promise<void>;
  clearNotifications: () => Promise<void>;
  getBadgeCount: () => Promise<number>;
  setBadgeCount: (count: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  const registerForNotifications = async () => {
    try {
      setIsLoading(true);
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
      }
      
      // Get current permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error registering for notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendLocalNotification = async (notificationData: NotificationData) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title || 'Notification',
          body: notificationData.body || '',
          data: notificationData.data || {},
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getBadgeCount = async (): Promise<number> => {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  useEffect(() => {
    // Register for notifications on mount
    registerForNotifications();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap/interaction here
      // You can navigate to specific screens based on notification data
      const data = response.notification.request.content.data;
      if (data) {
        // Handle navigation based on notification data
        console.log('Notification data:', data);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    isLoading,
    permissionStatus,
    registerForNotifications,
    sendLocalNotification,
    clearNotifications,
    getBadgeCount,
    setBadgeCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}