import logger from "../utils/logger";
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import i18n from "../../i18n/i18n";
import { translate } from "../../i18n";
import { translateCategoryName } from "../../utils/categoryTranslations";
import tw from "../../utils/useTailwind";
import { SvgUri } from "react-native-svg";
import { KeboSadIconSvg } from "../svg/KeboSadIconSvg";
import { RecurrenceIconHomeSvg } from "../svg/RecurrenceIconHomeSvg";
import { colors } from "../../theme";
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
          tw`py-4 px-4 bg-white`,
          !isLastItem && tw`border-b border-[#EBEBEF]`,
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
                  tw`absolute -bottom-1 -right-1 bg-white rounded-full`,
                  {
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
                  style={[
                    tw`text-base text-[#110627]`,
                    { fontFamily: "SFUIDisplayMedium" },
                  ]}
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
                style={[
                  tw`text-xs text-[#606A84]`,
                  { fontFamily: "SFUIDisplayLight" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {descriptionText}
              </Text>
            </View>
          </View>
          <View style={tw`items-end min-w-[100px]`}>
            <Text
              style={[
                tw`text-base ${
                  isExpense ? "text-[#606A84]" : "text-[#6934D2]"
                }`,
                { fontFamily: "SFUIDisplayBold" },
              ]}
            >
              {isExpense ? "- " : ""}
              {formatAmount(Math.abs(transaction.amount))}
            </Text>
            <Text
              style={[
                tw`text-xs text-[#606A84] mt-0.5`,
                { fontFamily: "SFUIDisplayRegular" },
              ]}
            >
              {formatDate(transaction.date)}
            </Text>
          </View>
          <View style={tw`items-end pl-2 ml-1`}>
            <MaterialIcons name="chevron-right" size={24} color="#6934D2" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};
