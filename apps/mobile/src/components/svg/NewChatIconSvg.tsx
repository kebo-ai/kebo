import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface NewChatIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export const NewChatIconSvg: React.FC<NewChatIconSvgProps> = ({
  width = 22,
  height = 22,
  color = colors.white,
}) => (
  <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
    <Path
      d="M7.71484 13.7541C7.71484 13.2649 7.71484 13.0203 7.7701 12.7901C7.8191 12.586 7.89991 12.3909 8.00956 12.212C8.13325 12.0102 8.3062 11.8372 8.6521 11.4913L17.7149 2.42857C18.5038 1.63959 19.783 1.63959 20.572 2.42857V2.42857C21.361 3.21755 21.361 4.49674 20.572 5.28572L11.5093 14.3485C11.1634 14.6944 10.9904 14.8673 10.7886 14.991C10.6096 15.1007 10.4145 15.1815 10.2105 15.2305C9.9803 15.2857 9.73571 15.2857 9.24653 15.2857H7.71484V13.7541Z"
      stroke="#6934D2"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M10.5714 3.85718H6.8C5.11984 3.85718 4.27976 3.85718 3.63803 4.18416C3.07354 4.47178 2.6146 4.93072 2.32698 5.49521C2 6.13694 2 6.97702 2 8.65718V16.2C2 17.8802 2 18.7203 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.6731C4.27976 21 5.11984 21 6.8 21H14.3429C16.023 21 16.8631 21 17.5048 20.6731C18.0693 20.3854 18.5283 19.9265 18.8159 19.362C19.1429 18.7203 19.1429 17.8802 19.1429 16.2V12.4286"
      stroke="#6934D2"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
