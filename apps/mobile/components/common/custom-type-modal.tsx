import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";
import { useTheme } from "@/hooks/use-theme";

type TransactionType = "Ingreso" | "Gasto" | null;

interface CustomTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: TransactionType) => void;
  onClear: () => void;
  selectedType: TransactionType;
}

export const CustomTypeModal: React.FC<CustomTypeModalProps> = ({
  visible,
  onClose,
  onSelect,
  onClear,
  selectedType,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50 mb-6`}>
          <View
            style={[tw`p-4 rounded-t-3xl max-h-[40%] items-center justify-center`, { backgroundColor: theme.surface }]}
          >
            <View style={tw`flex-row justify-between items-center mb-4 w-full`}>
              <TouchableOpacity onPress={onClear} style={tw`flex-1`}>
                <Text style={tw`text-[${colors.primary}] font-medium`}>
                  {translate("transactionScreen:transactions.clear")}
                </Text>
              </TouchableOpacity>
              <Text style={[tw`text-lg font-medium text-center flex-1`, { color: theme.textPrimary }]}>
                {translate("transactionScreen:transactions.selectType")}
              </Text>
              <TouchableOpacity onPress={onClose} style={tw`flex-1 items-end`}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={tw`py-3 w-full items-center ${
                selectedType === "Ingreso" ? "bg-[${colors.primary}]/10" : ""
              }`}
              onPress={() => {
                onSelect("Ingreso");
                onClose();
              }}
            >
              <Text
                style={[tw`text-base`, {
                  color: selectedType === "Ingreso" ? colors.primary : theme.textPrimary,
                }]}
              >
                {translate("transactionScreen:transactions.income")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`py-3 w-full items-center ${
                selectedType === "Gasto" ? "bg-[${colors.primary}]/10" : ""
              }`}
              onPress={() => {
                onSelect("Gasto");
                onClose();
              }}
            >
              <Text
                style={[tw`text-base`, {
                  color: selectedType === "Gasto" ? colors.primary : theme.textPrimary,
                }]}
              >
                {translate("transactionScreen:transactions.expense")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
