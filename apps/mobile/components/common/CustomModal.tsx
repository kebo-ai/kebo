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
import { colors } from "@/theme/colors";
import { translate } from "@/i18n/translate";

interface DataItem {
  label: string;
  value: string;
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  selectedValue: string;
  data: DataItem[];
  title: string;
  isRecurrence?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedValue,
  isRecurrence = false,
  data,
  title,
}) => {
  const getDisplayValue = (item: DataItem): string => {
    if (isRecurrence) {
      return translate(item.label as any);
    }
    return item.label;
  };

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
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => {
                const isLastItem = index === data.length - 1;
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item.value);
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
                        borderColor: isLastItem
                          ? "transparent" // no bottom line for last item
                          : "rgba(96, 106, 132, 0.15)",
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
                        {getDisplayValue(item)}
                      </Text>
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomModal;
