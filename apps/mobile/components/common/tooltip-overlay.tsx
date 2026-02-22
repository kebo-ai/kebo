import React, { useState } from "react";
import { View, Text, Dimensions, TouchableWithoutFeedback } from "react-native";
import tw from "twrnc";
import { useCurrencyFormatter } from "./currency-formatter";

interface TooltipOverlayProps {
  visible: boolean;
  value: number;
  label: string;
  type?: "income" | "expense" | null;
  x: number;
  y: number;
  onHide: () => void;
  showType?: boolean;
  customLabel?: string;
}

const TooltipOverlay: React.FC<TooltipOverlayProps> = ({
  visible,
  value,
  label,
  type,
  x,
  y,
  onHide,
  showType = true,
  customLabel,
}) => {
  const { formatAmount } = useCurrencyFormatter();
  const windowWidth = Dimensions.get("window").width;
  const [tooltipWidth, setTooltipWidth] = useState(0);

  if (!visible) return null;

  const tooltipY = y - 25;
  const tooltipX = Math.max(
    Math.min(x - tooltipWidth / 2, windowWidth - tooltipWidth - 20),
    20
  );

  return (
    <TouchableWithoutFeedback onPress={onHide}>
      <View style={[tw`absolute left-0 right-0 bottom-0 `, { top: tooltipY }]}>
        <View
          style={[
            tw`absolute bg-black px-3 py-2 rounded-xl shadow-lg`,
            {
              left: tooltipX / 1.2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
          ]}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setTooltipWidth(width);
          }}
        >
          <Text style={tw`text-white text-xs font-bold text-center`}>
            {showType
              ? type === "income"
                ? "Ingresos"
                : "Gastos"
              : customLabel || label}
          </Text>
          <Text style={tw`text-[#C4A8FF] text-center text-xs font-bold mt-1`}>
            {formatAmount(value)}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TooltipOverlay;
