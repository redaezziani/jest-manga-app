import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DownloadedChapter {
  id: string;
  number: number;
  title: string;
  path: string;
  pages: string[];
  createdAt: string;
  totalPages: number;
}

interface DownloadedMangaInfo {
  id: string;
  title: string;
  cover: string;
  coverThumbnail: string;
  authors: string[];
  artists: string[];
  genres: string[];
  status: string;
  type: string;
  description: string;
  otherTitles: string[];
  rating: number;
  views: number;
  releaseDate: string;
}

interface DownloadedManga {
  id: string;
  info: DownloadedMangaInfo;
  chapters: DownloadedChapter[];
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadedManga[]>([]);
  const [selectedManga, setSelectedManga] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const docDir = FileSystem.documentDirectory!;
      const dirs = await FileSystem.readDirectoryAsync(docDir);

      // find manga folders
      const mangaFolders = dirs.filter((d) => d.startsWith("manga_"));

      const mangas: DownloadedManga[] = [];

      for (const folder of mangaFolders) {
        const mangaId = folder.replace("manga_", "");
        const mangaPath = `${docDir}${folder}`;

        // Load manga info
        const mangaInfoPath = `${mangaPath}/manga_info.json`;
        let mangaInfo: DownloadedMangaInfo;

        try {
          const infoExists = await FileSystem.getInfoAsync(mangaInfoPath);
          if (infoExists.exists) {
            const infoContent =
              await FileSystem.readAsStringAsync(mangaInfoPath);
            mangaInfo = JSON.parse(infoContent);
          } else {
            // Fallback for old downloads without info
            mangaInfo = {
              id: mangaId,
              title: `مانجا ${mangaId}`,
              cover: "",
              coverThumbnail: "",
              authors: [],
              artists: [],
              genres: [],
              status: "",
              type: "",
              description: "",
              otherTitles: [],
              rating: 0,
              views: 0,
              releaseDate: "",
            };
          }
        } catch (err) {
          console.error("Error reading manga info:", err);
          continue;
        }

        const chapterDirs = await FileSystem.readDirectoryAsync(mangaPath);
        const chapters: DownloadedChapter[] = [];

        for (const ch of chapterDirs) {
          if (ch.startsWith("chapter_")) {
            const chapterId = ch.replace("chapter_", "");
            const chapterPath = `${mangaPath}/${ch}`;

            // Load chapter info
            const chapterInfoPath = `${chapterPath}/chapter_info.json`;
            let chapterInfo;

            try {
              const chapterInfoExists =
                await FileSystem.getInfoAsync(chapterInfoPath);
              if (chapterInfoExists.exists) {
                const chapterContent =
                  await FileSystem.readAsStringAsync(chapterInfoPath);
                chapterInfo = JSON.parse(chapterContent);
              } else {
                // Fallback for old downloads
                chapterInfo = {
                  id: chapterId,
                  title: `الفصل ${chapterId}`,
                  number: parseInt(chapterId),
                  createdAt: "",
                  totalPages: 0,
                };
              }
            } catch (err) {
              console.error("Error reading chapter info:", err);
              continue;
            }

            const pages = await FileSystem.readDirectoryAsync(chapterPath);
            const pageFiles = pages.filter(
              (p) => p.startsWith("page_") && p.endsWith(".jpg")
            );

            chapters.push({
              id: chapterInfo.id,
              number: chapterInfo.number,
              title: chapterInfo.title,
              path: chapterPath,
              pages: pageFiles.map((p) => `${chapterPath}/${p}`),
              createdAt: chapterInfo.createdAt,
              totalPages: pageFiles.length,
            });
          }
        }

        // Sort chapters by number
        chapters.sort((a, b) => a.number - b.number);

        if (chapters.length > 0) {
          mangas.push({
            id: mangaId,
            info: mangaInfo,
            chapters,
          });
        }
      }

