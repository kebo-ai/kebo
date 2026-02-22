import React, { useState, useEffect } from "react";
import { View, Text, TouchableWithoutFeedback, Animated } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import tw from "twrnc";
import TooltipOverlay from "./tooltip-overlay";
import { useTheme } from "@/hooks/use-theme";

interface CategoryData {
  id: string;
  name: string;
  emoji: string;
  icon_url: string;
  amount: number;
  color: string;
  icon?: string;
  percentage?: number;
}

interface CustomBarCategoryProps {
  data: CategoryData[];
  width: number;
  hideTooltipSignal?: number;
  tooltipVisible: boolean;
  tooltipData: CategoryData | null;
  showTooltip: (item: CategoryData, idx: number, x: number) => void;
  hideTooltip: () => void;
  activeBarIndex: number | null;
  setActiveBarIndex: (idx: number | null) => void;
  tooltipX: number;
  setTooltipX: (x: number) => void;
}

export const CustomBarCategory: React.FC<CustomBarCategoryProps> = ({
  data,
  width,
  hideTooltipSignal,
  tooltipVisible,
  tooltipData,
  showTooltip,
  hideTooltip,
  activeBarIndex,
  setActiveBarIndex,
  tooltipX,
  setTooltipX,
}) => {
  const [animation] = useState(new Animated.Value(0));
  const { isDark, theme } = useTheme();

  const formatYAxisValue = (value: number) => {
    if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return value.toString();
  };

  const chartWidth = width - 48;
  const barWidth = 28;
  const spacing = 24;
  const initialSpacing = 16;

  const hasData = data.length > 0;

  const barData = hasData
    ? data.map((item, idx) => ({
        value: item.amount,
        label: item.emoji
          ? item.icon_url
          : item.name.length > 4
          ? item.name.substring(0, 4) + "…"
          : item.name,
        frontColor: item.color,
        barWidth,
        onPress: (_bar: any, i: number) => {
          if (activeBarIndex === idx) {
            hideTooltip();
          } else {
            const x = initialSpacing + idx * (barWidth + spacing);
            setTooltipX(x);
            setActiveBarIndex(idx);
            showTooltip(item, idx, x);
          }
        },
      }))
    : [];

  const xAxisLabels = hasData
    ? data.map((item) => {
        const icon = item.icon || item.icon_url || item.emoji;
        const name = item.name || "";
        if (
          icon &&
          typeof icon === "string" &&
          !icon.startsWith("/storage") &&
          !icon.startsWith("http")
        ) {
          return icon;
        }
        return "";
      })
    : ["🐨"];

  const rawMax = hasData ? Math.max(...data.map((item) => item.amount)) : 1000;

  const getStep = (value: number): number => {
    if (value <= 10) return 1;
    if (value <= 100) return 10;
    if (value <= 1000) return 100;
    if (value <= 10000) return 1000;
    if (value <= 100000) return 10000;
    return 100000;
  };

  const step = getStep(rawMax);
  const maxValue = Math.ceil(rawMax / step) * step || step;

  const noOfSections = 6;
  const yAxisLabelTexts = Array.from({ length: noOfSections + 1 }, (_, i) =>
    formatYAxisValue(Math.round((i * maxValue) / noOfSections))
  );

  useEffect(() => {
    hideTooltip();
  }, [hideTooltipSignal]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [data]);

  const handleBarPress = (item: any, index: any) => {
    if (activeBarIndex === index) {
      hideTooltip();
    } else {
      const x = initialSpacing + index * (barWidth + spacing);
      setTooltipX(x);
      setActiveBarIndex(index);
      showTooltip(item, index, x);
    }
  };

  const renderXAxisLabel = (item: any, idx: number) => {
    const icon = item.icon || item.icon_url || item.emoji;
    const name = item.name || "";
    if (
      icon &&
      typeof icon === "string" &&
      !icon.startsWith("/storage") &&
      !icon.startsWith("http")
    ) {
      return <Text style={tw`text-xl text-center`}>{icon}</Text>;
    }
    return <Text style={[tw`text-xs text-center`, { color: theme.textSecondary }]}></Text>;
  };

  const chartBg = isDark ? "rgba(196, 168, 255, 0.08)" : "rgba(196, 168, 255, 0.15)";
  const rulesColor = isDark ? "rgba(196, 168, 255, 0.2)" : "#E6DAFD";

  return (
    <View style={[tw`px-4 items-center`]}>
      <TouchableWithoutFeedback onPress={hideTooltip}>
        <View style={[tw`rounded-3xl py-3 w-full`, { backgroundColor: chartBg }]}>
          <TouchableWithoutFeedback onPress={hideTooltip}>
            <View style={tw`overflow-hidden`}>
              <BarChart
                data={barData}
                width={chartWidth}
                height={200}
                initialSpacing={initialSpacing}
                barWidth={barWidth}
                xAxisLabelTextStyle={renderXAxisLabel}
                yAxisTextStyle={[
                  tw`font-light text-[10px] text-center`,
                  { color: theme.textSecondary },
                ]}
                noOfSections={6}
                xAxisThickness={1}
                xAxisColor={rulesColor}
                yAxisThickness={0}
                yAxisLabelTexts={yAxisLabelTexts}
                xAxisLabelTexts={xAxisLabels}
                maxValue={maxValue}
                roundedTop
                showGradient={false}
                barBorderRadius={2}
                rulesType="solid"
                rulesColor={rulesColor}
                rulesThickness={1}
                onPress={handleBarPress}
              />
            </View>
          </TouchableWithoutFeedback>
          {tooltipVisible && tooltipData && (
            <TooltipOverlay
              visible={tooltipVisible}
              value={tooltipData.amount}
              label={tooltipData.name}
              x={tooltipX + 50}
              y={220 - (tooltipData.amount * 220) / maxValue}
              onHide={hideTooltip}
              showType={false}
              customLabel={
                tooltipData.name?.length > 12
                  ? `${tooltipData.name.substring(0, 12)}...`
                  : tooltipData.name
              }
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
