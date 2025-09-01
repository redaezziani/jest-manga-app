import { KeepReadingItem } from "@/type/keepReading";
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
}
