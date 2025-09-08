import React from "react";
import { Image, View } from "react-native";

interface MangaCoverProps {
  coverUrl: string;
}

export const MangaCover: React.FC<MangaCoverProps> = ({ coverUrl }) => {
  return (
    <View
      style={{
        position: "relative",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <Image
        source={{ uri: coverUrl }}
        style={{
          width: 220,
          height: 350,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#d1d5db",
          marginVertical: 16,
        }}
      />
    </View>
  );
};
