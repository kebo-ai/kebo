import {
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { IconTypes } from "@/components/assets/icon";
import { colors } from "@/theme";
import { BackIconSvg } from "@/components/icons/back-svg";

interface CustomHeaderProps {
  showPrimaryIcon?: boolean;
  showSecondaryIcon?: boolean;
  primaryIcon?: IconTypes;
  title?: string;
  onPress?: () => void;
}

export default function CustomHeader({
  showPrimaryIcon = true,
  showSecondaryIcon = false,
  primaryIcon = "back",
  title,
  ...props
}: CustomHeaderProps) {
  return (
    <View style={tw`w-full`}>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
      />
      <View
        style={tw`justify-between flex-row items-center bg-[${colors.primary}] rounded-b-[20px]`}
      >
        {showPrimaryIcon && (
          <TouchableOpacity
            onPress={props.onPress}
            style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
          >
            <BackIconSvg width={15} height={15} />
          </TouchableOpacity>
        )}
        {title && (
          <Text
            weight="medium"
            style={tw`text-white text-lg`}
          >
            {title}
          </Text>
        )}
        <TouchableOpacity>
          <View style={tw`w-12 h-12`}></View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
