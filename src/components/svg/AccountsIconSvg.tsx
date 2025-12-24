import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface AccountsIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const AccountsIconSvg: React.FC<AccountsIconSvgProps> = ({
  width = 22,
  height = 20,
  color = "#6934D2",
}) => (
  <Svg width={width} height={height} viewBox="0 0 22 20" fill="none">
    <Path
      d="M15 12C15 12.8284 15.6716 13.5 16.5 13.5C17.3284 13.5 18 12.8284 18 12C18 11.1716 17.3284 10.5 16.5 10.5C15.6716 10.5 15 11.1716 15 12Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M9 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V13C21 15.8284 21 17.2426 20.1213 18.1213C19.2426 19 17.8284 19 15 19H9C5.22876 19 3.34315 19 2.17157 17.8284C1 16.6569 1 14.7712 1 11V9C1 5.22876 1 3.34315 2.17157 2.17157C3.34315 1 5.22876 1 9 1H13C13.93 1 14.395 1 14.7765 1.10222C15.8117 1.37962 16.6204 2.18827 16.8978 3.22354C17 3.60504 17 4.07003 17 5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
