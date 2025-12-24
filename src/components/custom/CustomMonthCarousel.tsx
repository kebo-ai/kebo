import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import moment from "moment";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const { width } = Dimensions.get("window");

const getLastMonths = (count = 12) => {
  const months = [];
  for (let i = 0; i < count; i++) {
    const date = moment().subtract(i, "months");
    months.push({
      label: date.format("MMM YYYY").toUpperCase(),
      value: date.format("YYYY-MM"),
    });
  }
  return months.reverse();
};

export const MonthCarousel = () => {
  const months = getLastMonths(12);
  const flatListRef = useRef<FlatList>(null);

  const currentIndex = months.findIndex(
    (m) => m.value === moment().format("YYYY-MM")
  );
  const [selectedMonth, setSelectedMonth] = useState(
    months[currentIndex].value
  );
  const [scrollIndex, setScrollIndex] = useState(currentIndex);

  useEffect(() => {
    setTimeout(() => {
      scrollToIndex(scrollIndex);
    }, 10);
  }, []);

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < months.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setSelectedMonth(months[index].value);
      setScrollIndex(index);
    }
  };

  const renderItem = ({ item, index }: any) => {
    const isSelected = item.value === selectedMonth;
    return (
      <View style={[{ width: width / 3 }, tw`items-center justify-center`]}>
        <Text
          style={tw.style(
            "text-base",
            isSelected
              ? "text-[#6934D2] font-bold"
              : "text-[#200066] font-semibold"
          )}
        >
          {item.label}
        </Text>
      </View>
    );
  };

  return (
    <View style={tw`w-full py-4`}>
      <FlatList
        ref={flatListRef}
        data={months}
        renderItem={renderItem}
        keyExtractor={(item) => item.value}
        horizontal
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width / 3,
          offset: (width / 3) * index,
          index,
        })}
        snapToInterval={width / 3}
        decelerationRate="fast"
        initialScrollIndex={scrollIndex}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (width / 3));
          if (index < scrollIndex) {
            scrollToIndex(index + 2);
          } else {
            scrollToIndex(index);
          }
        }}
        style={{ flexGrow: 0 }}
      />

      <View
        style={tw`absolute left-0 right-0 top-0 bottom-0 items-center justify-center`}
      >
        <TouchableOpacity
          onPress={() => scrollToIndex(scrollIndex - 1)}
          disabled={scrollIndex === 0}
          style={tw`absolute left-30 z-10`}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={scrollIndex === 0 ? "#aaa" : colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => scrollToIndex(scrollIndex + 1)}
          disabled={scrollIndex === months.length - 1}
          style={tw`absolute right-30 z-10`}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={scrollIndex === months.length - 1 ? "#aaa" : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