      setDownloads(mangas);
    } catch (err) {
      console.error("Error loading downloads:", err);
    }
  };

  const toggleMangaSelection = (mangaId: string) => {
    setSelectedManga(selectedManga === mangaId ? null : mangaId);
  };

  const deleteChapter = async (
    chapterPath: string,
    mangaId: string,
    chapterNumber: number
  ) => {
    try {
      // Delete chapter folder
      await FileSystem.deleteAsync(chapterPath);

      // Reload downloads to update UI
      await loadDownloads();

      Alert.alert("تم الحذف ✅", `تم حذف الفصل ${chapterNumber} بنجاح`);
    } catch (error) {
      console.error("Error deleting chapter:", error);
      Alert.alert("خطأ ❌", "فشل في حذف الفصل");
    }
  };

  const deleteManga = async (mangaId: string, mangaTitle: string) => {
    try {
      const mangaFolder = `${FileSystem.documentDirectory}manga_${mangaId}`;

      // Delete entire manga folder
      await FileSystem.deleteAsync(mangaFolder);

      // Reload downloads to update UI
      await loadDownloads();

      Alert.alert(
        "تم الحذف ✅",
        `تم حذف مانجا "${mangaTitle}" وجميع فصولها بنجاح`
      );
    } catch (error) {
      console.error("Error deleting manga:", error);
      Alert.alert("خطأ ❌", "فشل في حذف المانجا");
    }
  };

  const confirmDeleteChapter = (
    chapterPath: string,
    mangaId: string,
    chapterNumber: number,
    chapterTitle: string
  ) => {
    Alert.alert(
      "حذف الفصل",
      `هل أنت متأكد من رغبتك في حذف "${chapterTitle}"؟ لن تتمكن من التراجع عن هذا الإجراء.`,
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => deleteChapter(chapterPath, mangaId, chapterNumber),
        },
      ]
    );
  };

  const confirmDeleteManga = (mangaId: string, mangaTitle: string) => {
    Alert.alert(
      "حذف المانجا",
      `هل أنت متأكد من رغبتك في حذف مانجا "${mangaTitle}" وجميع فصولها المحملة؟ لن تتمكن من التراجع عن هذا الإجراء.`,
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "حذف الكل",
          style: "destructive",
          onPress: () => deleteManga(mangaId, mangaTitle),
        },
      ]
    );
  };

  const renderMangaCard = (manga: DownloadedManga) => {
    const isSelected = selectedManga === manga.id;

    return (
      <View
        key={manga.id}
        className="mb-6 bg-white rounded-md  border border-gray-400/45"
      >
        <TouchableOpacity
          onPress={() => toggleMangaSelection(manga.id)}
          className="p-4"
        >
          <View className="flex-row">
            {manga.info.cover && (
              <Image
                source={{ uri: manga.info.cover }}
                style={{ width: 80, height: 120 }}
                className="rounded-md border border-gray-300 mr-4"
                resizeMode="cover"
              />
            )}

            <View className="flex-1">
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-lg font-bold text-gray-900 mb-1"
              >
                {manga.info.title}
              </Text>

              {manga.info.otherTitles && manga.info.otherTitles.length > 0 && (
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-500 mb-2 text-sm line-clamp-1"
                >
                  {manga.info.otherTitles.join(" / ")}
                </Text>
              )}

              {manga.info.authors && manga.info.authors.length > 0 && (
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-600 text-sm mb-1"
                >
                  المؤلف: {manga.info.authors.join(", ")}
                </Text>
              )}

              {manga.info.status && (
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-600 text-sm mb-2"
                >
                  الحالة:{" "}
                  {manga.info.status.toLowerCase() === "ongoing"
                    ? "مستمرة"
                    : "مكتملة"}
                </Text>
              )}

              <Text
                style={{ fontFamily: "Doc" }}
                className="text-sm text-primary font-medium"
              >
                {manga.chapters.length} فصل محمل
              </Text>
            </View>
          </View>

          {manga.info.genres && manga.info.genres.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {manga.info.genres.slice(0, 3).map((genre, index) => (
                <View
                  key={`genre-${genre}-${index}`}
                  className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1"
                >
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-xs text-gray-700"
                  >
                    {genre}
                  </Text>
                </View>
              ))}
              {manga.info.genres.length > 3 && (
                <View className="bg-gray-100 px-2 py-1 rounded-full">
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-xs text-gray-700"
                  >
                    +{manga.info.genres.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {isSelected && (
          <View className="border-t border-gray-200 border-dashed p-4">
            {manga.info.description && (
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-gray-700 text-sm line-clamp-3 mb-4 leading-relaxed"
              >
                {manga.info.description}
              </Text>
            )}

            <Text
              style={{ fontFamily: "Doc" }}
              className="text-base font-semibold text-gray-800 mb-3"
            >
              الفصول المحملة
            </Text>

            {manga.chapters.map((chapter) => (
              <View
                key={chapter.id}
                className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2"
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/offline-reader?chapterPath=${encodeURIComponent(chapter.path)}&title=${encodeURIComponent(chapter.title)}`
                    )
                  }
                  className="flex-row items-center flex-1"
                >
                  {chapter.pages[0] && (
                    <Image
                      source={{ uri: chapter.pages[0] }}
                      className="w-12 h-16 rounded mr-3"
                      resizeMode="cover"
                    />
                  )}

                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Doc" }}
                      className="text-gray-800 font-medium"
                    >
                      الفصل {chapter.number}
                    </Text>
                    {chapter.title &&
                      chapter.title !== `الفصل ${chapter.number}` && (
                        <Text
                          style={{ fontFamily: "Doc" }}
                          className="text-gray-600 text-sm"
                        >
                          {chapter.title}
                        </Text>
                      )}
                  </View>

                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-xs text-gray-500 mr-2"
                  >
                    {chapter.totalPages} صفحة
                  </Text>
                </TouchableOpacity>

                {/* Delete chapter button */}
                <TouchableOpacity
                  onPress={() =>
                    confirmDeleteChapter(
                      chapter.path,
                      manga.id,
                      chapter.number,
                      chapter.title
                    )
                  }
                  className="p-2 ml-2"
                >
                  <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {isSelected && (
          <View className="border-t border-gray-200 border-dashed p-4">
            <TouchableOpacity
              className="flex-row items-center gap-2 mb-4"
              onPress={() => confirmDeleteManga(manga.id, manga.info.title)}
            >
              <Trash2 size={14} color="#ef4444" />
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-red-500 text-xs  "
              >
                حذف المانجا وجميع فصولها
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-col mb-6">
        <Text style={{ fontFamily: "Doc" }} className="text-xl  text-gray-900 ">
          مكتبتي
        </Text>
        <Text style={{ fontFamily: "Doc" }} className="text-gray-600  text-sm">
          هنا تجد جميع المانجا والفصول التي قمت بتحميلها للقراءة بدون اتصال
          بالإنترنت.
        </Text>
      </View>

      {downloads.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-20">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-gray-600 text-center text-lg"
          >
            لا توجد مانجا محملة
          </Text>
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-gray-500 text-center mt-2"
          >
            قم بتحميل بعض الفصول لتظهر هنا
          </Text>
        </View>
      ) : (
        downloads.map((manga) => renderMangaCard(manga))
      )}
    </ScrollView>
  );
}
