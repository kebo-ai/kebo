import { observer } from "mobx-react-lite";
import logger from "@/utils/logger";
import React, { FC, useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";

// Transaction list entering — depth rise with subtle overshoot
const transactionEntering = new Keyframe({
  0: {
    opacity: 0,
    transform: [
      { perspective: 600 },
      { translateY: 25 },
      { scale: 0.88 },
      { rotateX: "-8deg" },
    ],
  },
  65: {
    opacity: 1,
    transform: [
      { perspective: 600 },
      { translateY: -2 },
      { scale: 1.02 },
      { rotateX: "0.5deg" },
    ],
    easing: Easing.out(Easing.cubic),
  },
  100: {
    opacity: 1,
    transform: [
      { perspective: 600 },
      { translateY: 0 },
      { scale: 1 },
      { rotateX: "0deg" },
    ],
    easing: Easing.out(Easing.ease),
  },
});
const TRANSACTION_ANIM_DURATION = 420;
const TRANSACTION_ANIM_COOLDOWN = 2000;
import { Text } from "@/components/ui";
import { Screen } from "@/components/screen";
import { useTransactions, useDeleteTransaction } from "@/lib/api/hooks";
import type { TransactionsResponse } from "@/lib/api/hooks/use-transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/keys";
import type { Transaction as ApiTransaction } from "@/lib/api/types";
import tw from "twrnc";
import moment from "moment";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/use-theme";
import { BackIconSvg } from "@/components/icons/back-svg";
import { ArrowUpIconSvg } from "@/components/icons/arrow-up-icon";
import { MaterialIcons } from "@expo/vector-icons";
import { translate } from "@/i18n";
import { SwipeableListWrapper } from "@/components/swipeable-list-wrapper/swipeable-list-wrapper";
import { RowMap } from "react-native-swipe-list-view";
import CustomFilterModal from "@/components/common/custom-filter-modal";
import CustomBankModal from "@/components/common/custom-bank-modal";
import { SwipeableItem } from "@/components/swipeable-list/swipeable-list";
import * as Haptics from "expo-haptics";
import { InteractionManager } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStores } from "@/models/helpers/use-stores";
import { useCategories } from "@/lib/api/hooks";
import { AccountIconSvg } from "@/components/icons/account-svg";
import { CalendarIconSvg } from "@/components/icons/calendar-svg";
import { MultiCategoryModal } from "@/components/common/multi-category-modal";
import FilterButton from "@/components/common/filter-button";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import i18n from "@/i18n/i18n";
import { TransactionList } from "@/components/common/transactions-list";
import { CustomMonthModal } from "@/components/common/custom-month-modal";
import { CustomTypeModal } from "@/components/common/custom-type-modal";

interface Transaction extends SwipeableItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  transaction_type: string;
  category_id?: string;
  category_icon_url?: string;
  bank_url?: string;
  account_id: string;
  category_name?: string;
  is_recurring: boolean;
  metadata?: {
    auto_generated?: boolean;
  };
}

interface GroupedTransaction {
  name: string;
  date: string;
  transactions: Transaction[];
}

interface TransactionsScreenProps {
  initialFilters?: {
    accountIds?: string[];
    months?: string[];
    categoryIds?: string[] | any;
    transactionType?: "Income" | "Expense";
    origin?: "Home" | "Accounts";
  };
}

type RouteParams = {
  origin?: string;
  accountIds?: string;
  months?: string;
  categoryIds?: string;
  transactionType?: "Income" | "Expense";
};

const parseArrayParam = (param?: string): string[] | undefined => {
  if (!param) return undefined;
  try {
    return JSON.parse(param);
  } catch {
    return param.split(",");
  }
};

