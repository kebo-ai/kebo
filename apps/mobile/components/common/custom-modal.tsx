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
import { translate } from "@/i18n/translate";
import { useTheme } from "@/hooks/use-theme";

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
  const { theme } = useTheme();

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
          <View style={[tw`p-4 rounded-t-3xl max-h-[50%]`, { backgroundColor: theme.background }]}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <TouchableOpacity onPress={onClose} style={tw`ml-auto`}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={tw`absolute w-full items-center`}>
                <Text style={[tw`text-lg font-medium`, { color: theme.textPrimary }]}>{title}</Text>
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
                          ? "transparent"
                          : theme.border,
                      },
                      pressed && {
                        backgroundColor: colors.primaryBg,
                      },
                    ]}
                  >
                    {({ pressed }) => (
                      <Text
                        weight={pressed ? "semibold" : "light"}
                        style={[
                          tw`text-base px-2`,
                          { color: pressed ? colors.primary : theme.textPrimary },
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
