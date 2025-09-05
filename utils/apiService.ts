import { BookmarkResponse, BookmarksListResponse } from "@/type/bookmark";
import { KeepReadingItem } from "@/type/keepReading";
import {
  LikeCountResponse,
  LikedMangaListResponse,
  LikeResponse,
} from "@/type/like";
import { API_URL } from "@/utils";

export interface KeepReadingData {
  mangaId: string;
  chapterId: string;
}

export class APIService {
  /**
   * Makes an authenticated API call
   */
  static async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
    token: string
  ): Promise<Response> {
    const url = `${API_URL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Adds a chapter to keep reading list
   */
  static async addToKeepReading(
    data: KeepReadingData,
    token: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest(
        "/api/manga/keep-reading",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return { success: true, ...result };
    } catch (error) {
      console.error("Error adding to keep reading:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل في إضافة الفصل إلى قائمة المتابعة",
      };
    }
  }

  /**
   * Gets the keep reading list
   */
  static async getKeepReadingList(token: string): Promise<{
    success: boolean;
    data?: KeepReadingItem[];
    message?: string;
  }> {
    try {
      const response = await this.makeAuthenticatedRequest(
        "/api/manga/keep-reading",
        {
          method: "GET",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return { success: true, data: result.data?.items || [] };
    } catch (error) {
      console.error("Error getting keep reading list:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل في تحميل قائمة المتابعة",
      };
    }
  }

  /**
   * Removes a chapter from keep reading list
   */
  static async removeFromKeepReading(
    mangaId: string,
    token: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/manga/keep-reading/${mangaId}`,
        {
          method: "DELETE",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return { success: true, ...result };
    } catch (error) {
      console.error("Error removing from keep reading:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل في إزالة الفصل من قائمة المتابعة",
      };
    }
  }

  /**
   * BOOKMARKS METHODS
   */

  /**
   * Toggle bookmark status for a manga
   */
  static async toggleBookmark(
    mangaId: string,
    token: string
  ): Promise<BookmarkResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/bookmarks/toggle/${mangaId}`,
        {
          method: "POST",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      return {
        bookmarked: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل في تغيير حالة الإشارة المرجعية",
      };
    }
  }

  /**
   * Check if manga is bookmarked
   */
  static async checkBookmarkStatus(
    mangaId: string,
    token: string
  ): Promise<BookmarkResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/bookmarks/check/${mangaId}`,
        {
          method: "GET",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      return {
        bookmarked: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل في التحقق من حالة الإشارة المرجعية",
      };
    }
  }

  /**
   * Get user bookmarks
   */
  static async getUserBookmarks(
    token: string,
    params?: {
      search?: string;
      page?: number;
      limit?: number;
      genre?: string;
      status?: string;
    }
  ): Promise<BookmarksListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.genre) queryParams.append("genre", params.genre);
      if (params?.status) queryParams.append("status", params.status);

      const endpoint = `/api/bookmarks${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await this.makeAuthenticatedRequest(
        endpoint,
        {
          method: "GET",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error getting user bookmarks:", error);
      return {
        success: false,
        data: {
          bookmarks: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      };
    }
  }

  /**
   * LIKED MANGA METHODS
   */

  /**
   * Toggle like status for a manga
   */
  static async toggleLike(
    mangaId: string,
    token: string
  ): Promise<LikeResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/liked-manga/toggle/${mangaId}`,
        {
          method: "POST",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error toggling like:", error);
      return {
        liked: false,
        message:
          error instanceof Error ? error.message : "فشل في تغيير حالة الإعجاب",
      };
    }
  }

  /**
   * Check if manga is liked
   */
  static async checkLikeStatus(
    mangaId: string,
    token: string
  ): Promise<LikeResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/liked-manga/check/${mangaId}`,
        {
          method: "GET",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error checking like status:", error);
      return {
        liked: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل في التحقق من حالة الإعجاب",
      };
    }
  }

  /**
   * Get manga like count
   */
  static async getMangaLikeCount(
    mangaId: string,
    token: string
  ): Promise<LikeCountResponse & { success: boolean; message?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/liked-manga/count/${mangaId}`,
        {
          method: "GET",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return { success: true, ...result };
    } catch (error) {
      console.error("Error getting manga like count:", error);
      return {
        success: false,
        mangaId,
        likeCount: 0,
        message:
          error instanceof Error ? error.message : "فشل في تحميل عدد الإعجابات",
      };
    }
  }

  /**
   * Get user liked manga
   */
  static async getUserLikedManga(
    token: string,
    params?: {
      search?: string;
      page?: number;
      limit?: number;
      genre?: string;
      status?: string;
    }
  ): Promise<LikedMangaListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.genre) queryParams.append("genre", params.genre);
      if (params?.status) queryParams.append("status", params.status);

      const endpoint = `/api/liked-manga${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await this.makeAuthenticatedRequest(
        endpoint,
        {
          method: "GET",
        },
        token
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error getting user liked manga:", error);
      return {
        success: false,
        data: {
          likedManga: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      };
    }
  }
}
