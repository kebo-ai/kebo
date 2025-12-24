import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface DocumentIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const DocumentIconSvg: React.FC<DocumentIconSvgProps> = ({
  width = 11,
  height = 14,
}) => (
  <Svg width={width} height={height} viewBox="0 0 11 14" fill="none">
    <Path
      d="M1 3.6087V12.4783C1 12.7652 1.23478 13 1.52174 13H9.34783C9.63478 13 9.86957 12.7652 9.86957 12.4783V1.52174C9.86957 1.23478 9.63478 1 9.34783 1H3.6087M1 3.6087L3.6087 1M1 3.6087H3.08696C3.37391 3.6087 3.6087 3.37391 3.6087 3.08696V1M3.6087 7.26087H7.78261M3.6087 9.86957H7.78261"
      stroke={colors.black}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
