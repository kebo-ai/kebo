import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "../theme/colors";
import { AccountTypeSnapshotIn } from "../models/account-type-store/account-type";
import { translate } from "../i18n";

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
  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white p-4 rounded-t-3xl max-h-[50%]`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <TouchableOpacity onPress={onClose} style={tw`ml-auto`}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
              <View style={tw`absolute w-full items-center`}>
                <Text style={tw`text-lg font-medium`}>{title}</Text>
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
                    tw`text-base p-4 rounded-[20px] my-1`,
                    {
                      borderWidth: 1,
                      borderTopWidth: 0,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                      borderStyle: "solid",
                      borderColor: "rgba(96, 106, 132, 0.15)",
                    },
                    pressed && {
                      backgroundColor: colors.primaryBg,
                    },
                  ]}
                >
                  {({ pressed }) => (
                    <Text
                      style={[
                        tw`text-base text-[${colors.textGray}] px-2`,
                        pressed
                          ? [
                              tw`text-[${colors.primary}]`,
                              { fontFamily: "SFUIDisplaySemiBold" },
                            ]
                          : [
                              tw`text-[${colors.textGray}]`,
                              { fontFamily: "SFUIDisplayLight" },
                            ],
                      ]}
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
