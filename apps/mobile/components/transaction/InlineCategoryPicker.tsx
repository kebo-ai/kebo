import React, { useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { PressableScale } from "pressto";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";
import { Category } from "@/models/category/category";
import { translateCategoryName } from "@/utils/category-translations";

interface InlineCategoryPickerProps {
  categories: Category[];
  selectedId: string;
  onSelect: (category: Category) => void;
  onEdit: () => void;
}

export function InlineCategoryPicker({
  categories,
  selectedId,
  onSelect,
  onEdit,
}: InlineCategoryPickerProps) {
  const { theme } = useTheme();

  const visibleCategories = useMemo(
    () => categories.filter((cat) => cat.is_visible !== false),
    [categories],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Category; index: number }) => {
      const isSelected = item.id === selectedId;
      const isEmoji = item.icon_url && !item.icon_url.startsWith("/storage/");

      return (
        <Animated.View
          entering={FadeIn.duration(250).delay(index * 30)}
          style={styles.itemWrapper}
        >
          <PressableScale
            onPress={() => onSelect(item)}
            style={[
              styles.item,
              {
                backgroundColor: `${colors.primary}${isSelected ? "26" : "0D"}`,
                borderColor: isSelected ? colors.primary : "transparent",
                borderWidth: isSelected ? 2 : 1,
                opacity: isSelected ? 1 : 0.7,
              },
            ]}
          >
            <View style={styles.iconBox}>
              {isEmoji ? (
                <Text style={styles.emoji}>{item.icon_url}</Text>
              ) : item.icon_url ? (
                <SvgUri
                  width={22}
                  height={22}
                  uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.icon_url}`}
                />
              ) : (
                <Ionicons
                  name="folder-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              )}
            </View>
            <Text
              type="xs"
              weight="medium"
              color={theme.textPrimary}
              numberOfLines={1}
            >
              {translateCategoryName(item.name, item.id, item.icon_url ?? undefined)}
            </Text>
          </PressableScale>
        </Animated.View>
      );
    },
    [selectedId, onSelect, theme],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={true}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <PressableScale onPress={onEdit} style={styles.editRow}>
        <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        <Text type="sm" weight="medium" color={colors.primary}>
          Edit categories
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  list: {
    maxHeight: 250,
  },
  columnWrapper: {
    gap: 8,
  },
  itemWrapper: {
    flex: 1,
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 20,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
});