function groupTransactionsByMonth(transactions: ApiTransaction[]): GroupedTransaction[] {
  const groups: Record<string, GroupedTransaction> = {};

  for (const tx of transactions) {
    const monthKey = moment(tx.date).format("YYYY-MM");
    const monthLabel = moment(tx.date)
      .format("MMMM YYYY")
      .replace(/^\w/, (c) => c.toUpperCase());

    if (!groups[monthKey]) {
      groups[monthKey] = {
        name: monthLabel,
        date: monthKey,
        transactions: [],
      };
    }
    groups[monthKey].transactions.push(tx as unknown as Transaction);
  }

  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
}

export const TransactionsScreen: FC<TransactionsScreenProps> = observer(
  function TransactionsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<RouteParams>();
    const queryClient = useQueryClient();
    const deleteTransactionMutation = useDeleteTransaction();

    const initialFilters = useMemo(() => ({
      accountIds: parseArrayParam(params.accountIds),
      months: parseArrayParam(params.months),
      categoryIds: parseArrayParam(params.categoryIds),
      transactionType: params.transactionType,
    }), [params.accountIds, params.months, params.categoryIds, params.transactionType]);
    const origin = (params.origin as "Home" | "Accounts") ?? "Home";
    const { theme, isDark } = useTheme();
    const [page, setPage] = useState(1);
    const [allTransactions, setAllTransactions] = useState<ApiTransaction[]>([]);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const animatedIdsRef = useRef(new Set<string>());
    const animCooldownRef = useRef(false);
    const ITEMS_PER_PAGE = 15;
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
    const [selectedBankNames, setSelectedBankNames] = useState<string[]>([]);
    const [showBankModal, setShowBankModal] = useState(false);
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [showMonthModal, setShowMonthModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<
      { id: string; name: string }[]
    >([]);
    const [selectedType, setSelectedType] = useState<
      "Ingreso" | "Gasto" | null
    >(null);
    const { data: categories = [] } = useCategories();
    const currentLocale = i18n.language.split("-")[0];
    const [refreshing, setRefreshing] = useState(false);
    const [tempSelectedBanks, setTempSelectedBanks] = useState<string[]>([]);
    const [tempSelectedBankNames, setTempSelectedBankNames] = useState<
      string[]
    >([]);
    const [tempSelectedMonths, setTempSelectedMonths] = useState<string[]>([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState<
      { id: string; name: string }[]
    >([]);

    const hasInitialFilters = !!(
      initialFilters?.accountIds?.length ||
      initialFilters?.months?.length ||
      initialFilters?.categoryIds?.length ||
      initialFilters?.transactionType
    );

    const monthsList = Array.from({ length: 9 }, (_, i) => {
      const date = moment().subtract(i, "months");
      return {
        label: date
          .locale(currentLocale)
          .format("MMMM")
          .replace(/^\w/, (c) => c.toUpperCase()),
        value: date.format("YYYY-MM"),
        year: date.format("YYYY"),
      };
    });

    const groupedMonths = monthsList.reduce((acc, month) => {
      if (!acc[month.year]) {
        acc[month.year] = [];
      }
      acc[month.year].push(month);
      return acc;
    }, {} as Record<string, typeof monthsList>);

    const sortedYears = Object.keys(groupedMonths).sort(
      (a, b) => Number(b) - Number(a)
    );

    sortedYears.forEach((year) => {
      groupedMonths[year].sort((a, b) => {
        const monthA = moment(a.value);
        const monthB = moment(b.value);
        return monthB.valueOf() - monthA.valueOf();
      });
    });

    // Compute date range from selected months
    const monthDateRange = useMemo(() => {
      if (selectedMonths.length === 0) return {};
      const sorted = [...selectedMonths].sort();
      const startDate = moment(sorted[0], "YYYY-MM").startOf("month").format("YYYY-MM-DD");
      const endDate = moment(sorted[sorted.length - 1], "YYYY-MM").endOf("month").format("YYYY-MM-DD");
      return { start_date: startDate, end_date: endDate };
    }, [selectedMonths]);

    // Build API filters from component state
    const apiFilters = useMemo(() => ({
      account_ids: selectedBanks.length > 0 ? selectedBanks : undefined,
      category_ids: selectedCategories.length > 0 ? selectedCategories.map(c => c.id) : undefined,
      transaction_type: selectedType === "Ingreso" ? "Income" : selectedType === "Gasto" ? "Expense" : undefined,
      limit: ITEMS_PER_PAGE,
      page,
      ...monthDateRange,
    }), [selectedBanks, selectedCategories, selectedType, page, monthDateRange]);

    const { data: txResponse, isLoading: queryLoading, isFetching } = useTransactions(apiFilters);

    // Accumulate transaction pages for infinite scroll
    useEffect(() => {
      if (txResponse?.data) {
        if (page === 1) {
          setAllTransactions(txResponse.data);
        } else {
          setAllTransactions(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const newTxs = txResponse.data.filter(t => !existingIds.has(t.id));
            return [...prev, ...newTxs];
          });
        }
      }
    }, [txResponse, page]);

    const hasMore = txResponse ? txResponse.total > allTransactions.length : false;

    const groupedTransactions = useMemo(() => {
      return groupTransactionsByMonth(allTransactions);
    }, [allTransactions]);

    const loadMore = useCallback(() => {
      if (queryLoading || isFetching || !hasMore) return;
      setPage(prev => prev + 1);
    }, [queryLoading, isFetching, hasMore]);

    // Apply initial filters on mount
    useEffect(() => {
      if (initialFilters) {
        if (initialFilters.accountIds) {
          setSelectedBanks(initialFilters.accountIds);
          setTempSelectedBanks(initialFilters.accountIds);
        }
        if (initialFilters.months) {
          setSelectedMonths(initialFilters.months);
          setTempSelectedMonths(initialFilters.months);
        }
        if (initialFilters.categoryIds) {
          const categoriesToSet = initialFilters.categoryIds.map(
            (id: any) => {
              const category = categories.find(
                (cat) => cat.id === id || cat.category_id === id
              );
              return {
                id: category?.id || id,
                name: category?.name || "Categoria",
              };
            }
          );
          setSelectedCategories(categoriesToSet);
          setTempSelectedCategories(categoriesToSet);
        }
        if (initialFilters.transactionType) {
          const type =
            initialFilters.transactionType === "Income" ? "Ingreso" : "Gasto";
          setSelectedType(type);
        }
      }
    }, [initialFilters, categories]);

    const handleDelete = useCallback((transactionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
        translate("homeScreen:titleAlert"),
        translate("homeScreen:messageAlert"),
        [
          { text: translate("homeScreen:cancel"), style: "cancel" },
          {
            text: translate("homeScreen:delete"),
            style: "destructive",
            onPress: () => {
              deleteTransactionMutation.mutate(transactionId);
            },
          },
        ]
      );
    }, [deleteTransactionMutation]);

    const onRowClose = useCallback(() => setOpenRow(null), []);

    const handleBankSelect = useCallback(
      (bank: { id: string; name?: string; icon_url?: string }) => {
        if (tempSelectedBanks.includes(bank.id)) {
          setTempSelectedBanks((prev) => prev.filter((id) => id !== bank.id));
          setTempSelectedBankNames((prev) =>
            prev.filter((name) => name !== (bank.name || "Banco"))
          );
        } else {
          setTempSelectedBanks((prev) => [...prev, bank.id]);
          setTempSelectedBankNames((prev) => [...prev, bank.name || "Banco"]);
        }
      },
      [tempSelectedBanks]
    );

    const handleMonthSelect = useCallback((month: string) => {
      setTempSelectedMonths((prev) => {
        const newMonths = prev.includes(month)
          ? prev.filter((m) => m !== month)
          : [...prev, month];
        return newMonths;
      });
    }, []);

    const handleTypeSelect = useCallback(
      (type: "Ingreso" | "Gasto" | null) => {
        const newType = selectedType === type ? null : type;
        setSelectedType(newType);
      },
      [selectedType]
    );

    const handleEditTransaction = useCallback(
      (transaction: Transaction) => {
        router.push({
          pathname: "/(authenticated)/edit-transaction/[transactionId]",
          params: {
            transactionId: transaction.id,
            transactionType:
              transaction.transaction_type === "Expense"
                ? "Expense"
                : transaction.transaction_type === "Income"
                ? "Income"
                : "Transfer",
            transaction: JSON.stringify(transaction),
          },
        });
      },
      [router]
    );

    const applyFilters = useCallback(
      (filters: {
        accountIds?: string[];
        months?: string[];
        categoryIds?: string[];
        transactionType?: "Income" | "Expense";
      }) => {
        if (filters.accountIds) {
          setSelectedBanks(filters.accountIds);
        }
        if (filters.months) {
          setSelectedMonths(filters.months);
        }
        if (filters.categoryIds) {
          const categoriesToSet = filters.categoryIds.map((id) => {
            const category = categories.find((cat) => cat.id === id);
            return {
              id,
              name: category?.name || "Categoria",
            };
          });
          setSelectedCategories(categoriesToSet);
        }
        if (filters.transactionType) {
          setSelectedType(
            filters.transactionType === "Income" ? "Ingreso" : "Gasto"
          );
        }

        setPage(1);
        setAllTransactions([]);
      },
      [categories]
    );

    const clearAllFilters = useCallback(() => {
      setTempSelectedBanks([]);
      setTempSelectedBankNames([]);
      setTempSelectedMonths([]);
      setTempSelectedCategories([]);
      setSelectedBanks([]);
      setSelectedBankNames([]);
      setSelectedMonths([]);
      setSelectedCategories([]);
      setSelectedType(null);
      setPage(1);
      setAllTransactions([]);
    }, []);

    const openBankModal = useCallback(() => {
      setTempSelectedBanks(selectedBanks);
      setTempSelectedBankNames(selectedBankNames);
      setShowBankModal(true);
    }, [selectedBanks, selectedBankNames]);

    const openMonthModal = useCallback(() => {
      setTempSelectedMonths(selectedMonths);
      setShowMonthModal(true);
    }, [selectedMonths]);

    const openCategoryModal = useCallback(() => {
      setTempSelectedCategories(selectedCategories);
      setShowCategoryModal(true);
    }, [selectedCategories]);

    const renderTransactionItem = useCallback(
      (
        transaction: Transaction,
        index: number,
        transactions: Transaction[]
      ) => {
        const isNew = !animatedIdsRef.current.has(transaction.id);
        animatedIdsRef.current.add(transaction.id);

        const shouldAnimate = isNew && !animCooldownRef.current;
        if (shouldAnimate) {
          animCooldownRef.current = true;
          setTimeout(() => { animCooldownRef.current = false; }, TRANSACTION_ANIM_COOLDOWN);
        }

        return (
          <Animated.View entering={shouldAnimate ? transactionEntering.duration(TRANSACTION_ANIM_DURATION) : undefined}>
            <TransactionList
              transaction={transaction}
              index={index}
              transactions={transactions}
              handleEditTransaction={handleEditTransaction}
            />
          </Animated.View>
        );
      },
      [handleEditTransaction]
    );

    const renderHiddenItem = useCallback(
      (data: { item: Transaction }, rowMap: RowMap<Transaction>) => (
        <View
          style={[
            tw`flex-1 flex-row justify-end items-stretch h-full`,
            {
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "100%",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              tw`bg-[${colors.secondary}] w-20 h-full justify-center items-center`,
              { position: "absolute", right: 0 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setTimeout(() => {
                handleDelete(data.item.id);
              }, 100);
            }}
          >
            <MaterialIcons name="delete" size={28} color={colors.white} />
            <Text
              style={tw`text-xs mt-1 text-white`}
              weight="medium"
              color="white"
            >
              {translate("common:delete")}
            </Text>
          </TouchableOpacity>
        </View>
      ),
      [handleDelete]
    );

    const renderMonthGroup = ({
      item,
      index,
    }: {
      item: GroupedTransaction;
      index: number;
    }) => {
      return (
        <View style={tw`mb-2`}>
          <View style={tw`px-4 py-2`}>
            <Text
              style={tw`text-base`}
              weight="medium"
              color={theme.textSecondary}
            >
              {item.name}
            </Text>
          </View>
          <SwipeableListWrapper<Transaction>
            data={item.transactions}
            renderItem={(transaction: Transaction) => {
              const rowIndex = item.transactions.indexOf(transaction);
              return renderTransactionItem(
                transaction,
                rowIndex,
                item.transactions
              );
            }}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-80}
            disableRightSwipe
            keyExtractor={(item) => item.id}
            onRowOpen={(rowKey) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setOpenRow(rowKey);
            }}
            onRowClose={onRowClose}
            useNativeDriver={true}
            onSwipeStart={() => {
              InteractionManager.runAfterInteractions(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              });
            }}
            onSwipeEnd={() => {}}
            onDelete={handleDelete}
            rightThreshold={70}
            deleteButtonStyle={`bg-[${colors.secondary}]`}
          />
        </View>
      );
    };

    const applyMonthFilter = useCallback(() => {
      applyFilters({
        months: tempSelectedMonths,
      });
    }, [tempSelectedMonths, applyFilters]);

    const applyTypeFilter = useCallback(
      (type: "Ingreso" | "Gasto" | null) => {
        applyFilters({
          transactionType:
            type === "Ingreso"
              ? "Income"
              : type === "Gasto"
              ? "Expense"
              : undefined,
        });
      },
      [applyFilters]
    );

    const handleBankModalClose = useCallback(() => {
      setShowBankModal(false);
      applyFilters({
        accountIds: tempSelectedBanks,
      });
    }, [tempSelectedBanks, applyFilters]);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      setPage(1);
      setAllTransactions([]);
      await queryClient.refetchQueries({ queryKey: queryKeys.transactions.all });
      setRefreshing(false);
    }, [queryClient]);

    return (
      <Screen
        safeAreaEdges={["top"]}
        preset="fixed"
        statusBarStyle={isDark ? "light" : "dark"}
        backgroundColor={theme.background}
        header={
          <View style={tw`w-full`}>
            <View style={tw`justify-between flex-row items-center`}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
              >
                <BackIconSvg width={15} height={15} color={theme.textPrimary} />
              </TouchableOpacity>
              <Text
                style={tw`text-lg`}
                weight="medium"
                color={theme.textPrimary}
              >
                {translate("transactionScreen:transactionTitle")}
              </Text>
              <TouchableOpacity
                style={tw`mr-4`}
                onPress={() => setFilterModalVisible(true)}
              >
                {/* <FilterSvg /> */}
              </TouchableOpacity>
            </View>
          </View>
        }
      >
        <ScrollView
          ref={scrollViewRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = 300;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom;

            setShowScrollToTop(contentOffset.y > 100);

            if (isCloseToBottom && !queryLoading && !isFetching && hasMore) {
              logger.debug("Reached near bottom, triggering loadMore");
              loadMore();
            }
          }}
          scrollEventThrottle={200}
          onMomentumScrollEnd={() => {
            if (!queryLoading && !isFetching && hasMore) {
              loadMore();
            }
          }}
        >
          <View style={tw`px-4 pt-4 pb-2`}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`flex-row gap-2`}
            >
              <TouchableOpacity
                onPress={clearAllFilters}
                style={[
                  tw`w-9 h-9 rounded-lg items-center justify-center`,
                  {
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor:
                      selectedBanks.length > 0 ||
                      selectedMonths.length > 0 ||
                      selectedCategories.length > 0 ||
                      selectedType !== null
                        ? colors.primary
                        : theme.surface,
                  },
                ]}
                accessibilityLabel="Limpiar filtros"
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={
                    selectedBanks.length > 0 ||
                    selectedMonths.length > 0 ||
                    selectedCategories.length > 0 ||
                    selectedType !== null
                      ? colors.white
                      : colors.primary
                  }
                />
              </TouchableOpacity>
              <FilterButton
                icon={<AccountIconSvg />}
                label={translate("transactionScreen:transactions.account")}
                selectedCount={selectedBanks.length}
                onPress={openBankModal}
                isActive={selectedBanks.length > 0}
              />
              <FilterButton
                icon={<CalendarIconSvg />}
                label={translate("transactionScreen:transactions.month")}
                selectedCount={selectedMonths.length}
                onPress={openMonthModal}
                isActive={selectedMonths.length > 0}
              />
              <FilterButton
                icon={
                  <MaterialCommunityIcons
                    name="format-list-bulleted"
                    size={16}
                    color={colors.primary}
                  />
                }
                label={translate("transactionScreen:transactions.category")}
                selectedCount={selectedCategories.length}
                onPress={openCategoryModal}
                isActive={selectedCategories.length > 0}
              />
              <FilterButton
                icon={
                  <MaterialCommunityIcons
                    name="format-list-bulleted"
                    size={16}
                    color={colors.primary}
                  />
                }
                label={translate("transactionScreen:transactions.type")}
                selectedCount={selectedType ? 1 : 0}
                onPress={() => setShowTypeModal(true)}
                isActive={!!selectedType}
                onClear={selectedType ? () => setSelectedType(null) : undefined}
              />
            </ScrollView>
          </View>

          <View style={[tw`px-4 mt-4`, { backgroundColor: theme.background }]}>
            {queryLoading && page === 1 ? (
              <View style={tw`flex-1 items-center justify-center py-8`}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={tw`mt-4 text-base`} color={theme.textSecondary}>
                  {translate("transactionScreen:chargingTransaction")}
                </Text>
              </View>
            ) : groupedTransactions.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center py-12`}>
                <KeboSadIconSvg width={60} height={60} />
                <Text style={tw`text-base mt-4`} color={theme.textSecondary}>
                  {translate("transactionScreen:noTransaction")}
                </Text>
              </View>
            ) : (
              <View
                style={[tw`rounded-[18px] overflow-hidden`, { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface }]}
              >
                {groupedTransactions.map((group) => (
                  <View key={group.name}>
                    {renderMonthGroup({
                      item: group,
                      index: groupedTransactions.indexOf(group),
                    })}
                  </View>
                ))}
              </View>
            )}
            {isFetching && page > 1 && (
              <View style={tw`py-4 items-center`}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={tw`mt-2 text-sm`} color={theme.textSecondary}>
                  {translate("transactionScreen:chargingMoreTransaction")}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {showScrollToTop && (
          <TouchableOpacity
            style={tw`absolute bottom-4 right-4 bg-[#6934D2] w-12 h-12 rounded-full items-center justify-center shadow-lg`}
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          >
            <ArrowUpIconSvg width={24} height={24} color="white" />
          </TouchableOpacity>
        )}

<CustomFilterModal
          visible={isFilterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilter={(type) => {
            setPage(1);
          }}
        />

        <CustomBankModal
          visible={showBankModal}
          onClose={handleBankModalClose}
          onSelect={handleBankSelect}
          selectedBanks={tempSelectedBanks}
          multipleSelection={true}
          hideBankActions={true}
        />

        <MultiCategoryModal
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSelect={setSelectedCategories}
          selectedCategories={selectedCategories}
        />

        <CustomMonthModal
          visible={showMonthModal}
          onClose={() => setShowMonthModal(false)}
          onSelect={handleMonthSelect}
          onApply={applyMonthFilter}
          onClear={() => setTempSelectedMonths([])}
          selectedMonths={tempSelectedMonths}
          groupedMonths={groupedMonths}
          sortedYears={sortedYears}
        />

        <CustomTypeModal
          visible={showTypeModal}
          onClose={() => setShowTypeModal(false)}
          onSelect={(type) => {
            handleTypeSelect(type);
            setShowTypeModal(false);
          }}
          onClear={() => {
            applyTypeFilter(null);
            setShowTypeModal(false);
          }}
          selectedType={selectedType}
        />
      </Screen>
    );
  }
);
