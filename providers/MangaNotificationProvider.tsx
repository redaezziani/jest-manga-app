import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMangaNotifications } from '../hooks/useMangaNotifications';

interface MangaNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * This provider initializes the manga notifications WebSocket connection
 * and should be placed high in the component tree, ideally in the root layout.
 */
export const MangaNotificationProvider: React.FC<MangaNotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const {
    isConnected,
    connectionError,
    subscribeToGeneralUpdates,
    unreadCount,
  } = useMangaNotifications();

  // Auto-subscribe to general updates when user is authenticated
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      subscribeToGeneralUpdates();
    }
  }, [isAuthenticated, isConnected, subscribeToGeneralUpdates]);

  // Log connection status for debugging
  useEffect(() => {
    if (isAuthenticated) {
      console.log(`Manga notifications: ${isConnected ? 'Connected' : 'Disconnected'}`);
      if (connectionError) {
        console.error('Manga notification connection error:', connectionError);
      }
      if (unreadCount > 0) {
        console.log(`${unreadCount} unread manga notifications`);
      }
    }
  }, [isAuthenticated, isConnected, connectionError, unreadCount]);

  return <>{children}</>;
};
