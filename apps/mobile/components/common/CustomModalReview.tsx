import React, { useCallback } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";
import { KeboCongratulation } from "@/components/icons/kebo-congratulation";
import * as StoreReview from "expo-store-review";
import { ReviewService } from "@/services/review-service";
import logger from "@/utils/logger";

interface CustomModalReviewProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomModalReview: React.FC<CustomModalReviewProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = translate("customModalReview:confirm"),
  cancelText = translate("customModalReview:cancel"),
}) => {
  const handleConfirm = useCallback(async () => {
    try {
      const response = await ReviewService.handleRatingModalClick("love_it");

      if (response?.success) {
        logger.debug("Review action recorded:", response.message);
      } else {
        logger.error("Failed to record review action");
      }

      await StoreReview.requestReview();
      onConfirm();
    } catch (error) {
      logger.error("Error requesting review:", error);
      onConfirm();
    }
  }, [onConfirm]);

  const handleCancel = useCallback(async () => {
    try {
      const response = await ReviewService.handleRatingModalClick(
        "maybe_later"
      );

      if (response?.success) {
        logger.debug("Review action recorded:", response.message);
      } else {
        logger.error("Failed to record review action");
      }

      onCancel();
    } catch (error) {
      logger.error("Error handling cancel action:", error);
      onCancel();
    }
  }, [onCancel]);

  const handleClose = useCallback(async () => {
    try {
      const response = await ReviewService.handleRatingModalClick("dismiss");

      if (response?.success) {
        logger.debug("Review action recorded:", response.message);
      } else {
        logger.error("Failed to record review action");
      }

      onCancel();
    } catch (error) {
      logger.error("Error handling dismiss action:", error);
      onCancel();
    }
  }, [onCancel]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={tw`flex-1 justify-center items-center bg-black/50`}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={tw`flex-1`} />
        </TouchableWithoutFeedback>

        <View style={[tw`bg-white rounded-3xl p-4 w-85%`]}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <View style={tw`w-6`} />
            <Text
              weight="medium"
              style={tw`text-lg text-center flex-1`}
              numberOfLines={2}
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={tw`w-6 h-6 items-center justify-center`}
            >
              <Ionicons name="close" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row justify-center mb-2`}>
            <KeboCongratulation />
          </View>

          <Text
            weight="light"
            style={tw`text-base text-[${colors.textGray}] text-center mb-2`}
            numberOfLines={4}
          >
            {message}
          </Text>

          <View style={tw`flex-col px-3 gap-2`}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                tw`bg-[${colors.primary}] border-2 border-[${colors.primary}] px-2 py-2.5 rounded-full w-full`,
              ]}
            >
              <Text
                weight="medium"
                style={tw`text-white text-base text-center`}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                tw`border-2 border-[${colors.primary}] px-2 py-2.5 rounded-full w-full bg-white`,
              ]}
            >
              <Text
                weight="medium"
                style={tw`text-[${colors.primary}] text-base text-center`}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={tw`flex-1`} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default CustomModalReview;
