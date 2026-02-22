import React, { FC, useState, useEffect, useCallback } from "react";
import logger from "@/utils/logger";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { observer } from "mobx-react-lite";
import { translate } from "@/i18n";
import { Stack, useRouter } from "expo-router";
import moment from "moment";
import IncomeExpenseBarChart from "@/components/common/CustomBarIncome";
import { ArrowDownSimpleIcon } from "@/components/icons/arrow-down-simple-icon";
import CustomModal from "@/components/common/CustomModal";
import {
  ChartService,
  IncomeExpenseReportResponse,
} from "@/services/chart-service";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { CategoriesList } from "@/components/common/CategoriesList";
import * as Haptics from "expo-haptics";
import CustomAlert from "@/components/common/CustomAlert";
import { deleteCategoryService } from "@/services/category-service";
import { showToast } from "@/components/ui/custom-toast";
import { useStores } from "@/models/helpers/use-stores";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import { load, save } from "@/utils/storage";
import { REPORTS_INCOME_PERIOD } from "@/utils/storage/storage-keys";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";

interface ReportsIncomeScreenProps {}

type PeriodType = {
  translate: string;
  value: string;
};

interface Transaction {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  amount: number;
  color: string;
  percentage: number;
  transaction_count?: number;
}

interface PeriodData {
  granularity: string;
  period: string;
  period_label: string;
  prev_period: string;
  next_period: string;
  period_start: string;
  period_end: string;
  transaction_count?: number;
}

const periodOptions: PeriodType[] = [
  { translate: "reportsIncomeScreen:year", value: "year" },
  { translate: "reportsIncomeScreen:month", value: "month" },
  { translate: "reportsIncomeScreen:week", value: "week" },
];

const years = Array.from({ length: 12 }, (_, i) =>
  moment().subtract(i, "years").format("YYYY")
).reverse();

