import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui";
import tw from "@/hooks/use-tailwind";
import { translate } from "@/i18n";
import { useCurrencyFormatter } from "./currency-formatter";
import * as Haptics from "expo-haptics";
import { SwipeableListWrapper } from "@/components/swipeable-list-wrapper/swipeable-list-wrapper";
import { colors } from "@/theme";
import { useTheme } from "@/hooks/use-theme";
import { RowMap } from "react-native-swipe-list-view";
import { MaterialIcons } from "@expo/vector-icons";
import { InteractionManager } from "react-native";

interface BudgetLine {
  id: string;
  category_id: string;
  category_name: string;
  icon_url: string;
  icon_emoji: string | null;
  color_id: string | null;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
}

interface CategoriesListBudgetProps {
  data: BudgetLine[];
  onCategoryPress: (categoryId: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onConfirmDelete?: (categoryId: string) => void;
  onRowOpen?: (rowKey: string) => void;
  onRowClose?: () => void;
}

export const CategoriesListBudget: React.FC<CategoriesListBudgetProps> = ({
  data,
  onCategoryPress,
  onDeleteCategory,
  onConfirmDelete,
  onRowOpen,
  onRowClose,
}) => {
  const { formatAmount } = useCurrencyFormatter();
  const { isDark, theme } = useTheme();

  if (data.length === 0) {
    return (
      <View
        style={[
          tw`p-6 rounded-[18px] mx-4 mb-4`,
          {
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
          },
        ]}
      >
        <Text color={theme.textSecondary} style={tw`text-center`}>
          {translate("budgetScreen:noCategory")}
        </Text>
      </View>
    );
  }

  const progressTrackBg = isDark ? "rgba(96, 106, 132, 0.25)" : "#F5F5F5";

  const renderBudgetItem = (
    item: BudgetLine,
    index: number,
    isLast: boolean
  ) => (
    <View style={{ backgroundColor: theme.surface }}>
      <TouchableOpacity
        onPress={() => {
          onCategoryPress(item.category_id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <View
          style={[
            tw`flex-row items-center justify-between py-4 px-4`,
            !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
          ]}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
              {
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: isDark ? "rgba(96, 106, 132, 0.5)" : "rgba(96, 106, 132, 0.5)",
              },
            ]}
          >
            <Text style={tw`text-xl`}>{item.icon_emoji || item.icon_url}</Text>
          </View>
          <View style={tw`flex-1`}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text
                weight="light"
                style={tw`text-base`}
                color={theme.textSecondary}
              >
                {item.category_name}
              </Text>
              <Text
                weight="medium"
                style={tw`text-sm`}
                color={theme.textPrimary}
              >
                {formatAmount(item.amount)}
              </Text>
            </View>
            <View
              style={[
                tw`mt-2 h-2 rounded-full overflow-hidden`,
                { backgroundColor: progressTrackBg },
              ]}
            >
              <View
                style={[
                  tw`h-full rounded-full`,
                  item.spent_amount >= item.amount
                    ? tw`bg-[#ED706B]`
                    : tw`bg-[#C4A8FF]`,
                  { width: `${Math.min(item.progress_percentage, 100)}%` },
                ]}
              />
            </View>
            <View style={tw`flex-row justify-between items-center mt-1`}>
              <Text
                style={tw`text-xs font-light`}
                color={item.spent_amount >= item.amount ? "#ED706B" : theme.textSecondary}
              >
                {formatAmount(item.spent_amount)}
              </Text>
              <Text
                style={tw`text-xs font-light`}
                color={theme.textSecondary}
              >
                {formatAmount(item.remaining_amount)}
              </Text>
            </View>
          </View>
          <View style={tw`items-end`}>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const handleDeleteWithConfirmation = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (onConfirmDelete) {
      onConfirmDelete(categoryId);
    } else if (onDeleteCategory) {
      onDeleteCategory(categoryId);
    }
  };

  const renderHiddenItem = (
    data: { item: BudgetLine },
    rowMap: RowMap<BudgetLine>
  ) => (
    <View
      style={[
        tw`flex-1 flex-row justify-end items-stretch h-full`,
        { position: "absolute", right: 0, top: 0, bottom: 0, width: "100%" },
      ]}
    >
      <TouchableOpacity
        style={[
          tw`bg-[${colors.secondary}] w-20 h-full justify-center items-center`,
          { position: "absolute", right: 0 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(() => {
            handleDeleteWithConfirmation(data.item.category_id);
          }, 100);
        }}
      >
        <MaterialIcons name="delete" size={28} color={colors.white} />
        <Text
          weight="medium"
          style={tw`text-xs mt-1 text-white`}
        >
          {translate("common:delete")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!onDeleteCategory && !onConfirmDelete) {
    return (
      <View style={[tw`rounded-[18px] overflow-hidden`, { backgroundColor: theme.surface }]}>
        {data.map((item, index) => (
          <View key={item.id}>
            {renderBudgetItem(item, index, index === data.length - 1)}
          </View>
        ))}
      </View>
    );
  }

  const renderItemWrapper = (item: BudgetLine) => {
    const index = data.findIndex((dataItem) => dataItem.id === item.id);
    return renderBudgetItem(item, index, index === data.length - 1);
  };

  return (
    <View style={[tw`rounded-[18px] overflow-hidden`, { backgroundColor: theme.surface }]}>
      <SwipeableListWrapper
        data={data}
        renderItem={renderItemWrapper}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-80}
        disableRightSwipe
        keyExtractor={(item) => item.id}
        onRowOpen={onRowOpen}
        onRowClose={onRowClose}
        useNativeDriver={true}
        onSwipeStart={() => {
          InteractionManager.runAfterInteractions(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          });
        }}
        onSwipeEnd={() => {}}
        onDelete={(id) => {
          const item = data.find((item) => item.id === id);
          if (item) {
            handleDeleteWithConfirmation(item.category_id);
          }
        }}
        rightThreshold={70}
        deleteButtonStyle={`bg-[${colors.secondary}]`}
      />
    </View>
  );
};
