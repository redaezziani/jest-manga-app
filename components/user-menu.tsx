import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { TriggerRef } from "@rn-primitives/popover";
import * as React from "react";
import { View } from "react-native";

const USER = {
  fullName: "زاك نجنت", // translated name
  initials: "ZN",
  imgSrc: { uri: "https://github.com/mrzachnugent.png" },
  username: "mrzachnugent",
};

export function UserMenu() {
  const popoverTriggerRef = React.useRef<TriggerRef>(null);

  async function onSignOut() {
    popoverTriggerRef.current?.close();
    // TODO: تسجيل الخروج والانتقال إلى شاشة تسجيل الدخول
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <UserAvatar />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" className="w-80 p-0">
        <View className="border-border gap-3 border-b p-3">
          <View className="flex-row items-center gap-3">
            <UserAvatar className="size-10" />
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Arabic" }}
                className="font-medium leading-5"
              >
                {USER.fullName}
              </Text>
              {USER.fullName?.length ? (
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-muted-foreground text-sm font-normal leading-4"
                >
                  {USER.username}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}

function UserAvatar({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Avatar>, "alt">) {
  return (
    <Avatar
      alt={`صورة ${USER.fullName}`}
      className={cn("size-8", className)}
      {...props}
    >
      <AvatarImage source={USER.imgSrc} />
      <AvatarFallback>
        <Text>{USER.initials}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
