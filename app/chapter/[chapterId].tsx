import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Chapter, ChapterPage } from "@/type/chapter";
import { API_URL } from "@/utils";
import { APIService } from "@/utils/apiService";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Download } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import * as FileSystem from "expo-file-system";

// Custom Skeleton Components
const SkeletonBox = ({
  width,
  height,
  className = "",
}: {
  width: string | number;
  height: string | number;
  className?: string;
}) => (
  <View
    className={`bg-gray-200 rounded ${className}`}
    style={{
      width:
        typeof width === "string"
          ? width === "100%"
            ? "100%"
            : undefined
          : width,
      height:
        typeof height === "string"
          ? height === "100%"
            ? "100%"
            : undefined
          : height,
    }}
  />
);

const ChapterReaderSkeleton = () => (
  <LayoutWithTopBar>
    <Stack.Screen options={{ headerShown: false }} />

    {/* Path Indicator Skeleton */}
    <View className="px-4 bg-white pt-2 pb-1">
      <View className="flex-row items-center space-x-2 gap-1">
        <SkeletonBox width={60} height={16} />
        <Text className="text-sm text-gray-300">/</Text>
        <SkeletonBox width={80} height={16} />
        <Text className="text-sm text-gray-300">/</Text>
        <SkeletonBox width={120} height={16} />
      </View>
    </View>

    {/* Controls Skeleton */}
    <View className="flex-row items-center justify-between px-3 py-3 bg-white">
      <View className="flex-row items-center space-x-2">
        <SkeletonBox width={192} height={40} className="rounded-md" />
      </View>
      <View className="flex-row items-center gap-1 space-x-2">
        <SkeletonBox width={36} height={36} className="rounded-full" />
        <SkeletonBox width={36} height={36} className="rounded-full" />
        <SkeletonBox width={36} height={36} className="rounded-full" />
      </View>
    </View>

    {/* Pages Skeleton */}
    <ScrollView className="flex-1 w-full">
      {[...Array(5)].map((_, index) => (
        <View key={index} className="mt-2">
          <SkeletonBox width="100%" height={550} />
        </View>
      ))}
    </ScrollView>
  </LayoutWithTopBar>
);

const AnimatedSkeletonBox = ({
  width,
  height,
  className = "",
}: {
  width: string | number;
  height: string | number;
  className?: string;
}) => {
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 0.3 ? 0.7 : 0.3));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      className={`bg-gray-200 rounded ${className}`}
      style={[
        typeof width === "string"
          ? width === "100%"
            ? { width: "100%" as never }
            : {}
          : { width },
        typeof height === "string"
          ? height === "100%"
            ? { height: "100%" as never }
            : {}
          : { height },
        { opacity },
      ]}
    />
  );
};

const AnimatedChapterReaderSkeleton = () => (
  <LayoutWithTopBar>
    <Stack.Screen options={{ headerShown: false }} />

    {/* Path Indicator Skeleton */}
    <View className="px-4 bg-white pt-2 pb-1">
      <View className="flex-row items-center space-x-2 gap-1">
        <AnimatedSkeletonBox width={60} height={16} />
        <Text className="text-sm text-gray-300">/</Text>
        <AnimatedSkeletonBox width={80} height={16} />
        <Text className="text-sm text-gray-300">/</Text>
        <AnimatedSkeletonBox width={120} height={16} />
      </View>
    </View>

    {/* Controls Skeleton */}
    <View className="flex-row items-center justify-between px-3 py-3 bg-white">
      <View className="flex-row items-center space-x-2">
        <AnimatedSkeletonBox width={192} height={40} className="rounded-md" />
      </View>
      <View className="flex-row items-center gap-1 space-x-2">
        <AnimatedSkeletonBox width={36} height={36} className="rounded-full" />
        <AnimatedSkeletonBox width={36} height={36} className="rounded-full" />
        <AnimatedSkeletonBox width={36} height={36} className="rounded-full" />
      </View>
    </View>

    {/* Pages Skeleton */}
    <ScrollView className="flex-1 w-full">
      {[...Array(5)].map((_, index) => (
        <View key={index} className="mt-2">
          <AnimatedSkeletonBox width="100%" height={550} />
        </View>
      ))}
    </ScrollView>
  </LayoutWithTopBar>
);

