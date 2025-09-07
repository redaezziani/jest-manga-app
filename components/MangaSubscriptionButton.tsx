import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useMangaNotifications } from '../hooks/useMangaNotifications';
import { ThemedText } from './ThemedText';

interface MangaSubscriptionButtonProps {
  mangaId: string;
  mangaTitle: string;
  className?: string;
}

export const MangaSubscriptionButton: React.FC<MangaSubscriptionButtonProps> = ({
  mangaId,
  mangaTitle,
  className = '',
}) => {
  const {
    isSubscribedToManga,
    subscribeToManga,
    unsubscribeFromManga,
    isConnected,
  } = useMangaNotifications();

  const isSubscribed = isSubscribedToManga(mangaId);

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      unsubscribeFromManga(mangaId);
    } else {
      subscribeToManga(mangaId, mangaTitle);
    }
  };

  if (!isConnected) {
    return (
      <View className={`flex-row items-center justify-center py-3 px-4 bg-gray-200 rounded-lg ${className}`}>
        <Ionicons name="wifi-outline" size={16} color="#9CA3AF" />
        <ThemedText className="text-sm text-gray-500 ml-2">
          Not connected
        </ThemedText>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleToggleSubscription}
      className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${
        isSubscribed
          ? 'bg-red-500'
          : 'bg-blue-500'
      } ${className}`}
    >
      <Ionicons
        name={isSubscribed ? 'notifications-off' : 'notifications'}
        size={16}
        color="white"
      />
      <ThemedText className="text-white font-medium ml-2">
        {isSubscribed ? 'Unsubscribe' : 'Subscribe for Updates'}
      </ThemedText>
    </TouchableOpacity>
  );
};
