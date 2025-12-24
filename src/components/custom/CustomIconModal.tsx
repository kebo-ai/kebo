import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { Icon } from "../../models/icon/icon";
import { CategoryItem } from "./CategoryItem";
import { translate } from "../../i18n";

interface CustomIconModalProps {
  visible: boolean;
  onClose: () => void;
  showLabel?: boolean;
  onSelect: React.Dispatch<React.SetStateAction<Icon | undefined>>;
  icons: Icon[];
  navigation: any;
}

const CustomIconModal: React.FC<CustomIconModalProps> = ({
  visible,
  onClose,
  onSelect,
  showLabel,
  icons,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white p-4 rounded-t-3xl max-h-[50%] h-[50%]`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <TouchableOpacity onPress={onClose} style={tw`ml-auto`}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
              <View style={tw`absolute w-full items-center`}>
                <Text style={tw`text-lg font-medium`}>
                  {translate("components:newCategory.selectIcon")}
                </Text>
              </View>
            </View>
            <FlatList
              data={icons}
              numColumns={5}
              keyExtractor={(item) => item.name}
              style={tw`flex-1`}
              contentContainerStyle={tw`pb-4`}
              showsVerticalScrollIndicator={true}
              renderItem={({ item, index }) => (
                <CategoryItem
                  key={index}
                  showLabel={showLabel}
                  item={item}
                  onSelect={() => {
                    onSelect(item);
                    onClose();
                  }}
                />
              )}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomIconModal;
