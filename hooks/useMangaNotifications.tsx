import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNotifications } from '../providers/notification-context';
import { useAuth } from './useAuth';

// API Base URL
const API_BASE_URL = 'http://192.168.1.126:8082';
const WS_URL = API_BASE_URL.replace('http', 'ws');

// Notification interfaces
interface BaseMangaNotification {
  id: string;
  timestamp: string;
  message: string;
}

interface NewMangaNotification extends BaseMangaNotification {
  type: 'new_manga';
  mangaId: string;
  mangaTitle: string;
  mangaSlug: string;
  coverImage?: string;
}

interface NewChapterNotification extends BaseMangaNotification {
  type: 'new_chapter';
  mangaId: string;
  mangaTitle: string;
  mangaSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterId: string;
  coverImage?: string;
}

type MangaNotification = NewMangaNotification | NewChapterNotification;

interface SubscriptionData {
  mangaId: string;
  mangaTitle: string;
}

interface WebSocketMessage {
  event: string;
  data?: any;
}

interface UseMangaNotificationsReturn {
  notifications: MangaNotification[];
  isConnected: boolean;
  connectionError: string | null;
  subscriptions: SubscriptionData[];
  subscribeToManga: (mangaId: string, mangaTitle: string) => void;
  unsubscribeFromManga: (mangaId: string) => void;
  subscribeToGeneralUpdates: () => void;
  clearNotifications: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  unreadCount: number;
  isSubscribedToManga: (mangaId: string) => boolean;
  reconnect: () => void;
}

const STORAGE_KEYS = {
  NOTIFICATIONS: 'manga_notifications',
  SUBSCRIPTIONS: 'manga_subscriptions',
  READ_NOTIFICATIONS: 'read_notifications',
};

