import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/use-theme";
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

  // Image column takes ~28% of the screen width so the art scales with the
  // device (same feel as the original 30%), but unlike the old code the text
  // column uses flex: 1 instead of a hard-coded 80% width, so the two
  // columns can never sum to more than the card's width and the title /
  // subtitle can no longer overflow past the image.
  const imageColumnWidth = Math.round(width * 0.28);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[resolvedTop, resolvedBottom]}
        style={tw`rounded-xl flex-row overflow-hidden min-h-[100px]`}
      >
        <View style={tw`flex-1 justify-center gap-1 py-4 pl-4 pr-2`}>
          <Text
            weight="medium"
            style={tw`text-[15px]`}
            color={theme.textPrimary}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            weight="light"
            style={tw`text-[13px] leading-[18px]`}
            color={theme.textSecondary}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>
        <View style={[tw`justify-end`, { width: imageColumnWidth }]}>
          <Image
            source={imageSource}
            style={{ width: "100%", height: 100, resizeMode: "cover" }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CustomReportCard;
