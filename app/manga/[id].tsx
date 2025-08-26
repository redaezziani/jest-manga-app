import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

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

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [similar, setSimilar] = useState<Manga[]>([]);

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
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!manga) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text
          style={{
            fontFamily: "Arabic",
          }}
          className="text-gray-500 text-lg"
        >
          جارٍ تحميل المانجا...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-2">
      {/* Cover */}
      <Image
        source={{ uri: manga.cover }}
        style={{ width: 220, height: 350 }}
        className=" my-4 rounded-md"
      />

      <View className="px-2 py-2">
        <Text
          style={{
            fontFamily: "Arabic",
          }}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          {manga.title}
        </Text>
        {manga.otherTitles.length > 0 && (
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-gray-500 mb-2"
          >
            {manga.otherTitles.join(" / ")}
          </Text>
        )}

        {/* Authors / Artists / Type / Status */}
        <View className="mb-3">
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-gray-700"
          >
            <Text
              style={{
                fontFamily: "Arabic",
              }}
              className="font-bold"
            >
              المؤلف:{" "}
            </Text>
            {manga.authors.join(", ")}
          </Text>
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-gray-700"
          >
            <Text
              style={{
                fontFamily: "Arabic",
              }}
              className="font-bold"
            >
              الرسام:{" "}
            </Text>
            {manga.artists.join(", ")}
          </Text>
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-gray-700"
          >
            <Text
              style={{
                fontFamily: "Arabic",
              }}
              className="font-bold"
            >
              النوع:{" "}
            </Text>
            {manga.type}
          </Text>
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-gray-700"
          >
            <Text
              style={{
                fontFamily: "Arabic",
              }}
              className="font-bold"
            >
              الحالة:{" "}
            </Text>
            {manga.status}
          </Text>
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-gray-700"
          >
            <Text
              style={{
                fontFamily: "Arabic",
              }}
              className="font-bold"
            >
              المنصة:{" "}
            </Text>
            {manga.platform}
          </Text>
        </View>

        {/* Genres */}
        {manga.genres.length > 0 && (
          <View className="flex-row flex-wrap mb-4">
            {manga.genres.map((genre) => (
              <View
                key={genre}
                className="bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2"
              >
                <Text
                  style={{
                    fontFamily: "Arabic",
                  }}
                  className="text-sm text-gray-700"
                >
                  {genre}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <Text
          style={{
            fontFamily: "Arabic",
          }}
          className="text-gray-800 leading-relaxed"
        >
          {manga.description}
        </Text>
      </View>

      {/* Similar Manga */}
      {similar.length > 0 && (
        <View className="py-4 px-4">
          <Text
            style={{
              fontFamily: "Arabic",
            }}
            className="text-xl  text-gray-900 mb-2"
          >
            مانجا مشابهة
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
