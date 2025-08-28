import CustomSelect from "@/components/ui/Custome-Select";
import { Chapter, ChapterPage } from "@/type/chapter";
import { API_URL } from "@/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChapterReader() {
  const { chapterId, mangaId } = useLocalSearchParams<{
    chapterId: string;
    mangaId: string;
  }>();

  const [chapter, setChapter] = useState<ChapterPage | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff4D00" />
        <Text style={{ fontFamily: "Arabic" }} className="text-gray-500 mt-2">
          جاري تحميل الفصل...
        </Text>
      </View>
    );
  }

  if (!chapter) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text style={{ fontFamily: "Arabic" }} className="text-red-500">
          لم يتم العثور على الفصل.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between h-12 px-4 bg-white border-b border-gray-300">
        <Text
          style={{ fontFamily: "Arabic" }}
          className="text-base text-gray-800"
          numberOfLines={1}
        >
          <Text
            onPress={() => router.push("/")}
            style={{ fontFamily: "Arabic" }}
          >
            رغبة <Text style={{ color: "#5d3aca" }}>مانجا</Text>
          </Text>
          / {chapter.mangaName} / {chapter.chapterName}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={22} color="#5d3aca" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between px-3 py-3 border-b border-gray-200 bg-gray-50">
        <TouchableOpacity
          disabled={currentIndex === chapters.length - 1}
          onPress={() => {
            if (chapters[currentIndex + 1])
              goToChapter(chapters[currentIndex + 1].id);
          }}
          className="p-2 rounded-full"
          style={{
            backgroundColor:
              currentIndex === chapters.length - 1 ? "#f0f0f0" : "#fff",
            elevation: currentIndex === chapters.length - 1 ? 0 : 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <ChevronLeft
            size={24}
            color={currentIndex === chapters.length - 1 ? "#ccc" : "#5d3aca"}
          />
        </TouchableOpacity>

        <View className="flex-1 mx-3">
          <CustomSelect
            options={chapterOptions}
            selectedValue={chapterId}
            onValueChange={goToChapter}
            placeholder="اختر فصلاً"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          />
        </View>

        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => {
            if (chapters[currentIndex - 1])
              goToChapter(chapters[currentIndex - 1].id);
          }}
          className="p-2 rounded-full"
          style={{
            backgroundColor: currentIndex === 0 ? "#f0f0f0" : "#fff",
            elevation: currentIndex === 0 ? 0 : 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <ChevronRight
            size={24}
            color={currentIndex === 0 ? "#ccc" : "#5d3aca"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-white px-2 mt-2">
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
    </>
  );
}