export default function ChapterReader() {
  const { chapterId, mangaId } = useLocalSearchParams<{
    chapterId: string;
    mangaId: string;
  }>();

  const { user, token, isAuthenticated } = useAuth();
  const [chapter, setChapter] = useState<ChapterPage | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToKeepReading, setAddingToKeepReading] = useState(false);
  const router = useRouter();

  const handelFetchChapter = async () => {
    if (!mangaId || !chapterId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/manga/manga/${mangaId}/chapter/${chapterId}`
      );
      const data = await res.json();
      if (data.success) setChapter(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handelFetchMangaChapters = async () => {
    if (!mangaId) return;
    try {
      const res = await fetch(`${API_URL}/api/manga/manga/${mangaId}/chapters`);
      const data = await res.json();
      if (data.success) setChapters(data.data.chapters);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handelFetchChapter();
  }, [chapterId, mangaId]);

  useEffect(() => {
    handelFetchMangaChapters();
  }, [mangaId]);

  const currentIndex = useMemo(
    () => chapters.findIndex((c) => c.number.toString() === chapterId),
    [chapters, chapterId]
  );

  const currentChapter = useMemo(
    () => chapters.find((c) => c.number.toString() === chapterId),
    [chapters, chapterId]
  );

  // Separate useEffect for adding to keep reading after chapter is loaded
  useEffect(() => {
    if (chapter && mangaId && currentChapter && isAuthenticated && token) {
      addToKeepReading();
    }
  }, [chapter, mangaId, currentChapter, isAuthenticated, token]);

  const chapterOptions = useMemo(
    () =>
      chapters.map((c) => ({
        label: ` ${c.title}`,
        value: c.number.toString(),
      })),
    [chapters]
  );

  const goToChapter = (chapterNumber: string) => {
    if (!mangaId) return;
    router.push(`/chapter/${chapterNumber}?mangaId=${mangaId}`);
  };

  const downloadChapter = async () => {
    if (!chapter || !mangaId || !chapterId) return;

    try {
      // create folder for manga if not exist
      const mangaFolder = `${FileSystem.documentDirectory}manga_${mangaId}`;
      const chapterFolder = `${mangaFolder}/chapter_${chapterId}`;

      const mangaFolderInfo = await FileSystem.getInfoAsync(mangaFolder);
      if (!mangaFolderInfo.exists) {
        await FileSystem.makeDirectoryAsync(mangaFolder, {
          intermediates: true,
        });
      }

      const chapterFolderInfo = await FileSystem.getInfoAsync(chapterFolder);
      if (!chapterFolderInfo.exists) {
        await FileSystem.makeDirectoryAsync(chapterFolder, {
          intermediates: true,
        });
      }

      // download each page
      for (let i = 0; i < chapter.pages.length; i++) {
        const pageUrl = chapter.pages[i];
        const fileUri = `${chapterFolder}/page_${i}.jpg`;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(pageUrl, fileUri);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addToKeepReading = async () => {
    if (
      !mangaId ||
      !chapterId ||
      !token ||
      !isAuthenticated ||
      !currentChapter
    ) {
      return;
    }

    setAddingToKeepReading(true);
    try {
      console.log("Adding to keep reading:", {
        mangaId,
        chapterId: currentChapter.id,
      }); // Debug log
      const result = await APIService.addToKeepReading(
        {
          mangaId: mangaId,
          chapterId: currentChapter.id,
        },
        token
      );

      if (result.success) {
        console.log("Chapter successfully added to keep reading");
      } else {
        console.error("Failed to add to keep reading:", result.message);
      }
    } catch (error) {
      console.error("Error adding to keep reading:", error);
    } finally {
      setAddingToKeepReading(false);
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <AnimatedChapterReaderSkeleton />;
  }

  if (!chapter) {
    return (
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center bg-white">
          <Text style={{ fontFamily: "Doc" }} className="text-red-500">
            لم يتم العثور على الفصل.
          </Text>
        </View>
      </LayoutWithTopBar>
    );
  }

  return (
    <LayoutWithTopBar>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-4   bg-white pt-2 pb-1 ">
        <PathIndicator
          title={chapter.chapterName}
          mangaId={mangaId}
          mangaName={chapter.mangaName}
        />
      </View>

      <View className="flex-row items-center justify-between px-3 py-3  bg-white">
        <View className="flex-row items-center space-x-2">
          <Select
            value={chapterOptions.find((option) => option.value === chapterId)}
            onValueChange={(option) => option && goToChapter(option.value)}
            className="w-48"
          >
            <SelectTrigger>
              <SelectValue
                style={{ fontFamily: "Doc" }}
                placeholder="اختر الفصل"
                className="text-sm text-gray-700"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {chapterOptions.map((option) => (
                  <SelectItem
                    label={option.label}
                    key={option.value}
                    value={option.value}
                    className="text-sm text-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
        <View className="flex-row items-center gap-1 space-x-2">
          <Button
            variant="outline"
            size={"icon"}
            className=" rounded-full w-9 h-9 flex items-center justify-center"
            onPress={downloadChapter}
          >
            <Download size={16} className="" color="#9ca3af" />
          </Button>
          <Button
            variant="outline"
            size={"icon"}
            disabled={currentIndex === chapters.length - 1}
            onPress={() => {
              if (currentIndex < chapters.length - 1) {
                goToChapter(chapters[currentIndex + 1].number.toString());
              }
            }}
            className=" rounded-full w-9 h-9 flex items-center justify-center"
          >
            <ChevronRight size={16} color="#9ca3af" />
          </Button>
          <Button
            variant="outline"
            size={"icon"}
            disabled={currentIndex === 0}
            onPress={() => {
              if (currentIndex > 0) {
                goToChapter(chapters[currentIndex - 1].number.toString());
              }
            }}
            className=" rounded-full w-9 h-9 flex items-center justify-center"
          >
            <ChevronRight
              size={16}
              color="#9ca3af"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1 w-full  ">
        {chapter.pages.map((pageUrl, index) => (
          <Image
            key={index}
            source={{ uri: pageUrl }}
            style={{ width: "100%", height: 550 }}
            className="mt-2"
          />
        ))}
      </ScrollView>
    </LayoutWithTopBar>
  );
}

const PathIndicator = ({
  title,
  mangaId,
  mangaName,
}: {
  title: string;
  mangaId?: string;
  mangaName?: string;
}) => (
  <View className="flex-row items-center space-x-2 gap-1">
    <Link
      href="/"
      style={{ fontFamily: "Doc" }}
      className="text-sm text-[#ff4133]"
    >
      الرئيسية
    </Link>
    <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-500">
      /
    </Text>
    <Link
      href={`/manga/${mangaId}`}
      style={{ fontFamily: "Doc" }}
      className="text-sm text-gray-500"
    >
      {mangaName}
    </Link>
    <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-500">
      /
    </Text>
    <Text
      style={{ fontFamily: "Doc" }}
      className="text-sm text-gray-700 "
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  </View>
);
