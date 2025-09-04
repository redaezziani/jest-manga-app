import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { TriggerRef } from "@rn-primitives/popover";
import { Link, useRouter } from "expo-router";
import { LogIn, LogOut, UserPlus } from "lucide-react-native";
import * as React from "react";
import { Alert, TouchableOpacity, View } from "react-native";

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const popoverTriggerRef = React.useRef<TriggerRef>(null);
  const router = useRouter();

  async function onSignOut() {
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
          popoverTriggerRef.current?.close();
          router.replace("/");
        },
      },
    ]);
  }

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
      <Popover>
        <PopoverTrigger asChild ref={popoverTriggerRef}>
          <Button variant="ghost" size="icon" className="p-0 ">
            <Avatar
              alt="@shadcn"
              className="border-background  web:border-0 web:ring-2 web:ring-background rounded-lg "
            >
              <AvatarImage
                source={{
                  uri: "https://images6.alphacoders.com/129/1295937.jpg",
                }}
              />
              <AvatarFallback>
                <Text>CN</Text>
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center" side="bottom" className="w-60 p-3">
          <View className="gap-2">
            <TouchableOpacity
              onPress={() => {
                popoverTriggerRef.current?.close();
                router.push("/auth/login" as any);
              }}
              className="flex-row items-center gap-3 p-3 "
            >
              <LogIn size={16} color="#666" />
              <Text
                style={{ fontFamily: "Doc" }}
                className=" text-sm text-gray-700"
              >
                تسجيل الدخول
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                popoverTriggerRef.current?.close();
                router.push("/auth/register" as any);
              }}
              className="flex-row items-center gap-3 p-3 "
            >
              <UserPlus size={16} color="#ff4133" />
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-sm  text-[#ff4133]"
              >
                إنشاء حساب جديد
              </Text>
            </TouchableOpacity>
          </View>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <UserAvatar />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="w-52 p-0">
        <View className="border-border gap-3 border-b border-dashed p-3">
          <View className="flex-row items-center gap-3">
            <UserAvatar />
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Doc" }}
                className="font-medium text-xs leading-5"
              >
                {user?.name}
              </Text>
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-muted-foreground line-clamp-1 text-sm font-normal leading-4"
              >
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-3">
          <TouchableOpacity
            onPress={onSignOut}
            className="flex-row items-center gap-1   hover:bg-gray-50"
          >
            <LogOut size={14} color="#dc2626" />
            <Text
              style={{ fontFamily: "Doc" }}
              className=" text-xs text-red-600"
            >
              تسجيل الخروج
            </Text>
          </TouchableOpacity>
          <Link
            href="/(tabs)/profile"
            className="flex-row items-center gap-1   hover:bg-gray-50 mt-2"
          >
            <UserPlus size={14} color="#666" />
            <Text
              style={{ fontFamily: "Doc" }}
              className=" text-xs text-gray-700 mx-3"
            >
              ملفي الشخصي
            </Text>
          </Link>
        </View>
      </PopoverContent>
    </Popover>
  );
}

function UserAvatar({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Avatar>, "alt">) {
  const { user } = useAuth();

  return (
    <Avatar
      alt={`صورة ${user?.name}`}
      className={cn("size-8", className)}
      {...props}
    >
      <AvatarImage
        source={{
          uri: "https://i.pinimg.com/564x/79/28/b0/7928b0704929f5f58b5571c8731d05c5.jpg",
        }}
      />

      <AvatarFallback>
        <Text className="text-xs font-medium">
          {user?.name ? getInitials(user.name) : "??"}
        </Text>
      </AvatarFallback>
    </Avatar>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
