import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { translate } from "@/i18n";
import Animated, { FadeIn } from "react-native-reanimated";
import { KeboWiseThinkingSvg } from "@/components/icons/KeboWiseThinkingSvg";
import { useTheme } from "@/hooks/use-theme";
import { PressableScale } from "pressto";

interface ChatEmptyProps {
  onSampleQuestionPress: (question: string) => void;
}

export const ChatEmpty: React.FC<ChatEmptyProps> = ({
  onSampleQuestionPress,
}) => {
  const { theme } = useTheme();

  const sampleQuestions = [
    translate("chatbotScreen:sampleQuestions"),
    translate("chatbotScreen:sampleQuestions1"),
    translate("chatbotScreen:sampleQuestions2"),
  ];

  return (
    <View style={tw`flex-1 justify-end`}>
      <View style={tw`items-center mb-8`}>
        <KeboWiseThinkingSvg width={80} height={80} />
      </View>

      <View style={tw`px-5 mb-6 gap-2.5`}>
        {sampleQuestions.map((question, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.duration(350).delay(100 + index * 120)}
          >
            <PressableScale
              onPress={() => onSampleQuestionPress(question)}
              style={[
                tw`px-5 py-3 rounded-2xl border`,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <Text
                weight="regular"
                style={[tw`text-sm`, { color: theme.textSecondary }]}
              >
                {question}
              </Text>
            </PressableScale>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};
