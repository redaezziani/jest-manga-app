import { useCustomAlert } from "@/components/CustomAlert";
import { MangaDetailSkeleton } from "@/components/Details-Manga-S";
import { LayoutWithTopBar } from "@/components/LayoutWithBar";
import { useAuth } from "@/hooks/useAuth";
import { Chapter } from "@/type/chapter";
import { Comment } from "@/type/comment";
import { MangaExtended } from "@/type/manga";
import { API_URL } from "@/utils";
import { APIService } from "@/utils/apiService";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  ChaptersList,
  CommentsSection,
  MangaActions,
  MangaCover,
  MangaInfo,
  PathIndicator,
  SimilarManga,
} from "./ui";

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showAlert } = useCustomAlert();
  const [manga, setManga] = useState<MangaExtended | null>(null);
  const [similar, setSimilar] = useState<MangaExtended[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadedChapters, setDownloadedChapters] = useState<Set<string>>(
    new Set()
  );
  const [downloadingChapters, setDownloadingChapters] = useState<Set<string>>(
    new Set()
  );
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Bookmark and Like states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    handelFetchMangaDetails();
    handelFetchChapters();
    checkDownloadedChapters();
  }, [id]);

  useEffect(() => {
    if (id && isAuthenticated && token) fetchComments();
  }, [id, isAuthenticated, token]);

  useEffect(() => {
    if (id && isAuthenticated && token) {
      checkBookmarkAndLikeStatus();
    }
  }, [id, isAuthenticated, token]);

  const checkDownloadedChapters = async () => {
    if (!id) return;

    try {
      const mangaFolder = `${FileSystem.documentDirectory}manga_${id}`;
      const mangaInfo = await FileSystem.getInfoAsync(mangaFolder);

      if (mangaInfo.exists) {
        const chapterDirs = await FileSystem.readDirectoryAsync(mangaFolder);
        const downloaded = new Set<string>();

        for (const dir of chapterDirs) {
          if (dir.startsWith("chapter_")) {
            const chapterId = dir.replace("chapter_", "");
            downloaded.add(chapterId);
          }
        }

        setDownloadedChapters(downloaded);
      }
    } catch (err) {
      console.error("Error checking downloaded chapters:", err);
    }
  };

  const handelFetchMangaDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manga/info/${id}`);
      const data = await res.json();
      setManga(data.data.mangaDetails);
      setSimilar(data.data.similarManga);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handelFetchChapters = async () => {
    try {
      const res = await fetch(`${API_URL}/api/manga/manga/${id}/chapters`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data.chapters);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      handelFetchMangaDetails(),
      handelFetchChapters(),
      checkDownloadedChapters(),
      fetchComments(),
      isAuthenticated && token
        ? checkBookmarkAndLikeStatus()
        : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

  // Comment-related functions
  const fetchComments = async () => {
    if (!id) return;

    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/comments/manga/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success && data.data) {
          setComments(data.data);
        } else if (Array.isArray(data)) {
          setComments(data);
        } else {
          setComments([]);
        }
      } else {
        console.error("Failed to fetch comments:", res.status);
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const createComment = async (content: string, parentId?: string) => {
    if (!isAuthenticated || !token || !content.trim()) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/comments/manga/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          parentId,
        }),
      });

      const data = await res.json();
      console.log("Create comment response:", data);

      if (res.ok) {
        setNewComment("");
        setReplyingTo(null);
        setReplyContent("");
        fetchComments();
      } else {
        throw new Error(data.message || "Failed to create comment");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Refresh comments after successful deletion
        fetchComments();
        showAlert({
          title: "نجح الحذف",
          message: "تم حذف التعليق بنجاح",
        });
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      showAlert({
        title: "خطأ",
        message: "فشل في حذف التعليق",
      });
    }
  };

  // Bookmark and Like functions
  const checkBookmarkAndLikeStatus = async () => {
    if (!id || !token) return;

    try {
      console.log("Checking bookmark and like status for manga:", id);

      // Check each endpoint separately to better handle errors
      try {
        const bookmarkResult = await APIService.checkBookmarkStatus(id, token);
        console.log("Bookmark status result:", bookmarkResult);
        setIsBookmarked(bookmarkResult.bookmarked);
      } catch (bookmarkError) {
        console.error("Bookmark check failed:", bookmarkError);
        // Set default bookmark status if endpoint fails
        setIsBookmarked(false);
      }

      try {
        const likeResult = await APIService.checkLikeStatus(id, token);
        console.log("Like status result:", likeResult);
        setIsLiked(likeResult.liked);
      } catch (likeError) {
        console.error("Like check failed:", likeError);
        // Set default like status if endpoint fails
        setIsLiked(false);
      }

      try {
        const likeCountResult = await APIService.getMangaLikeCount(id, token);
        console.log("Like count result:", likeCountResult);
        setLikeCount(likeCountResult.likeCount);
      } catch (countError) {
        console.error("Like count check failed:", countError);
        // Set default count if endpoint fails
        setLikeCount(0);
      }
    } catch (error) {
      console.error("General error checking bookmark and like status:", error);
      // Set defaults if everything fails
      setIsBookmarked(false);
      setIsLiked(false);
      setLikeCount(0);
    }
  };

  const handleToggleBookmark = async () => {
    if (!id || !token || bookmarkLoading) return;

    setBookmarkLoading(true);
    try {
      const result = await APIService.toggleBookmark(id, token);
      setIsBookmarked(result.bookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!id || !token || likeLoading) return;

    setLikeLoading(true);
    try {
      const result = await APIService.toggleLike(id, token);
      setIsLiked(result.liked);
      const likeCountResult = await APIService.getMangaLikeCount(id, token);
      setLikeCount(likeCountResult.likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <LayoutWithTopBar>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView className="flex-1 bg-white">
          <MangaDetailSkeleton />
        </ScrollView>
      </LayoutWithTopBar>
    );
  }

  const downloadChapter = async (chapter: Chapter) => {
    try {
      if (!manga) return;

      // Mark as downloading
      setDownloadingChapters((prev) => new Set(prev).add(chapter.id));

      const mangaFolder = `${FileSystem.documentDirectory}manga_${manga.id}`;
      const chapterFolder = `${mangaFolder}/chapter_${chapter.id}`;

      // make sure folders exist
      const mangaInfo = await FileSystem.getInfoAsync(mangaFolder);
      if (!mangaInfo.exists) {
        await FileSystem.makeDirectoryAsync(mangaFolder, {
          intermediates: true,
        });
      }

      const chapterInfo = await FileSystem.getInfoAsync(chapterFolder);
      if (!chapterInfo.exists) {
        await FileSystem.makeDirectoryAsync(chapterFolder, {
          intermediates: true,
        });
      }

      // Save manga info if not already saved
      const mangaInfoPath = `${mangaFolder}/manga_info.json`;
      const mangaInfoExists = await FileSystem.getInfoAsync(mangaInfoPath);
      if (!mangaInfoExists.exists) {
        const mangaData = {
          id: manga.id,
          title: manga.title,
          cover: manga.cover,
          coverThumbnail: manga.coverThumbnail,
          authors: manga.authors,
          artists: manga.artists,
          genres: manga.genres,
          status: manga.status,
          type: manga.type,
          description: manga.description,
          otherTitles: manga.otherTitles,
          rating: manga.rating,
          views: manga.views,
          releaseDate: manga.releaseDate,
        };
        await FileSystem.writeAsStringAsync(
          mangaInfoPath,
          JSON.stringify(mangaData)
        );
      }

      const res = await fetch(
        `${API_URL}/api/manga/manga/${id}/chapter/${chapter.number}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch chapter");
      }

      // Extract pages from the response - the structure might be different
      let pages: string[] = [];
      if (data.data.pages) {
        pages = data.data.pages;
      } else if (data.data && Array.isArray(data.data)) {
        pages = data.data;
      } else {
        throw new Error("No pages found in API response");
      }

      // Save chapter info
      const chapterInfoPath = `${chapterFolder}/chapter_info.json`;
      const chapterData = {
        id: chapter.id,
        title: chapter.title,
        number: chapter.number,
        createdAt: chapter.createdAt,
        totalPages: pages.length,
      };
      await FileSystem.writeAsStringAsync(
        chapterInfoPath,
        JSON.stringify(chapterData)
      );

      for (let i = 0; i < pages.length; i++) {
        const pageUrl = pages[i];
        const fileUri = `${chapterFolder}/page_${i + 1}.jpg`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(pageUrl, fileUri);
        } else {
        }
      }

      // Refresh downloaded chapters list
      checkDownloadedChapters();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل تحميل الفصل";
    } finally {
      // Remove from downloading state
      setDownloadingChapters((prev) => {
        const updated = new Set(prev);
        updated.delete(chapter.id);
        return updated;
      });
    }
  };

  return (
    <LayoutWithTopBar>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-4">
        <PathIndicator title={manga ? manga.title : "تفاصيل المانجا"} />
      </View>
      <ScrollView
        className="flex-1 bg-white px-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff4133"
            title="جاري التحديث..."
            titleColor="#666"
          />
        }
      >
        {manga && (
          <>
            <MangaCover coverUrl={manga.cover} />

            <View className="px-2">
              <MangaActions
                isAuthenticated={isAuthenticated}
                isBookmarked={isBookmarked}
                isLiked={isLiked}
                likeCount={likeCount}
                bookmarkLoading={bookmarkLoading}
                likeLoading={likeLoading}
                onToggleBookmark={handleToggleBookmark}
                onToggleLike={handleToggleLike}
              />

              <MangaInfo manga={manga} />
            </View>

            <SimilarManga similarManga={similar} />
          </>
        )}

        <ChaptersList
          chapters={chapters}
          mangaId={id!}
          downloadedChapters={downloadedChapters}
          downloadingChapters={downloadingChapters}
          onDownloadChapter={downloadChapter}
        />

        <CommentsSection
          comments={comments}
          newComment={newComment}
          replyingTo={replyingTo}
          replyContent={replyContent}
          commentsLoading={commentsLoading}
          isAuthenticated={isAuthenticated}
          currentUserId={user?.email} // Using email as identifier until we have proper user ID
          onNewCommentChange={setNewComment}
          onReplyContentChange={setReplyContent}
          onCreateComment={createComment}
          onSetReplyingTo={setReplyingTo}
          onDeleteComment={deleteComment}
          showAlert={showAlert}
        />
      </ScrollView>
    </LayoutWithTopBar>
  );
}
