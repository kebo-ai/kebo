import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { AccountTypeSnapshotIn } from "@/models/account-type-store/account-type";
import { translate } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";

interface ModalAccountTypeProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: AccountTypeSnapshotIn) => void;
  selectedValue: AccountTypeSnapshotIn;
  data: AccountTypeSnapshotIn[];
  title: string;
}

const translateType = (type: string) => {
  switch (type) {
    case "Efectivo":
      return translate("modalAccount:cash");
    case "Transferencia":
      return translate("modalAccount:checkingAccount");
    case "Cuenta de Ahorro":
      return translate("modalAccount:savingsAccount");
    case "Tarjeta de Crédito":
      return translate("modalAccount:creditCard");
    case "Cuenta Corriente":
      return translate("modalAccount:currentAccount");
    default:
      return type;
  }
};

const ModalAccountType: React.FC<ModalAccountTypeProps> = ({
  visible,
  onClose,
  onSelect,
  selectedValue,
  data,
  title,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={[tw`p-4 rounded-t-3xl max-h-[50%]`, { backgroundColor: theme.surface }]}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <TouchableOpacity onPress={onClose} style={tw`ml-auto`}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
              <View style={tw`absolute w-full items-center`}>
                <Text
                  style={tw`text-lg`}
                  weight="medium"
                  color={theme.textPrimary}
                >
                  {title}
                </Text>
              </View>
            </View>

            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    tw`p-4 rounded-[20px] my-1`,
                    {
                      borderBottomWidth: 1,
                      borderColor: theme.border,
                    },
                    pressed && {
                      backgroundColor: colors.primaryBg,
                    },
                  ]}
                >
                  {({ pressed }) => (
                    <Text
                      weight={pressed ? "semibold" : "light"}
                      style={tw`text-base px-2`}
                      color={pressed ? colors.primary : theme.textSecondary}
                    >
                      {translateType(item.type_name)}
                    </Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalAccountType;
