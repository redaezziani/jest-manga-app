import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import { AlertProvider } from "@/components/CustomAlert";
import { AuthProvider } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MangaNotificationProvider } from "@/providers/MangaNotificationProvider";
import { NotificationProvider } from "@/providers/notification-context";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import "./global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [loaded] = useFonts({
    Bigx: require("../assets/fonts/bigx.otf"),
    Vexa: require("../assets/fonts/vexa.ttf"),
    Almarai: require("../assets/fonts/Almarai-Regular.ttf"),
    Doc: require("../assets/fonts/bein-ar-normal_0.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    if (loaded) {
      prepare();
    }
  }, [loaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has actually
      // rendered.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleAnimationFinish = () => {
    setShowSplash(false);
  };

  if (!appIsReady) {
    return null;
  }

  if (showSplash) {
    return <AnimatedSplashScreen onAnimationFinish={handleAnimationFinish} />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <MangaNotificationProvider>
          <AlertProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
                <PortalHost />
              </View>
            </ThemeProvider>
          </AlertProvider>
        </MangaNotificationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
