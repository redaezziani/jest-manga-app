import { HapticTab } from "@/components/HapticTab";
import {
  CustomTabBarBackground,
  LayoutWithTopBar,
} from "@/components/LayoutWithBar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import { ArrowDown, Home, Library, Search, User } from "lucide-react-native";
import { Platform, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <LayoutWithTopBar>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: CustomTabBarBackground,
          tabBarStyle: {
            position: Platform.OS === "ios" ? "absolute" : "relative",
            height: Platform.OS === "ios" ? 90 : 70,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 25 : 8,
            paddingHorizontal: 8,
            backgroundColor: "transparent",
            borderTopWidth: 0.3,
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
            
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
            marginTop: 2,
            letterSpacing: 0.3,
            fontFamily: "Arabic",

          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarActiveTintColor: "#ff4133",
          tabBarInactiveTintColor:
            colorScheme === "dark" ? "#9ca3af" : "#9ca3af",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color }) => (
              <View className="p-1">
                <Home size={22} color={color} strokeWidth={1.5} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "استكشاف",
            tabBarIcon: ({ color }) => (
              <View className="p-1">
                <Search size={22} color={color} strokeWidth={1.5} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "المكتبة",
            tabBarIcon: ({ color }) => (
              <View className="p-1">
                <Library size={22} color={color} strokeWidth={1.5} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "الملف الشخصي",
            tabBarIcon: ({ color }) => (
              <View className="p-1">
                <User size={22} color={color} strokeWidth={1.5} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="downloads"
          options={{
            title: "التنزيلات",
            tabBarIcon: ({ color }) => (
              <View className="p-1">
                <ArrowDown size={22} color={color} strokeWidth={1.5} />
              </View>
            ),
          }}
        />
      </Tabs>
    </LayoutWithTopBar>
  );
}
