import { useColorScheme, View } from "react-native";
import { TopBar } from "./TopBar";

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
        colorScheme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <TopBar />
      {children}
    </View>
  );
};

export { CustomTabBarBackground, LayoutWithTopBar };
