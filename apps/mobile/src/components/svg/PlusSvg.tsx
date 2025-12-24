import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface PlusIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const PlusIconSvg: React.FC<PlusIconSvgProps> = ({
  width = 33,
  height = 32,
  color = colors.primary,
  isPressed = false,
}) => (
  <Svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
  >
    <Path
      d="M6.8 9.7H1.2C0.86 9.7 0.575 9.58567 0.345 9.357C0.115 9.12833 0 8.845 0 8.507C0 8.169 0.115 7.88333 0.345 7.65C0.575 7.41667 0.86 7.3 1.2 7.3H6.8V1.7C6.8 1.36 6.91433 1.075 7.143 0.844999C7.37167 0.614999 7.655 0.5 7.993 0.5C8.331 0.5 8.61667 0.614999 8.85 0.844999C9.08333 1.075 9.2 1.36 9.2 1.7V7.3H14.8C15.14 7.3 15.425 7.41433 15.655 7.643C15.885 7.87167 16 8.155 16 8.493C16 8.831 15.885 9.11667 15.655 9.35C15.425 9.58333 15.14 9.7 14.8 9.7H9.2V15.3C9.2 15.64 9.08567 15.925 8.857 16.155C8.62833 16.385 8.345 16.5 8.007 16.5C7.669 16.5 7.38333 16.385 7.15 16.155C6.91667 15.925 6.8 15.64 6.8 15.3V9.7Z"
      fill="white"
    />
  </Svg>
);
