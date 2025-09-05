import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { TriggerRef } from "@rn-primitives/popover";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Alert, View } from "react-native";

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
      <View className="flex-row items-center gap-2">
        <Link href="/auth/login" asChild>
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-sm font-normal text-white "
          >
            تسجيل الدخول
          </Text>
        </Link>
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-sm font-normal text-white "
        >
          /
        </Text>
        <Link href="/auth/register" asChild>
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-sm font-normal text-white "
          >
            إنشاء حساب
          </Text>
        </Link>
      </View>
    );
  }

  return (
    <Link href="/profile" asChild>
      <Text
        style={{ fontFamily: "Doc" }}
        className="text-sm font-normal  text-white "
      >
        مرحباً، {user?.name || "مستخدم"}
      </Text>
    </Link>
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
