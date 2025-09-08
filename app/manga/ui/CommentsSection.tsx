import { Button } from "@/components/ui/button";
import { Comment } from "@/type/comment";
import { MessageCircle, Send } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface CommentsSectionProps {
  comments: Comment[];
  newComment: string;
  replyingTo: string | null;
  replyContent: string;
  commentsLoading: boolean;
  isAuthenticated: boolean;
  onNewCommentChange: (text: string) => void;
  onReplyContentChange: (text: string) => void;
  onCreateComment: (content: string, parentId?: string) => void;
  onSetReplyingTo: (commentId: string | null) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  newComment,
  replyingTo,
  replyContent,
  commentsLoading,
  isAuthenticated,
  onNewCommentChange,
  onReplyContentChange,
  onCreateComment,
  onSetReplyingTo,
}) => {
  const renderComment = (comment: Comment, level: number = 0) => (
    <View key={comment.id} className={`mb-1 ${level > 0 ? "ml-4 pl-4 " : ""}`}>
      <View className=" p-3 ">
        <View className="flex-row items-center justify-between mb-2">
          <Text
            style={{ fontFamily: "Doc" }}
            className=" text-sm text-gray-800"
          >
            {comment.user.name}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString("ar")}
          </Text>
        </View>

        <Text
          style={{ fontFamily: "Doc" }}
          className="text-gray-500 text-sm mb-2"
        >
          {comment.content}
        </Text>

        {/* Only show reply button for top-level comments (level 0) */}
        {level === 0 && (
          <TouchableOpacity
            onPress={() =>
              onSetReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="flex-row items-center"
          >
            <Text
              style={{ fontFamily: "Doc" }}
              className="text-sm text-gray-600 underline ml-1"
            >
              رد
            </Text>
          </TouchableOpacity>
        )}

        {replyingTo === comment.id && level === 0 && (
          <View className="mt-3 p-2 bg-white rounded">
            <TextInput
              style={{ fontFamily: "Doc" }}
              className="border border-gray-300 rounded p-2 mb-2"
              placeholder="اكتب ردك هنا..."
              value={replyContent}
              onChangeText={onReplyContentChange}
              multiline
            />
            <View className="flex-row gap-2">
              <Button
                onPress={() => onCreateComment(replyContent, comment.id)}
                size="sm"
                className="flex-1"
              >
                <Send size={16} color="white" />
                <Text style={{ fontFamily: "Doc" }} className="text-white ml-2">
                  إرسال
                </Text>
              </Button>
              <Button
                variant="ghost"
                onPress={() => {
                  onSetReplyingTo(null);
                  onReplyContentChange("");
                }}
                size="sm"
              >
                <Text style={{ fontFamily: "Doc" }} className="text-gray-600">
                  إلغاء
                </Text>
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Only render direct replies (level 0 -> level 1), no nested replies */}
      {level === 0 && comment.replies && comment.replies.length > 0 && (
        <View className="">
          {comment.replies.map((reply) => renderComment(reply, level + 1))}
        </View>
      )}
    </View>
  );

  return (
    <View className="px-2 py-4 mt-4 border-t border-gray-200">
      <View className="flex-row items-center mb-4">
        <MessageCircle size={14} color="#ff4133" />
        <Text
          style={{ fontFamily: "Doc" }}
          className="text-md text-gray-900 ml-2"
        >
          التعليقات ({comments.length})
        </Text>
      </View>

      {/* Add new comment */}
      {isAuthenticated ? (
        <View className="mb-4 p-3 ">
          <TextInput
            style={{ fontFamily: "Doc" }}
            className="border border-gray-300 rounded p-3 mb-3"
            placeholder="اكتب تعليقك هنا..."
            value={newComment}
            onChangeText={onNewCommentChange}
            multiline
            numberOfLines={3}
          />
          <Button
            onPress={() => onCreateComment(newComment)}
            disabled={!newComment.trim()}
          >
            <Text style={{ fontFamily: "Doc" }} className="text-white">
              إضافة تعليق
            </Text>
          </Button>
        </View>
      ) : (
        <View className="mb-4 p-3 bg-gray-100 rounded-lg">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-gray-600 text-center"
          >
            يجب تسجيل الدخول لإضافة تعليق
          </Text>
        </View>
      )}

      {/* Comments list */}
      {commentsLoading ? (
        <View className="py-4">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-center text-gray-500"
          >
            جاري تحميل التعليقات...
          </Text>
        </View>
      ) : comments.length > 0 ? (
        <View>{comments.map((comment) => renderComment(comment))}</View>
      ) : (
        <View className="py-8">
          <Text
            style={{ fontFamily: "Doc" }}
            className="text-center text-gray-500"
          >
            لا توجد تعليقات بعد. كن أول من يعلق!
          </Text>
        </View>
      )}
    </View>
  );
};
