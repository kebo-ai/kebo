import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";

interface MonthData {
  label: string;
  value: string;
  year: string;
}

type YearMonthGroup = [string, MonthData[]];

interface CustomMonthModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (month: string) => void;
  onApply: () => void;
  onClear: () => void;
  selectedMonths: string[];
  groupedMonths: Record<string, MonthData[]>;
  sortedYears: string[];
}

export const CustomMonthModal: React.FC<CustomMonthModalProps> = ({
  visible,
  onClose,
  onSelect,
  onApply,
  onClear,
  selectedMonths,
  groupedMonths,
  sortedYears,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white p-4 rounded-t-3xl max-h-[50%]`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <TouchableOpacity onPress={onClear} style={tw`flex-1`}>
                <Text style={tw`text-[${colors.primary}] font-medium`}>
                  {translate("transactionScreen:transactions.clear")}
                </Text>
              </TouchableOpacity>
              <Text style={tw`text-lg font-medium text-center flex-1`}>
                {translate("transactionScreen:transactions.selectMonth")}
              </Text>
              <TouchableOpacity onPress={onClose} style={tw`flex-1 items-end`}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <FlatList<YearMonthGroup>
              data={sortedYears.map((year) => [year, groupedMonths[year]])}
              renderItem={({ item: [year, months] }) => (
                <View>
                  <Text
                    style={tw`text-base font-medium px-4 py-2 text-[#606A84]`}
                  >
                    {year}
                  </Text>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={tw`py-3 flex-row px-8 border-b border-[#EBEBEF] items-center justify-between`}
                      onPress={() => onSelect(month.value)}
                    >
                      <Text style={tw`text-base`}>{month.label}</Text>
                      {selectedMonths.includes(month.value) && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              keyExtractor={(item) => String(item[0])}
            />

            <TouchableOpacity
              onPress={() => {
                onClose();
                onApply();
              }}
              style={tw`bg-[${colors.primary}] rounded-[40px] p-4 items-center mt-2 mb-6`}
            >
              <Text style={tw`text-white font-medium`}>
                {translate("transactionScreen:transactions.apply")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
