export interface Bookmark {
  id: string;
  userId: string;
  mangaId: string;
  createdAt: string;
  manga?: {
    id: string;
    title: string;
    coverThumbnail: string;
    cover: string;
    status: string;
    genres: string[];
    authors: string[];
    description: string;
  };
}

export interface BookmarkResponse {
  bookmarked: boolean;
  message?: string;
}

export interface BookmarksListResponse {
  success: boolean;
  data: {
    bookmarks: Bookmark[];
    total: number;
    page: number;
    limit: number;
  };
}
