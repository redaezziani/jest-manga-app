import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Manga {
  id: string;
  title: string;
  otherTitles: string[];
  cover: string;
  coverThumbnail: string;
  authors: string[];
  artists: string[];
  platform: string;
  type: string;
  releaseDate: string;
  status: string;
  genres: string[];
  description: string;
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  createdAt: string;
}

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [similar, setSimilar] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const API_URL =
      Platform.OS === "android"
        ? "http://10.0.2.2:8082"
        : "http://localhost:8082";

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
    fetch(`${API_URL}/api/manga/manga/${id}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChapters(data.data.chapters);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text style={{ fontFamily: "Arabic" }} className="text-gray-500">
          جاري التحميل...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row  flex items-end justify-between h-24 px-4 py-3 bg-white border-b border-gray-300 ">
        <Text
          style={{ fontFamily: "Arabic" }}
          className="text-base flex-row  mt-2 text-gray-800"
          numberOfLines={1}
        >
          <Text
            onPress={() => router.push("/")}
            style={{ fontFamily: "Arabic" }}
          >
            رغبة <Text style={{ color: "#ff4D00" }}>مانجا</Text>
          </Text>
          /{manga?.title}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="">
          <ChevronLeft size={20} color="#ff4D00" />
        </TouchableOpacity>
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
                className="text-2xl font-bold text-gray-900 mb-1"
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
                  className="text-gray-700"
                >
                  <Text style={{ fontFamily: "Arabic" }} className="font-bold">
                    المؤلف:{" "}
                  </Text>
                  {manga.authors.join(", ")}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700"
                >
                  <Text style={{ fontFamily: "Arabic" }} className="font-bold">
                    الرسام:{" "}
                  </Text>
                  {manga.artists.join(", ")}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700"
                >
                  <Text style={{ fontFamily: "Arabic" }} className="font-bold">
                    النوع:{" "}
                  </Text>
                  {manga.type}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700"
                >
                  <Text style={{ fontFamily: "Arabic" }} className="font-bold">
                    الحالة:{" "}
                  </Text>
                  {manga.status}
                </Text>

                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-gray-700"
                >
                  <Text style={{ fontFamily: "Arabic" }} className="font-bold">
                    المنصة:{" "}
                  </Text>
                  {manga.platform}
                </Text>
              </View>

              {manga.genres.length > 0 && (
                <View className="flex-row flex-wrap mb-4">
                  {manga.genres.map((genre) => (
                    <View
                      key={genre}
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
              <View className="py-4 px-4">
                <Text
                  style={{ fontFamily: "Arabic" }}
                  className="text-xl  text-gray-900 mb-2"
                >
                  مانجا مشابهة
                </Text>
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
            {chapters.map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id}
                className="py-2 "
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
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}
