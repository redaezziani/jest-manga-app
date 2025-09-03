import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { KeepReadingItem } from "@/type/keepReading";
import Manga from "@/type/manga";
import { API_URL } from "@/utils";
import { APIService } from "@/utils/apiService";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import Swiper from "react-native-swiper";

export default function HomeScreen() {
  const [latestManga, setLatestManga] = useState<Manga[]>([]);
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [keepReadingManga, setKeepReadingManga] = useState<KeepReadingItem[]>(
    []
  );
  const [keepReadingLoading, setKeepReadingLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, token, isAuthenticated } = useAuth();
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

  const fetchKeepReading = async () => {
    if (!isAuthenticated || !token) return;

    setKeepReadingLoading(true);
    try {
      const result = await APIService.getKeepReadingList(token);
      if (result.success && result.data) {
        setKeepReadingManga(result.data);
      }
    } catch (err) {
      console.error("Error fetching keep reading:", err);
    } finally {
      setKeepReadingLoading(false);
    }
  };

  useEffect(() => {
    fetchManga();
    fetchKeepReading();
  }, [isAuthenticated, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchManga();
    await fetchKeepReading();
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
    <Link href={`/manga/${item.id}`} className="flex-1 px-3  " key={item.id}>
      <View className=" p-0.5  relative  w-full rounded-md ">
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
      </View>

      <View className="pt-2 px-1">
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-sm font-bold line-clamp-1 text-gray-900 mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-xs text-gray-600 mb-2"
          numberOfLines={1}
        >
          {item.authors && item.authors.length > 0 && item.authors[0] !== ""
            ? item.authors.join(", ")
            : "غير معروف"}
        </Text>
        <View className="flex-row items-center space-x-2 gap-1">
          <Text
            style={{ fontFamily: "Doc" }}
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
    <View className="flex-row px-2" key={index}>
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
            style={{ fontFamily: "Doc" }}
            className="text-gray-700 text-xl font-semibold"
          >
            {title}
          </Text>
          <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-600">
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
                fontFamily: "Doc",
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

  const renderKeepReadingCard = (item: KeepReadingItem) => (
    <Link
      href={`/chapter/${item.chapterId}?mangaId=${item.mangaId}`}
      className="flex-1 px-3"
      key={item.id}
    >
      <View className="p-0.5 relative w-full rounded-md">
        <Image
          source={{ uri: item.manga.coverThumbnail }}
          style={{
            width: "100%",
            height: 245,
            borderRadius: 5,
          }}
          resizeMode="cover"
          className="border border-gray-300"
        />
      </View>

      <View className="pt-2 px-1">
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-sm font-bold line-clamp-1 text-gray-900 mb-1"
          numberOfLines={2}
        >
          {item.manga.title}
        </Text>
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-xs text-gray-600"
          numberOfLines={1}
        >
          {item.chapter.title}
        </Text>
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-xs text-gray-500 mt-1"
        >
          الفصل {item.chapter.number}
        </Text>
      </View>
    </Link>
  );

  const renderKeepReadingSection = () => {
    if (!isAuthenticated) return null;

    if (keepReadingLoading) {
      return (
        <View className="my-4">
          <View className="px-4 py-2">
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-gray-700 text-xl font-semibold"
            >
              متابعة القراءة
            </Text>
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-sm text-gray-600"
            >
              استكمل قراءة المانجا التي بدأتها
            </Text>
          </View>
          <View className="flex-1 justify-center items-center py-8">
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-gray-500 text-sm"
            >
              جارٍ تحميل قائمة المتابعة...
            </Text>
          </View>
        </View>
      );
    }

    if (keepReadingManga.length === 0) {
      return (
        <View className="my-4">
          <View className="px-4 py-2">
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-gray-700 text-xl font-semibold"
            >
              متابعة القراءة
            </Text>
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-sm text-gray-600"
            >
              ابدأ بقراءة مانجا لتظهر هنا
            </Text>
          </View>
        </View>
      );
    }

    const mangaPairs = [];
    for (let i = 0; i < keepReadingManga.length; i += 2) {
      mangaPairs.push(keepReadingManga.slice(i, i + 2));
    }

    return (
      <View className="my-4">
        <View className="px-4 py-2">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-gray-700 text-xl font-semibold"
          >
            متابعة القراءة
          </Text>
          <Text style={{ fontFamily: "Doc" }} className="text-sm text-gray-600">
            استكمل قراءة المانجا التي بدأتها
          </Text>
        </View>

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
            {mangaPairs.map((pair, index) => (
              <View className="flex-row px-2" key={index}>
                {pair.map((item) => renderKeepReadingCard(item))}
                {pair.length === 1 && <View className="flex-1 mx-2" />}
              </View>
            ))}
          </Swiper>
        </View>
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
      <View className=" h-72 w-full bg-gray-200 relative flex justify-center items-center">
        <Image
          source={{
            uri: "https://t3.ftcdn.net/jpg/07/32/10/90/360_F_732109080_4lXwGofazqAiysUpcCnrbflsNOl9EMdW.jpg",
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          className=" z-0"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
        />
        <View className="absolute inset-0 z-20 backdrop-blur-lg  opacity-70" />
        <View className="absolute z-30 px-4">
          <Text
            style={{ fontFamily: "Bigx" }}
            className="text-4xl text-center text-white mb-2"
          >
            مرحبًا بك في Desire Manga
          </Text>
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-sm text-white/80 mb-4"
          >
            استكشف مجموعتنا الواسعة من المانجا واستمتع بقراءة قصصك المفضلة.
          </Text>
          <View className="">
            <Input
              placeholder="ابحث عن مانجا..."
              style={{ fontFamily: "Doc" }}
              className="text-sm text-gray-800"
            />
          </View>
        </View>
      </View>

      {renderKeepReadingSection()}

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

      {renderKeepReadingSection()}
    </ScrollView>
  );
}
