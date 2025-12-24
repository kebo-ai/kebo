import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";

interface CustomReportCardProps {
  title?: string;
  subtitle?: string;
  imageSource?: any;
  onPress?: () => void;
  colorTop?: string;
  colorBottom?: string;
}

const CustomReportCard = ({
  title,
  subtitle,
  imageSource,
  onPress,
  colorTop = "#C4A8FF",
  colorBottom = "#FAFAFA",
}: CustomReportCardProps) => {
  const { width } = useWindowDimensions();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[colorTop, colorBottom]}
        style={tw`rounded-xl flex-row justify-between h-[100px]`}
      >
        <View
          style={[tw`flex-1 justify-between py-4 pl-3`, { width: width * 0.8 }]}
        >
          <Text
            style={[
              tw`text-[15px] text-[#110627]`,
              { fontFamily: "SFUIDisplayMedium" },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              tw`text-[14px] text-[#110627]`,
              { fontFamily: "SFUIDisplayLight" },
            ]}
          >
            {subtitle}
          </Text>
        </View>
        <View style={[tw`justify-end overflow-hidden`, { width: width * 0.3 }]}>
          <Image
            source={imageSource}
            style={[tw`h-25`, { width: "110%", resizeMode: "cover" }]}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CustomReportCard;
