import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Text } from "@/components/ui";
import Markdown from "react-native-markdown-display";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useStores } from "@/models/helpers/useStores";
import { showToast } from "@/components/ui/CustomToast";
import { createReportThread } from "@/services/ChatService";
import reactotron from "reactotron-react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { KeboWiseThinkingSvg } from "@/components/icons/KeboWiseThinkingSvg";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

export type MessageType = "user" | "bot";

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp?: string;
  isLoading?: boolean;
}

const LOADING_MESSAGES = [
  "chatbotScreen:loadingAnalyzing",
  "chatbotScreen:loadingCrunching",
  "chatbotScreen:loadingReviewing",
  "chatbotScreen:loadingPatterns",
  "chatbotScreen:loadingInsights",
  "chatbotScreen:loadingAlmost",
] as const;

const CyclingLoadingText = () => {
  const [index, setIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={tw`items-center py-4`}>
      <KeboWiseThinkingSvg />
      <View style={{ height: 28, justifyContent: "center", marginTop: 8 }}>
        <Animated.Text
          key={index}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={[
            tw`text-sm text-center`,
            {
              fontFamily: "SFUIDisplayLight",
              color: theme.textSecondary,
            },
          ]}
        >
          {translate(LOADING_MESSAGES[index])}
        </Animated.Text>
      </View>
    </View>
  );
};

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
  const { theme } = useTheme();
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
    body: { ...tw`text-sm font-normal`, color: theme.textPrimary },
    heading1: { ...tw`text-xl font-bold mt-2 mb-1`, color: theme.textPrimary },
    heading2: { ...tw`text-lg font-bold mt-2 mb-1`, color: theme.textPrimary },
    heading3: { ...tw`text-base font-bold mt-2 mb-1`, color: theme.textPrimary },
    heading4: { ...tw`text-sm font-bold mt-2 mb-1`, color: theme.textPrimary },
    heading5: { ...tw`text-xs font-bold mt-2 mb-1`, color: theme.textPrimary },
    heading6: { ...tw`text-xs font-bold mt-2 mb-1`, color: theme.textPrimary },
    paragraph: tw`mb-1`,
    link: tw`text-[${colors.primary}] underline`,
    list: tw`ml-4`,
    listItem: tw`mb-1`,
    blockquote: { ...tw`border-l-4 pl-2 italic`, borderColor: theme.border },
    code_block: { ...tw`font-mono p-1 rounded`, backgroundColor: theme.surfaceSecondary },
    code_inline: { ...tw`font-mono px-1 rounded`, backgroundColor: theme.surfaceSecondary },
    table: { ...tw`border-collapse w-full rounded-2xl overflow-hidden`, backgroundColor: theme.surface, borderColor: theme.border },
    tr: { ...tw`border-b`, borderColor: theme.border },
    th: tw`bg-[${colors.primary}] text-white text-center p-1 font-semibold text-xs justify-center`,
    td: { ...tw`text-center p-2 text-sm`, color: theme.textPrimary },
  };

  return (
    <>
      <View
        style={tw`mb-4 flex-row ${isUser ? "justify-end" : "justify-start"}`}
      >
        <View
          style={tw`max-w-[95%] rounded-2xl ${
            isUser
              ? `bg-[${colors.primary}] p-3 rounded-tr-none`
              : "rounded-tl-none p-1"
          }`}
        >
          {isLoading ? (
            <CyclingLoadingText />
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
                    <Ionicons
                      name="flag-outline"
                      size={12}
                      color={theme.textTertiary}
                    />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
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
              <View
                style={[
                  tw`p-4 rounded-t-3xl pb-6`,
                  { backgroundColor: theme.surface },
                ]}
              >
                <View
                  style={tw`flex-row justify-between items-center mb-4`}
                >
                  <View style={tw`flex-1`}>
                    <Text
                      weight="medium"
                      style={[tw`text-lg text-center`, { color: theme.textPrimary }]}
                    >
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
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[tw`text-base mb-4`, { color: theme.textSecondary }]}
                >
                  {translate("chatbotScreen:reportConfirm")}
                </Text>

                <TextInput
                  style={[
                    tw`border rounded-lg p-3 mb-1 min-h-[100px] text-base`,
                    {
                      borderColor:
                        formik.touched.reportReason &&
                        formik.errors.reportReason
                          ? colors.danger
                          : theme.border,
                      color: theme.textPrimary,
                      backgroundColor: theme.surfaceSecondary,
                    },
                  ]}
                  placeholder={translate("chatbotScreen:reportPlaceholder")}
                  placeholderTextColor={theme.textTertiary}
                  value={formik.values.reportReason}
                  onChangeText={formik.handleChange("reportReason")}
                  onBlur={formik.handleBlur("reportReason")}
                  multiline
                  textAlignVertical="top"
                />

                {formik.touched.reportReason &&
                  formik.errors.reportReason && (
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
                      !formik.isValid || formik.isSubmitting
                        ? "opacity-50"
                        : ""
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
