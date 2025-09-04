import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/utils";
import { useRouter } from "expo-router";
import { Search, Settings2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// --- options & genres ---
const genres = [
  "أكشن",
  "مغامرات",
  "كوميديا",
  "دراما",
  "خيال",
  "رعب",
  "رومانسي",
  "خارق للطبيعة",
  "قوى خارقة",
  "نينجا",
  "ساموراي",
  "مدرسي",
  "رياضة",
  "تاريخي",
  "نفسي",
  "إثارة",
  "جوائز",
  "يومي",
  "حريم",
  "ايسيكاي",
  "آلة",
  "عسكري",
  "موسيقى",
  "غموض",
];

const statusOptions = [
  { label: "جميع الحالات", value: "" },
  { label: "مستمرة", value: "مستمرة" },
  { label: "مكتملة", value: "مكتملة" },
  { label: "متوقفة", value: "متوقفة" },
  { label: "ملغاة", value: "ملغاة" },
];

const typeOptions = [
  { label: "جميع الأنواع", value: "" },
  { label: "مانجا", value: "مانجا" },
  { label: "مانهوا", value: "مانهوا" },
  { label: "مانهو", value: "مانهو" },
  { label: "ويبتون", value: "ويبتون" },
];

const sortOptions = [
  { label: "الأحدث", value: "newest" },
  { label: "الأقدم", value: "oldest" },
  { label: "الأعلى تقييماً", value: "rating" },
  { label: "الأكثر مشاهدة", value: "views" },
  { label: "أبجدي", value: "alphabetical" },
];

const ratingOptions = [
  { label: "جميع التقييمات", value: "" },
  { label: "5 نجوم فأكثر", value: "5" },
  { label: "4 نجوم فأكثر", value: "4" },
  { label: "3 نجوم فأكثر", value: "3" },
  { label: "2 نجوم فأكثر", value: "2" },
  { label: "1 نجمة فأكثر", value: "1" },
];

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [mangaData, setMangaData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // --- fetch data ---
  const fetchMangaData = async (searchQuery = "", page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/api/manga/all?page=${page}&limit=${limit}&search=${encodeURIComponent(
        searchQuery
      )}`;
      const response = await fetch(url);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setMangaData(data.data.items);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching manga data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangaData();
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedGenres([]);
    setMinRating("");
    setSelectedStatus("");
    setSelectedType("");
    setSortBy("newest");
  };

  const handleSearch = () => {
    fetchMangaData(searchText);
  };

  const hasActiveFilters =
    searchText ||
    selectedGenres.length > 0 ||
    minRating ||
    selectedStatus ||
    selectedType;

  const renderMangaCard = (item: any) => (
    <View className="flex-1 px-2 mb-4 " key={item.id}>
      <Image
        source={{ uri: item.coverThumbnail }}
        style={{ width: "100%", height: 245, borderRadius: 10 }}
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <FlatList
          data={mangaData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-1 m-2">{renderMangaCard(item)}</View>
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={{ backgroundColor: "#f9fafb", padding: 16 }}>
              {/* Header */}
              <View style={{ marginBottom: 24, marginTop: 2 }}>
                <Text className=" text-primary " style={{ fontFamily: "Doc" }}>
                  استكشاف المانجا
                </Text>
                <Text
                  style={{ color: "#4b5563", fontFamily: "Doc" }}
                  className="text-sm mt-1"
                >
                  اكتشف مانجا جديدة ومثيرة
                </Text>
              </View>

              {/* Search Bar */}
              <View className=" flex-row items-center justify-between">
                <Input
                  placeholder="ابحث عن المانجا..."
                  value={searchText}
                  onChangeText={setSearchText}
                  className=" text-right bg-white max-w-[90%]"
                  style={{ fontFamily: "Doc" }}
                />
                <Button
                  size={"icon"}
                  variant={"outline"}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Settings2 size={14} />
                </Button>
              </View>

              {/* Clear filters */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              ></View>

              {/* Filters */}
              {showFilters && (
                <Card style={{ marginBottom: 24 }}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: "Doc" }}>
                      خيارات البحث المتقدم
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Sorting / Type */}
                    <View className="flex-row justify-between gap-2 items-center w-full">
                      {/* Sort */}
                      <View className="flex-col justify-start items-start w-1/2">
                        <Text
                          style={{ fontFamily: "Doc" }}
                          className="text-sm text-gray-500"
                        >
                          ترتيب النتائج
                        </Text>
                        <Select
                          className="w-full"
                          value={sortOptions.find((o) => o.value === sortBy)}
                          onValueChange={(o) => setSortBy(o?.value ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue
                              style={{ fontFamily: "Doc" }}
                              placeholder="اختر طريقة الترتيب"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {sortOptions.map((o) => (
                                <SelectItem
                                  key={o.value}
                                  value={o.value}
                                  label={o.label}
                                >
                                  <Text style={{ fontFamily: "Doc" }}>
                                    {o.label}
                                  </Text>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </View>
                      {/* Type */}
                      <View className="flex-col justify-start items-start w-1/2 ">
                        <Text
                          style={{ fontFamily: "Doc" }}
                          className="text-sm text-gray-500"
                        >
                          نوع المحتوى
                        </Text>
                        <Select
                          className="w-full"
                          value={typeOptions.find(
                            (o) => o.value === selectedType
                          )}
                          onValueChange={(o) => setSelectedType(o?.value ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue
                              style={{ fontFamily: "Doc" }}
                              placeholder="اختر نوع المحتوى"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {typeOptions.map((o) => (
                                <SelectItem
                                  key={o.value}
                                  value={o.value}
                                  label={o.label}
                                >
                                  <Text style={{ fontFamily: "Doc" }}>
                                    {o.label}
                                  </Text>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </View>
                    </View>

                    {/* Status / Rating */}
                    <View className="flex-row justify-between gap-2 items-center w-full mt-4">
                      <View className="flex-col justify-start items-start w-1/2">
                        <Text
                          style={{ fontFamily: "Doc" }}
                          className="text-sm text-gray-500"
                        >
                          حالة النشر
                        </Text>
                        <Select
                          className="w-full"
                          value={statusOptions.find(
                            (o) => o.value === selectedStatus
                          )}
                          onValueChange={(o) =>
                            setSelectedStatus(o?.value ?? "")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              style={{ fontFamily: "Doc" }}
                              placeholder="اختر حالة النشر"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {statusOptions.map((o) => (
                                <SelectItem
                                  key={o.value}
                                  value={o.value}
                                  label={o.label}
                                >
                                  <Text style={{ fontFamily: "Doc" }}>
                                    {o.label}
                                  </Text>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </View>
                      {/* Rating */}
                      <View className="flex-col justify-start items-start w-1/2">
                        <Text
                          style={{ fontFamily: "Doc" }}
                          className="text-sm text-gray-500"
                        >
                          التقييم الأدنى
                        </Text>
                        <Select
                          className="w-full"
                          value={ratingOptions.find(
                            (o) => o.value === minRating
                          )}
                          onValueChange={(o) => setMinRating(o?.value ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue
                              style={{ fontFamily: "Doc" }}
                              placeholder="اختر التقييم الأدنى"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ratingOptions.map((o) => (
                                <SelectItem
                                  key={o.value}
                                  value={o.value}
                                  label={o.label}
                                >
                                  <Text style={{ fontFamily: "Doc" }}>
                                    {o.label}
                                  </Text>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </View>
                    </View>

                    {/* Genres */}
                    <Text
                      style={{
                        marginVertical: 8,
                        fontFamily: "Doc",
                      }}
                    >
                      التصنيفات ({selectedGenres.length} محدد)
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {genres.map((g) => (
                        <View
                          key={g}
                          className="flex gap-1 min-w-28 col-span-1 flex-row-reverse items-center"
                        >
                          <Text style={{ flex: 1, fontFamily: "Doc" }}>
                            {g}
                          </Text>
                          <Checkbox
                            checked={selectedGenres.includes(g)}
                            onCheckedChange={() => toggleGenre(g)}
                          />
                        </View>
                      ))}
                    </View>
                  </CardContent>
                </Card>
              )}

              {/* Search Button */}
              <Button onPress={handleSearch} style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontFamily: "Doc",
                  }}
                >
                  بحث
                </Text>
                {<Search color={"#fff"} size={16} />}
              </Button>

              {/* Loading / Error */}
              {loading && <ActivityIndicator />}
              {error && (
                <View>
                  <Text
                    style={{
                      color: "red",
                      textAlign: "center",
                      fontFamily: "Doc",
                    }}
                  >
                    {error}
                  </Text>
                  <Button onPress={() => fetchMangaData()}>
                    <Text style={{ fontFamily: "Doc" }}>إعادة المحاولة</Text>
                  </Button>
                </View>
              )}
              {!loading && !error && mangaData.length === 0 && (
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-center text-gray-500 my-4"
                >
                  لم يتم العثور على مانجا.
                </Text>
              )}
            </View>
          }
        />
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
