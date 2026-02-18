import React, { useState, useCallback } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import tw from "@/hooks/useTailwind";
import { translate } from "@/i18n";
import i18n from "@/i18n/i18n";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";

interface CalendarRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const CalendarRangePicker: React.FC<CalendarRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  isVisible,
  onClose,
}) => {
  const { theme } = useTheme();
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const locale = i18n.language.startsWith("es") ? es : enUS;

  const formatDateForCalendar = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const generateMarkedDates = () => {
    const marked: any = {};

    if (selectedStartDate) {
      marked[formatDateForCalendar(selectedStartDate)] = {
        startingDay: true,
        color: colors.primary,
        textColor: "white",
      };
    }

    if (selectedEndDate) {
      marked[formatDateForCalendar(selectedEndDate)] = {
        endingDay: true,
        color: colors.primary,
        textColor: "white",
      };

      let currentDate = addDays(selectedStartDate!, 1);
      while (isBefore(currentDate, selectedEndDate)) {
        marked[formatDateForCalendar(currentDate)] = {
          color: colors.primary,
          textColor: "white",
        };
        currentDate = addDays(currentDate, 1);
      }
    }

    return marked;
  };

  const handleDayPress = useCallback(
    (day: DateData) => {
      const pressedDate = new Date(day.dateString + "T00:00:00");

      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        setSelectedStartDate(pressedDate);
        setSelectedEndDate(null);
        setIsSelectingEnd(true);
      } else if (isSelectingEnd) {
        if (isAfter(pressedDate, selectedStartDate)) {
          setSelectedEndDate(pressedDate);
          setIsSelectingEnd(false);
        } else {
          setSelectedEndDate(selectedStartDate);
          setSelectedStartDate(pressedDate);
          setIsSelectingEnd(false);
        }
      }
    },
    [selectedStartDate, selectedEndDate, isSelectingEnd]
  );

  const handleConfirm = () => {
    if (selectedStartDate && selectedEndDate) {
      onDateRangeChange(selectedStartDate, selectedEndDate);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingEnd(false);
    onClose();
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-center items-center bg-black/50 px-4`}>
          <View style={tw`bg-[${theme.surface}] rounded-2xl p-6 w-full max-w-sm`}>
            <Calendar
              key={theme.surface}
              onDayPress={handleDayPress}
              markedDates={generateMarkedDates()}
              markingType="period"
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

            <View style={tw`flex-row mt-6 gap-3`}>
              <View style={tw`flex-1`}>
                <Button
                  title={translate("newBudgetScreen:cancel")}
                  onPress={handleCancel}
                  variant="outline"
                  size="md"
                  radius="lg"
                />
              </View>
              <View style={tw`flex-1`}>
                <Button
                  title={translate("newBudgetScreen:confirm")}
                  onPress={handleConfirm}
                  disabled={!(selectedStartDate && selectedEndDate)}
                  size="md"
                  radius="lg"
                  haptic
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
