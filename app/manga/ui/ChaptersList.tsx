import { Button } from "@/components/ui/button";
import { Chapter } from "@/type/chapter";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { Book, Download } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ChaptersListProps {
  chapters: Chapter[];
  mangaId: string;
  downloadedChapters: Set<string>;
  downloadingChapters: Set<string>;
  onDownloadChapter: (chapter: Chapter) => void;
}

export const ChaptersList: React.FC<ChaptersListProps> = ({
  chapters,
  mangaId,
  downloadedChapters,
  downloadingChapters,
  onDownloadChapter,
}) => {
  const router = useRouter();

  if (chapters.length === 0) {
    return null;
  }

  return (
    <View className="px-2 py-4">
      <Text
        style={{ fontFamily: "Doc" }}
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
                  router.push(`/chapter/${chapter.number}?mangaId=${mangaId}`)
                }
              >
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-800 text-sm"
                >
                  {chapter.number} - {chapter.title}
                </Text>
              </TouchableOpacity>
            </View>

            {isDownloaded && (
              <TouchableOpacity
                onPress={() => {
                  const chapterPath = `${FileSystem.documentDirectory}manga_${mangaId}/chapter_${chapter.id}`;
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
                onPress={() => onDownloadChapter(chapter)}
                disabled={isDownloaded || isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size={12} color="#ff4133" />
                ) : (
                  <Download color={"#ff4133"} size={12} className="" />
                )}
              </Button>
            )}
          </View>
        );
      })}
    </View>
  );
};
