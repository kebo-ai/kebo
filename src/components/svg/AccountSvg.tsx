import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface AccountSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const AccountIconSvg: React.FC<AccountSvgProps> = ({
  width = 24,
  height = 24,
  color = colors.primary,
}) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <Path
      d="M9.48736 11.5379V19.5588M7.39494 11.5379V19.5588M20.6469 11.5379V19.5588M18.5545 11.5379V19.5588M15.0671 11.5379V19.5588M12.9747 11.5379V19.5588M22.0418 11.5379H6V10.68C6 10.3592 6.21622 10.0872 6.5231 10.0035L13.7908 6.04185C13.9442 5.98605 14.1046 5.98605 14.2581 6.04185L21.5257 10.0105C21.8326 10.0872 22.0488 10.3662 22.0488 10.687V11.5449L22.0418 11.5379ZM6 19.9076H22.0418V21.3025C22.0418 21.6861 21.728 22 21.3444 22H6.69747C6.31386 22 6 21.6861 6 21.3025V19.9076Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
