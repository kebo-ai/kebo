import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import tw from "twrnc";

interface CustomReportCardProps {
  title?: string;
  subtitle?: string;
  imageSource?: any;
  onPress?: () => void;
  colorTop?: string;
  colorBottom?: string;
}

const darkGradients: Record<string, string> = {
  "#D3C0FF": "#2A1A4E",
  "#E4E6E9": "#1C1C2E",
  "#F4F1FB": "#1C1C2E",
};

const CustomReportCard = ({
  title,
  subtitle,
  imageSource,
  onPress,
  colorTop = "#C4A8FF",
  colorBottom = "#FAFAFA",
}: CustomReportCardProps) => {
  const { width } = useWindowDimensions();
  const { isDark, theme } = useTheme();

  const resolvedTop = isDark ? (darkGradients[colorTop] ?? "#2A1A4E") : colorTop;
  const resolvedBottom = isDark ? (darkGradients[colorBottom] ?? "#1C1C2E") : colorBottom;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[resolvedTop, resolvedBottom]}
        style={tw`rounded-xl flex-row justify-between h-[100px]`}
      >
        <View
          style={[tw`flex-1 justify-between py-4 pl-3`, { width: width * 0.8 }]}
        >
          <Text
            weight="medium"
            style={tw`text-[15px]`}
            color={theme.textPrimary}
          >
            {title}
          </Text>
          <Text
            weight="light"
            style={tw`text-[14px]`}
            color={theme.textSecondary}
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
