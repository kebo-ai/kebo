import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  Text,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { Svg, Path } from "react-native-svg";
import { SendArrowSvg } from "../svg/SendArrowSvg";
import { translate } from "../../i18n";
import { useTranslation } from "react-i18next";
import { useStores } from "../../models/helpers/useStores";
import { getLanguageName } from "../../i18n/languages";
import { showToast } from "../ui/CustomToast";
import { MoreIconSvg } from "../svg/MoreIconSvg";
import * as Haptics from "expo-haptics";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  inputRef: React.RefObject<TextInput>;
}

const validationSchema = Yup.object().shape({
  message: Yup.string(),
});

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  inputValue,
  setInputValue,
  inputRef,
}) => {
  const { i18n } = useTranslation();
  const rootStore = useStores();
  const userName = rootStore.profileModel?.full_name || "User";
  const currentLanguage = i18n.language || "en";
  const languageName = getLanguageName(currentLanguage.split("-")[0]);
  const [inputHeight, setInputHeight] = useState(40);
  const initialValues = { message: inputValue };
  
  const LoadingSquare = () => {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }, [opacity]);

    return (
      <Animated.View style={[tw`h-3 w-3 bg-white rounded-sm`, { opacity }]} />
    );
  };

  const handleSubmit = async (
    values: { message: string },
    { resetForm }: any
  ) => {
    if (values.message.trim()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSendMessage(values.message.trim());
      resetForm();
      setInputValue("");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!inputValue) {
      setInputHeight(40);
    }
  }, [inputValue]);

  return (
    <Formik
      initialValues={{ message: inputValue }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ handleChange, handleSubmit, values, errors, touched }) => (
        <View
          style={tw`px-4 pb-${Platform.OS === "ios" ? "3" : "3"} bg-[#FAFAFA]`}
        >
          <View
            style={[
              tw`flex-row border border-[#6934D2] rounded-3xl px-4 py-2 bg-white`,
              { alignItems: "flex-end" },
            ]}
          >
            <TouchableOpacity
              onPress={() => showToast("warning", "Coming soon")}
              style={tw`items-center justify-end mr-2 pb-1`}
            >
              <MoreIconSvg />
            </TouchableOpacity>
            <TextInput
              placeholder={translate("chatbotScreen:textInput")}
              value={values.message}
              onChangeText={(text) => {
                handleChange("message")(text);
                setInputValue(text);
              }}
              textAlignVertical="center"
              style={[
                tw`flex-1 text-base text-black `,
                {
                  fontFamily: "SFUIDisplayLight",
                  height: Math.max(40, inputHeight),
                  paddingVertical: 10,
                },
              ]}
              multiline
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit()}
              editable={!isLoading}
              ref={inputRef}
            />
            <TouchableOpacity
              onPress={() => handleSubmit()}
              disabled={!values.message.trim() || isLoading}
              style={tw`items-center justify-end pb-1`}
            >
              {isLoading ? (
                <View
                  style={tw`h-8 w-8 rounded-full bg-[${colors.primary}] items-center justify-center`}
                >
                  <LoadingSquare />
                </View>
              ) : (
                <SendArrowSvg />
              )}
            </TouchableOpacity>
          </View>
          {touched.message && errors.message && (
            <Text style={tw`text-red-500 text-xs mt-1`}>{errors.message}</Text>
          )}
        </View>
      )}
    </Formik>
  );
};
