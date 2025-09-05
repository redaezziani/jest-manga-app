import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface MangaCardProps {
  manga: {
    id: string;
    title: string;
    coverThumbnail?: string;
    cover: string;
    status: string;
    genres?: string[];
    authors?: string[];
    description?: string;
  };
  showActions?: boolean;
  actionIcon?: React.ReactNode;
}

export const MangaCard: React.FC<MangaCardProps> = ({
  manga,
  showActions = false,
  actionIcon,
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-white rounded-md border border-gray-400/35 p-3 mb-3 "
      onPress={() => router.push(`/manga/${manga.id}`)}
    >
      <View className="flex-row">
        <Image
          source={{ uri: manga.coverThumbnail || manga.cover }}
          style={{
            width: 80,
            height: 120,
          }}
          className="border border-gray-400/35 rounded-sm mr-3"
        />

        <View className="flex-1 mr-3">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-lg font-bold text-gray-900 mb-2"
            numberOfLines={2}
          >
            {manga.title}
          </Text>

          {manga.description && (
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-sm text-gray-600 mb-2"
              numberOfLines={3}
            >
              {manga.description}
            </Text>
          )}

          {manga.genres && (
            <View className="flex-row flex-wrap gap-1 mb-2">
              {manga.genres.slice(0, 3).map((genre, index) => (
                <View
                  key={index}
                  className="bg-gray-100 rounded-full px-2 py-1"
                >
                  <Text
                    style={{ fontFamily: "Doc" }}
                    className="text-xs text-gray-600"
                  >
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-xs text-gray-500"
            >
              {manga.status === "ongoing" ? "مستمرة" : "مكتملة"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
