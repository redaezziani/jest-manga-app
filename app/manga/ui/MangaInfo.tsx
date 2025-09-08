import { MangaExtended } from "@/type/manga";
import React from "react";
import { Text, View } from "react-native";

interface MangaInfoProps {
  manga: MangaExtended;
}

export const MangaInfo: React.FC<MangaInfoProps> = ({ manga }) => {
  return (
    <View>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-xl font-bold text-gray-900 mb-1"
          >
            {manga.title}
          </Text>
        </View>
      </View>

      {manga.otherTitles.length > 0 && (
        <Text style={{ fontFamily: "Doc" }} className="text-gray-500 mb-2">
          {manga.otherTitles.length > 2
            ? `${manga.otherTitles.slice(0, 2).join(" / ")} ...`
            : manga.otherTitles.join(" / ")}
        </Text>
      )}

      <View className="mb-3">
        <Text style={{ fontFamily: "Doc" }} className="text-gray-500 text-sm">
          <Text
            style={{ fontFamily: "Doc" }}
            className=" text-sm text-gray-700"
          >
            المؤلف:{" "}
          </Text>
          {manga.authors.join(", ") === ""
            ? "غير محدد"
            : manga.authors.join(", ")}
        </Text>

        <Text style={{ fontFamily: "Doc" }} className="text-gray-500 text-sm">
          <Text
            style={{ fontFamily: "Doc" }}
            className=" text-sm text-gray-700"
          >
            الرسام:{" "}
          </Text>
          {manga.artists.join(", ") === ""
            ? "غير محدد"
            : manga.artists.join(", ")}
        </Text>

        <Text style={{ fontFamily: "Doc" }} className="text-gray-500 text-sm">
          <Text
            style={{ fontFamily: "Doc" }}
            className=" text-sm text-gray-700"
          >
            النوع:{" "}
          </Text>
          {manga.type === "" ? "غير محدد" : manga.type}
        </Text>

        <Text style={{ fontFamily: "Doc" }} className="text-gray-500 text-sm">
          <Text
            style={{ fontFamily: "Doc" }}
            className=" text-sm text-gray-700"
          >
            الحالة:{" "}
          </Text>
          {manga.status.toLowerCase() === "ongoing" ? "مستمرة" : "مكتملة"}
        </Text>
      </View>

      {manga.genres.length > 0 && (
        <View className="flex-row flex-wrap mb-4">
          {manga.genres.map((genre, index) => (
            <View
              key={`genre-${genre}-${index}`}
              className="bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2"
            >
              <Text
                style={{ fontFamily: "Doc" }}
                className="text-sm text-gray-700"
              >
                {genre}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text
        style={{ fontFamily: "Doc" }}
        className={`text-gray-800 leading-relaxed ${manga.description === "" ? " text-gray-400" : ""}`}
      >
        {manga.description === ""
          ? "لا توجد وصف متاح لهذه المانجا."
          : manga.description}
      </Text>
    </View>
  );
};
