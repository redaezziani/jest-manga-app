import { MangaExtended } from "@/type/manga";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import Swiper from "react-native-swiper";

interface SimilarMangaProps {
  similarManga: MangaExtended[];
}

export const SimilarManga: React.FC<SimilarMangaProps> = ({ similarManga }) => {
  const router = useRouter();

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
          style={{ fontFamily: "Doc" }}
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
            style={{ fontFamily: "Doc" }}
            className="text-xs text-gray-500 capitalize"
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (similarManga.length === 0) {
    return null;
  }

  return (
    <View className="py-4 px-2">
      <Text
        style={{ fontFamily: "Doc" }}
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
          {similarManga
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
                {pair.length === 1 && <View className="flex-1 mx-2" />}
              </View>
            ))}
        </Swiper>
      </View>
    </View>
  );
};
