import { Button } from "@/components/ui/button";
import { Bookmark, Heart } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface MangaActionsProps {
  isAuthenticated: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
  likeCount: number;
  viewsCount: number;
  bookmarkLoading: boolean;
  likeLoading: boolean;
  onToggleBookmark: () => void;
  onToggleLike: () => void;
}

export const MangaActions: React.FC<MangaActionsProps> = ({
  isAuthenticated,
  isBookmarked,
  isLiked,
  likeCount,
  bookmarkLoading,
  likeLoading,
  onToggleBookmark,
  onToggleLike,
  viewsCount = 0,
}) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View className="flex-row gap-4">
      {/* Bookmark Button */}
      <Button
        variant="outline"
        className="flex-row items-center border-transparent px-0 py-1 border-none"
        onPress={onToggleBookmark}
        disabled={bookmarkLoading}
      >
        {bookmarkLoading ? (
          <ActivityIndicator size={16} color="#ff4133" />
        ) : isBookmarked ? (
          <Bookmark
            size={16}
            fill={"#f43f5e"}
            color="#f43f5e"
            strokeWidth={1.6}
          />
        ) : (
          <Bookmark size={16} color="#666" strokeWidth={1.6} />
        )}
        <Text style={{ fontFamily: "Doc" }} className=" text-sm text-gray-700">
          {isBookmarked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        </Text>
      </Button>
      {/* Like Button */}
      <Button
        variant="outline"
        className="flex-row items-center border-transparent px-0 py-1 border-none"
        onPress={onToggleLike}
        disabled={likeLoading}
      >
        {likeLoading ? (
          <ActivityIndicator size={16} color="#ff4133" />
        ) : isLiked ? (
          <Heart size={16} fill={"#f43f5e"} color="#f43f5e" strokeWidth={1.6} />
        ) : (
          <Heart size={16} color="#666" strokeWidth={1.6} />
        )}
        <Text style={{ fontFamily: "Doc" }} className=" text-sm text-gray-700">
          {isLiked ? "إلغاء الإعجاب" : "إعجاب"}
          {likeCount > 0 ? ` (${likeCount})` : ""}
        </Text>
      </Button>
    </View>
  );
};
