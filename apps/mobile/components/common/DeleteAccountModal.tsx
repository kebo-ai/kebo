import logger from "@/utils/logger";
import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { useFormik } from "formik";
import * as Yup from "yup";
import { colors } from "@/theme/colors";
import { userSelfHardDelete } from "@/services/UserService";
import { supabase } from "@/config/supabase";
import { showToast } from "@/components/ui/CustomToast";
import { translate } from "@/i18n";
import { useTranslation } from "react-i18next";
import { useStores } from "@/models/helpers/use-stores";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { transactionModel } = useStores();

  const getConfirmationWord = () => {
    return t('components:deleteAccountModal.confirm');
  };

  const DeleteAccountSchema = Yup.object().shape({
    confirmation: Yup.string()
      .required(translate("components:deleteAccountModal.confirmMessage"))
      .equals(
        [getConfirmationWord()],
        translate("components:deleteAccountModal.deleteCondition")
      ),
  });

  const handleDeleteAccount = async (values: { confirmation: string }) => {
    setIsLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        showToast(
          "error",
          translate("components:deleteAccountModal.errorLogin")
        );
        setIsLoading(false);
        return;
      }

      const email = sessionData.session.user.email;

      if (!email) {
        showToast(
          "error",
          translate("components:deleteAccountModal.errorMail")
        );
        setIsLoading(false);
        return;
      }

      // Clear all transaction data before deleting the account
      try {
        logger.debug("Cleaning transaction data before deleting account");
        
        // Use the new method to completely reset the transaction model
        transactionModel.resetAllData();
        
        logger.debug("✅ Datos de transacción limpiados exitosamente");
      } catch (error) {
        logger.error("❌ Error al limpiar datos de transacción:", error);
        // Continue with account deletion anyway
      }

      const result = await userSelfHardDelete(email);
      await GoogleSignin.signOut();
      if (result.success) {
        showToast(
          "warning",
          translate("components:deleteAccountModal.deleteAccountSuccess")
        );
        await supabase.auth.signOut();
        onClose();
      } else {
        showToast(
          "error",
          result.error ||
            translate("components:deleteAccountModal.deleteAccountError")
        );
      }
    } catch (error) {
      showToast(
        "error",
        translate("components:deleteAccountModal.deleteAccountError")
      );
      logger.error("Error deleting account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: { confirmation: "" },
    validationSchema: DeleteAccountSchema,
    onSubmit: handleDeleteAccount,
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}>
          <View style={tw`flex-1 justify-center items-center bg-black/50`}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={tw`bg-white w-[90%] rounded-[20px] max-h-[90%]`}>
                <ScrollView 
                  contentContainerStyle={tw`p-6`}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    weight="medium"
                    style={tw`text-xl mb-2 text-center text-red-500`}
                  >
                    {translate("components:deleteAccountModal.deleteAccount")}
                  </Text>
                  <Text
                    weight="light"
                    style={tw`text-base text-[${colors.textGray}] text-center mb-6`}
                  >
                    {translate("components:deleteAccountModal.deleteAccountBody")}
                  </Text>

                  <Text
                    weight="medium"
                    style={tw`text-base text-[${colors.textGray}] text-center mb-4`}
                  >
                    {translate("components:deleteAccountModal.deleteAccountBody2")}
                  </Text>

                  <TextInput
                    style={tw`border border-gray-300 rounded-lg p-4 text-base mb-2`}
                    placeholder={getConfirmationWord()}
                    value={formik.values.confirmation}
                    onChangeText={formik.handleChange("confirmation")}
                    onBlur={formik.handleBlur("confirmation")}
                  />

                  {formik.touched.confirmation && formik.errors.confirmation && (
                    <Text style={tw`text-red-500 mb-4`}>
                      {formik.errors.confirmation}
                    </Text>
                  )}

                  <View style={tw`flex-row justify-end mt-6 gap-4`}>
                    <TouchableOpacity
                      onPress={onClose}
                      style={tw`py-3 px-5 rounded-[10px] bg-gray-100`}
                    >
                      <Text
                        weight="medium"
                        style={tw`text-[${colors.textGray}]`}
                      >
                        {translate("components:deleteAccountModal.cancel")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => formik.handleSubmit()}
                      disabled={isLoading}
                      style={tw`py-3 px-5 rounded-[10px] ${
                        isLoading ? "bg-red-400" : "bg-red-500"
                      }`}
                    >
                      <Text
                        weight="medium"
                        style={tw`text-white`}
                      >
                        {isLoading
                          ? translate("components:deleteAccountModal.delete")
                          : translate(
                              "components:deleteAccountModal.deleteAccount"
                            )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DeleteAccountModal;
