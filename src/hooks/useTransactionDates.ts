import { useState } from 'react';
import moment from 'moment';
import { RecurrenceType, RecurrenceCadenceEnum, recurrenceDisplayMap } from '../types/transaction';
import i18n from '../i18n/i18n';
import logger from '../utils/logger';

export const useTransactionDates = (formik: any) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const currentLocale = i18n.language.startsWith("es") ? "es" : "en";

  const handleDateConfirm = (date: Date) => {
    const displayDate = moment(date)
      .locale(currentLocale)
      .format("dddd, D MMMM")
      .replace(/^\w/, (c) => c.toUpperCase());

    const selectedDateOnly = moment(date).format("YYYY-MM-DD");

    formik.setFieldValue("date", selectedDateOnly);
    formik.setFieldValue("displayDate", displayDate);
    setDatePickerVisibility(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    const displayDate = moment(date)
      .locale(currentLocale)
      .format("dddd, D MMMM")
      .replace(/^\w/, (c) => c.toUpperCase());

    const backendDate = moment(date).format("YYYY-MM-DD HH:mm:ss.SSS Z");

    formik.setFieldValue("recurrence_end_date", backendDate);
    formik.setFieldValue("displayEndDate", displayDate);
    setEndDatePickerVisibility(false);
  };

  const handleRecurrenceChange = (selected: string, translate: any) => {
    logger.debug("Selected recurrence:", selected);
    const backendValue = Object.entries(recurrenceDisplayMap).find(
      ([_, display]) => display === selected
    )?.[0] as RecurrenceType;
    logger.debug("Backend value:", backendValue);
    formik.setFieldValue(
      "recurrence",
      selected || RecurrenceType.NEVER
    );
    formik.setFieldValue(
      "recurrence_cadence",
      selected || RecurrenceCadenceEnum.NEVER
    );

    if (selected && selected !== RecurrenceType.NEVER) {
      const oneYearFromNow = moment().add(1, 'year');
      const displayEndDate = oneYearFromNow
        .locale(currentLocale)
        .format("dddd, D MMMM YYYY")
        .replace(/^\w/, (c) => c.toUpperCase());
      const backendEndDate = oneYearFromNow.format("YYYY-MM-DD HH:mm:ss.SSS Z");

      formik.setFieldValue("recurrence_end_date", backendEndDate);
      formik.setFieldValue("displayEndDate", displayEndDate);
    }
  };

  return {
    isDatePickerVisible,
    setDatePickerVisibility,
    isEndDatePickerVisible,
    setEndDatePickerVisibility,
    handleDateConfirm,
    handleEndDateConfirm,
    handleRecurrenceChange,
  };
};
