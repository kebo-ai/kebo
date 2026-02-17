import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui";
import tw from "@/hooks/useTailwind";
import { ArrowDownSimpleIcon } from "@/components/icons/ArrowDownSimpleIcon";
import { BackIconSvg } from "@/components/icons/BackSvg";
import { colors } from "@/theme/colors";
import { IconTypes } from "@/components/assets/Icon";

interface CustomHeaderSecondaryProps {
  showPrimaryIcon?: boolean;
  showSecondaryIcon?: boolean;
  primaryIcon?: IconTypes;
  title?: string;
  onPress?: () => void;
  onPress2?: () => void;
  title2?: string;
}

export default function CustomHeaderSecondary({
  showPrimaryIcon = true,
  showSecondaryIcon = false,
  primaryIcon = "back",
  title,
  onPress2,
  title2,
  ...props
}: CustomHeaderSecondaryProps) {
  return (
    <View style={tw`w-full h-16 justify-center`}>
      <View style={tw`flex-row justify-between items-center h-full`}>
        {showPrimaryIcon ? (
          <TouchableOpacity
            onPress={props.onPress}
            style={tw`w-12 h-12 justify-center items-center shadow-md`}
          >
            <BackIconSvg width={15} height={15} color={colors.black} />
          </TouchableOpacity>
        ) : (
          <View style={tw`w-12`} />
        )}
      </View>
      {title && (
        <Text
          weight="medium"
          style={tw`absolute self-center text-black text-lg`}
        >
          {title}
        </Text>
      )}
    </View>
  );
}
