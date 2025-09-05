export interface LikedManga {
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

export interface LikeResponse {
  liked: boolean;
  message?: string;
}

export interface LikeCountResponse {
  mangaId: string;
  likeCount: number;
}

export interface LikedMangaListResponse {
  success: boolean;
  data: {
    likedManga: LikedManga[];
    total: number;
    page: number;
    limit: number;
  };
}
