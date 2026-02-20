import logger from "@/utils/logger";
import React from "react";
import { View, Pressable, Image } from "react-native";
import { Text } from "@/components/ui";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import i18n from "@/i18n/i18n";
import { translate } from "@/i18n";
import { translateCategoryName } from "@/utils/categoryTranslations";
import tw from "@/hooks/useTailwind";
import { SvgUri } from "react-native-svg";
import { KeboSadIconSvg } from "@/components/icons/KeboSadIconSvg";
import { RecurrenceIconHomeSvg } from "@/components/icons/RecurrenceIconHomeSvg";
import { colors } from "@/theme";
import { useTheme } from "@/hooks/useTheme";
import { useCurrencyFormatter } from "./CurrencyFormatter";

interface TransactionListProps {
  transaction: any;
  index: number;
  transactions: any[];
  handleEditTransaction: (transaction: any) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transaction,
  index,
  transactions,
  handleEditTransaction,
}) => {
  const isExpense = transaction.transaction_type === "Expense";
  const isLastItem = index === transactions.length - 1;
  const { formatAmount } = useCurrencyFormatter();
  const { theme } = useTheme();
  const currentLocale = i18n.language.split("-")[0];

  const formatDate = (date: string) => {
    const today = moment().startOf("day");
    const transactionDate = moment(date).startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    if (transactionDate.isSame(today)) {
      return translate("homeScreen:today");
    } else if (transactionDate.isSame(yesterday)) {
      return translate("homeScreen:yesterday");
    } else {
      return moment(date)
        .locale(currentLocale)
        .format("MMM DD")
        .replace(/^\w/, (c) => c.toUpperCase());
    }
  };

  const categoryText = transaction.category_name
    ? transaction.category_name.length > 20
      ? `${translateCategoryName(transaction.category_name, transaction.category_id, transaction.category_icon_url).substring(0, 20)}...`
      : translateCategoryName(transaction.category_name, transaction.category_id, transaction.category_icon_url)
    : translate("homeScreen:noCategory");

  const descriptionText = transaction.description
    ? transaction.description.length > 20
      ? `${transaction.description.substring(0, 20)}...`
      : transaction.description
    : translate("transactionScreen:noDescription");

  return (
    <Pressable onPress={() => handleEditTransaction(transaction)}>
      <View
        style={[
          tw`py-4 px-4`,
          { backgroundColor: theme.surface },
          !isLastItem && { borderBottomWidth: 1, borderBottomColor: theme.border },
        ]}
      >
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center flex-1 mr-3`}>
            <View
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center mr-3 relative`,
                {
                  borderWidth: 1.3,
                  borderColor: isExpense ? colors.bgGray : colors.primary,
                },
              ]}
            >
              <View style={tw`w-full h-full items-center justify-center`}>
                {transaction.category_icon_url ? (
                  transaction.category_icon_url.startsWith("/storage/") ? (
                    <SvgUri
                      width="100%"
                      height="100%"
                      uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${transaction.category_icon_url}`}
                    />
                  ) : (
                    <Text style={tw`text-2xl`}>
                      {transaction.category_icon_url}
                    </Text>
                  )
                ) : (
                  <KeboSadIconSvg width={24} height={24} />
                )}
              </View>
              <View
                style={[
                  tw`absolute -bottom-1 -right-1 rounded-full`,
                  {
                    backgroundColor: theme.surface,
                    borderWidth: 1.3,
                    borderColor: isExpense ? colors.bgGray : colors.primary,
                  },
                ]}
              >
                {transaction.bank_url ? (
                  <Image
                    source={{
                      uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${transaction.bank_url}`,
                    }}
                    style={tw`w-[13px] h-[13px] rounded-full`}
                    onError={(e) =>
                      logger.debug(
                        "Error loading bank icon:",
                        e.nativeEvent.error
                      )
                    }
                  />
                ) : (
                  <KeboSadIconSvg width={13} height={13} />
                )}
              </View>
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center`}>
                <Text
                  weight="medium"
                  style={tw`text-base`}
                  color={theme.textPrimary}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {categoryText}
                </Text>
                {transaction.metadata?.auto_generated && (
                  <View style={tw`ml-1 w-5 h-5 items-center justify-center`}>
                    <RecurrenceIconHomeSvg width={20} height={20} />
                  </View>
                )}
              </View>
              <Text
                weight="light"
                style={tw`text-xs`}
                color={theme.textSecondary}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {descriptionText}
              </Text>
            </View>
          </View>
          <View style={tw`items-end min-w-[100px]`}>
            <Text
              weight="bold"
              style={tw`text-base`}
              color={isExpense ? theme.textSecondary : colors.primary}
            >
              {isExpense ? "- " : ""}
              {formatAmount(Math.abs(transaction.amount))}
            </Text>
            <Text
              weight="normal"
              style={tw`text-xs mt-0.5`}
              color={theme.textSecondary}
            >
              {formatDate(transaction.date)}
            </Text>
          </View>
          <View style={tw`items-end pl-2 ml-1`}>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};
