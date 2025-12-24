import { TouchableOpacity, View, Text } from "react-native";
import tw from "../../utils/useTailwind";
import { ArrowDownSimpleIcon } from "../svg/ArrowDownSimpleIcon";
import { BackIconSvg } from "../svg/BackSvg";
import { colors } from "../../theme/colors";
import { IconTypes } from "../assets/Icon";

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
          style={[
            tw`absolute self-center text-black text-lg`,
            { fontFamily: "SFUIDisplayMedium" },
          ]}
        >
          {title}
        </Text>
      )}
    </View>
  );
}
