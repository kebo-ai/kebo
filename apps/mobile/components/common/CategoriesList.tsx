import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { translate } from "@/i18n";
import { SvgUri } from "react-native-svg";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import { colors } from "@/theme/colors";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import { translateCategoryName } from "@/utils/category-translations";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "@/hooks/use-theme";

interface ItemData {
  id: string;
  name: string;
  amount: number;
  icon?: string;
  percentage?: number;
  color?: string;
  bar_color?: string;
  transaction_type?: string;
  transaction_count?: number;
}

interface CategoriesListProps {
  data: ItemData[];
  navigation?: any;
  selectedMonth?: string;
  onDeleteItem?: (id: string) => void;
  formatAmount?: (amount: number) => string;
  percentage?: number;
  color?: string;
  bar_color?: string;
  transaction_type?: string;
  icon?: string;
  transaction_count?: number;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
  data,
  navigation,
  selectedMonth,
  onDeleteItem,
  transaction_count,
}) => {
  const { formatAmount } = useCurrencyFormatter();
  const { isDark, theme } = useTheme();
  const currentScreen = useRoute().name;

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
          {translate("homeScreen:noTransactions")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[tw`rounded-[18px] overflow-hidden`, { backgroundColor: theme.surface }]}>
      {data.map((item) => {
        const isExpense = item.transaction_type === "Expense";
        const isIncome = item.transaction_type === "Income";

        const descriptionText = item.name
          ? item.name.length > 18
            ? `${translateCategoryName(item.name, item.id, item.icon).substring(
                0,
                18
              )}...`
            : translateCategoryName(item.name, item.id, item.icon)
          : translate("homeScreen:noDescription");

        const amountText =
          (isExpense ? "- " : "") + formatAmount(Math.abs(item.amount));

        let borderColor = item.color || colors.bgGray;
        let amountColor = isExpense
          ? theme.textSecondary
          : isIncome
          ? "#9C88FF"
          : theme.textSecondary;
        if (isExpense) borderColor = "#9C88FF";
        if (isIncome) borderColor = "#9C88FF";

        const handlePress = () => {
          if (navigation) {
            const filters: {
              categoryIds?: string[];
              months?: string[];
              transactionType?: "Income" | "Expense";
            } = {};
            if (item.id) filters.categoryIds = [String(item.id)];
            if (selectedMonth) filters.months = [selectedMonth];
            if (
              item.transaction_type === "Income" ||
              item.transaction_type === "Expense"
            ) {
              filters.transactionType = item.transaction_type;
            }

            navigation.navigate("Transactions", {
              origin: currentScreen,
              initialFilters: filters,
            });
          }
        };

        return (
          <Pressable
            key={item.id}
            style={{ backgroundColor: theme.background }}
            onPress={handlePress}
            android_ripple={{ color: colors.primary + "20" }}
          >
            <View
              style={[
                tw`py-4 pl-4`,
                {
                  backgroundColor: theme.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`w-10 h-10 rounded-full items-center justify-center mr-3 relative`,
                      {
                        borderWidth: 1.3,
                        borderColor: borderColor,
                      },
                    ]}
                  >
                    <View style={tw`w-full h-full items-center justify-center`}>
                      {item.icon ? (
                        item.icon.startsWith("/storage/") ? (
                          <SvgUri
                            width="100%"
                            height="100%"
                            uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.icon}`}
                          />
                        ) : (
                          <Text style={tw`text-2xl`}>{item.icon}</Text>
                        )
                      ) : (
                        <KeboSadIconSvg width={32} height={32} />
                      )}
                    </View>
                  </View>
                  <View>
                    <Text
                      weight="medium"
                      style={tw`text-base`}
                      color={theme.textPrimary}
                    >
                      {descriptionText}
                    </Text>
                    <Text
                      style={tw`text-[10px] mt-0.5`}
                      color={theme.textSecondary}
                    >
                      {item.transaction_count}{" "}
                      {item.transaction_count === 1
                        ? translate("reportsCategoryScreen:transaction")
                        : translate("reportsCategoryScreen:transactions")}
                    </Text>
                  </View>
                </View>
                <View style={tw`items-end pr-4`}>
                  <Text
                    weight="bold"
                    color={amountColor}
                    style={tw`text-base`}
                  >
                    {amountText}
                  </Text>

                  {currentScreen === "ReportsCategoryScreen" &&
                    item.percentage !== undefined && (
                      <Text
                        weight="normal"
                        style={tw`text-xs mt-0.5`}
                        color={theme.textSecondary}
                      >
                        {item.percentage.toFixed(1)}%
                      </Text>
                    )}
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
