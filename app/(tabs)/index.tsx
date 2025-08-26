import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

interface Manga {
  id: string;
  title: string;
  slug: string;
  rating: number;
  coverThumbnail: string;
  cover: string;
  authors: string[];
  artists: string[];
  platform: string;
  type: string;
  releaseDate: string;
  status: string;
  genres: string[];
  views: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomeScreen() {
  const [latestManga, setLatestManga] = useState<Manga[]>([]);
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const swiperRefLatest = useRef<Swiper | null>(null);
  const swiperRefPopular = useRef<Swiper | null>(null);

  const router = useRouter();

  const API_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:8082"
      : "http://localhost:8082";

  const fetchManga = async () => {
    try {
      const latestRes = await fetch(`${API_URL}/api/manga/latest`);
      const latestData = await latestRes.json();
      setLatestManga(latestData);

      const popularRes = await fetch(`${API_URL}/api/manga/popular`);
      const popularData = await popularRes.json();
      setPopularManga(popularData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchManga();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchManga();
    setRefreshing(false);
  };

  const getMangaPairs = (list: Manga[]) => {
    const pairs = [];
    for (let i = 0; i < list.length; i += 2) {
      pairs.push(list.slice(i, i + 2));
    }
    return pairs;
  };

  const renderMangaCard = (item: Manga) => (
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

  const renderMangaPair = (pair: Manga[], index: number) => (
    <View className="flex-row px-4" key={index}>
      {pair.map((manga) => renderMangaCard(manga))}
      {pair.length === 1 && <View className="flex-1 mx-2" />}
    </View>
  );

  const renderSwiperSection = (
    title: string,
    description: string,
    mangaList: Manga[],
    swiperRef: React.RefObject<Swiper | null>
  ) => {
    const mangaPairs = getMangaPairs(mangaList);

    return (
      <View className="my-4">
        <View className="px-4 py-2">
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-gray-700 text-lg font-semibold"
          >
            {title}
          </Text>
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-xs text-gray-600"
          >
            {description}
          </Text>
        </View>

        {mangaList.length > 0 ? (
          <View style={{ height: 330 }} className="relative">
            <Swiper
              ref={swiperRef}
              showsPagination={true}
              autoplay={false}
              loop={false}
              dotStyle={{ display: "none" }}
              activeDotStyle={{ display: "none" }}
              showsButtons={false}
              className="mt-2"
            >
              {mangaPairs.map((pair, index) => renderMangaPair(pair, index))}
            </Swiper>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-md">جارٍ تحميل المانجا...</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderSwiperSection(
        "أحدث المانجا",
        "تصفح أحدث الإضافات إلى مكتبتنا المتنامية من المانجا",
        latestManga,
        swiperRefLatest
      )}

      {renderSwiperSection(
        "المانجا الشعبية",
        "أفضل المانجا التي يحبها المستخدمون",
        popularManga,
        swiperRefPopular
      )}
    </ScrollView>
  );
}
