import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface ChatHelpIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ChatHelpIconSvg: React.FC<ChatHelpIconSvgProps> = ({
  width = 17,
  height = 14,
}) => (
  <Svg width={width} height={height} viewBox="0 0 17 14" fill="none">
    <Path
      d="M5 4.33333H13M5 7H13M5 1H12.3333C14.54 1 16.3333 2.79333 16.3333 5V6.33333C16.3333 8.54 14.54 10.3333 12.3333 10.3333H5L1 13V5C1 2.79333 2.79333 1 5 1Z"
      stroke={colors.black}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
