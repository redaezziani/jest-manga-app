import Manga from "@/type/manga";
import { API_URL } from "@/utils";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import Swiper from "react-native-swiper";

export default function HomeScreen() {
  const [latestManga, setLatestManga] = useState<Manga[]>([]);
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const swiperRefLatest = useRef<Swiper | null>(null);
  const swiperRefPopular = useRef<Swiper | null>(null);

  const router = useRouter();

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
    <Link href={`/manga/${item.id}`} className="flex-1 px-2  " key={item.id}>
      <View className=" p-1 border relative border-gray-300 bg-gray-100 w-full rounded-md ">
        <Image
          source={{ uri: item.coverThumbnail }}
          style={{
            width: "100%",
            height: 245,
            borderRadius: 5,
          }}
          resizeMode="cover"
          className="border border-gray-300"
        />
        <View className="absolute top-0 left-2 bg-amber-300 h-10 rounded-b-[0.2rem]  bg-opacity-50 px-2 py-1 rounded">
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-sm text-amber-900 font-bold mt-1"
          >
            {item.rating}
          </Text>
        </View>
      </View>

      <View className="pt-10 px-1">
        <Text
          style={{ fontFamily: "Arabic" }}
          className="text-sm font-bold line-clamp-1 text-gray-900 mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={{ fontFamily: "Arabic" }}
          className="text-xs text-gray-600 mb-2"
          numberOfLines={1}
        >
          {item.authors && item.authors.length > 0 && item.authors[0] !== ""
            ? item.authors.join(", ")
            : "غير معروف"}
        </Text>
        <View className="flex-row items-center space-x-2 gap-1">
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-xs text-gray-500 capitalize"
          >
            {item.status.toLowerCase() === "ongoing"
              ? "مستمرة"
              : item.status.toLowerCase()}
          </Text>
        </View>
      </View>
    </Link>
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
            <Text
              style={{
                fontFamily: "Arabic",
              }}
              className="text-gray-500 text-md"
            >
              جارٍ تحميل المانجا...
            </Text>
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
      <View className=" h-72 w-full relative flex justify-center items-center">
        <Image
          source={{
            uri:"https://t3.ftcdn.net/jpg/07/32/10/90/360_F_732109080_4lXwGofazqAiysUpcCnrbflsNOl9EMdW.jpg"
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          className=" z-0"
        />
        <View className="absolute inset-0 z-20 backdrop-blur-lg bg-black opacity-70" />
        <View className="absolute z-30 px-4">
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-2xl text-white mb-2"
          >
            مرحبًا بك في Desire Manga
          </Text>
          <Text
            style={{ fontFamily: "Arabic" }}
            className="text-sm text-white mb-4"
          >
            استكشف مجموعتنا الواسعة من المانجا واستمتع بقراءة قصصك المفضلة.
          </Text>
          <View className="bg-white bg-opacity-90 px-4 py-3 rounded-full">
            <Text
              style={{ fontFamily: "Arabic" }}
              className="text-sm text-gray-800"
            >
              ابحث عن مانجا...
            </Text>
          </View>
        </View>
      </View>
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
