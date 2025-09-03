import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  I18nManager,
  Image,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserMenu } from "./user-menu";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

export const TopBar = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 16,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
      }}
      className=" bg-primary"
    >
      <StatusBar barStyle="light-content" backgroundColor="#ef4444" />

      <View className="flex-row-reverse justify-between items-center">
        <UserMenuWrapper toggleMenu={() => setMenuVisible(!menuVisible)} />
        <AppTitle />
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        colorScheme={colorScheme ?? "light"}
      />
    </View>
  );
};

const UserMenuWrapper = ({ toggleMenu }: { toggleMenu: () => void }) => (
  <View
    className="flex flex-row-reverse items-center gap-1"
    style={{ minHeight: 40 }}
  >
    <UserMenu />
  </View>
);
const AppTitle = () => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Image
      source={require("../assets/images/jest-name.png")}
      style={{
        width: 32,
        height: 32,
        marginRight: 8,
        tintColor: "white", // <- this changes black parts to white
      }}
      resizeMode="contain"
    />

    <Text
      style={{
        fontFamily: "Bigx",
        includeFontPadding: false,
        textAlignVertical: "center",
        fontSize: 24,
        color: "#fff",
      }}
      className="text-3xl text-white"
    >
      ر دينو <Text style={{ color: "#fff" }}>مانجا</Text>
    </Text>
  </View>
);

const MenuModal = ({
  visible,
  onClose,
  colorScheme,
}: {
  visible: boolean;
  onClose: () => void;
  colorScheme: "dark" | "light";
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: Platform.OS === "web" ? "blur(40px)" : undefined,
        }}
        onPress={onClose}
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
              className={`text-sm ${colorScheme === "dark" ? "text-white" : "text-gray-800"}`}
            >
              ملفي الشخصي
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2"
            onPress={() => console.log("Logout")}
          >
            <Text
              className={`text-sm ${colorScheme === "dark" ? "text-white" : "text-gray-800"}`}
            >
              تسجيل الخروج
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};
