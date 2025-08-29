import { MangaDetailSkeleton } from "@/components/Details-Manga-S";
import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import { Chapter } from "@/type/chapter";
import { MangaExtended } from "@/type/manga";
import { API_URL } from "@/utils";
import * as FileSystem from "expo-file-system";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Download } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [manga, setManga] = useState<MangaExtended | null>(null);
  const [similar, setSimilar] = useState<MangaExtended[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWithDelay = async () => {
      setLoading(true); // show skeleton immediately

      // fake delay function
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      try {
        // fetch manga details
        const res1 = await fetch(`${API_URL}/api/manga/info/${id}`);
        const data1 = await res1.json();
        setManga(data1.data.mangaDetails);
        setSimilar(data1.data.similarManga);

        // fetch chapters
        const res2 = await fetch(`${API_URL}/api/manga/manga/${id}/chapters`);
        const data2 = await res2.json();
        if (data2.success) setChapters(data2.data.chapters);

        // wait 1-2 seconds before hiding skeleton
        await sleep(1500);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithDelay();
  }, [id]);

  const handelFetchMangaDetails = () => {
    fetch(`${API_URL}/api/manga/info/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setManga(data.data.mangaDetails);
        setSimilar(data.data.similarManga);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handelFetchChapters = () => {
    fetch(`${API_URL}/api/manga/manga/${id}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChapters(data.data.chapters);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const renderMangaCard = (item: MangaExtended) => (
    <View className="flex-1 px-2 mb-4 " key={item.id}>
      <Image
        source={{ uri: item.coverThumbnail }}
        style={{
          width: "100%",
          height: 245,
          borderRadius: 10,
        }}
        resizeMode="cover"
        className="border border-gray-300"
      />
      <View className="pt-2 px-1">
        <Text
          onPress={() => router.push(`/manga/${item.id}`)}
          style={{ fontFamily: "Arabic" }}
          className="text-sm font-bold line-clamp-1 text-gray-900 mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text className="text-xs text-gray-600 mb-2" numberOfLines={1}>
          {item.authors.join(", ")}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-xs text-gray-500 capitalize"
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView className="flex-1 bg-white">
          <MangaDetailSkeleton />
        </ScrollView>
      </LayoutWithTopBar>
    );
  }

  const downloadChapter = async (chapter: Chapter) => {
    try {
      if (!manga) return;

      const mangaFolder = `${FileSystem.documentDirectory}manga_${manga.id}`;
      const chapterFolder = `${mangaFolder}/chapter_${chapter.id}`;

      // make sure folders exist
      const mangaInfo = await FileSystem.getInfoAsync(mangaFolder);
      if (!mangaInfo.exists) {
        await FileSystem.makeDirectoryAsync(mangaFolder, {
          intermediates: true,
        });
      }

      const chapterInfo = await FileSystem.getInfoAsync(chapterFolder);
      if (!chapterInfo.exists) {
        await FileSystem.makeDirectoryAsync(chapterFolder, {
          intermediates: true,
        });
      }

      // fetch chapter data (pages) from API
      const res = await fetch(`${API_URL}/api/manga/chapter/${chapter.id}`);
      const data = await res.json();

      if (!data.success) throw new Error("Failed to fetch chapter");

      const pages: string[] = data.data.pages;

      // download each page
      for (let i = 0; i < pages.length; i++) {
        const pageUrl = pages[i];
        const fileUri = `${chapterFolder}/page_${i + 1}.jpg`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(pageUrl, fileUri);
        }
      }

      Alert.alert("نجاح ✅", `تم تحميل الفصل ${chapter.number}`);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ ❌", "فشل تحميل الفصل");
    }
  };

  return (
    <LayoutWithTopBar>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-4 mt-4 pt-2 pb-1 ">
        <PathIndicator title={manga ? manga.title : "تفاصيل المانجا"} />
      </View>
      <ScrollView className="flex-1 bg-white px-2">
        {manga && (
          <>
            <Image
              source={{ uri: manga.cover }}
              style={{ width: 220, height: 350 }}
              className="my-4 rounded-md border border-gray-300"
            />

            <View className="px-2 py-2">
              <Text
                style={{ fontFamily: "Arabic" }}
                className="text-xl font-bold text-gray-900 mb-1"
              >
                {manga.title}
              </Text>

              {manga.otherTitles.length > 0 && (
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-500 mb-2"
                >
                  {manga.otherTitles.join(" / ")}
                </Text>
              )}

              <View className="mb-3">
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-500 text-sm"
                >
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className=" text-sm text-gray-700"
                  >
                    المؤلف:{" "}
                  </Text>
                  {manga.authors.join(", ")}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-500 text-sm"
                >
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className=" text-sm text-gray-700"
                  >
                    الرسام:{" "}
                  </Text>
                  {manga.artists.join(", ")}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-500 text-sm"
                >
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className=" text-sm text-gray-700"
                  >
                    النوع:{" "}
                  </Text>
                  {manga.type}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-500 text-sm"
                >
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className=" text-sm text-gray-700"
                  >
                    الحالة:{" "}
                  </Text>
                  {manga.status.toLowerCase() === "ongoing"
                    ? "مستمرة"
                    : "مكتملة"}
                </Text>
              </View>

              {manga.genres.length > 0 && (
                <View className="flex-row flex-wrap mb-4">
                  {manga.genres.map((genre, index) => (
                    <View
                      key={`genre-${genre}-${index}`}
                      className="bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text
                        style={{ fontFamily: "Arabic" }}
                        className="text-sm text-gray-700"
                      >
                        {genre}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text
                style={{ fontFamily: "Arabic" }}
                className="text-gray-800 leading-relaxed"
              >
                {manga.description}
              </Text>
            </View>

            {similar.length > 0 && (
              <View className="py-4 px-2">
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-xl  text-gray-900 mb-2"
                >
                  مانجا مشابهة
                </Text>
                <View style={{ height: 330 }} className="relative">
                  <Swiper
                    showsPagination={true}
                    autoplay={false}
                    loop={false}
                    dotStyle={{ display: "none" }}
                    activeDotStyle={{ display: "none" }}
                    showsButtons={false}
                    className="mt-2"
                  >
                    {similar
                      .reduce((resultArray: MangaExtended[][], item, index) => {
                        const chunkIndex = Math.floor(index / 2);
                        if (!resultArray[chunkIndex]) {
                          resultArray[chunkIndex] = [];
                        }
                        resultArray[chunkIndex].push(item);
                        return resultArray;
                      }, [])
                      .map((pair, index) => (
                        <View className="flex-row " key={index}>
                          {pair.map((manga) => renderMangaCard(manga))}
                          {pair.length === 1 && (
                            <View className="flex-1 mx-2" />
                          )}
                        </View>
                      ))}
                  </Swiper>
                </View>
              </View>
            )}
          </>
        )}
        {chapters.length > 0 && (
          <View className="px-2 py-4">
            <Text
              style={{ fontFamily: "Arabic" }}
              className="text-xl  text-gray-900 mb-2"
            >
              الفصول
            </Text>
            {chapters.map((chapter) => (
              <View
                key={chapter.id}
                className="py-2 flex-row items-center justify-between"
              >
                {/* Open chapter */}
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/chapter/${chapter.number}?mangaId=${id}`)
                  }
                >
                  <Text
                    style={{ fontFamily: "Arabic" }}
                    className="text-gray-800 text-sm"
                  >
                    {chapter.number} - {chapter.title}
                  </Text>
                </TouchableOpacity>

                {/* Download button */}
                <Button
                  variant="ghost"
                  size={"icon"}
                  className=" rounded-full w-6 h-6 flex items-center justify-center"
                  onPress={() => downloadChapter(chapter)}
                >
                  <Download size={12} className="" color="#ff4D00" />
                </Button>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LayoutWithTopBar>
  );
}

const PathIndicator = ({ title }: { title: string }) => (
  <View className="flex-row items-center gap-1 space-x-2">
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
    <Text
      style={{ fontFamily: "Arabic" }}
      className="text-sm text-gray-700 font-bold"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  </View>
);
