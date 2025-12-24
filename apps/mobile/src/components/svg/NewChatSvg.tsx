import React from "react";
import { Svg, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/colors";

interface NewChatSvgProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export const NewChatSvg: React.FC<NewChatSvgProps> = ({
  width = 23,
  height = 23,
}) => (
  <Svg width={width} height={height} viewBox="0 0 23 23" fill="none">
    <Path
      d="M9.25 10.75H5.75C5.5375 10.75 5.35938 10.6785 5.21563 10.5356C5.07188 10.3927 5 10.2156 5 10.0044C5 9.79312 5.07188 9.61458 5.21563 9.46875C5.35938 9.32292 5.5375 9.25 5.75 9.25H9.25V5.75C9.25 5.5375 9.32146 5.35937 9.46438 5.21562C9.60729 5.07187 9.78437 5 9.99563 5C10.2069 5 10.3854 5.07187 10.5312 5.21562C10.6771 5.35937 10.75 5.5375 10.75 5.75V9.25H14.25C14.4625 9.25 14.6406 9.32146 14.7844 9.46438C14.9281 9.60729 15 9.78437 15 9.99563C15 10.2069 14.9281 10.3854 14.7844 10.5312C14.6406 10.6771 14.4625 10.75 14.25 10.75H10.75V14.25C10.75 14.4625 10.6785 14.6406 10.5356 14.7844C10.3927 14.9281 10.2156 15 10.0044 15C9.79312 15 9.61458 14.9281 9.46875 14.7844C9.32292 14.6406 9.25 14.4625 9.25 14.25V10.75Z"
      fill="#6934D2"
    />
    <Rect
      x="1"
      y="1"
      width="18"
      height="18"
      rx="5"
      stroke="#6934D2"
      stroke-width="4"
    />
  </Svg>
);
