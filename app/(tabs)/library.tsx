import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { MangaCard } from "@/components/MangaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark } from "@/type/bookmark";
import { LikedManga } from "@/type/like";
import { APIService } from "@/utils/apiService";
import { Link, Stack, useRouter } from "expo-router";
import {
  Bookmark as BookmarkIcon,
  Heart,
  Search,
  User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

type TabType = "bookmarks" | "liked";

export default function LibraryScreen() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("bookmarks");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [likedManga, setLikedManga] = useState<LikedManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadData();
    }
  }, [isAuthenticated, token, activeTab]);

  const loadData = async (reset = true) => {
    if (!token) return;

    if (reset) {
      setPage(1);
      setLoading(true);
    }

    try {
      const currentPage = reset ? 1 : page;

      if (activeTab === "bookmarks") {
        const result = await APIService.getUserBookmarks(token, {
          search: searchQuery,
          page: currentPage,
          limit: 20,
        });

        if (result.success) {
          if (reset) {
            setBookmarks(result.data.bookmarks);
          } else {
            setBookmarks((prev) => [...prev, ...result.data.bookmarks]);
          }
          setHasMore(result.data.bookmarks.length === 20);
        }
      } else {
        const result = await APIService.getUserLikedManga(token, {
          search: searchQuery,
          page: currentPage,
          limit: 20,
        });

        if (result.success) {
          if (reset) {
            setLikedManga(result.data.likedManga);
          } else {
            setLikedManga((prev) => [...prev, ...result.data.likedManga]);
          }
          setHasMore(result.data.likedManga.length === 20);
        }
      }
    } catch (error) {
      console.error("Error loading library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [activeTab, searchQuery, token]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setPage((prev) => prev + 1);
    await loadData(false);
  };

  const handleSearch = useCallback(async () => {
    await loadData(true);
  }, [searchQuery, activeTab, token]);

  const renderMangaItem = ({ item }: { item: Bookmark | LikedManga }) => {
    const manga = item.manga;
    if (!manga) return null;

    return (
      <MangaCard
        manga={manga}
        showActions={true}
        actionIcon={
          activeTab === "bookmarks" ? (
            <BookmarkIcon size={16} color="#ff4133" />
          ) : (
            <Heart size={16} color="#ff4133" />
          )
        }
      />
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-16">
      {activeTab === "bookmarks" ? (
        <BookmarkIcon size={64} color="#d1d5db" />
      ) : (
        <Heart size={64} color="#d1d5db" />
      )}
      <Text
        style={{ fontFamily: "Doc" }}
        className="text-lg text-gray-500 mt-4 text-center"
      >
        {activeTab === "bookmarks"
          ? "لا توجد إشارات مرجعية بعد"
          : "لا توجد مانجا مُعجب بها بعد"}
      </Text>
      <Text
        style={{ fontFamily: "Doc" }}
        className="text-sm text-gray-400 mt-2 text-center px-8"
      >
        {activeTab === "bookmarks"
          ? "ابدأ بإضافة المانجا إلى الإشارات المرجعية لتجدها هنا"
          : "ابدأ بالإعجاب بالمانجا لتجدها هنا"}
      </Text>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <User size={64} color="#d1d5db" />
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-xl text-gray-700 mt-4 text-center"
          >
            يجب تسجيل الدخول
          </Text>
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-sm text-gray-500 mt-2 text-center"
          >
            سجل دخولك لرؤية مكتبتك الشخصية
          </Text>
          <Link href="/auth/login" asChild>
            <Button className="mt-6">
              <Text style={{ fontFamily: "Doc" }} className="text-white">
                تسجيل الدخول
              </Text>
            </Button>
          </Link>
        </View>
      </LayoutWithTopBar>
    );
  }

  const currentData = activeTab === "bookmarks" ? bookmarks : likedManga;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-2xl  text-gray-900 mb-4 text-center"
          >
            مكتبتي
          </Text>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
          >
            <TabsList className="w-full">
              <TabsTrigger
                value="bookmarks"
                className="flex-1  p-1 flex justify-center items-center"
              >
                <BookmarkIcon size={16} color="#ff4133" />
                <Text
                  className=" -mt-2 text-center  "
                  style={{ fontFamily: "Doc" }}
                >
                  الإشارات المرجعية
                </Text>
              </TabsTrigger>

              <TabsTrigger
                value="liked"
                className="flex-1 p-1 flex justify-center items-center"
              >
                <Heart size={16} color="#ff4133" />
                <Text
                  className="-mt-2 text-center  "
                  style={{ fontFamily: "Doc" }}
                >
                  المُعجب بها
                </Text>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar */}
          <View className="flex-row mt-4 items-center bg-gray-100 rounded-lg px-3">
            <Search size={16} color="#666" />
            <Input
              style={{ fontFamily: "Doc" }}
              className="flex-1 mr-2 text-gray-700 bg-transparent border-none
              shadow-none focus:ring-0 rounded-none"
              placeholder={`البحث في ${activeTab === "bookmarks" ? "الإشارات المرجعية" : "المُعجب بها"}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholderTextColor={"#666"}
            />
          </View>
        </View>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={() => {}}>
          <TabsContent className=" mt-10" value="bookmarks">
            {loading && bookmarks.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ff4133" />
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-500 mt-4"
                >
                  جاري التحميل...
                </Text>
              </View>
            ) : (
              <FlatList
                data={bookmarks}
                renderItem={renderMangaItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#ff4133"
                  />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                  !loading && activeTab === "bookmarks"
                    ? renderEmptyState
                    : null
                }
                ListFooterComponent={
                  loading && bookmarks.length > 0 ? (
                    <View className="py-4">
                      <ActivityIndicator size="small" color="#ff4133" />
                    </View>
                  ) : null
                }
              />
            )}
          </TabsContent>

          <TabsContent value="liked">
            {loading && likedManga.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ff4133" />
                <Text
                  style={{ fontFamily: "Doc" }}
                  className="text-gray-500 mt-4"
                >
                  جاري التحميل...
                </Text>
              </View>
            ) : (
              <FlatList
                data={likedManga}
                renderItem={renderMangaItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#ff4133"
                  />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                  !loading && activeTab === "liked" ? renderEmptyState : null
                }
                ListFooterComponent={
                  loading && likedManga.length > 0 ? (
                    <View className="py-4">
                      <ActivityIndicator size="small" color="#ff4133" />
                    </View>
                  ) : null
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </View>
    </>
  );
}
