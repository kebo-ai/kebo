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
import { ArrowRightIconSvg } from "@/components/icons/ArrowRightIcon";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import i18n from "@/i18n/i18n";
import { ArrowLefttIconV2 } from "@/components/icons/ArrowLefttIconV2";

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
          tw`flex-row bg-white rounded-2xl py-3 border border-[#EBEBEF] items-center justify-between`,
          { width: cardWidth, paddingHorizontal: 12 },
        ]}
      >
        <View style={tw`flex-1 items-center`}>
          <Text style={tw`text-[13px] md:text-md font-semibold text-[#110627]`}>
            {moment(month)
              .locale(currentLocale)
              .format("MMM YYYY")
              .toUpperCase()}
          </Text>
        </View>

        <Text style={tw`text-2xl text-[#3C3C43]/10 font-light`}>|</Text>

        <View style={tw`flex-1 items-center`}>
          <Text style={tw`text-[10px] text-black font-light`}>
            {translate("reportsCategoryScreen:total")}
          </Text>
          <Text
            style={[
              tw`font-bold text-[#200066]`,
              { fontSize: getFontSize(total) },
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
