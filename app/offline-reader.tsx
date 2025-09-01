import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

interface OfflineChapterInfo {
  id: string;
  title: string;
  number: number;
  totalPages: number;
}

export default function OfflineReader() {
  const { chapterPath, title } = useLocalSearchParams<{
    chapterPath: string;
    title: string;
  }>();

  const [pages, setPages] = useState<string[]>([]);
  const [chapterInfo, setChapterInfo] = useState<OfflineChapterInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width: screenWidth } = Dimensions.get("window");

  useEffect(() => {
    loadOfflineChapter();
  }, [chapterPath]);

  const loadOfflineChapter = async () => {
    if (!chapterPath) return;

    setLoading(true);
    try {
      // Load chapter info
      const infoPath = `${chapterPath}/chapter_info.json`;
      const infoExists = await FileSystem.getInfoAsync(infoPath);

      if (infoExists.exists) {
        const infoContent = await FileSystem.readAsStringAsync(infoPath);
        const info = JSON.parse(infoContent);
        setChapterInfo(info);
      }

      // Load pages
      const files = await FileSystem.readDirectoryAsync(chapterPath);
      const pageFiles = files
        .filter((file) => file.startsWith("page_") && file.endsWith(".jpg"))
        .sort((a, b) => {
          const aNum = parseInt(a.replace("page_", "").replace(".jpg", ""));
          const bNum = parseInt(b.replace("page_", "").replace(".jpg", ""));
          return aNum - bNum;
        })
        .map((file) => `${chapterPath}/${file}`);

      setPages(pageFiles);
    } catch (err) {
      console.error("Error loading offline chapter:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#ff4133" />
          <Text style={{ fontFamily: "Arabic" }} className="text-gray-600 mt-4">
            جاري تحميل الفصل...
          </Text>
        </View>
      </LayoutWithTopBar>
    );
  }

  return (
    <LayoutWithTopBar>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ArrowRight size={20} color="#374151" />
            <Text
              style={{ fontFamily: "Arabic" }}
              className="text-gray-700 mr-2"
            >
              رجوع
            </Text>
          </Button>

          <View className="flex-1 items-center">
            <Text
              style={{ fontFamily: "Arabic" }}
              className="text-lg font-semibold text-gray-900"
              numberOfLines={1}
            >
              {chapterInfo?.title || title || "قارئ الفصول"}
            </Text>
            {chapterInfo && (
              <Text
                style={{ fontFamily: "Arabic" }}
                className="text-sm text-gray-600"
              >
                {pages.length} صفحة
              </Text>
            )}
          </View>

          <View style={{ width: 80 }} />
        </View>
      </View>

      {/* Pages */}
      <ScrollView
        className="flex-1 bg-black"
        showsVerticalScrollIndicator={false}
      >
        {pages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text
              style={{ fontFamily: "Arabic" }}
              className="text-white text-center text-lg"
            >
              لا توجد صفحات في هذا الفصل
            </Text>
          </View>
        ) : (
          pages.map((pageUri, index) => (
            <View key={index} className="mb-2">
              <Image
                source={{ uri: pageUri }}
                style={{
                  width: screenWidth,
                  height: undefined,
                  aspectRatio: 0.7, // Typical manga page ratio
                }}
                resizeMode="contain"
                onError={(error) => {
                  console.error(`Error loading page ${index + 1}:`, error);
                }}
              />

              {/* Page number indicator */}
              <View className="absolute bottom-2 right-2 bg-black bg-opacity-60 px-2 py-1 rounded">
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-white text-xs"
                >
                  {index + 1} / {pages.length}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </LayoutWithTopBar>
  );
}
