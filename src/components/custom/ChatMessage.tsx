import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Markdown from "react-native-markdown-display";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { translate } from "../../i18n";
import { Ionicons } from "@expo/vector-icons";
import { useStores } from "../../models/helpers/useStores";
import { showToast } from "../ui/CustomToast";
import { createReportThread } from "../../services/ChatService";
import reactotron from "reactotron-react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { KeboWiseThinkingSvg } from "../svg/KeboWiseThinkingSvg";
import TypingDots from "./TypingDots";

export type MessageType = "user" | "bot";

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp?: string;
  isLoading?: boolean;
}

const reportValidationSchema = Yup.object().shape({
  reportReason: Yup.string()
    .required(translate("chatbotScreen:reportThanks"))
    .max(200, translate("chatbotScreen:reportThanks")),
});

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  type,
  timestamp,
  isLoading = false,
}) => {
  const isUser = type === "user";
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const {
    uiStoreModel: { showLoader, hideLoader },
  } = useStores();
  const [partialContent, setPartialContent] = useState("");
  const [typingFinished, setTypingFinished] = useState(isLoading);

  useEffect(() => {
    if (!isUser && content && !typingFinished) {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setPartialContent(content.slice(0, i));
        if (i >= content.length) {
          clearInterval(interval);
          setTypingFinished(true);
        }
      }, 2);

      return () => clearInterval(interval);
    }
  }, [content, typingFinished]);

  useEffect(() => {
    if (!isUser && !content) {
      setTypingFinished(false);
      setPartialContent("");
    }
  }, [isLoading]);

  const formik = useFormik({
    initialValues: {
      reportReason: "",
    },
    validationSchema: reportValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        showLoader();
        reactotron.log({
          message: content,
          report_message: values.reportReason,
        });
        await createReportThread({
          message: content,
          report_message: values.reportReason,
        });
        showToast("success", translate("chatbotScreen:reportSent"));
        setIsReportModalVisible(false);
        formik.resetForm();
      } catch (error) {
        showToast("error", translate("chatbotScreen:errorMessage"));
      } finally {
        hideLoader();
      }
      resetForm();
    },
  });

  const handleReport = () => {
    setIsReportModalVisible(true);
  };

  const markdownStyles = {
    body: tw`text-sm font-normal`,
    heading1: tw`text-xl font-bold mt-2 mb-1`,
    heading2: tw`text-lg font-bold mt-2 mb-1`,
    heading3: tw`text-base font-bold mt-2 mb-1`,
    heading4: tw`text-sm font-bold mt-2 mb-1`,
    heading5: tw`text-xs font-bold mt-2 mb-1`,
    heading6: tw`text-xs font-bold mt-2 mb-1`,
    paragraph: tw`mb-1`,
    link: tw`text-[${colors.primary}] underline`,
    list: tw`ml-4`,
    listItem: tw`mb-1`,
    blockquote: tw`border-l-4 border-gray-300 pl-2 italic`,
    code_block: tw`font-mono bg-gray-100 p-1 rounded`,
    code_inline: tw`font-mono bg-gray-100 px-1 rounded`,


    table: tw`border-collapse w-full bg-white rounded-2xl border-gray-200 overflow-hidden`,
    tr: tw`border-b border-gray-200`,
    th: tw`bg-[${colors.primary}] text-white text-center p-1 font-semibold text-xs justify-center`,
    td: tw`text-center p-2 text-black text-sm`,
  };

  return (
    <>
      <View
        style={tw`mb-4 flex-row ${isUser ? "justify-end" : "justify-start"}`}
      >
        {/* {!isUser && (
          <View
            style={tw`h-8 w-8 rounded-full bg-[${colors.primary}] mr-2 items-center justify-center`}
          >
            <Text style={tw`text-white font-bold`}>K</Text>
          </View>
        )} */}

        <View
          style={tw`max-w-[95%] rounded-2xl ${
            isUser
              ? `bg-[${colors.primary}] p-3 rounded-tr-none`
              : "rounded-tl-none p-1"
          }`}
        >
          {isLoading ? (
            <View style={tw`flex-row items-center py-1`}>
              <KeboWiseThinkingSvg />
              <View style={tw`ml-2`}>
                <TypingDots />
              </View>

              {/*  <ActivityIndicator
                size="small"
                color={isUser ? "#ffffff" : colors.primary}
              />
              
             <Text style={tw`ml-2 ${isUser ? "text-white" : "text-gray-600"}`}>
                {isUser
                  ? translate("chatbotScreen:sending")
                  : translate("chatbotScreen:thinking")
                  }
              </Text> */}
            </View>
          ) : isUser ? (
            <Text style={tw`text-white`}>{content}</Text>
          ) : (
            <>
              {!typingFinished ? (
                <Markdown style={markdownStyles}>{partialContent}</Markdown>
              ) : (
                <>
                  <Markdown style={markdownStyles}>{content}</Markdown>
                  <TouchableOpacity
                    onPress={handleReport}
                    style={tw`mt-2 flex-row items-center justify-end`}
                  >
                    <Ionicons name="flag-outline" size={12} color={colors.primary} />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* {timestamp && !isLoading && (
            <Text
              style={tw`text-xs text-right mt-1 ${
                isUser ? "text-white opacity-70" : "text-gray-500"
              }`}
            >
              {timestamp}
            </Text>
          )} */}
        </View>

        {/* {isUser && (
          <View style={tw`h-8 w-8 rounded-full ml-2 overflow-hidden`}>
            <Image
              source={{
                uri: "https://ui-avatars.com/api/?name=User&background=random",
              }}
              style={tw`h-full w-full`}
            />
          </View>
        )} */}
      </View>

      <Modal visible={isReportModalVisible} transparent animationType="none">
        <TouchableWithoutFeedback
          onPress={() => {
            formik.resetForm();
            setIsReportModalVisible(false);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw`flex-1`}
          >
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <View style={tw`bg-white p-4 rounded-t-3xl pb-6`}>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-medium text-center`}>
                      {translate("chatbotScreen:reportTitle")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      formik.resetForm();
                      setIsReportModalVisible(false);
                    }}
                    style={tw`absolute right-0`}
                  >
                    <Ionicons name="close" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <Text style={tw`text-base text-gray-600 mb-4`}>
                  {translate("chatbotScreen:reportConfirm")}
                </Text>

                <TextInput
                  style={tw`border ${
                    formik.touched.reportReason && formik.errors.reportReason
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg p-3 mb-1 min-h-[100px] text-base`}
                  placeholder={translate("chatbotScreen:reportPlaceholder")}
                  value={formik.values.reportReason}
                  onChangeText={formik.handleChange("reportReason")}
                  onBlur={formik.handleBlur("reportReason")}
                  multiline
                  textAlignVertical="top"
                />

                {formik.touched.reportReason && formik.errors.reportReason && (
                  <Text style={tw`text-[${colors.primary}] text-sm mb-3`}>
                    {formik.errors.reportReason}
                  </Text>
                )}
                {formik.values.reportReason && (
                  <TouchableOpacity
                    onPress={() => formik.handleSubmit()}
                    disabled={!formik.isValid || formik.isSubmitting}
                    style={tw`bg-[${
                      colors.primary
                    }] rounded-full py-3 px-6 items-center mb-4 ${
                      !formik.isValid || formik.isSubmitting ? "opacity-50" : ""
                    }`}
                  >
                    <Text style={tw`text-white font-medium text-base`}>
                      {translate("chatbotScreen:report")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
