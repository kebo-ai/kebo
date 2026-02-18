import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { ScrollView } from "react-native";
import { translate } from "@/i18n";
import Animated, { FadeIn } from "react-native-reanimated";
import { KeboWiseThinkingSvg } from "@/components/icons/KeboWiseThinkingSvg";
import { useTheme } from "@/hooks/useTheme";

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
  const { theme } = useTheme();
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
            <Animated.View
              key={index}
              entering={FadeIn.duration(400).delay(index * 150)}
            >
              <TouchableOpacity
                style={[
                  tw.style(
                    `px-4 py-3 rounded-xl border`,
                    index === 0 ? `ml-6` : `ml-0`
                  ),
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                ]}
                onPress={question.onPress}
              >
                <Text
                  weight="light"
                  style={[tw`text-sm text-center`, { color: theme.textSecondary }]}
                >
                  {question.text}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
