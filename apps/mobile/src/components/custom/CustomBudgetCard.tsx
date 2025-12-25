import logger from "../../utils/logger";
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { translate } from "../../i18n";
import { colors } from "../../theme";
import tw from "../../utils/useTailwind";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import * as Haptics from "expo-haptics";
import moment from "moment";
import "moment/locale/es";
import i18n from "../../i18n/i18n";
import { PencilSvg } from "../svg/PencilSvg";

const ensureValidMomentLocale = () => {
  try {
    const currentLocale = i18n.language?.split("-")[0] || "en";
    if (!moment.localeData(currentLocale)) {
      moment.locale("en");
    } else {
      moment.locale(currentLocale);
    }
  } catch (error) {
    logger.warn("Error setting moment locale:", error);
    moment.locale("en");
  }
};

interface BudgetMetrics {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_progress_percentage: number;
}

interface CustomBudgetCardProps {
  budget: {
    budget: {
      custom_name: string;
      start_date: string;
      end_date: string;
    };
    total_metrics: BudgetMetrics;
  };
  onEditPress?: () => void;
  onArrowPress?: () => void;
  isSwipeOpen?: boolean;
}

const CustomBudgetCard: React.FC<CustomBudgetCardProps> = ({
  budget,
  onEditPress,
  onArrowPress,
  isSwipeOpen = false,
}) => {
  const { formatAmount } = useCurrencyFormatter();
  const { total_metrics } = budget;
  const progressWidth = `${Math.min(
    total_metrics.overall_progress_percentage,
    100
  )}%`;

  const parseDate = (dateString: string) => {
    try {
      ensureValidMomentLocale();

      const parsedDate = moment(dateString, "DD/MM/YYYY");
      if (parsedDate.isValid()) {
        return parsedDate.toDate();
      }

      const isoDate = moment(dateString);
      if (isoDate.isValid()) {
        return isoDate.toDate();
      }

      logger.warn("Invalid date format:", dateString);
      return new Date();
    } catch (error) {
      logger.warn("Error parsing date:", error);
      return new Date();
    }
  };
  return (
    <View>
      <TouchableOpacity
        style={[
          tw`bg-white p-4 shadow-sm border border-[#E1E5EC]`,
          isSwipeOpen ? tw`rounded-l-3xl` : tw`rounded-3xl`,
        ]}
        onPress={() => {
          onArrowPress?.();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <View style={tw`flex-row justify-between items-start`}>
          <View>
            <Text
              style={[
                tw`text-black text-base`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {budget.budget.custom_name}
            </Text>
            <Text
              style={[
                tw`text-[${colors.primary}] text-xs mt-1`,
                { fontFamily: "SFUIDisplayLight" },
              ]}
            >
              {(() => {
                try {
                  const startDate = parseDate(budget.budget.start_date);
                  const endDate = parseDate(budget.budget.end_date);

                  ensureValidMomentLocale();
                  const startFormatted = moment(startDate).format("DD/MM/YYYY");
                  const endFormatted = moment(endDate).format("DD/MM/YYYY");

                  return `${startFormatted} ${translate(
                    "budgetScreen:to"
                  )} ${endFormatted}`;
                } catch (error) {
                  logger.warn("Error formatting dates:", error);
                  return `${budget.budget.start_date} ${translate(
                    "budgetScreen:to"
                  )} ${budget.budget.end_date}`;
                }
              })()}
            </Text>
          </View>
          {onEditPress && (
            <TouchableOpacity onPress={onEditPress}>
              <PencilSvg width={20} height={20} />
            </TouchableOpacity>
          )}
          {onArrowPress && (
            <View style={tw`items-center justify-center`}>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.primary}
              />
            </View>
          )}
        </View>

        <View style={tw`flex-row items-center justify-between mt-2`}>
          <View style={tw`flex-row items-end`}>
            <Text
              style={[
                tw`text-black text-xl`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {formatAmount(total_metrics.total_budget)}
            </Text>
          </View>
          <Text
            style={[
              tw`text-[#606A84] text-xs`,
              { fontFamily: "SFUIDisplayLight" },
            ]}
          >
            {Math.min(total_metrics.overall_progress_percentage, 100).toFixed(
              0
            )}
            %
          </Text>
        </View>

        <View style={tw`flex-row items-center justify-between mt-2`}>
          <View
            style={tw`flex-1 h-4 bg-[#606A84]/15 rounded-full overflow-hidden`}
          >
            <View
              style={[
                tw`h-full rounded-full`,
                total_metrics.total_spent >= total_metrics.total_budget
                  ? tw`bg-[#ED706B]`
                  : tw`bg-[#C4A8FF]`,
                { width: progressWidth },
              ]}
            />
          </View>
        </View>
        <View style={tw`flex-row justify-between mt-2`}>
          <Text
            style={[
              tw`text-xs`,
              { fontFamily: "SFUIDisplayLight" },
              total_metrics.total_spent > total_metrics.total_budget
                ? tw`text-[#ED706B]`
                : tw`text-[#5C6784]`,
            ]}
          >
            {formatAmount(total_metrics.total_spent)}{" "}
            {translate("budgetScreen:spent")}
          </Text>
          <Text
            style={[
              tw`text-[#5C6784] text-xs`,
              { fontFamily: "SFUIDisplayLight" },
            ]}
          >
            {formatAmount(total_metrics.total_remaining)}{" "}
            {translate("budgetScreen:toSpend")}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomBudgetCard;
