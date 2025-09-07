import { Stack } from 'expo-router';
import React from 'react';
import { MangaNotificationsCenter } from '../components/MangaNotificationsCenter';
import { ThemedView } from '../components/ThemedView';

export default function NotificationsPage() {
  return (
    <ThemedView className="flex-1">
      <Stack.Screen
        options={{
          title: 'إشعارات المانجا',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ef4444',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontFamily: 'Doc',
            fontSize: 18,
          },
        }}
      />
      <MangaNotificationsCenter />
    </ThemedView>
  );
}
