import { Tabs } from "expo-router";
import React, { useState } from "react";
import {
  I18nManager,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { UserMenu } from "@/components/user-menu";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Home, Library, Search, User } from "lucide-react-native";

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const TopBar = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <View
      className={`${
        colorScheme === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      } border-b`}
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 16,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
      }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "#f53d3d" : "#f53d3d"}
      />

      <View className="flex-row-reverse justify-between items-center">
        <View
          className="flex flex-row-reverse items-center gap-1"
          style={{ minHeight: 40 }}
        >
          <UserMenu />
        </View>
        <View className="flex flex-row-reverse items-center gap-1">
          <Text
            style={{
              fontFamily: "Arabic",
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
            className={`text-base ${colorScheme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            دينو <Text style={{ color: "#f53d3d" }}>مانجا</Text>
          </Text>

          {/* <Image
            source={require("../../assets/images/dino.png")}
            className="w-14 h-auto aspect-square hue-rotate-15 "
          /> */}
        </View>
      </View>

      {/* Move Modal outside row */}
      <Modal
        transparent
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          // lets add a backdrop blur effect
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",

            backdropFilter: "blur(40px)",
          }}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: insets.top + 50,
              right: 16,
              backgroundColor: colorScheme === "dark" ? "#1f2937" : "#fff",
              borderRadius: 8,
              paddingVertical: 8,
              width: 160,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              className="px-4 py-2"
              onPress={() => console.log("Go to profile")}
            >
              <Text
                className={`text-sm ${
                  colorScheme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                ملفي الشخصي
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2"
              onPress={() => console.log("Logout")}
            >
              <Text
                className={`text-sm ${
                  colorScheme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                تسجيل الخروج
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Custom Tab Bar Background Component
const CustomTabBarBackground = () => {
  const colorScheme = useColorScheme();
  return (
    <View
      className={`flex-1 ${
        colorScheme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
      style={{
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        borderTopWidth: 0,
      }}
    />
  );
};

const LayoutWithTopBar = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  return (
    <View
      className={`flex-1 ${
        colorScheme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <TopBar />
      {children}
    </View>
  );
};

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
          tabBarActiveTintColor: "#f53d3d",
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
      </Tabs>
    </LayoutWithTopBar>
  );
}
