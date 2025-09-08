import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

interface PathIndicatorProps {
  title: string;
}

export const PathIndicator: React.FC<PathIndicatorProps> = ({ title }) => (
  <View className="flex-row items-center gap-1 ">
    <Link href="/" style={{ fontFamily: "Doc" }} className=" text-[#ff4133]">
      الرئيسية
    </Link>
    <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-500">
      /
    </Text>
    <Text
      style={{ fontFamily: "Doc" }}
      className="text-sm text-gray-700 font-bold"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  </View>
);
