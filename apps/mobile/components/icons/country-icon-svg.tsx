import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

interface CountryIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const CountryIconSvg: React.FC<CountryIconSvgProps> = ({}) => (
  <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
    <Path
      d="M12.5 24C18.8513 24 24 18.8513 24 12.5C24 6.14873 18.8513 1 12.5 1M12.5 24C6.14873 24 1 18.8513 1 12.5C1 6.14873 6.14873 1 12.5 1M12.5 24C14 24 18 18.85 18 12.5C18 6.15 14 1 12.5 1M12.5 24C11 24 7 18.85 7 12.5C7 6.15 11 1 12.5 1M2.97 18.92C5.03 17.67 19.97 17.67 22.03 18.92M2.52 6.8C4.5 8.14 20.5 8.14 22.48 6.8"
      stroke="#6934D2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
