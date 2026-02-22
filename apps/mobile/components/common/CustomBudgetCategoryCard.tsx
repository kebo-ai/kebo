import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { translate } from "@/i18n";
import tw from "@/hooks/useTailwind";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/theme";
import { PencilSvg } from "@/components/icons/PencilSvg";

interface CategoryMetrics {
  budget_line_id: string;
  category_id: string;
  category_name: string;
  icon_url: string;
  icon_emoji: string | null;
  color_id: string | null;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
}

interface CustomBudgetCategoryCardProps {
  category_metrics: CategoryMetrics;
  router?: any;
  editCategory: () => void;
}

const CustomBudgetCategoryCard: React.FC<CustomBudgetCategoryCardProps> = ({
  category_metrics,
  router,
  editCategory,
}) => {
  const { formatAmount } = useCurrencyFormatter();
  const progressWidth = `${Math.min(
    category_metrics.progress_percentage,
    100
  )}%`;

  return (
    <View style={tw`px-6 py-2`}>
      <View
        style={tw`bg-white rounded-3xl p-4 shadow-sm border border-[#E1E5EC]`}
      >
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center`}>
            <Text
              style={tw`text-2xl w-12 h-12 items-center text-center justify-center border border-[#E1E5EC] rounded-full p-2 `}
            >
              {category_metrics.icon_url}
            </Text>
            <Text
              style={[
                tw`text-[#606A84] text-base ml-2`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {category_metrics.category_name}
            </Text>
          </View>
          <TouchableOpacity onPress={editCategory}>
            <PencilSvg width={20} height={20} />
          </TouchableOpacity>
        </View>
        <View style={tw`mt-2`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text
              style={[
                tw`text-black text-xl`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {formatAmount(category_metrics.budgeted_amount)}{" "}
            </Text>
            <Text
              style={[
                tw`text-[#606A84] text-xs`,
                { fontFamily: "SFUIDisplayLight" },
              ]}
            >
              {category_metrics.progress_percentage.toFixed(0)}%
            </Text>
          </View>
          <View style={tw`h-4 bg-[#606A84]/15 rounded-full overflow-hidden`}>
            <View
              style={[
                tw`h-full rounded-full`,
                category_metrics.spent_amount >=
                category_metrics.budgeted_amount
                  ? tw`bg-[#ED706B]`
                  : tw`bg-[#C4A8FF]`,
                {
                  width: `${Math.min(
                    category_metrics.progress_percentage,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
          <View style={tw`flex-row justify-between mt-1`}>
            <Text
              style={[
                tw`text-[#5C6784] text-xs`,
                { fontFamily: "SFUIDisplayLight" },
              ]}
            >
              {formatAmount(category_metrics.spent_amount)}{" "}
              {translate("budgetScreen:spent")}
            </Text>
            <Text
              style={[
                tw`text-[#5C6784] text-xs`,
                { fontFamily: "SFUIDisplayLight" },
              ]}
            >
              {formatAmount(category_metrics.remaining_amount)}{" "}
              {translate("budgetScreen:toSpend")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CustomBudgetCategoryCard;
