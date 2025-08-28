import { Skeleton } from "moti/skeleton";
import { View } from "react-native";

export const MangaDetailSkeleton = () => {
  return (
    <View className="px-2 py-4">
      {/* Path Indicator */}
      <View className="px-2 mb-4">
        <View className="flex-row items-center space-x-2">
          <Skeleton colorMode="light" width={60} height={14} radius={4} />
          <Skeleton colorMode="light" width={8} height={14} radius={4} />
          <Skeleton colorMode="light" width={100} height={14} radius={4} />
        </View>
      </View>

      {/* Main Content */}
      <View className="px-2">
        {/* Cover Image - Centered */}
        <View className="items-start mb-4">
          <Skeleton colorMode="light" width={220} height={350} radius={8} />
        </View>

        {/* Manga Details */}
        <View className="px-2 py-2">
          {/* Title */}
          <Skeleton colorMode="light" width="80%" height={24} radius={4} />
          <View className="mb-1" />

          {/* Other Titles */}
          <Skeleton colorMode="light" width="60%" height={16} radius={4} />
          <View className="mb-3" />

          {/* Author, Artist, Type, Status */}
          <View className="mb-3">
            <Skeleton colorMode="light" width="70%" height={14} radius={4} />
            <View className="mb-1" />
            <Skeleton colorMode="light" width="65%" height={14} radius={4} />
            <View className="mb-1" />
            <Skeleton colorMode="light" width="40%" height={14} radius={4} />
            <View className="mb-1" />
            <Skeleton colorMode="light" width="45%" height={14} radius={4} />
          </View>

          {/* Genres */}
          <View className="flex-row flex-wrap mb-4">
            <Skeleton colorMode="light" width={60} height={24} radius={12} />
            <View className="mr-2" />
            <Skeleton colorMode="light" width={80} height={24} radius={12} />
            <View className="mr-2" />
            <Skeleton colorMode="light" width={70} height={24} radius={12} />
            <View className="mr-2" />
            <Skeleton colorMode="light" width={65} height={24} radius={12} />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Skeleton colorMode="light" width="100%" height={16} radius={4} />
            <View className="mb-2" />
            <Skeleton colorMode="light" width="95%" height={16} radius={4} />
            <View className="mb-2" />
            <Skeleton colorMode="light" width="90%" height={16} radius={4} />
            <View className="mb-2" />
            <Skeleton colorMode="light" width="85%" height={16} radius={4} />
          </View>
        </View>

        {/* Similar Manga Section */}
        <View className="py-4 px-2">
          <Skeleton colorMode="light" width="40%" height={24} radius={4} />
          <View className="mt-4">
            <View className="flex-row">
              <View className="flex-1 px-2">
                <Skeleton
                  colorMode="light"
                  width="100%"
                  height={245}
                  radius={10}
                />
                <View className="pt-2 px-1">
                  <Skeleton
                    colorMode="light"
                    width="90%"
                    height={14}
                    radius={4}
                  />
                  <View className="mb-1" />
                  <Skeleton
                    colorMode="light"
                    width="70%"
                    height={12}
                    radius={4}
                  />
                  <View className="mb-2" />
                  <Skeleton
                    colorMode="light"
                    width="50%"
                    height={12}
                    radius={4}
                  />
                </View>
              </View>
              <View className="flex-1 px-2">
                <Skeleton
                  colorMode="light"
                  width="100%"
                  height={245}
                  radius={10}
                />
                <View className="pt-2 px-1">
                  <Skeleton
                    colorMode="light"
                    width="85%"
                    height={14}
                    radius={4}
                  />
                  <View className="mb-1" />
                  <Skeleton
                    colorMode="light"
                    width="65%"
                    height={12}
                    radius={4}
                  />
                  <View className="mb-2" />
                  <Skeleton
                    colorMode="light"
                    width="45%"
                    height={12}
                    radius={4}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Chapters Section */}
        <View className="px-2 py-4">
          <Skeleton colorMode="light" width="30%" height={24} radius={4} />
          <View className="mt-4">
            {/* Chapter items */}
            {[...Array(8)].map((_, index) => (
              <View key={index} className="py-2">
                <Skeleton
                  colorMode="light"
                  width="80%"
                  height={14}
                  radius={4}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
