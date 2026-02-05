import React from "react";
import { TouchableOpacity, Text, Pressable, View } from "react-native";
import tw from "twrnc";
import { useTranslation } from "react-i18next";
import { translate } from "@/i18n";
import * as Haptics from "expo-haptics";

type CustomSegmentedControlProps = {
  selected: string;
  onSelect: (option: string) => void;
  activeColor?: string;
  inactiveColor?: string;
  mappedValues: string[];
  dividerColor?: string;
  disabledOptions?: string[];
  disabledColor?: string;
  hiddenOptions?: string[];
};

const CustomSegmentedControl: React.FC<CustomSegmentedControlProps> = ({
  selected,
  onSelect,
  activeColor = "primary",
  inactiveColor = "secondary",
  dividerColor = "text-[rgba(142,142,147,0.3)]`",
  mappedValues,
  disabledOptions = [],
  disabledColor = "bg-gray-300",
  hiddenOptions = [],
}) => {
  const visibleOptions = mappedValues.filter(
    (option) => !hiddenOptions.includes(option)
  );

  return (
    <View style={tw`flex-row bg-[#F0EBFB] rounded-[9px] p-1`}>
      {visibleOptions.map((option, index) => {
        const isDisabled = disabledOptions.includes(option);
        const isSelected = option === selected;

        return (
          <React.Fragment key={option}>
            {index > 0 &&
              selected !== visibleOptions[index - 1] &&
              selected !== option && (
                <Text style={tw` py-2 ${dividerColor}`}>|</Text>
              )}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                !isDisabled && onSelect(option);
              }}
              disabled={isDisabled}
              style={tw`flex-1 items-center py-2 rounded-[7px] ${
                isDisabled
                  ? disabledColor
                  : isSelected
                  ? activeColor
                  : inactiveColor
              }`}
            >
              <Text
                style={tw`font-light ${
                  isDisabled
                    ? "text-gray-400"
                    : isSelected
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {(() => {
                  switch (option) {
                    case "Expense":
                      return translate("components:transactionTypes.expense");
                    case "Income":
                      return translate("components:transactionTypes.income");
                    case "Transfer":
                      return translate("components:transactionTypes.transfer");
                    default:
                      return option;
                  }
                })()}
              </Text>
            </Pressable>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default CustomSegmentedControl;
