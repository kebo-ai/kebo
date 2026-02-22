import React, { useCallback } from "react";
import { View, Modal, TouchableWithoutFeedback } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { format } from "date-fns";
import tw from "@/hooks/useTailwind";
import i18n from "@/i18n/i18n";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui";

interface CalendarPickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
  isVisible: boolean;
  onClose: () => void;
  title?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateChange,
  isVisible,
  onClose,
  title,
}) => {
  const { theme } = useTheme();
  const currentDate = selectedDate ?? new Date();

  const markedDates: Record<string, any> = {
    [format(currentDate, "yyyy-MM-dd")]: {
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: "#ffffff",
    },
  };

  const handleDayPress = useCallback((day: DateData) => {
    onDateChange(new Date(day.dateString + "T00:00:00"));
    onClose();
  }, [onDateChange, onClose]);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end items-center bg-black/50 px-4 pb-8`}>
          <TouchableWithoutFeedback>
            <View
              style={tw`bg-[${theme.surface}] rounded-2xl p-6 w-full max-w-sm`}
            >
              {title && (
                <Text
                  type="sm"
                  weight="medium"
                  color={theme.textSecondary}
                  style={tw`text-center mb-3`}
                >
                  {title}
                </Text>
              )}
              <Calendar
                key={theme.surface}
                current={format(currentDate, "yyyy-MM-dd")}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                style={{ height: 350 }}
                theme={{
                  backgroundColor: theme.surface,
                  calendarBackground: theme.surface,
                  textSectionTitleColor: theme.textPrimary,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: colors.primary,
                  dayTextColor: theme.textPrimary,
                  textDisabledColor: theme.textTertiary,
                  dotColor: colors.primary,
                  selectedDotColor: "#ffffff",
                  arrowColor: colors.primary,
                  monthTextColor: colors.primary,
                  indicatorColor: colors.primary,
                  textDayFontFamily: "SFUIDisplayRegular",
                  textMonthFontFamily: "SFUIDisplayMedium",
                  textDayHeaderFontFamily: "SFUIDisplayRegular",
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
                locale={i18n.language}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
