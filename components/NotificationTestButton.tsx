import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { useMangaNotifications } from '../hooks/useMangaNotifications';
import { useNotifications } from '../providers/notification-context';
import { ThemedText } from './ThemedText';

export const NotificationTestButton: React.FC = () => {
  const { sendLocalNotification } = useNotifications();
  const { subscribeToGeneralUpdates, isConnected, connectionError } = useMangaNotifications();

  const testLocalNotification = async () => {
    try {
      await sendLocalNotification({
        title: '📚 Test Notification',
        body: 'This is a test manga notification!',
        data: {
          type: 'test',
          mangaId: 'test-123',
        },
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const testWebSocketConnection = () => {
    Alert.alert(
      'WebSocket Status',
      `Connection: ${isConnected ? 'Connected' : 'Disconnected'}\n${connectionError ? `Error: ${connectionError}` : 'No errors'}`
    );
  };

  return (
    <View className="p-4 border-t border-gray-200">
      <ThemedText className="text-lg font-bold mb-4">Notification Test</ThemedText>
      
      <View className="space-y-2">
        <TouchableOpacity
          onPress={testLocalNotification}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <ThemedText className="text-white text-center font-medium">
            Test Local Notification
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testWebSocketConnection}
          className="bg-green-500 p-3 rounded-lg"
        >
          <ThemedText className="text-white text-center font-medium">
            Check WebSocket Status
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={subscribeToGeneralUpdates}
          className="bg-purple-500 p-3 rounded-lg"
        >
          <ThemedText className="text-white text-center font-medium">
            Subscribe to General Updates
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View className="mt-4 p-3 bg-gray-100 rounded-lg">
        <ThemedText className="text-sm">
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </ThemedText>
        {connectionError && (
          <ThemedText className="text-sm text-red-600 mt-1">
            Error: {connectionError}
          </ThemedText>
        )}
      </View>
    </View>
  );
};
