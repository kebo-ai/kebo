import { TouchableOpacity, Text, View } from "react-native";
import { Category } from "@/models/category/category";
import { Icon } from "@/models/icon/icon";
import tw from "@/hooks/use-tailwind";
import { SvgUri } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { useState, useEffect } from "react";
import { translateCategoryName } from "@/utils/category-translations";
import * as Haptics from "expo-haptics";

export const CategoryItem: React.FC<{
  item: Category | Icon;
  onSelect: () => void;
  showLabel?: boolean;
  onEdit?: () => void;
  onAdd?: () => void;
  showActions?: boolean;
  setShowActions?: (showActions: boolean) => void;
  screenName?: string;
  disableTouch?: boolean;
}> = ({
  item,
  showLabel = true,
  onSelect,
  onEdit,
  onAdd,
  showActions,
  setShowActions,
  screenName,
  disableTouch = false,
}) => {
  const imageUrl = "icon_url" in item ? item.icon_url : item.url;
  const isEmoji = imageUrl && !imageUrl.startsWith("/storage/");
  const [isPressed, setIsPressed] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const shouldShowFullName = screenName === "CreateBudgetCategory";

  useEffect(() => {
    const calculateDisplayName = () => {
      if (!item.name) return "";

      const translatedName = translateCategoryName(
        item.name,
        item.id,
        imageUrl || ""
      );

      if (shouldShowFullName) {
        return translatedName;
      } else {
        return translatedName.length > 8
          ? translatedName.slice(0, 9) + "..."
          : translatedName;
      }
    };

    const timer = setTimeout(() => {
      setDisplayName(calculateDisplayName());
    }, 50);

    return () => clearTimeout(timer);
  }, [item.name, item.id, imageUrl, shouldShowFullName]);

  const content = (
    <>
      <View style={tw`w-[50px] h-[50px] items-center justify-center`}>
        {imageUrl ? (
          isEmoji ? (
            <Text style={tw`text-3xl`}>{imageUrl}</Text>
          ) : (
            <SvgUri
              width={50}
              height={50}
              uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${imageUrl}`}
            />
          )
        ) : (
          <View style={tw`w-[50px] h-[50px]`} />
        )}
      </View>

      {showActions && (
        <View
          style={tw`absolute -top-2 -left-5 -right-5 flex-row justify-between`}
        >
          <TouchableOpacity
            onPress={() => {
              onEdit?.();
              setShowActions?.(false);
            }}
            style={tw`rounded-full p-2 shadow-md`}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onAdd?.();
              setShowActions?.(false);
            }}
            style={tw`rounded-full p-2 shadow-md`}
          >
            <Ionicons name="trash" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {showLabel && (
        <View style={tw`h-4 mt-2 justify-center`}>
          <Text
            style={tw`text-xs text-[#606A84] text-center`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayName || ""}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={tw`w-[70px] h-[90px] items-center justify-center`}>
      {disableTouch ? (
        <View
          style={tw`items-center justify-center w-full h-full rounded-lg`}
        >
          {content}
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPressIn={() => {
            setIsPressed(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onPressOut={() => setIsPressed(false)}
          style={[
            tw`items-center justify-center w-full h-full rounded-lg`,
            {
              backgroundColor: isPressed ? "#6934D215" : "transparent",
            },
          ]}
          onPress={onSelect}
        >
          {content}
        </TouchableOpacity>
      )}
    </View>
  );
};
