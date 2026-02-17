import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui";
import tw from "@/hooks/useTailwind";
import { translate } from "@/i18n";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import * as Haptics from "expo-haptics";
import { SwipeableListWrapper } from "@/components";
import { colors } from "@/theme";
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

  if (data.length === 0) {
    return (
      <View
        style={tw`border border-[#EBEBEF] bg-white p-6 rounded-[18px] mx-4 mb-4`}
      >
        <Text style={tw`text-[#606A84] text-center`}>
          {translate("budgetScreen:noCategory")}
        </Text>
      </View>
    );
  }

  const renderBudgetItem = (
    item: BudgetLine,
    index: number,
    isLast: boolean
  ) => (
    <View style={tw`bg-white`}>
      <TouchableOpacity
        onPress={() => {
          onCategoryPress(item.category_id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <View
          style={[
            tw`flex-row items-center justify-between py-4 px-4`,
            !isLast && tw`border-b border-[#EBEBEF]`,
          ]}
        >
          <View
            style={tw`w-10 h-10 rounded-full bg-white border border-[#606A84]/50 items-center justify-center mr-3`}
          >
            <Text style={tw`text-xl`}>{item.icon_emoji || item.icon_url}</Text>
          </View>
          <View style={tw`flex-1`}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text
                weight="light"
                style={tw`text-base text-[#606A84]`}
              >
                {item.category_name}
              </Text>
              <Text
                weight="medium"
                style={tw`text-[#110627] text-sm`}
              >
                {formatAmount(item.amount)}
              </Text>
            </View>
            <View
              style={tw`mt-2 bg-[#F5F5F5] h-2 rounded-full overflow-hidden`}
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
                style={[
                  tw`text-xs font-light`,
                  item.spent_amount >= item.amount
                    ? tw`text-[#ED706B]`
                    : tw`text-[#606A84]`,
                ]}
              >
                {formatAmount(item.spent_amount)}
              </Text>
              <Text style={tw`text-[#606A84] text-xs font-light`}>
                {formatAmount(item.remaining_amount)}
              </Text>
            </View>
          </View>
          <View style={tw`items-end`}>
            <MaterialIcons name="chevron-right" size={24} color="#6934D2" />
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
      <View style={tw`bg-white rounded-[18px] overflow-hidden`}>
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
    <View style={tw`bg-white rounded-[18px] overflow-hidden`}>
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
