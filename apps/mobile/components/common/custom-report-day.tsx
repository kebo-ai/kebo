import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import tw from "twrnc";
import { translate } from "@/i18n";
import moment from "moment";
import { ArrowRightIconSvg } from "@/components/icons/arrow-right-icon";
import { useCurrencyFormatter } from "./currency-formatter";
import i18n from "@/i18n/i18n";
import { ArrowLefttIconV2 } from "@/components/icons/arrow-leftt-icon-v2";
import { useTheme } from "@/hooks/use-theme";

interface CustomReportDayProps {
  month: string;
  total: number;
  porcentaje: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}

export const CustomReportDay: React.FC<CustomReportDayProps> = ({
  month,
  total,
  porcentaje,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}) => {
  const { width } = useWindowDimensions();
  const { formatAmount } = useCurrencyFormatter();
  const { isDark, theme } = useTheme();
  const currentLocale = i18n.language.split("-")[0];

  const getFontSize = (amount: number) => {
    const amountStr = formatAmount(amount);
    if (amountStr.length > 12) {
      return 10;
    }
    return 12;
  };

  const cardWidth = width > 600 ? "50%" : "80%";

  return (
    <View
      style={tw`flex-row items-center justify-between justify-center my-6 w-full`}
    >
      <TouchableOpacity
        onPress={onPrev}
        disabled={disablePrev}
        style={tw`rounded-lg`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={tw`w-10 h-10 px-2 justify-center items-center`}>
          <ArrowLefttIconV2 />
        </View>
      </TouchableOpacity>
      <View
        style={[
          tw`flex-row rounded-2xl py-3 items-center justify-between`,
          {
            width: cardWidth,
            paddingHorizontal: 12,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={tw`flex-1 items-center`}>
          <Text
            style={[
              tw`text-[13px] md:text-md font-semibold`,
              { color: theme.textPrimary },
            ]}
          >
            {moment(month)
              .locale(currentLocale)
              .format("MMM YYYY")
              .toUpperCase()}
          </Text>
        </View>

        <Text
          style={[
            tw`text-2xl font-light`,
            { color: isDark ? "rgba(255,255,255,0.15)" : "rgba(60,60,67,0.1)" },
          ]}
        >
          |
        </Text>

        <View style={tw`flex-1 items-center`}>
          <Text
            style={[
              tw`text-[10px] font-light`,
              { color: theme.textSecondary },
            ]}
          >
            {translate("reportsCategoryScreen:total")}
          </Text>
          <Text
            style={[
              tw`font-bold`,
              {
                fontSize: getFontSize(total),
                color: isDark ? "#C4A8FF" : "#200066",
              },
            ]}
          >
            {formatAmount(total)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onNext}
        disabled={disableNext}
        style={tw`py-2 rounded-lg`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={tw`w-10 h-10 px-2 justify-center items-center`}>
          <ArrowRightIconSvg />
        </View>
      </TouchableOpacity>
    </View>
  );
};
