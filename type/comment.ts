export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mangaId: string;
  userId: string;
  parentId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile: {
      id: string;
      bio?: string;
      phone?: string;
      image?: string;
      badge?: string;
    };
  };
  replies?: Comment[];
  likes?: any[];
  isLiked?: boolean;
  _count?: {
    replies: number;
  };
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface CommentResponse {
  success: boolean;
  data?: Comment[];
  message?: string;
}
