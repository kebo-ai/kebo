import React from "react";
import { Svg, Path } from "react-native-svg";

interface InstagramIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const InstagramIconSvg: React.FC<InstagramIconSvgProps> = ({
  width = 24,
  height = 24,
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
      stroke="#6934D2"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z"
      stroke="#6934D2"
      strokeWidth="1.5"
    />
    <Path
      d="M17.5078 6.5L17.4988 6.5"
      stroke="#6934D2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
