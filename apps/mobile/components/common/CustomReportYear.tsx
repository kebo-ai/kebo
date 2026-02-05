import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import moment from "moment";
import { translate } from "@/i18n/translate";
import { ArrowRightIconSvg } from "@/components/icons/ArrowRightIcon";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import { ArrowLefttIconV2 } from "@/components/icons/ArrowLefttIconV2";

interface CustomReportYearProps {
  income: number;
  expenses: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  periodLabel: string;
  onPressExpenses: () => void;
  onPressIncome: () => void;
}

export const CustomReportYear: React.FC<CustomReportYearProps> = ({
  income,
  expenses,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
  periodLabel,
  onPressExpenses,
  onPressIncome,
}) => {
  const { formatAmount } = useCurrencyFormatter();

  return (
    <View style={tw`flex-row items-center justify-center px-2`}>
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
      <View style={tw`flex-row items-center justify-between w-[80%] my-2`}>
        {/* <View style={tw`flex-1 items-center`}>
          <Text style={tw`text-md font-semibold text-[#110627]`}>
            {periodLabel}
          </Text>
        </View> */}
        {/* <Text style={tw`text-2xl text-[#3C3C43]/10 font-light`}>|</Text> */}
        <TouchableOpacity
          onPress={onPressExpenses}
          style={tw`flex-1 items-center bg-white rounded-2xl px-2 py-2 border border-[#D3D3D3]`}
        >
          <Text style={tw`text-xs text-black font-light`}>
            {translate("reportsIncomeScreen:expenses")}
          </Text>
          <Text style={tw`text-xs font-bold text-[#200066]`}>
            {formatAmount(expenses)}
          </Text>
        </TouchableOpacity>
        {/* <Text style={tw`text-2xl text-[#3C3C43]/10 font-light`}>|</Text> */}
        <TouchableOpacity
          onPress={onPressIncome}
          style={tw`flex-1 items-center bg-white rounded-2xl ml-2 px-2 py-2 border border-[#D3D3D3]`}
        >
          <Text style={tw`text-xs text-black font-light`}>
            {translate("reportsIncomeScreen:income")}
          </Text>
          <Text style={tw`text-xs font-bold text-[#9C88FF]`}>
            {formatAmount(income)}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onNext}
        disabled={disableNext}
        style={tw`rounded-lg`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={tw`w-10 h-10 px-2 justify-center items-center`}>
          <ArrowRightIconSvg />
        </View>
      </TouchableOpacity>
    </View>
  );
};