export const ReportsIncomeScreen: FC<ReportsIncomeScreenProps> = observer(
  function ReportsIncomeScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { categoryStoreModel } = useStores();
    const [period, setPeriod] = useState<PeriodType>(periodOptions[1]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedYearIndex, setSelectedYearIndex] = useState(
      years.length - 1
    );
    const [currentDate, setCurrentDate] = useState(moment());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] =
      useState<IncomeExpenseReportResponse | null>(null);
    const { formatAmount } = useCurrencyFormatter();
    const [renderHiddenItem, setRenderHiddenItem] = useState<any>(null);
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
      null
    );
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

    // Create a navigation-compatible object for CategoriesList
    const navigation = {
      navigate: (route: string, navParams?: any) => {
        if (route === "Transactions") {
          router.push({
            pathname: "/(authenticated)/transactions",
            params: navParams,
          });
        } else {
          router.push(route as any);
        }
      },
      goBack: () => router.back(),
    };

    const hideTooltip = () => {
      setTooltipVisible(false);
    };

    const getCurrentPeriod = useCallback(() => {
      switch (period.value) {
        case "year":
          return years[selectedYearIndex];
        case "month":
          return currentDate.format("YYYY-MM");
        case "week":
          const weekStart = currentDate.clone().startOf("week");
          return weekStart.format("YYYY-MM-DD");
        default:
          return years[selectedYearIndex];
      }
    }, [period.value, selectedYearIndex, currentDate]);

    const getPeriodData = useCallback(
      (selectedPeriod: PeriodType): PeriodData => {
        const currentPeriod = getCurrentPeriod();
        const date = moment(currentPeriod);

        switch (selectedPeriod.value) {
          case "year":
            return {
              granularity: "year",
              period: currentPeriod,
              period_label: currentPeriod,
              prev_period: date.clone().subtract(1, "year").format("YYYY"),
              next_period: date.clone().add(1, "year").format("YYYY"),
              period_start: date.startOf("year").format("YYYY-MM-DD"),
              period_end: date.endOf("year").format("YYYY-MM-DD"),
            };
          case "month":
            return {
              granularity: "month",
              period: currentPeriod,
              period_label: currentPeriod,
              prev_period: date.clone().subtract(1, "month").format("YYYY-MM"),
              next_period: date.clone().add(1, "month").format("YYYY-MM"),
              period_start: date.startOf("month").format("YYYY-MM-DD"),
              period_end: date.endOf("month").format("YYYY-MM-DD"),
            };
          case "week":
            const weekStart = date.clone().startOf("week");
            const weekEnd = date.clone().endOf("week");
            return {
              granularity: "week",
              period: weekStart.format("YYYY-MM-DD"),
              period_label: `${weekStart.format("DD MMM")} - ${weekEnd.format("DD MMM")}`,
              prev_period: weekStart.clone().subtract(1, "week").format("YYYY-MM-DD"),
              next_period: weekStart.clone().add(1, "week").format("YYYY-MM-DD"),
              period_start: weekStart.format("YYYY-MM-DD"),
              period_end: weekEnd.format("YYYY-MM-DD"),
            };
          default:
            return {
              granularity: "year",
              period: currentPeriod,
              period_label: currentPeriod,
              prev_period: date.clone().subtract(1, "year").format("YYYY"),
              next_period: date.clone().add(1, "year").format("YYYY"),
              period_start: date.startOf("year").format("YYYY-MM-DD"),
              period_end: date.endOf("year").format("YYYY-MM-DD"),
            };
        }
      },
      [getCurrentPeriod]
    );

    const fetchReport = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const periodData = getPeriodData(period);
        if (!periodData) {
          throw new Error("Could not retrieve period data");
        }
        const data = await ChartService.getIncomeExpenseReport(
          periodData.period_start,
          periodData.granularity
        );

        if (data?.time_series) {
          const periods = data.time_series
            .filter((item) => item.income > 0 || item.expense > 0)
            .map((item) => item.period);
          setAvailablePeriods(periods);
        }

        setReportData(data ?? null);
      } catch (e: any) {
        logger.error("Error en fetchReport:", e);
        setError(e.message || "Error al cargar el reporte");
      } finally {
        setLoading(false);
      }
    }, [period, getPeriodData]);

    useEffect(() => {
      fetchReport();
    }, [fetchReport, currentDate, selectedYearIndex]);

    // Load saved period when component mounts
    useEffect(() => {
      const loadSavedPeriod = async () => {
        try {
          const savedPeriod = await load(REPORTS_INCOME_PERIOD);
          if (savedPeriod) {
            const selectedPeriod = periodOptions.find(
              (option) => option.value === savedPeriod
            );
            if (selectedPeriod) {
              setPeriod(selectedPeriod);
            }
          }
        } catch (error) {
          logger.error("Error loading saved period:", error);
        }
      };
      loadSavedPeriod();
    }, []);

    const handleSelectPeriod = async (value: string) => {
      const selectedPeriod = periodOptions.find(
        (option) => option.value === value
      );
      if (period === selectedPeriod) {
        setModalVisible(false);
        return;
      }
      hideTooltip();
      setPeriod(selectedPeriod ?? periodOptions[0]);
      setCurrentDate(moment());
      setModalVisible(false);

      // Save the selected period
      try {
        await save(REPORTS_INCOME_PERIOD, value);
      } catch (error) {
        logger.error("Error saving period:", error);
      }
    };

    const handlePrevPeriod = () => {
      if (!reportData) return;
      hideTooltip();

      if (period.value === "year") {
        if (selectedYearIndex > 0) {
          setSelectedYearIndex(selectedYearIndex - 1);
        }
      } else if (period.value === "month") {
        const newDate = currentDate.clone().subtract(1, "month");
        if (newDate.isValid()) {
          setCurrentDate(newDate);
        }
      } else if (period.value === "week") {
        const newDate = currentDate.clone().subtract(7, "days");
        if (newDate.isValid()) {
          setCurrentDate(newDate);
        }
      }
    };

    const handleNextPeriod = () => {
      if (!reportData) return;
      hideTooltip();

      if (period.value === "year") {
        if (selectedYearIndex < years.length - 1) {
          setSelectedYearIndex(selectedYearIndex + 1);
        }
      } else if (period.value === "month") {
        const newDate = currentDate.clone().add(1, "month");
        if (newDate.isValid()) {
          setCurrentDate(newDate);
        }
      } else if (period.value === "week") {
        const newDate = currentDate.clone().add(7, "days");
        if (newDate.isValid()) {
          setCurrentDate(newDate);
        }
      }
    };

    const chartData = (reportData?.time_series ?? []).map((item) => ({
      label: item.period_label,
      income: item.income,
      expense: item.expense,
      onPrev: handlePrevPeriod,
      onNext: handleNextPeriod,
      periodLabel: item.period_label,
      onPressExpenses: () => {},
      onPressIncome: () => {},
    }));
    const totalIncome = reportData?.summary?.total_income ?? 0;
    const totalExpense = reportData?.summary?.total_expenses ?? 0;
    const balance = reportData?.summary?.total_balance ?? 0;
    const periodLabel = reportData?.period_label ?? "";

    const handleDelete = useCallback((categoryId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setCategoryToDelete(categoryId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!categoryToDelete) return;

      try {
        const result = await deleteCategoryService(categoryToDelete);
        if (result.kind === "ok") {
          showToast(
            "success",
            translate("components:categoryModal.deleteCategorySuccess")
          );
          await categoryStoreModel.getCategories();
          await fetchReport();
        } else {
          showToast(
            "error",
            translate("components:categoryModal.errorCategory")
          );
        }
      } catch (error) {
        logger.error("Error deleting category:", error);
        showToast("error", translate("components:categoryModal.errorCategory"));
      } finally {
        setIsDeleteAlertVisible(false);
        setCategoryToDelete(null);
      }
    }, [categoryToDelete, categoryStoreModel, fetchReport]);

    const handleCloseDeleteAlert = () => {
      setIsDeleteAlertVisible(false);
    };

    const renderTransactionItemWrapper = useCallback(
      (item: Transaction) => {
        const itemWithType = {
          ...item,
          transaction_type: reportData?.categories?.income?.some(
            (i) => i.id === item.id
          )
            ? "Income"
            : "Expense",
        };
        return (
          <CategoriesList
            data={[itemWithType]}
            formatAmount={formatAmount}
            navigation={navigation}
            onDeleteItem={handleDelete}
            transaction_count={item.transaction_count}
          />
        );
      },
      [formatAmount, navigation, reportData]
    );

    const renderTransactions = useCallback(() => {
      const incomeTransactions = reportData?.categories?.income || [];
      const expenseTransactions = reportData?.categories?.expenses || [];
      const allTransactions = [
        ...incomeTransactions,
        ...expenseTransactions,
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return (
        <View
          style={[
            tw`${Platform.OS === "android" ? "px-6" : "px-4"}`,
            { backgroundColor: theme.background },
          ]}
        >
          {allTransactions.length === 0 ? (
            <View
              style={[
                tw`py-6 rounded-[18px] items-center justify-center`,
                { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <KeboSadIconSvg width={60} height={60} />
              <Text style={[tw`text-center`, { color: theme.textSecondary }]}>
                {translate("homeScreen:noTransactions")}
              </Text>
            </View>
          ) : (
            <View
              style={[
                tw`rounded-[18px] overflow-hidden`,
                { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              {allTransactions.map((item) => (
                <View key={item.id}>
                  <CategoriesList
                    data={[item]}
                    navigation={navigation}
                    selectedMonth={
                      period.value === "month"
                        ? currentDate.format("YYYY-MM")
                        : undefined
                    }
                    onDeleteItem={handleDelete}
                    transaction_count={item.transaction_count}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }, [
      renderTransactionItemWrapper,
      reportData,
      currentDate,
      navigation,
      handleDelete,
      theme,
    ]);

    return (
      <TouchableWithoutFeedback onPress={hideTooltip}>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          {tooltipVisible && (
            <TouchableWithoutFeedback onPress={hideTooltip}>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                }}
                pointerEvents="auto"
              />
            </TouchableWithoutFeedback>
          )}
          <Stack.Screen
            options={{
              ...standardHeader(theme),
              headerShown: true,
              title: translate("reportsIncomeScreen:reportsIncome"),
              headerBackTitle: translate("navigator:reports"),
            }}
          />
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              Platform.OS === "android" ? { paddingBottom: 70 } : undefined
            }
          >
            <View style={tw`px-6 pt-3`}>
              <Text style={[tw`text-md font-light`, { color: theme.textPrimary }]}>
                {periodLabel}
              </Text>
              <View style={tw`flex-row items-center justify-between mb-2`}>
                <Text
                  style={[tw`text-3xl font-medium`, { color: theme.textPrimary }]}
                >{`${formatAmount(balance)}`}</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                    style={[
                      tw`flex-row items-center rounded-2xl px-3 py-2`,
                      { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
                    ]}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={[tw`text-xs font-medium mr-2`, { color: theme.textPrimary }]}>
                      {translate(
                        `reportsIncomeScreen:${period.value}` as any
                      )}
                    </Text>
                    <ArrowDownSimpleIcon />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableWithoutFeedback onPress={hideTooltip}>
              <View style={tw`mt-1`}>
                <IncomeExpenseBarChart
                  data={chartData}
                  width={360}
                  hideTooltip={hideTooltip}
                  periodType={period.value as "year" | "month" | "week"}
                  onPrev={handlePrevPeriod}
                  onNext={handleNextPeriod}
                  disablePrev={selectedYearIndex === 0}
                  disableNext={selectedYearIndex === years.length + 1}
                  onPressExpenses={() => {}}
                  onPressIncome={() => {}}
                  income={totalIncome}
                  expenses={totalExpense}
                />
              </View>
            </TouchableWithoutFeedback>
            <View style={tw`pt-6`}>{renderTransactions()}</View>
          </ScrollView>
          <CustomModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSelect={handleSelectPeriod}
            selectedValue={period.value}
            data={[
              {
                label: translate("reportsIncomeScreen:year"),
                value: "year",
              },
              {
                label: translate("reportsIncomeScreen:month"),
                value: "month",
              },
              {
                label: translate("reportsIncomeScreen:week"),
                value: "week",
              },
            ]}
            title={translate("reportsIncomeScreen:selectPeriod")}
          />
          <CustomAlert
            visible={isDeleteAlertVisible}
            title={translate("homeScreen:titleAlert")}
            message={translate("components:categoryModal.deleteMessage")}
            onConfirm={handleConfirmDelete}
            onCancel={handleCloseDeleteAlert}
            type="danger"
            confirmText={translate("homeScreen:delete")}
            cancelText={translate("homeScreen:cancel")}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
);
