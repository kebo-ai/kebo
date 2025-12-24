import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import tw from "twrnc";
import { translate } from "../../i18n";
import { useCurrencyFormatter } from "./CurrencyFormatter";
import TooltipOverlay from "./TooltipOverlay";
import { useIsFocused } from "@react-navigation/native";
import { ArrowRightIconSvg } from "../svg/ArrowRightIcon";
import { ArrowLefttIconV2 } from "../svg/ArrowLefttIconV2";

interface PeriodData {
  label: string;
  income: number;
  expense: number;
  disablePrev?: boolean;
  disableNext?: boolean;
}

interface CustomBarIncomeProps {
  data: PeriodData[];
  width: number;
  hideTooltip: () => void;
  periodType?: "year" | "month" | "week";
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
  onPressExpenses: () => void;
  onPressIncome: () => void;
  income: number;
  expenses: number;
}

const incomeColor = "#9C88FF";
const expenseColor = "#200066";

const CustomBarIncome: React.FC<CustomBarIncomeProps> = ({
  data,
  width,
  hideTooltip,
  periodType = "month",
  income,
  expenses,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}) => {
  const isFocused = useIsFocused();
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    value: number;
    label: string;
    type: "income" | "expense" | null;
    x: number;
    y: number;
  }>({ visible: false, value: 0, label: "", type: null, x: 0, y: 0 });
  const [scrollX, setScrollX] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [selectedType, setSelectedType] = useState<
    "all" | "income" | "expense" | "both"
  >("expense");
  const { formatAmount } = useCurrencyFormatter();

  const handleHideTooltip = () => {
    setTooltip((t) => ({ ...t, visible: false }));
    hideTooltip();
  };

  useEffect(() => {
    handleHideTooltip();
  }, [selectedType]);

  useEffect(() => {
    if (!isFocused) {
      handleHideTooltip();
    }
  }, [isFocused]);

  useEffect(() => {
    handleHideTooltip();
  }, [periodType]);

  useEffect(() => {
    const handleBlur = () => {
      handleHideTooltip();
    };

    const subscription = Dimensions.addEventListener("change", handleBlur);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [data]);

  const getStep = (value: number): number => {
    if (value <= 10) return 1;
    if (value <= 100) return 10;
    if (value <= 1000) return 100;
    if (value <= 10000) return 1000;
    if (value <= 100000) return 10000;
    if (value <= 1000000) return 100000;
    return 1000000;
  };

  const formatYAxisValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  const translateLabel = (label: string) => {
    if (periodType === "year") {
      const monthMap: { [key: string]: string } = {
        JAN: translate("reportsIncomeScreen:jan"),
        FEB: translate("reportsIncomeScreen:feb"),
        MAR: translate("reportsIncomeScreen:mar"),
        APR: translate("reportsIncomeScreen:apr"),
        MAY: translate("reportsIncomeScreen:may"),
        JUN: translate("reportsIncomeScreen:jun"),
        JUL: translate("reportsIncomeScreen:jul"),
        AUG: translate("reportsIncomeScreen:aug"),
        SEP: translate("reportsIncomeScreen:sep"),
        OCT: translate("reportsIncomeScreen:oct"),
        NOV: translate("reportsIncomeScreen:nov"),
        DEC: translate("reportsIncomeScreen:dec"),
      };
      return monthMap[label] || label;
    } else if (periodType === "week") {
      const dayMap: { [key: string]: string } = {
        MON: translate("reportsIncomeScreen:monday"),
        TUE: translate("reportsIncomeScreen:tuesday"),
        WED: translate("reportsIncomeScreen:wednesday"),
        THU: translate("reportsIncomeScreen:thursday"),
        FRI: translate("reportsIncomeScreen:friday"),
        SAT: translate("reportsIncomeScreen:saturday"),
        SUN: translate("reportsIncomeScreen:sunday"),
      };
      return dayMap[label] || label;
    }
    return label;
  };

  const maxValue = Math.max(
    ...data.map((item) => {
      if (selectedType === "income") return item.income || 0;
      if (selectedType === "expense") return item.expense || 0;
      if (selectedType === "both")
        return Math.max(item.income || 0, item.expense || 0);
      return Math.max(item.income || 0, item.expense || 0);
    })
  );

  const step = getStep(maxValue);
  const maxYValue = Math.ceil(maxValue / step) * step;

  const noOfSections = 5;
  const yAxisLabelTextsIncome = Array.from(
    { length: noOfSections + 1 },
    (_, i) => {
      const value = Math.round((i * maxYValue) / noOfSections);
      return formatYAxisValue(value);
    }
  );

  const barData = data.flatMap((item, idx) => {
    const incomeValue = item.income || 0;
    const expenseValue = item.expense || 0;
    const spacingValue =
      periodType === "month" ? 1 : periodType === "week" ? 10 : 8;
    const barWidth =
      periodType === "month" ? 8 : periodType === "week" ? 14 : 10;
    const spacing =
      periodType === "month" ? 24 : periodType === "week" ? 10 : 8;
    const initialSpacing = 16;

    const barPosition = initialSpacing + idx * (barWidth + spacing);
    const incomeBarX = barPosition;
    const expenseBarX = barPosition + barWidth + 4;

    return [
      {
        value: selectedType === "expense" ? 0 : incomeValue,
        label: translateLabel(item.label),
        frontColor: incomeColor,
        barWidth,
        spacing: spacingValue,
        onPress: () => {
          if (selectedType !== "expense") {
            setTooltip({
              visible: true,
              value: incomeValue,
              label: translateLabel(item.label),
              type: "income",
              x: incomeBarX + barWidth / 2,
              y: 220 - (incomeValue * 220) / maxYValue,
            });
          }
        },
      },
      {
        value: selectedType === "income" ? 0 : expenseValue,
        label: "",
        frontColor: expenseColor,
        barWidth,
        spacing: spacingValue,
        onPress: () => {
          if (selectedType !== "income") {
            setTooltip({
              visible: true,
              value: expenseValue,
              label: translateLabel(item.label),
              type: "expense",
              x: expenseBarX + barWidth / 2,
              y: 220 - (expenseValue * 220) / maxYValue,
            });
          }
        },
      },
    ];
  });

  return (
    <TouchableWithoutFeedback onPress={handleHideTooltip}>
      <View style={tw`flex-1`}>
        <View
          style={tw`flex-row items-center justify-between justify-center px-4`}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <TouchableOpacity
              onPress={() => {
                handleHideTooltip();
                onPrev();
              }}
              disabled={disablePrev}
              style={tw`rounded-lg`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={tw`w-10 h-10 px-2 justify-center items-center`}>
                <ArrowLefttIconV2 />
              </View>
            </TouchableOpacity>
            <View
              style={tw`flex-row items-center justify-between w-[80%] my-2`}
            >
              <TouchableOpacity
                onPress={() => {
                  handleHideTooltip();
                  if (selectedType === "all") {
                    setSelectedType("expense");
                  } else if (selectedType === "expense") {
                    setSelectedType("all");
                  } else if (selectedType === "income") {
                    setSelectedType("both");
                  } else if (selectedType === "both") {
                    setSelectedType("income");
                  }
                }}
                style={[
                  tw`flex-1 items-center rounded-2xl ml-2 px-2 py-2 border`,
                  {
                    backgroundColor:
                      selectedType === "expense" || selectedType === "both"
                        ? expenseColor
                        : "#FFFFFF",
                    borderColor:
                      selectedType === "expense" || selectedType === "both"
                        ? expenseColor
                        : "#D3D3D3",
                  },
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-light`,
                    {
                      color:
                        selectedType === "expense" || selectedType === "both"
                          ? "#FFFFFF"
                          : expenseColor,
                    },
                  ]}
                >
                  {translate("reportsIncomeScreen:expenses")}
                </Text>
                <Text
                  style={[
                    tw`text-xs font-bold`,
                    {
                      color:
                        selectedType === "expense" || selectedType === "both"
                          ? "#FFFFFF"
                          : expenseColor,
                    },
                  ]}
                >
                  {formatAmount(expenses)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleHideTooltip();
                  if (selectedType === "all") {
                    setSelectedType("income");
                  } else if (selectedType === "income") {
                    setSelectedType("all");
                  } else if (selectedType === "expense") {
                    setSelectedType("both");
                  } else if (selectedType === "both") {
                    setSelectedType("expense");
                  }
                }}
                style={[
                  tw`flex-1 items-center rounded-2xl ml-2 px-2 py-2 border`,
                  {
                    backgroundColor:
                      selectedType === "income" || selectedType === "both"
                        ? incomeColor
                        : "#FFFFFF",
                    borderColor:
                      selectedType === "income" || selectedType === "both"
                        ? incomeColor
                        : "#D3D3D3",
                  },
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-light`,
                    {
                      color:
                        selectedType === "income" || selectedType === "both"
                          ? "#FFFFFF"
                          : incomeColor,
                    },
                  ]}
                >
                  {translate("reportsIncomeScreen:income")}
                </Text>
                <Text
                  style={[
                    tw`text-xs font-bold`,
                    {
                      color:
                        selectedType === "income" || selectedType === "both"
                          ? "#FFFFFF"
                          : incomeColor,
                    },
                  ]}
                >
                  {formatAmount(income)}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                handleHideTooltip();
                onNext();
              }}
              disabled={disableNext}
              style={tw`rounded-lg`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={tw`w-10 h-10 px-2 justify-center items-center`}>
                <ArrowRightIconSvg />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`flex-1`}>
          {data.some((item) => item.income !== 0 || item.expense !== 0) ? (
            <View style={tw`items-center px-4 pt-2`}>
              <View
                style={[
                  tw`bg-[#C4A8FF]/15 rounded-3xl py-3 px-1.5 w-full`,
                  {
                    shadowColor: "#C4A8FF",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.02,
                    shadowRadius: 2,
                    overflow: "hidden",
                  },
                ]}
              >
                <ScrollView
                  onScroll={(e) => {
                    setScrollX(e.nativeEvent.contentOffset.x);
                    handleHideTooltip();
                  }}
                  scrollEventThrottle={16}
                  contentContainerStyle={{
                    marginTop: 4,
                  }}
                >
                  <View>
                    <BarChart
                      data={barData}
                      width={width - 12}
                      height={200}
                      initialSpacing={0}
                      endSpacing={24}
                      barWidth={14}
                      xAxisLabelTextStyle={[
                        tw`text-[10px] uppercase font-light w-8 text-center`,
                        {
                          fontSize: periodType === "month" ? 9 : 10,
                        },
                      ]}
                      yAxisTextStyle={tw`text-black font-light text-[10px] text-center`}
                      noOfSections={noOfSections}
                      xAxisThickness={1}
                      xAxisColor="#E6DAFD"
                      yAxisThickness={0}
                      yAxisLabelTexts={yAxisLabelTextsIncome}
                      maxValue={maxYValue}
                      animationDuration={800}
                      roundedTop
                      showGradient={false}
                      barBorderRadius={2}
                      rulesType="solid"
                      rulesColor="#E6DAFD"
                      rulesThickness={1}
                      xAxisLabelTexts={data.map((item) =>
                        translateLabel(item.label)
                      )}
                    />
                  </View>
                  <Text
                    style={tw`text-black text-[10px] font-light my-0.5 text-center`}
                  >
                    {periodType === "month"
                      ? translate("reportsIncomeScreen:labelMonth")
                      : periodType === "year"
                      ? translate("reportsIncomeScreen:labelYear")
                      : translate("reportsIncomeScreen:labelWeek")}
                  </Text>
                </ScrollView>
              </View>
              {tooltip.visible && tooltip.value && (
                <TooltipOverlay
                  visible={tooltip.visible}
                  value={tooltip.value}
                  label={tooltip.label}
                  type={tooltip.type}
                  x={
                    tooltip.x -
                    scrollX +
                    (periodType === "year"
                      ? 200
                      : periodType === "week"
                      ? 70
                      : 0)
                  }
                  y={tooltip.y}
                  onHide={handleHideTooltip}
                />
              )}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CustomBarIncome;
