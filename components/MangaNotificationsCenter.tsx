import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useMangaNotifications } from '../hooks/useMangaNotifications';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface NotificationItemProps {
  notification: any;
  onPress: () => void;
  onMarkAsRead: () => void;
  isRead: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  isRead,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'new_manga':
        return 'book-outline';
      case 'new_chapter':
        return 'reader-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'new_manga':
        return '#4CAF50';
      case 'new_chapter':
        return '#2196F3';
      default:
        return '#FF9800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-3 p-4 rounded-lg border ${
        isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200 shadow-sm'
      }`}
    >
      <View className="flex-row items-start space-x-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: getNotificationColor() + '20' }}
        >
          <Ionicons
            name={getNotificationIcon() as any}
            size={20}
            color={getNotificationColor()}
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <ThemedText className={`font-semibold ${isRead ? 'text-gray-600' : 'text-gray-800'}`}>
              {notification.type === 'new_manga' ? 'New Manga' : 'New Chapter'}
            </ThemedText>
            <View className="flex-row items-center space-x-2">
              <ThemedText className="text-xs text-gray-500">
                {formatTimeAgo(notification.timestamp)}
              </ThemedText>
              {!isRead && (
                <TouchableOpacity onPress={onMarkAsRead} className="p-1">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ThemedText className={`text-sm mb-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </ThemedText>
          
          {notification.mangaTitle && (
            <View className="flex-row items-center">
              <ThemedText className="text-xs font-medium text-blue-600">
                {notification.mangaTitle}
              </ThemedText>
              {notification.chapterNumber && (
                <ThemedText className="text-xs text-gray-500 ml-2">
                  Chapter {notification.chapterNumber}
                </ThemedText>
              )}
            </View>
          )}
        </View>
        
        {!isRead && (
          <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionError: string | null;
  onReconnect: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  connectionError,
  onReconnect,
}) => {
  if (isConnected) {
    return (
      <View className="flex-row items-center justify-center p-3 bg-green-50 rounded-lg mb-4">
        <Ionicons name="wifi" size={16} color="#4CAF50" />
        <ThemedText className="text-sm text-green-700 ml-2">
          Connected to live updates
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between p-3 bg-red-50 rounded-lg mb-4">
      <View className="flex-row items-center flex-1">
        <Ionicons name="wifi-outline" size={16} color="#F44336" />
        <ThemedText className="text-sm text-red-700 ml-2">
          {connectionError || 'Disconnected from live updates'}
        </ThemedText>
      </View>
      <TouchableOpacity onPress={onReconnect} className="bg-red-500 px-3 py-1 rounded">
        <ThemedText className="text-xs text-white font-medium">Retry</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

export const MangaNotificationsCenter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    isConnected,
    connectionError,
    subscriptions,
    subscribeToGeneralUpdates,
    clearNotifications,
    markNotificationAsRead,
    unreadCount,
    reconnect,
  } = useMangaNotifications();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      subscribeToGeneralUpdates();
    }
  }, [isAuthenticated, subscribeToGeneralUpdates]);

  const handleRefresh = async () => {
    setRefreshing(true);
    reconnect();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationPress = (notification: any) => {
    markNotificationAsRead(notification.id);
    
    if (notification.type === 'new_chapter' && notification.chapterId) {
      router.push(`/chapter/${notification.chapterId}`);
    } else if (notification.type === 'new_manga' && notification.mangaId) {
      router.push(`/manga/${notification.mangaId}`);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearNotifications },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <Ionicons name="log-in-outline" size={48} color="#9CA3AF" />
        <ThemedText className="text-lg font-semibold text-gray-600 mt-4 text-center">
          Please log in to receive manga notifications
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <ThemedText className="text-2xl font-bold">Notifications</ThemedText>
            {unreadCount > 0 && (
              <ThemedText className="text-sm text-gray-600">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </ThemedText>
            )}
          </View>
          
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              className="bg-red-500 px-3 py-2 rounded-lg"
            >
              <ThemedText className="text-white text-sm font-medium">Clear All</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Connection Status */}
        <ConnectionStatus
          isConnected={isConnected}
          connectionError={connectionError}
          onReconnect={reconnect}
        />

        {/* Subscriptions Info */}
        {subscriptions.length > 0 && (
          <View className="bg-blue-50 p-4 rounded-lg mb-4">
            <ThemedText className="font-semibold text-blue-800 mb-2">
              Subscribed to {subscriptions.length} manga
            </ThemedText>
            <View className="flex-row flex-wrap">
              {subscriptions.slice(0, 3).map((sub, index) => (
                <View key={sub.mangaId} className="bg-blue-200 px-2 py-1 rounded mr-2 mb-1">
                  <ThemedText className="text-xs text-blue-800">
                    {sub.mangaTitle}
                  </ThemedText>
                </View>
              ))}
              {subscriptions.length > 3 && (
                <View className="bg-blue-200 px-2 py-1 rounded">
                  <ThemedText className="text-xs text-blue-800">
                    +{subscriptions.length - 3} more
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
            <ThemedText className="text-lg font-semibold text-gray-600 mt-4">
              No notifications yet
            </ThemedText>
            <ThemedText className="text-sm text-gray-500 text-center mt-2">
              You'll see manga updates and new chapter notifications here
            </ThemedText>
          </View>
        ) : (
          <View>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onMarkAsRead={() => markNotificationAsRead(notification.id)}
                isRead={false} // You can implement read status tracking
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
};
