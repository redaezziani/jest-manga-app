import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define types for chapter and manga data
interface ChapterPage {
  mangaId: string;
  chapterId: string;
  mangaName: string;
  chapterName: string;
  chapterNumber: number;
  pages: string[];
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  createdAt: string;
}

export default function ChapterReader() {
  const { chapterId, mangaId } = useLocalSearchParams<{
    chapterId: string;
    mangaId: string;
  }>();

  const [chapter, setChapter] = useState<ChapterPage | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const API_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:8082"
      : "http://localhost:8082";

  // Fetch chapter pages
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/manga/manga/${mangaId}/chapter/${chapterId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setChapter(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [chapterId, mangaId]);

  // Fetch chapters list
  useEffect(() => {
    fetch(`${API_URL}/api/manga/manga/${mangaId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setChapters(data.data.chapters);
      })
      .catch((err) => console.error(err));
  }, [mangaId]);

  const currentIndex = useMemo(
    () => chapters.findIndex((c) => c.id === chapterId),
    [chapters, chapterId]
  );

  const goToChapter = (number: string) => {
    // /chapter/:chapter?mangaId=
    router.push(`/chapter/${number}?mangaId=${mangaId}`);
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
      {/* Header */}
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

      {/* Chapter navigation */}
      <View className="flex-row items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        {/* Prev button */}
        <TouchableOpacity
          disabled={currentIndex === chapters.length - 1}
          onPress={() => {
            if (chapters[currentIndex + 1])
              goToChapter(chapters[currentIndex + 1].id);
          }}
          className="p-2"
        >
          <ChevronLeft
            size={24}
            color={currentIndex === chapters.length - 1 ? "#ccc" : "#5d3aca"}
          />
        </TouchableOpacity>

        {/* Chapter selector */}
        <View className="flex-1 mx-3 border border-gray-300 rounded-md bg-white">
          <Picker
            selectedValue={chapterId}
            onValueChange={(value) => goToChapter(value)}
          >
            {chapters.map((c) => (
              <Picker.Item
                key={c.number}
                label={`الفصل ${c.number} - ${c.title}`}
                value={c.number}
              />
            ))}
          </Picker>
        </View>

        {/* Next button */}
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => {
            if (chapters[currentIndex - 1])
              goToChapter(chapters[currentIndex - 1].id);
          }}
          className="p-2"
        >
          <ChevronRight
            size={24}
            color={currentIndex === 0 ? "#ccc" : "#5d3aca"}
          />
        </TouchableOpacity>
      </View>

      {/* Pages */}
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
