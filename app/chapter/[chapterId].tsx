import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChapterPage {
  mangaId: string;
  chapterId: string;
  mangaName: string;
  chapterName: string;
  chapterNumber: number;
  pages: string[];
}

export default function ChapterReader() {
  const { chapterId, mangaId } = useLocalSearchParams<{
    chapterId: string;
    mangaId: string;
  }>();

  console.log("Params:", { chapterId, mangaId });
  const [chapter, setChapter] = useState<ChapterPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL =
      Platform.OS === "android"
        ? "http://10.0.2.2:8082"
        : "http://localhost:8082";

    fetch(`${API_URL}/api/manga/manga/${mangaId}/chapter/${chapterId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChapter(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [chapterId, mangaId]);

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

  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row  flex items-end justify-between h-24 px-4 py-3 bg-white border-b border-gray-300 ">
        <Text
          style={{ fontFamily: "Arabic" }}
          className="text-base flex-row  mt-2 text-gray-800"
          numberOfLines={1}
        >
          <Text
            onPress={() => router.push("/")}
            style={{ fontFamily: "Arabic" }}
          >
            رغبة <Text style={{ color: "#ff4D00" }}>مانجا</Text>
          </Text>
          / {chapter.mangaName} / {chapter.chapterName}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="">
          <ChevronLeft size={20} color="#ff4D00" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 bg-white px-2">
        {chapter.pages.map((pageUrl, index) => (
          <Image
            key={index}
            source={{ uri: pageUrl }}
            style={{ width: "100%", height: 600 }}
            className="my-2 rounded-md"
            resizeMode="contain"
          />
        ))}
      </ScrollView>
    </>
  );
}
