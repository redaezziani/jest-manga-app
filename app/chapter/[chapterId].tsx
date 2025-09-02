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
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

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
    // Automatically add to keep reading when chapter loads
    if (mangaId && chapterId && isAuthenticated && token) {
      addToKeepReading();
    }
  }, [chapterId, mangaId, isAuthenticated, token]);
  useEffect(() => {
    handelFetchMangaChapters();
  }, [mangaId]);

  const currentIndex = useMemo(
    () => chapters.findIndex((c) => c.id === chapterId),
    [chapters, chapterId]
  );

  const chapterOptions = useMemo(
    () =>
      chapters.map((c) => ({
        label: `الفصل ${c.number} - ${c.title}`,
        value: c.id,
      })),
    [chapters]
  );

  const goToChapter = (chapterIdToGo: string) => {
    router.push(`/chapter/${chapterIdToGo}?mangaId=${mangaId}`);
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

      Alert.alert("نجاح ✅", "تم تحميل الفصل ويمكنك قراءته في المكتبة");
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ ❌", "فشل تحميل الفصل");
    }
  };

  const addToKeepReading = async () => {
    if (!mangaId || !chapterId || !token || !isAuthenticated) {
      // Silently return if not authenticated - no alert needed
      return;
    }

    setAddingToKeepReading(true);
    try {
      const result = await APIService.addToKeepReading(
        {
          mangaId: mangaId,
          chapterId: chapter?.chapterId!,
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff4133" />
        <Text style={{ fontFamily: "Doc" }} className="text-gray-500 mt-2">
          جاري تحميل الفصل...
        </Text>
      </View>
    );
  }

  if (!chapter) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text style={{ fontFamily: "Doc" }} className="text-red-500">
          لم يتم العثور على الفصل.
        </Text>
      </View>
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
            onValueChange={(value) => value && goToChapter(value.value)}
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
            <Download size={16} className="" color="#ff4133" />
          </Button>
          <Button
            variant="outline"
            size={"icon"}
            disabled={currentIndex === chapters.length - 1}
            onPress={() => {
              if (currentIndex < chapters.length - 1) {
                goToChapter(chapters[currentIndex + 1].id);
              }
            }}
            className=" rounded-full w-9 h-9 flex items-center justify-center"
          >
            <ChevronRight size={16} color="#ff4133" />
          </Button>
          <Button
            variant="outline"
            size={"icon"}
            disabled={currentIndex === 0}
            onPress={() => {
              if (currentIndex > 0) {
                goToChapter(chapters[currentIndex - 1].id);
              }
            }}
            className=" rounded-full w-9 h-9 flex items-center justify-center"
          >
            <ChevronRight
              size={16}
              color="#ff4133"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1 bg-white px-2">
        {chapter.pages.map((pageUrl, index) => (
          <Image
            key={index}
            source={{ uri: pageUrl }}
            style={{ width: "100%", height: 550 }}
            className="mt-2"
            resizeMode="contain"
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
