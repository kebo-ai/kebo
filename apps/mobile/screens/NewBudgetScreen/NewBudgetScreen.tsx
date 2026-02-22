import logger from "@/utils/logger";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, Button } from "@/components/ui";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import { useTheme } from "@/hooks/use-theme";
import { translate } from "@/i18n";
import { TxKeyPath } from "@/i18n";
import tw from "@/hooks/use-tailwind";
import CustomInput from "@/components/common/CustomInput";
import { useFormik } from "formik";
import moment from "moment";
import "moment/locale/es";
import i18n from "@/i18n/i18n";

const ensureValidMomentLocale = () => {
  const lang = i18n.language || "en";
  const currentLocale = lang.split("-")[0];
  if (!moment.localeData(currentLocale)) {
    moment.locale("en");
  } else {
    moment.locale(currentLocale);
  }
};

import { budgetService } from "@/services/budget-service";
import { showToast } from "@/components/ui/CustomToast";
import { CalendarRangePicker } from "@/components/common/CalendarRangePicker";
import { ArrowDownSimpleIcon } from "@/components/icons/ArrowDownSimpleIcon";

interface NewBudgetScreenProps {}

export const NewBudgetScreen: React.FC<NewBudgetScreenProps> = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{
    isEditing?: string;
    budgetId?: string;
    budgetData?: string;
  }>();

  useEffect(() => {
    ensureValidMomentLocale();
  }, []);

  const isEditing = params.isEditing === "true";
  const budgetId = params.budgetId;

  const [budgetData] = useState(() => {
    try {
      return params.budgetData ? JSON.parse(params.budgetData) : undefined;
    } catch {
      return undefined;
    }
  });

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const [now] = useState(() => new Date());
  const [defaultEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const monthIndex = now.getMonth();
  const currentMonthKey = monthNames[monthIndex];
  const translatedMonth = translate(`months:${currentMonthKey}` as TxKeyPath);
  const [isCalendarRangeVisible, setCalendarRangeVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (values: { name: string; startDate: Date; endDate: Date }) => {
      try {
        setIsLoading(true);
        ensureValidMomentLocale();
        const startDateStr = moment(values.startDate).format("YYYY-MM-DD");
        const endDateStr = moment(values.endDate).format("YYYY-MM-DD");

        if (isEditing && budgetId) {
          const success = await budgetService.updateBudget(
            budgetId,
            values.name,
            startDateStr,
            endDateStr
          );

          if (success) {
            showToast("success", translate("newBudgetScreen:successMessage"));
            router.back();
          } else {
            showToast("error", translate("newBudgetScreen:errorMessage"));
          }
        } else {
          const result = await budgetService.createBudget(
            values.name,
            startDateStr,
            endDateStr
          );

          if (result?.id) {
            router.replace({
              pathname: "/(authenticated)/budget/[budgetId]",
              params: { budgetId: result.id },
            });
          } else {
            showToast("error", translate("newBudgetScreen:errorMessage"));
          }
        }
      } catch (error) {
        logger.error("Error handling budget:", error);
        showToast("error", translate("newBudgetScreen:errorMessage"));
      } finally {
        setIsLoading(false);
      }
    },
    [router, isEditing, budgetId]
  );

  const formik = useFormik({
    initialValues: {
      name: `${translate("newBudgetScreen:budget")} ${translatedMonth}`,
      startDate: now,
      endDate: defaultEndDate,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (isEditing && budgetData) {
      formik.setValues({
        name: `${translate("newBudgetScreen:budget")} ${translatedMonth}`,
        startDate: new Date(budgetData.start_date),
        endDate: new Date(budgetData.end_date),
      });
    }
  }, [isEditing, budgetData]);

  const isFormValidForSubmission = useMemo(() => {
    return Boolean(
      formik.values.name?.trim() &&
        formik.values.startDate &&
        formik.values.endDate &&
        !isLoading
    );
  }, [formik.values, isLoading]);

  const handleCalendarRangeChange = (startDate: Date, endDate: Date) => {
    formik.setFieldValue("startDate", startDate);
    formik.setFieldValue("endDate", endDate);
    setCalendarRangeVisible(false);
  };

  const formatDate = (date: Date) => {
    const lang = i18n.language || "es";
    return moment(date).locale(lang.split("-")[0]).format("DD/MM/YYYY");
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...standardHeader(theme),
          headerShown: true,
          title: isEditing
            ? translate("newBudgetScreen:editBudget")
            : translate("newBudgetScreen:createBudget"),
          headerBackTitle: translate("budgetScreen:budget"),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={tw`flex-1`}
          contentContainerStyle={tw`px-6 pb-6`}
        >
          <Text type="sm" weight="light" color={theme.textSecondary} style={tw`pt-2 pb-4`}>
            {translate("newBudgetScreen:description")}
          </Text>

          <View>
            <CustomInput
              label={translate("newBudgetScreen:labelName")}
              placeholder={translate("newBudgetScreen:labelName")}
              value={formik.values.name}
              onChangeText={formik.handleChange("name")}
            />
          </View>

          <View>
            <Text type="sm" weight="light" color={theme.textTertiary} style={tw`mb-1`}>
              {translate("newBudgetScreen:labelTime")}
            </Text>

            <TouchableOpacity
              onPress={() => setCalendarRangeVisible(true)}
              style={tw`mb-3`}
            >
              <View
                style={tw`flex-row items-center justify-between border border-[${theme.border}] bg-[${theme.surface}] rounded-xl px-4 h-15`}
              >
                <Text color={theme.textPrimary}>
                  {formatDate(formik.values.startDate)} -{" "}
                  {formatDate(formik.values.endDate)}
                </Text>

                <ArrowDownSimpleIcon
                  width={12}
                  height={8}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={tw`px-6 pb-4 pt-2`}>
          <Button
            title={
              isEditing
                ? translate("newBudgetScreen:updateBudget")
                : translate("newBudgetScreen:createBudget")
            }
            onPress={() => formik.handleSubmit()}
            disabled={!isFormValidForSubmission}
            loading={isLoading}
            size="md"
            radius="lg"
            haptic
          />
        </View>
        <CalendarRangePicker
          startDate={formik.values.startDate}
          endDate={formik.values.endDate}
          isVisible={isCalendarRangeVisible}
          onDateRangeChange={handleCalendarRangeChange}
          onClose={() => setCalendarRangeVisible(false)}
        />
      </KeyboardAvoidingView>
    </>
  );
};
