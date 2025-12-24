import React from "react";
import {
  Svg,
  Path,
  Circle,
  G,
  Defs,
  ClipPath,
  Rect,
  Filter,
  FeFlood,
  FeBlend,
  FeGaussianBlur,
  Ellipse,
} from "react-native-svg";
import { colors } from "../../theme/colors";

interface InfoIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const InfoIconSvg: React.FC<InfoIconSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg width={width} height={height} viewBox="0 0 13 13" fill="none">
    <G clipPath="url(#clip0_624_6765)">
      <Path
        d="M6.50004 8.66683V6.50016M6.50004 4.3335H6.50546M11.9167 6.50016C11.9167 9.4917 9.49158 11.9168 6.50004 11.9168C3.5085 11.9168 1.08337 9.4917 1.08337 6.50016C1.08337 3.50862 3.5085 1.0835 6.50004 1.0835C9.49158 1.0835 11.9167 3.50862 11.9167 6.50016Z"
        stroke={colors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_624_6765">
        <Rect width="13" height="13" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
