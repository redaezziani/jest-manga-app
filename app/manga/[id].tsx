import { MangaDetailSkeleton } from "@/components/Details-Manga-S";
import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { Button } from "@/components/ui/button";
import { Chapter } from "@/type/chapter";
import { MangaExtended } from "@/type/manga";
import { API_URL } from "@/utils";
import * as FileSystem from "expo-file-system";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Book, Download } from "lucide-react-native";
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
  const [downloadedChapters, setDownloadedChapters] = useState<Set<string>>(
    new Set()
  );
  const [downloadingChapters, setDownloadingChapters] = useState<Set<string>>(
    new Set()
  );
  const router = useRouter();

  useEffect(() => {
    handelFetchMangaDetails();
    handelFetchChapters();
    checkDownloadedChapters();
  }, [id]);

  const checkDownloadedChapters = async () => {
    if (!id) return;

    try {
      const mangaFolder = `${FileSystem.documentDirectory}manga_${id}`;
      const mangaInfo = await FileSystem.getInfoAsync(mangaFolder);

      if (mangaInfo.exists) {
        const chapterDirs = await FileSystem.readDirectoryAsync(mangaFolder);
        const downloaded = new Set<string>();

        for (const dir of chapterDirs) {
          if (dir.startsWith("chapter_")) {
            const chapterId = dir.replace("chapter_", "");
            downloaded.add(chapterId);
          }
        }

        setDownloadedChapters(downloaded);
      }
    } catch (err) {
      console.error("Error checking downloaded chapters:", err);
    }
  };

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

      // Mark as downloading
      setDownloadingChapters((prev) => new Set(prev).add(chapter.id));

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

      // Save manga info if not already saved
      const mangaInfoPath = `${mangaFolder}/manga_info.json`;
      const mangaInfoExists = await FileSystem.getInfoAsync(mangaInfoPath);
      if (!mangaInfoExists.exists) {
        const mangaData = {
          id: manga.id,
          title: manga.title,
          cover: manga.cover,
          coverThumbnail: manga.coverThumbnail,
          authors: manga.authors,
          artists: manga.artists,
          genres: manga.genres,
          status: manga.status,
          type: manga.type,
          description: manga.description,
          otherTitles: manga.otherTitles,
          rating: manga.rating,
          views: manga.views,
          releaseDate: manga.releaseDate,
        };
        await FileSystem.writeAsStringAsync(
          mangaInfoPath,
          JSON.stringify(mangaData)
        );
      }

      // fetch chapter data (pages) from API
      console.log(
        `Fetching chapter: ${API_URL}/api/manga/manga/${id}/chapter/${chapter.number}`
      );
      const res = await fetch(
        `${API_URL}/api/manga/manga/${id}/chapter/${chapter.number}`
      );
      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch chapter");
      }

      // Extract pages from the response - the structure might be different
      let pages: string[] = [];
      if (data.data.pages) {
        pages = data.data.pages;
      } else if (data.data && Array.isArray(data.data)) {
        pages = data.data;
      } else {
        throw new Error("No pages found in API response");
      }

      // Save chapter info
      const chapterInfoPath = `${chapterFolder}/chapter_info.json`;
      const chapterData = {
        id: chapter.id,
        title: chapter.title,
        number: chapter.number,
        createdAt: chapter.createdAt,
        totalPages: pages.length,
      };
      await FileSystem.writeAsStringAsync(
        chapterInfoPath,
        JSON.stringify(chapterData)
      );

      // download each page
      console.log(`Starting download of ${pages.length} pages`);
      for (let i = 0; i < pages.length; i++) {
        const pageUrl = pages[i];
        const fileUri = `${chapterFolder}/page_${i + 1}.jpg`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
          console.log(`Downloading page ${i + 1}/${pages.length}: ${pageUrl}`);
          await FileSystem.downloadAsync(pageUrl, fileUri);
        } else {
          console.log(`Page ${i + 1} already exists, skipping`);
        }
      }

      console.log(`Successfully downloaded all ${pages.length} pages`);
      Alert.alert(
        "نجاح ✅",
        `تم تحميل الفصل ${chapter.number} بنجاح (${pages.length} صفحة)`
      );

      // Refresh downloaded chapters list
      checkDownloadedChapters();
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "فشل تحميل الفصل";
      Alert.alert("خطأ ❌", `فشل تحميل الفصل: ${errorMessage}`);
    } finally {
      // Remove from downloading state
      setDownloadingChapters((prev) => {
        const updated = new Set(prev);
        updated.delete(chapter.id);
        return updated;
      });
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
            {chapters.map((chapter) => {
              const isDownloaded = downloadedChapters.has(chapter.id);
              const isDownloading = downloadingChapters.has(chapter.id);

              return (
                <View
                  key={chapter.id}
                  className="py-2 flex-row items-center justify-between"
                >
                  {/* Chapter title and reading options */}
                  <View className="flex-1">
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

                    {isDownloading && (
                      <Text
                        style={{ fontFamily: "Arabic" }}
                        className="text-blue-600 text-xs mt-1"
                      >
                        ⬇️ جاري التحميل...
                      </Text>
                    )}
                  </View>

                  {isDownloaded && (
                    <TouchableOpacity
                      onPress={() => {
                        const chapterPath = `${FileSystem.documentDirectory}manga_${id}/chapter_${chapter.id}`;
                        router.push(
                          `/offline-reader?chapterPath=${encodeURIComponent(chapterPath)}&title=${encodeURIComponent(`الفصل ${chapter.number}`)}`
                        );
                      }}
                      className="rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <Book size={12} color={"#374151"} />
                    </TouchableOpacity>
                  )}
                  {!isDownloaded && (
                    <Button
                      variant="ghost"
                      size={"icon"}
                      className="rounded-full w-6 h-6 flex items-center justify-center"
                      onPress={() => downloadChapter(chapter)}
                      disabled={isDownloaded || isDownloading}
                    >
                      <Download color={"#ff4133"} size={12} className="" />
                    </Button>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </LayoutWithTopBar>
  );
}

const PathIndicator = ({ title }: { title: string }) => (
  <View className="flex-row items-center gap-1 space-x-2">
    <Link href="/" style={{ fontFamily: "Arabic" }} className=" text-[#ff4133]">
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
