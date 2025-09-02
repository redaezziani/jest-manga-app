import { AlertProvider } from "@/components/CustomAlert";
import { AuthProvider } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Bigx: require("../assets/fonts/bigx.otf"),
    Vexa: require("../assets/fonts/vexa.ttf"),
    Almarai: require("../assets/fonts/Almarai-Regular.ttf"),
    Doc: require("../assets/fonts/bein-ar-normal_0.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AlertProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          <PortalHost />
        </ThemeProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
