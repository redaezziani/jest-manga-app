import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

export default function OfflineReader() {
  const { chapterPath, title } = useLocalSearchParams<{
    chapterPath: string;
    title: string;
  }>();
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(chapterPath!);
      // sort pages in order
      const sorted = files
        .filter((f) => f.endsWith(".jpg"))
        .sort((a, b) => a.localeCompare(b));
      setPages(sorted.map((f) => `${chapterPath}/${f}`));
    } catch (err) {
      console.error("Error loading offline pages:", err);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-2">
      <Text
        style={{ fontFamily: "Arabic" }}
        className="text-xl text-center text-gray-800 mb-3"
      >
        {title}
      </Text>

      {pages.map((p, idx) => (
        <View key={idx} className="mb-3">
          <Image
            source={{ uri: p }}
            className="w-full h-[500px] rounded-xl"
            resizeMode="contain"
          />
        </View>
      ))}
    </ScrollView>
  );
}
