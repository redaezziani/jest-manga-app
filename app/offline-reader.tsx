import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

  // Refs for smooth scrolling
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

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

  // Smooth scroll to specific page
  const scrollToPage = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0, // Top of the screen
      });
    }
  };

  if (loading) {
    return (
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#ff4133" />
          <Text style={{ fontFamily: "Doc" }} className="text-gray-600 mt-4">
            جاري تحميل الفصل...
          </Text>
        </View>
      </LayoutWithTopBar>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />

        <View className="px-4 pt-2 pb-1">
          <PathIndicator
            chapterName={chapterInfo ? chapterInfo.title : title || "الفصل"}
          />
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={pages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Animated.View
              className="mb-2"
              style={{
                opacity: scrollY.interpolate({
                  inputRange: [
                    (index - 1) * screenWidth * 1.4,
                    index * screenWidth * 1.4,
                    (index + 1) * screenWidth * 1.4,
                  ],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    scale: scrollY.interpolate({
                      inputRange: [
                        (index - 1) * screenWidth * 1.4,
                        index * screenWidth * 1.4,
                        (index + 1) * screenWidth * 1.4,
                      ],
                      outputRange: [0.8, 1, 0.8],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              }}
            >
              <Image
                source={{ uri: item }}
                style={{
                  width: screenWidth,
                  height: undefined,
                  aspectRatio: 0.7,
                }}
                onError={(error) => {
                  console.error(`Error loading page ${index + 1}:`, error);
                }}
              />

              <View className="absolute bottom-2 right-2 bg-black/80 bg-opacity-60 px-2 py-1 rounded">
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-white text-xs"
                >
                  {index + 1} / {pages.length}
                </Text>
              </View>
            </Animated.View>
          )}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={1} // Smoother scroll events
          decelerationRate={0.95} // Custom deceleration for smoother feel
          // Enhanced scroll properties for smoothness
          bounces={true}
          bouncesZoom={false}
          alwaysBounceVertical={true}
          // Scroll event handling for animations
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: true,
              listener: (event) => {
                // Optional: Add custom scroll logic here
              },
            }
          )}
          // Snap to pages for better UX (optional)
          snapToInterval={screenWidth * 1.4 + 8} // Page height + margin
          snapToAlignment="start"
          // Momentum scroll settings
          maximumZoomScale={1}
          minimumZoomScale={1}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={2}
          // Smooth scroll indicator
          indicatorStyle="white"
        />

        {/* Optional: Floating scroll controls */}
        <View className="absolute right-4 gap-1 bottom-20 flex-col space-y-2">
          <TouchableOpacity
            onPress={() => {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
            }}
            className="bg-black/60 bg-opacity-60 p-2 rounded-full"
          >
            <Text style={{ fontFamily: "Doc" }} className="text-white text-xs">
              أول
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const lastPageOffset =
                (pages.length - 1) * (screenWidth * 1.4 + 8);
              flatListRef.current?.scrollToOffset({
                offset: lastPageOffset,
                animated: true,
              });
            }}
            className="bg-black/60 bg-opacity-60 p-2 rounded-full"
          >
            <Text style={{ fontFamily: "Doc" }} className="text-white text-xs">
              آخر
            </Text>
          </TouchableOpacity>
        </View>
      </LayoutWithTopBar>
    </GestureHandlerRootView>
  );
}

const PathIndicator = ({ chapterName }: { chapterName: string }) => {
  const router = useRouter();
  return (
    <View className="flex-row items-center space-x-2 gap-1">
      <Text
        onPress={() => router.push("/")}
        style={{ fontFamily: "Doc" }}
        className="text-sm text-[#ff4133]"
      >
        الرئيسية
      </Text>
      <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-500">
        /
      </Text>
      <Text
        onPress={() => router.back()}
        style={{ fontFamily: "Doc" }}
        className="text-sm text-gray-500"
      >
        الفصول المحفوظة
      </Text>
      <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-500">
        /
      </Text>
      <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-500">
        {chapterName}
      </Text>
    </View>
  );
};
