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
import { Chapter, ChapterPage } from "@/type/chapter";
import { API_URL } from "@/utils";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
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
    <LayoutWithTopBar>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-4 mt-6  bg-white pt-2 pb-1 ">
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
            onValueChange={(value) => goToChapter(value.value)}
            className="w-48"
          >
            <SelectTrigger>
              <SelectValue
                style={{ fontFamily: "Arabic" }}
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
            disabled={currentIndex === chapters.length - 1}
            onPress={() => {
              if (currentIndex < chapters.length - 1) {
                goToChapter(chapters[currentIndex + 1].id);
              }
            }}
            className=" rounded-full w-9 h-9 flex items-center justify-center"
          >
            <ChevronRight size={16} color="#ff4D00" />
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
              color="#ff4D00"
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
      style={{ fontFamily: "Arabic" }}
      className="text-sm text-[#ff4D00]"
    >
      الرئيسية
    </Link>
    <Text style={{ fontFamily: "Arabic" }} className="text-sm text-gray-500">
      /
    </Text>
    <Link
      href={`/manga/${mangaId}`}
      style={{ fontFamily: "Arabic" }}
      className="text-sm text-gray-500"
    >
      {mangaName}
    </Link>
    <Text style={{ fontFamily: "Arabic" }} className="text-sm text-gray-500">
      /
    </Text>
    <Text
      style={{ fontFamily: "Arabic" }}
      className="text-sm text-gray-700 "
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  </View>
);
