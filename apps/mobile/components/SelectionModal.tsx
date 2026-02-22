import React from "react";
import { Modal, TouchableWithoutFeedback, View, TouchableOpacity, Text } from "react-native";
import { translate } from "@/i18n";
import { colors } from "@/theme";
import tw from "@/hooks/use-tailwind";
import { Ionicons } from "@expo/vector-icons";

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  selectedValue: string;
  data: string[];
  title?: string;
  labelText?: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedValue,
  data,
  title = translate("components:selectionModal.select"),
  labelText = translate("components:selectionModal.recurrece"),
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
                <Text style={tw`text-lg font-medium`}>
                  {translate("components:selectionModal.select")} {labelText.toLowerCase()}
                </Text>
              </View>
            </View>
            <View style={tw`mt-2`}> 
              {data.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => onSelect(option)}
                  style={tw`py-3 px-4 rounded-lg mb-1 items-center justify-center ${selectedValue === option ? 'bg-[#7C3AED]' : 'bg-gray-100'}`}
                >
                  <Text style={tw`${selectedValue === option ? 'text-white font-bold' : 'text-gray-800'}`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectionModal; 