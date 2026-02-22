import logger from "@/utils/logger";
import React, { FC, useState, useEffect, useCallback, memo } from "react";
import {
  Platform,
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import { observer } from "mobx-react-lite";
import { translate } from "@/i18n";
import { Stack, useRouter } from "expo-router";
import moment from "moment";
import { CustomReportDay } from "@/components/common/CustomReportDay";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { CustomBarCategory } from "@/components/common/CustomBarCategory";
import * as Haptics from "expo-haptics";
import CustomAlert from "@/components/common/CustomAlert";
import { ChartService } from "@/services/chart-service";
import { deleteCategoryService } from "@/services/category-service";
import { showToast } from "@/components/ui/custom-toast";
import { CategoriesList } from "@/components/common/CategoriesList";
import { KeboSadIconSvg } from "@/components/icons/KeboSadIconSvg";
import { useTheme } from "@/hooks/use-theme";

interface ReportsCategoryScreenProps {}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  amount: number;
  color: string;
  percentage: number;
  transaction_count: number;
}

export const ReportsCategoryScreen: FC<ReportsCategoryScreenProps> = observer(
  function ReportsCategoryScreen() {
    const router = useRouter();
    const { isDark, theme } = useTheme();
    const screenWidth = Dimensions.get("window").width - 32;
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const selectedMonth = availableMonths[selectedMonthIndex] || "";
    const { formatAmount } = useCurrencyFormatter();
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
      null
    );
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [renderHiddenItem, setRenderHiddenItem] = useState<any>(null);
    const [total, setTotal] = useState(0);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipData, setTooltipData] = useState<CategoryData | null>(null);
    const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
    const [tooltipX, setTooltipX] = useState<number>(0);

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

    const fetchAvailableMonths = useCallback(() => {
      const months = Array.from({ length: 12 }, (_, i) =>
        moment().subtract(i, "months").format("YYYY-MM")
      ).reverse();
      setAvailableMonths(months);
      setSelectedMonthIndex(months.length - 1);
    }, []);

    useEffect(() => {
      fetchAvailableMonths();
    }, [fetchAvailableMonths]);

    const fetchChartData = useCallback(async () => {
      if (!selectedMonth) return;

      try {
        setIsLoading(true);
        const periodDate = moment(selectedMonth).toDate();
        const response = await ChartService.getExpenseReportByCategory(
          periodDate
        );

        setTotal(response.total);

        const formattedData = response.data_categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          emoji: cat.icon,
          amount: cat.amount,
          color: cat.bar_color,
          percentage: cat.percentage * 100,
          transaction_count: cat.transaction_count,
        }));

        setCategoryData(formattedData);
        setCategories(formattedData);
      } catch (error) {
        logger.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }, [selectedMonth]);

    useEffect(() => {
      fetchChartData();
    }, [fetchChartData]);

    const handlePrevMonth = () => {
      if (selectedMonthIndex > 0) {
        setSelectedMonthIndex(selectedMonthIndex - 1);
      }
    };

    const handleNextMonth = () => {
      if (selectedMonthIndex < availableMonths.length - 1) {
        setSelectedMonthIndex(selectedMonthIndex + 1);
      }
    };

    const handleDelete = useCallback((categoryId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setCategoryToDelete(categoryId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (categoryToDelete) {
        try {
          const result = await deleteCategoryService(categoryToDelete);
          if (result.kind === "ok") {
            showToast(
              "success",
              translate("components:categoryModal.deleteCategorySuccess")
            );
            await fetchChartData();
          } else {
            showToast(
              "error",
              translate("components:categoryModal.errorCategory")
            );
          }
        } catch (error) {
          logger.error("Error deleting category:", error);
          showToast(
            "error",
            translate("components:categoryModal.errorCategory")
          );
        }
      }
      setIsDeleteAlertVisible(false);
      setCategoryToDelete(null);
    }, [categoryToDelete, fetchChartData]);

    const renderTransactionItemWrapper = useCallback(
      (item: CategoryData) => {
        const itemWithType = { ...item, transaction_type: "Expense" };
        return (
          <CategoriesList
            data={[itemWithType]}
            navigation={navigation}
            selectedMonth={selectedMonth}
            onDeleteItem={handleDelete}
            formatAmount={formatAmount}
            percentage={item.percentage}
            color={item.color}
            bar_color={item.color}
            icon={item.icon}
            transaction_count={item.transaction_count}
          />
        );
      },
      [navigation, formatAmount, selectedMonth]
    );

    const onRowClose = useCallback(() => setOpenRow(null), []);

    const renderCategoryContent = useCallback(
      () => (
        <View style={[tw`px-4`, { backgroundColor: theme.background }]}>
          {categories.length === 0 ? (
            <View
              style={[
                tw`py-6 rounded-[18px]`,
                {
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <Text style={[tw`text-center`, { color: theme.textSecondary }]}>
                {translate("homeScreen:noTransactions")}
              </Text>
            </View>
          ) : (
            <View
              style={[
                tw`rounded-[18px] overflow-hidden`,
                {
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              {categories.map((item) => (
                <View key={item.id}>
                  {renderTransactionItemWrapper(item)}
                </View>
              ))}
            </View>
          )}
        </View>
      ),
      [
        categories,
        renderTransactionItemWrapper,
        theme,
      ]
    );

    const handleCloseDeleteAlert = useCallback(() => {
      setIsDeleteAlertVisible(false);
      setCategoryToDelete(null);
    }, []);

    const showTooltip = (item: CategoryData, idx: number, x: number) => {
      setTooltipData(item);
      setActiveBarIndex(idx);
      setTooltipX(x);
      setTooltipVisible(true);
    };
    const hideTooltip = () => {
      setTooltipVisible(false);
      setTooltipData(null);
      setActiveBarIndex(null);
    };

    return (
      <TouchableWithoutFeedback onPress={hideTooltip}>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
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
              title: translate("reportsCategoryScreen:reportsCategoryTitle"),
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
            <CustomReportDay
              month={selectedMonth}
              total={total}
              porcentaje={total && total !== 0 ? 100 : 0}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              disablePrev={selectedMonthIndex === 0}
              disableNext={selectedMonthIndex === availableMonths.length - 1}
            />
            {isLoading ? (
              <View style={tw`items-center justify-center py-10`}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : categoryData.length === 0 ? (
              <View style={tw`items-center justify-center py-10`}>
                <KeboSadIconSvg width={60} height={60} />
                <Text style={[tw`text-center`, { color: theme.textSecondary }]}>
                  {translate("homeScreen:noTransactions")}
                </Text>
              </View>
            ) : (
              <>
                <CustomBarCategory
                  data={categoryData}
                  width={screenWidth}
                  tooltipVisible={tooltipVisible}
                  tooltipData={tooltipData}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  activeBarIndex={activeBarIndex}
                  setActiveBarIndex={setActiveBarIndex}
                  tooltipX={tooltipX}
                  setTooltipX={setTooltipX}
                />
                <View style={tw`pt-6`}>
                  {renderCategoryContent()}
                </View>
                <CustomAlert
                  visible={isDeleteAlertVisible}
                  title={translate("homeScreen:titleAlert")}
                  message={translate(
                    "components:categoryModal.deleteCategory"
                  )}
                  onConfirm={handleConfirmDelete}
                  onCancel={handleCloseDeleteAlert}
                  type="danger"
                  confirmText={translate("homeScreen:delete")}
                  cancelText={translate("homeScreen:cancel")}
                />
              </>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);
