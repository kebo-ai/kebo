import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface CommentsIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const CommentsIconSvg: React.FC<CommentsIconSvgProps> = ({
  width = 24,
  height = 24,
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 13.5002H16M8 8.50024H12"
      stroke="#6934D2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.09881 19.0002C4.7987 18.8724 3.82475 18.4819 3.17157 17.8287C2 16.6571 2 14.7715 2 11.0002V10.5002C2 6.72901 2 4.84339 3.17157 3.67182C4.34315 2.50024 6.22876 2.50024 10 2.50024H14C17.7712 2.50024 19.6569 2.50024 20.8284 3.67182C22 4.84339 22 6.72901 22 10.5002V11.0002C22 14.7715 22 16.6571 20.8284 17.8287C19.6569 19.0002 17.7712 19.0002 14 19.0002C13.4395 19.0127 12.9931 19.0554 12.5546 19.1553C11.3562 19.4312 10.2465 20.0444 9.14987 20.5791C7.58729 21.3411 6.806 21.722 6.31569 21.3654C5.37769 20.6668 6.29454 18.5021 6.5 17.5002"
      stroke="#6934D2"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);
