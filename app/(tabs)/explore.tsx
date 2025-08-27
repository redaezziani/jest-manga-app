import { Badge } from "@/components/ui/badge";
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
import { Filter, Search, Star, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";

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
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minRating, setMinRating] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [mangaData, setMangaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch manga data
  const fetchMangaData = async (searchQuery = "", page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const url = `http://localhost:8082/api/manga/all?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMangaData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching manga data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMangaData();
  }, []);

  const toggleGenre = (genre) => {
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
    // Build search parameters
    const searchParams = {
      search: searchText,
      genres: selectedGenres,
      minRating,
      status: selectedStatus,
      type: selectedType,
      sortBy,
    };

    console.log("Search with filters:", searchParams);
    fetchMangaData(searchText);
  };

  const hasActiveFilters =
    searchText ||
    selectedGenres.length > 0 ||
    minRating ||
    selectedStatus ||
    selectedType;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 text-right mb-2">
            استكشاف المانجا
          </h1>
          <p className="text-gray-600 text-right text-base">
            اكتشف مانجا جديدة ومثيرة
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="ابحث عن المانجا..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-12 pr-4 h-12 text-right bg-white"
            />
            <Search className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Filter Toggle & Clear */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            <span>{showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}</span>
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              <X size={16} className="mr-1" />
              <span className="text-gray-600">مسح الكل</span>
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 text-right mb-2">
              الفلاتر النشطة:
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              {searchText && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span className="text-xs">البحث: {searchText}</span>
                </Badge>
              )}
              {selectedGenres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">{genre}</span>
                </Badge>
              ))}
              {minRating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star size={12} />
                  <span className="text-xs">{minRating}+</span>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-right">خيارات البحث المتقدم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sort & Quick Filters */}
              <div className="space-y-4">
                <p className="text-base font-medium text-right text-gray-900">
                  ترتيب النتائج
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر طريقة الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-4">
                <p className="text-base font-medium text-right text-gray-900">
                  نوع المحتوى
                </p>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر نوع المحتوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-4">
                <p className="text-base font-medium text-right text-gray-900">
                  حالة النشر
                </p>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر حالة النشر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-4">
                <p className="text-base font-medium text-right text-gray-900">
                  التقييم الأدنى
                </p>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر التقييم الأدنى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Genres Filter */}
              <div className="space-y-4">
                <p className="text-base font-medium text-right text-gray-900">
                  التصنيفات ({selectedGenres.length} محدد)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {genres.map((genre) => (
                    <div
                      key={genre}
                      className="flex items-center justify-end space-x-2 space-x-reverse p-2 rounded-lg border border-gray-100"
                    >
                      <span className="text-sm text-gray-700 flex-1 text-right">
                        {genre}
                      </span>
                      <Checkbox
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => toggleGenre(genre)}
                        className="ml-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Button */}
        <Button className="mb-6 h-12 w-full" onClick={handleSearch}>
          <Search size={18} className="mr-2" />
          <span className="text-white font-medium">بحث</span>
        </Button>

        {/* Results Section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {loading && (
              <p className="text-center text-gray-600">
                جاري البحث عن النتائج...
              </p>
            )}

            {error && (
              <div className="text-center text-red-600">
                <p>حدث خطأ أثناء جلب البيانات: {error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchMangaData()}
                  className="mt-2"
                >
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {mangaData && !loading && !error && (
              <div>
                <p className="text-center text-gray-800 mb-4">
                  تم العثور على {mangaData.meta.totalItems} نتيجة
                </p>

                {mangaData.data.items.map((manga) => (
                  <Card key={manga.id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={manga.coverThumbnail}
                          alt={manga.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-right mb-2">
                            {manga.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mb-2 justify-end">
                            {manga.genres.map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-xs"
                              >
                                {genre}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 text-right space-y-1">
                            <p>الحالة: {manga.status}</p>
                            <p>النوع: {manga.type}</p>
                            <p>المشاهدات: {manga.views}</p>
                            <p>بواسطة: {manga.authors.join(", ")}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mangaData.meta.totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <p className="text-sm text-gray-500">
                      الصفحة {mangaData.meta.currentPage} من{" "}
                      {mangaData.meta.totalPages}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!mangaData && !loading && !error && (
              <div className="text-center text-gray-600">
                <p>استخدم الفلاتر أعلاه لتخصيص البحث</p>
                <p className="text-xs text-gray-400 mt-1">
                  أو انقر على زر البحث للحصول على جميع النتائج
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
