import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = translate("components:customAlert.confirm"),
  cancelText = translate("components:customAlert.cancel"),
  type = "danger",
}) => {
  const getColorByType = () => {
    switch (type) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return `bg-[${colors.primary}]`;
      default:
        return "bg-red-500";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={tw`flex-1 justify-center items-center bg-black/50`}>
          <TouchableWithoutFeedback>
            <View style={tw`bg-white w-[80%] rounded-3xl p-6`}>
              <Text
                style={[
                  tw`text-lg mb-4 text-center`,
                  { fontFamily: "SFUIDisplayMedium" },
                ]}
              >
                {title}
              </Text>
              <Text
                style={[
                  tw`text-base text-[${colors.textGray}] text-center mb-6`,
                  { fontFamily: "SFUIDisplayLight" },
                ]}
              >
                {message}
              </Text>
              <View style={tw`flex-row justify-center gap-2`}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={tw`border-2 border-[${colors.primary}] px-6 py-2 rounded-full`}
                >
                  <Text
                    style={[
                      tw`text-[${colors.primary}] text-base`,
                      { fontFamily: "SFUIDisplayMedium" },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  style={tw`bg-[${colors.primary}] border-2 border-[${colors.primary}] px-6 py-2 rounded-full`}
                >
                  <Text
                    style={[
                      tw`text-white text-base`,
                      { fontFamily: "SFUIDisplayMedium" },
                    ]}
                  >
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomAlert;
