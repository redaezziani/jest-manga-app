import { Chapter } from "./chapter";
import Manga from "./manga";

export interface KeepReadingItem {
  id: string;
  userId: string;
  mangaId: string;
  chapterId: string;
  createdAt: Date;
  updatedAt: Date;
  manga: Manga;
  chapter: Chapter;
}

export interface KeepReadingResponse {
  success: boolean;
  data: {
    items: KeepReadingItem[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
}
