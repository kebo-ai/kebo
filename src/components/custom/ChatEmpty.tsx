import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { Svg, Path, Circle } from "react-native-svg";
// import { ScrollView } from "moti";
import { ScrollView } from "react-native";
import { iconRegistry } from "../assets/Icon";
import { ImageCustom } from "../assets/Image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { translate } from "../../i18n";
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { KeboIconSvg } from "../svg/KeboIconSvg";
import { KeboWiseThinkingSvg } from "../svg/KeboWiseThinkingSvg";

interface SampleQuestion {
  text: string;
  onPress: () => void;
}

interface ChatEmptyProps {
  onSampleQuestionPress: (question: string) => void;
}

export const ChatEmpty: React.FC<ChatEmptyProps> = ({
  onSampleQuestionPress,
}) => {
  const insets = useSafeAreaInsets();
  const sampleQuestions: SampleQuestion[] = [
    {
      text: translate("chatbotScreen:sampleQuestions"),
      onPress: () =>
        onSampleQuestionPress(translate("chatbotScreen:sampleQuestions")),
    },
    {
      text: translate("chatbotScreen:sampleQuestions1"),
      onPress: () =>
        onSampleQuestionPress(translate("chatbotScreen:sampleQuestions1")),
    },
    {
      text: translate("chatbotScreen:sampleQuestions2"),
      onPress: () =>
        onSampleQuestionPress(translate("chatbotScreen:sampleQuestions2")),
    },
  ];

  return (
    <View style={tw`flex-1`}>
      <View style={tw`justify-center items-center flex-1`}>
        <KeboWiseThinkingSvg width={100} height={100} />
      </View>
      <View style={tw`w-full`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`gap-3`}
          keyboardShouldPersistTaps="always"
        >
          {sampleQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={tw.style(
                `px-4 py-3 bg-[#606A84]/5 rounded-xl`,
                index === 0 ? `ml-6` : `ml-0`
              )}
              onPress={question.onPress}
            >
              <Text
                style={[
                  tw`text-sm text-[#606A84] text-center`,
                  { fontFamily: "SFUIDisplayLight" },
                ]}
              >
                {question.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
