import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface DownloadedChapter {
  id: string;
  number: string;
  title: string;
  path: string;
  pages: string[];
}

interface DownloadedManga {
  id: string;
  title: string;
  chapters: DownloadedChapter[];
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadedManga[]>([]);
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
        const chapterDirs = await FileSystem.readDirectoryAsync(mangaPath);

        const chapters: DownloadedChapter[] = [];

        for (const ch of chapterDirs) {
          if (ch.startsWith("chapter_")) {
            const chapterId = ch.replace("chapter_", "");
            const chapterPath = `${mangaPath}/${ch}`;
            const pages = await FileSystem.readDirectoryAsync(chapterPath);

            chapters.push({
              id: chapterId,
              number: chapterId,
              title: `الفصل ${chapterId}`,
              path: chapterPath,
              pages: pages.map((p) => `${chapterPath}/${p}`),
            });
          }
        }

        mangas.push({
          id: mangaId,
          title: `مانجا ${mangaId}`,
          chapters,
        });
      }

      setDownloads(mangas);
    } catch (err) {
      console.error("Error loading downloads:", err);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text
        style={{ fontFamily: "Arabic" }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        مكتبتي
      </Text>

      {downloads.length === 0 ? (
        <Text
          style={{ fontFamily: "Arabic" }}
          className="text-gray-600 text-center mt-10"
        >
          لا توجد فصول محملة
        </Text>
      ) : (
        downloads.map((manga) => (
          <View key={manga.id} className="mb-6">
            <Text
              style={{ fontFamily: "Arabic" }}
              className="text-xl font-semibold text-gray-800 mb-2"
            >
              {manga.title}
            </Text>

            {manga.chapters.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                className="flex-row items-center justify-between bg-gray-100 rounded-xl p-3 mb-2"
                onPress={() =>
                  router.push({
                    pathname: "/offline-reader",
                    params: {
                      chapterPath: ch.path,
                      title: ch.title,
                    },
                  })
                }
              >
                {/* first page preview */}
                {ch.pages[0] && (
                  <Image
                    source={{ uri: ch.pages[0] }}
                    className="w-16 h-20 rounded mr-3"
                  />
                )}

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-800 text-lg flex-1"
                >
                  {ch.title}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-sm text-gray-500"
                >
                  {ch.pages.length} صفحة
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}
