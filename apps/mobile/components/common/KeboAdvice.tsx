import React from "react";
import { View, Text, Image } from "react-native";
import tw from "twrnc";
import { translate } from "@/i18n";

interface KeboAdviceProps {
  message: string;
  highlight?: string;
}

export const KeboAdvice: React.FC<KeboAdviceProps> = ({
  message,
  highlight,
}) => {
  return (
    <View
      style={tw`flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-[#6934D21A]`}
    >
      {/* Kebo Icon */}
      <View style={tw`w-12 h-12 mr-3`}>
        <Image
          source={require("../../assets/images/kebito-advice.png")}
          style={tw`w-full h-full`}
          resizeMode="contain"
        />
      </View>

      {/* Message */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-sm text-[#110627]`}>
          {translate("components:keboAdvice.advicebody")}
        </Text>
        <Text style={tw`text-sm text-[#110627] mt-1`}>
          {message} <Text style={tw`text-[#6934D2]`}>{highlight}</Text>
        </Text>
      </View>
    </View>
  );
};