export const useMangaNotifications = (): UseMangaNotificationsReturn => {
  const { token, isAuthenticated } = useAuth();
  const { sendLocalNotification, setBadgeCount } = useNotifications();
  
  const [notifications, setNotifications] = useState<MangaNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load stored data on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateBadgeCount();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [notifications, readNotifications]);

  const loadStoredData = async () => {
    try {
      const [storedNotifications, storedSubscriptions, storedReadNotifications] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.READ_NOTIFICATIONS),
      ]);
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      if (storedSubscriptions) setSubscriptions(JSON.parse(storedSubscriptions));
      if (storedReadNotifications) setReadNotifications(new Set(JSON.parse(storedReadNotifications)));
    } catch (error) {
      console.error('Error loading stored notification data:', error);
    }
  };

  const saveNotifications = async (newNotifications: MangaNotification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const saveSubscriptions = async (newSubscriptions: SubscriptionData[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(newSubscriptions));
    } catch (error) {
      console.error('Error saving subscriptions:', error);
    }
  };

  const saveReadNotifications = async (readNotificationIds: Set<string>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, JSON.stringify(Array.from(readNotificationIds)));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  };

  const updateBadgeCount = useCallback(async () => {
    const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;
    await setBadgeCount(unreadCount);
  }, [notifications, readNotifications, setBadgeCount]);

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch {
        setConnectionError('فشل في إرسال الرسالة');
      }
    } else {
      setConnectionError('غير متصل بالخادم');
    }
  };

  const startHeartbeat = () => {
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    heartbeatInterval.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({ event: 'ping' });
      }
    }, 30000);
  };

  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !token) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) return;

    const wsUrl = `${WS_URL}/manga-notifications?auth_token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000;
      startHeartbeat();
      sendMessage({ event: 'subscribe-to-manga-updates' });
      subscriptions.forEach(sub => {
        sendMessage({ event: 'subscribe-to-specific-manga', data: { mangaId: sub.mangaId } });
      });
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      if (event.code === 4001) {
        setConnectionError('فشل في المصادقة');
        return;
      }
      if (event.code !== 1000 && isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
        setConnectionError(`انقطع الاتصال. إعادة الاتصال... (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        setTimeout(() => {
          reconnectAttempts.current++;
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000);
          connectWebSocket();
        }, reconnectDelay.current);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionError('فشل في إعادة الاتصال. يرجى تحديث الصفحة.');
      }
    };

    ws.onerror = () => {
      setConnectionError('فشل في الاتصال');
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current = ws;
  }, [isAuthenticated, token, subscriptions]);

  const handleWebSocketMessage = useCallback(async (message: any) => {
    switch (message.event || message.type) {
      case 'new-manga':
      case 'new_manga':
        await handleNewMangaNotification(message.data || message);
        break;
      case 'new-chapter':
      case 'new_chapter':
        await handleNewChapterNotification(message.data || message);
        break;
      case 'manga-notification':
        await handleGeneralNotification(message.data || message);
        break;
      default:
        console.log('Unknown message type:', message.event || message.type);
    }
  }, []);

  const handleNewMangaNotification = useCallback(async (notification: NewMangaNotification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev.slice(0, 99)];
      saveNotifications(updated);
      return updated;
    });

    await sendLocalNotification({
      title: 'مانجا جديدة متاحة',
      body: notification.message,
      data: {
        type: 'new_manga',
        mangaId: notification.mangaId,
        mangaSlug: notification.mangaSlug,
        notificationId: notification.id,
      },
    });

    await updateBadgeCount();
  }, [sendLocalNotification, updateBadgeCount]);

  const handleNewChapterNotification = useCallback(async (notification: NewChapterNotification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev.slice(0, 99)];
      saveNotifications(updated);
      return updated;
    });

    await sendLocalNotification({
      title: `فصل جديد: ${notification.mangaTitle}`,
      body: notification.message,
      data: {
        type: 'new_chapter',
        mangaId: notification.mangaId,
        mangaSlug: notification.mangaSlug,
        chapterId: notification.chapterId,
        chapterNumber: notification.chapterNumber,
        notificationId: notification.id,
      },
    });

    await updateBadgeCount();
  }, [sendLocalNotification, updateBadgeCount]);

  const handleGeneralNotification = useCallback(async (notification: any) => {
    await sendLocalNotification({
      title: 'تحديث جديد للمانجا',
      body: notification.message || 'يوجد تحديث جديد للمانجا',
      data: {
        type: 'general',
        notificationId: notification.id,
      },
    });
  }, [sendLocalNotification]);

  // Setup WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      connectWebSocket();
    } else {
      if (wsRef.current) {
        wsRef.current.close(1000, 'User logged out');
        wsRef.current = null;
        setIsConnected(false);
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };
  }, [isAuthenticated, token, connectWebSocket]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.notificationId) markNotificationAsRead(String(data.notificationId));
      if (data?.type === 'new_chapter' && data?.chapterId) {
        router.push(`/chapter/${data.chapterId}`);
      } else if (data?.type === 'new_manga' && data?.mangaId) {
        router.push(`/manga/${data.mangaId}`);
      }
    });
    return () => subscription.remove();
  }, []);

  const subscribeToManga = useCallback((mangaId: string, mangaTitle: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    sendMessage({ event: 'subscribe-to-specific-manga', data: { mangaId } });
    setSubscriptions(prev => {
      const exists = prev.find(sub => sub.mangaId === mangaId);
      if (exists) return prev;
      const updated = [...prev, { mangaId, mangaTitle }];
      saveSubscriptions(updated);
      return updated;
    });
  }, []);

  const unsubscribeFromManga = useCallback((mangaId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      sendMessage({ event: 'unsubscribe-from-specific-manga', data: { mangaId } });
    }
    setSubscriptions(prev => {
      const updated = prev.filter(sub => sub.mangaId !== mangaId);
      saveSubscriptions(updated);
      return updated;
    });
  }, []);

  const subscribeToGeneralUpdates = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      sendMessage({ event: 'subscribe-to-manga-updates' });
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    setReadNotifications(new Set());
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.READ_NOTIFICATIONS),
      setBadgeCount(0),
    ]);
  }, [setBadgeCount]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => {
      const updated = new Set(prev);
      updated.add(notificationId);
      saveReadNotifications(updated);
      updateBadgeCount();
      return updated;
    });
  }, [updateBadgeCount]);

  const isSubscribedToManga = useCallback((mangaId: string) => {
    return subscriptions.some(sub => sub.mangaId === mangaId);
  }, [subscriptions]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnect');
      wsRef.current = null;
    }
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
    reconnectAttempts.current = 0;
    reconnectDelay.current = 1000;
    setConnectionError(null);
    connectWebSocket();
  }, [connectWebSocket]);

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  return {
    notifications,
    isConnected,
    connectionError,
    subscriptions,
    subscribeToManga,
    unsubscribeFromManga,
    subscribeToGeneralUpdates,
    clearNotifications,
    markNotificationAsRead,
    unreadCount,
    isSubscribedToManga,
    reconnect,
  };
};
