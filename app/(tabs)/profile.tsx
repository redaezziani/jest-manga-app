import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { LogIn, Mail, User, UserPlus } from "lucide-react-native";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من رغبتك في تسجيل الخروج؟", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6 py-20">
          <View className="items-center mb-8">
            <Avatar alt="Guest user" className="size-20 mb-4">
              <AvatarFallback>
                <User size={40} color="#999" />
              </AvatarFallback>
            </Avatar>

            <Text
              style={{ fontFamily: "Doc" }}
              className="text-2xl  text-gray-900 mb-2"
            >
              مرحباً بك
            </Text>
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-gray-600 text-center mb-8"
            >
              قم بتسجيل الدخول للوصول إلى ملفك الشخصي ومكتبتك
            </Text>
          </View>

          <View className="w-full max-w-sm space-y-3">
            <Button
              onPress={() => router.push("/auth/login" as any)}
              className=" py-4 rounded-lg w-full"
            >
              <View className="flex-row items-center justify-center gap-2">
                <LogIn size={16} color="white" />
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-white text-sm font-semibold"
                >
                  تسجيل الدخول
                </Text>
              </View>
            </Button>

            <Button
              onPress={() => router.push("/auth/register" as any)}
              variant="outline"
              className="py-4 rounded-lg w-full "
            >
              <View className="flex-row items-center justify-center gap-2">
                <UserPlus size={16} color="#ff4133" />
                <Text style={{ fontFamily: "Doc" }} className=" text-lg ">
                  إنشاء حساب جديد
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <Avatar alt={user?.name || "User"} className="size-24 mb-4">
            {user?.profile ? (
              <AvatarImage source={{ uri: user.profile }} />
            ) : null}
            <AvatarFallback>
              <Text className="text-xl font-bold text-gray-600">
                {user?.name ? getInitials(user.name) : "??"}
              </Text>
            </AvatarFallback>
          </Avatar>

          <Text
            style={{ fontFamily: "Doc" }}
            className="text-2xl font-bold text-gray-900 mb-1"
          >
            {user?.name}
          </Text>
          <Text style={{ fontFamily: "Doc" }} className="text-gray-600">
            {user?.email}
          </Text>
        </View>

        {/* Profile Info */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            معلومات الحساب
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center gap-3 py-2">
              <User size={20} color="#666" />
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-sm text-gray-500"
                >
                  الاسم
                </Text>
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-900 font-medium"
                >
                  {user?.name}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 py-2">
              <Mail size={20} color="#666" />
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-sm text-gray-500"
                >
                  البريد الإلكتروني
                </Text>
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-900 font-medium"
                >
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/downloads")}
            className=" rounded-xl p-4 flex-row items-center justify-between"
          >
            <Text style={{ fontFamily: "Doc" }} className=" font-medium">
              مكتبتي المحملة
            </Text>
            <Text className="">←</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Button
              variant={"destructive"}
              className=" mt-2 font-medium w-full"
            >
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-white text-sm"
              >
                تسجيل الخروج
              </Text>
            </Button>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
