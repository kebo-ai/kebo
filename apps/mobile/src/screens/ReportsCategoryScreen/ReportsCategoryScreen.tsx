import logger from "../utils/logger";
import React, { FC, useState, useEffect, useCallback, memo } from "react";
import {
  Platform,
  KeyboardAvoidingView,
  View,
  Dimensions,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { Screen } from "../../components";
import { observer } from "mobx-react-lite";
import { translate } from "../../i18n";
import { AppStackScreenProps } from "../../navigators";
import moment from "moment";
import { CustomReportDay } from "../../components/custom/CustomReportDay";
import { useCurrencyFormatter } from "../../components/custom/CurrencyFormatter";
import { CustomBarCategory } from "../../components/custom/CustomBarCategory";
import * as Haptics from "expo-haptics";
import CustomAlert from "../../components/custom/CustomAlert";
import { ChartService } from "../../services/ChartService";
import { deleteCategoryService } from "../../services/CategoryService";
import { showToast } from "../../components/ui/CustomToast";
import { CategoriesList } from "../../components/custom/CategoriesList";
import CustomHeaderSecondary from "../../components/custom/CustomHeaderSecondary";
import { KeboSadIconSvg } from "../../components/svg/KeboSadIconSvg";

interface ReportsCategoryScreenProps
  extends AppStackScreenProps<"ReportsCategoryScreen"> {}

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
  function ReportsCategoryScreen({ navigation, route }) {
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
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

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
        const initialCategories = formattedData.slice(0, ITEMS_PER_PAGE);
        setCategories(initialCategories);
        setPage(1);
        setHasMore(formattedData.length > ITEMS_PER_PAGE);
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

    const keyExtractorCategory = useCallback(() => "category-content", []);

    const keyExtractorSwipe = useCallback((item: CategoryData) => item.id, []);

    const onRowClose = useCallback(() => setOpenRow(null), []);

    const loadMoreCategories = useCallback(() => {
      if (isLoadingMore || !hasMore) return;

      setIsLoadingMore(true);
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newCategories = categoryData.slice(0, endIndex);

      setCategories(newCategories);
      setPage(nextPage);
      setHasMore(categoryData.length > endIndex);
      setIsLoadingMore(false);
    }, [isLoadingMore, hasMore, page, categoryData, ITEMS_PER_PAGE]);

    const renderFooter = useCallback(() => {
      if (!isLoadingMore) return null;

      return (
        <View style={tw`py-4 items-center justify-center`}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={tw`mt-2 text-sm text-[#606A84]`}>
            {translate("transactionScreen:chargingMoreTransaction")}
          </Text>
        </View>
      );
    }, [isLoadingMore]);

    const renderCategoryContent = useCallback(
      () => (
        <View style={tw`px-4 bg-[#FAFAFA]`}>
          {categories.length === 0 ? (
            <View
              style={tw`border border-[#EBEBEF] bg-white py-6 rounded-[18px]`}
            >
              <Text style={tw`text-[#606A84] text-center`}>
                {translate("homeScreen:noTransactions")}
              </Text>
            </View>
          ) : (
            <View
              style={tw`border border-[#EBEBEF] bg-white rounded-[18px] overflow-hidden`}
            >
              <FlatList
                data={categories}
                renderItem={({ item }) => renderTransactionItemWrapper(item)}
                keyExtractor={keyExtractorSwipe}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMoreCategories}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                onMomentumScrollEnd={() => {
                  if (!isLoadingMore && hasMore) {
                    loadMoreCategories();
                  }
                }}
              />
            </View>
          )}
        </View>
      ),
      [
        categories,
        renderTransactionItemWrapper,
        keyExtractorSwipe,
        loadMoreCategories,
        isLoadingMore,
        hasMore,
        renderFooter,
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
        <View style={{ flex: 1 }}>
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw`flex-1`}
          >
            <Screen
              safeAreaEdges={["top"]}
              preset="scroll"
              backgroundColor="#FAFAFA"
              statusBarBackgroundColor="#FAFAFA"
              header={
                <CustomHeaderSecondary
                  onPress={() => navigation.goBack()}
                  title={translate(
                    "reportsCategoryScreen:reportsCategoryTitle"
                  )}
                />
              }
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
                  <Text style={tw`text-[#606A84] text-center`}>
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
                    <FlatList
                      data={[1]}
                      renderItem={renderCategoryContent}
                      keyExtractor={keyExtractorCategory}
                      showsVerticalScrollIndicator={false}
                    />
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
            </Screen>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);
