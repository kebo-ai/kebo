import { observer } from "mobx-react-lite";
import logger from "../../utils/logger";
import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Screen } from "../../components/Screen";
import { TransactionService } from "../../services/TransactionService";
import tw from "twrnc";
import moment from "moment";
import { colors } from "../../theme/colors";
import { AppStackScreenProps } from "../../navigators/AppNavigator";
import { BackIconSvg } from "../../components/svg/BackSvg";
import { ArrowUpIconSvg } from "../../components/svg/ArrowUpIcon";
import { MaterialIcons } from "@expo/vector-icons";
import CustomAlert from "../../components/custom/CustomAlert";
import { translate } from "../../i18n";
import { SwipeableListWrapper } from "../../components";
import { RowMap } from "react-native-swipe-list-view";
import CustomFilterModal from "../../components/custom/CustomFilterModal";
import CustomBankModal from "../../components/custom/CustomBankModal";
import { SwipeableItem } from "../../components/SwipeableList/SwipeableList";
import * as Haptics from "expo-haptics";
import { InteractionManager } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStores } from "../../models/helpers/useStores";
import { AccountIconSvg } from "../../components/svg/AccountSvg";
import { CalendarIconSvg } from "../../components/svg/CalendarSvg";
import { MultiCategoryModal } from "../../components/custom/MultiCategoryModal";
import FilterButton from "../../components/custom/FilterButton";
import { KeboSadIconSvg } from "../../components/svg/KeboSadIconSvg";
import i18n from "../../i18n/i18n";
import { showToast } from "../../components/ui/CustomToast";
import { TransactionList } from "../../components/custom/TransactionsList";
import { CustomMonthModal } from "../../components/custom/CustomMonthModal";
import { CustomTypeModal } from "../../components/custom/CustomTypeModal";

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

interface TransactionsScreenProps extends AppStackScreenProps<"Transactions"> {
  initialFilters?: {
    accountIds?: string[];
    months?: string[];
    categoryIds?: string[] | any;
    transactionType?: "Income" | "Expense";
    origin?: "Home" | "Accounts";
  };
}

type RouteParams = {
  origin?: "Home" | "Accounts";
  initialFilters?: {
    accountIds?: string[];
    months?: string[];
    categoryIds?: string[];
    transactionType?: "Income" | "Expense";
  };
};

export const TransactionsScreen: FC<TransactionsScreenProps> = observer(
  function TransactionsScreen({ navigation }) {
    const [transactions, setTransactions] = useState<GroupedTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const ITEMS_PER_PAGE = 15;
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<
      string | null
    >(null);
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
    const { categoryStoreModel } = useStores();
    const categories = categoryStoreModel.categories;
    const currentLocale = i18n.language.split("-")[0];
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [tempSelectedBanks, setTempSelectedBanks] = useState<string[]>([]);
    const [tempSelectedBankNames, setTempSelectedBankNames] = useState<
      string[]
    >([]);
    const [tempSelectedMonths, setTempSelectedMonths] = useState<string[]>([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState<
      { id: string; name: string }[]
    >([]);
    const route = useRoute();
    const { initialFilters } = (route.params || {}) as RouteParams;
    const [readyToFetch, setReadyToFetch] = useState(false);
    const origin = (route.params as RouteParams)?.origin ?? "Home";

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

    const fetchTransactions = useCallback(
      async (pageNumber = 1, isLoadMore = false) => {
        try {
          if (!isLoadMore) {
            setLoading(true);
          }

          const filters = {
            accountIds: selectedBanks.length > 0 ? selectedBanks : undefined,
            months: selectedMonths.length > 0 ? selectedMonths : undefined,
            categoryIds:
              selectedCategories.length > 0
                ? selectedCategories.map((cat) => cat.id)
                : undefined,
            transactionType:
              selectedType === "Ingreso"
                ? ("Income" as const)
                : selectedType === "Gasto"
                ? ("Expense" as const)
                : undefined,
          };

          const data = await TransactionService.getTransactionsByMonth(
            pageNumber,
            ITEMS_PER_PAGE,
            filters
          );

          if (!data || (Array.isArray(data) && data.length === 0)) {
            setHasMore(false);
            if (!isLoadMore) {
              setTransactions([]);
            }
          } else {
            const totalTransactions = countTotalTransactions(data);
            setHasMore(totalTransactions === ITEMS_PER_PAGE);

            setTransactions((prev) => {
              if (!Array.isArray(data)) return prev;

              if (isLoadMore) {
                const combinedTransactions = [...prev];

                data.forEach((newGroup) => {
                  const existingGroupIndex = combinedTransactions.findIndex(
                    (group) => group.name === newGroup.name
                  );

                  if (existingGroupIndex !== -1) {
                    combinedTransactions[existingGroupIndex].transactions = [
                      ...combinedTransactions[existingGroupIndex].transactions,
                      ...newGroup.transactions,
                    ];
                  } else {
                    combinedTransactions.push(newGroup);
                  }
                });

                return combinedTransactions;
              }

              return data;
            });
          }
        } catch (error) {
          logger.error("Error fetching transactions:", error);
          setTransactions([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [selectedBanks, selectedMonths, selectedCategories, selectedType]
    );

    const countTotalTransactions = (
      groups: GroupedTransaction[] | undefined
    ): number => {
      if (!groups) return 0;
      return groups.reduce((total: number, group: GroupedTransaction) => {
        return total + (group.transactions ? group.transactions.length : 0);
      }, 0);
    };

    const loadMore = useCallback(() => {
      if (loading || !hasMore) return;

      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);

      const filters = {
        accountIds: selectedBanks.length > 0 ? selectedBanks : undefined,
        months: selectedMonths.length > 0 ? selectedMonths : undefined,
        categoryIds:
          selectedCategories.length > 0
            ? selectedCategories.map((cat) => cat.id)
            : undefined,
        transactionType:
          selectedType === "Ingreso"
            ? ("Income" as const)
            : selectedType === "Gasto"
            ? ("Expense" as const)
            : undefined,
      };

      TransactionService.getTransactionsByMonth(
        nextPage,
        ITEMS_PER_PAGE,
        filters
      )
        .then((data) => {
          if (!data || data.length === 0) {
            setHasMore(false);
          } else {
            setTransactions((prev) => {
              if (!Array.isArray(data)) return prev;

              const combinedTransactions = [...prev];
              data.forEach((newGroup) => {
                const existingGroupIndex = combinedTransactions.findIndex(
                  (group) => group.name === newGroup.name
                );

                if (existingGroupIndex !== -1) {
                  combinedTransactions[existingGroupIndex].transactions = [
                    ...combinedTransactions[existingGroupIndex].transactions,
                    ...newGroup.transactions,
                  ];
                } else {
                  combinedTransactions.push(newGroup);
                }
              });

              return combinedTransactions;
            });

            const totalTransactions = countTotalTransactions(data);
            setHasMore(totalTransactions === ITEMS_PER_PAGE);
          }
        })
        .catch((error) => {
          logger.error("Error loading more transactions:", error);
          setHasMore(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [
      loading,
      hasMore,
      page,
      selectedBanks,
      selectedMonths,
      selectedCategories,
      selectedType,
      countTotalTransactions,
    ]);

    useEffect(() => {
      const applyInitialFilters = async () => {
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
                  name: category?.name || "Categoría",
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

        await new Promise((resolve) => setTimeout(resolve, 100));
        setReadyToFetch(true);
      };
      applyInitialFilters();
    }, [initialFilters, categories]);

    useEffect(() => {
      if (readyToFetch) {
        setLoading(true);
        fetchTransactions(1, false);
        setReadyToFetch(false);
      }
    }, [readyToFetch]);

    useFocusEffect(
      useCallback(() => {
        if (!hasInitialFilters) {
          setPage(1);
          setHasMore(true);
          setLoading(true);
          fetchTransactions(1, false);
        }
      }, [fetchTransactions, hasInitialFilters])
    );

    const handleDelete = useCallback((transactionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTransactionToDelete(transactionId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!transactionToDelete) return;

      setIsDeleting(true);
      try {
        await TransactionService.deleteTransaction(transactionToDelete);
        setIsUpdating(true);
        await fetchTransactions();
        showToast("success", translate("transactionScreen:deleteTransaction"));
      } catch (error) {
        logger.error("Error deleting transaction:", error);
        showToast(
          "error",
          translate("transactionScreen:errorMessageTransaction")
        );
      } finally {
        setIsDeleting(false);
        setIsUpdating(false);
        setIsDeleteAlertVisible(false);
        setTransactionToDelete(null);
      }
    }, [transactionToDelete, fetchTransactions]);

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
        navigation.navigate("EditTransaction", {
          transactionId: transaction.id,
          transactionType:
            transaction.transaction_type === "Expense"
              ? "Expense"
              : transaction.transaction_type === "Income"
              ? "Income"
              : "Transfer",
          transaction: transaction,
        });

        const unsubscribe = navigation.addListener("focus", () => {
          InteractionManager.runAfterInteractions(async () => {
            setTransactions([]);
            setPage(1);
            setHasMore(true);
            await fetchTransactions(1, false);
          });
        });

        return () => {
          unsubscribe();
        };
      },
      [navigation, fetchTransactions]
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
              name: category?.name || "Categoría",
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
        setHasMore(true);
        setLoading(true);
        setTransactions([]);

        const apiFilters = {
          accountIds: filters.accountIds || selectedBanks,
          months: filters.months || selectedMonths,
          categoryIds:
            filters.categoryIds || selectedCategories.map((cat) => cat.id),
          transactionType:
            filters.transactionType ||
            (selectedType === "Ingreso"
              ? "Income"
              : selectedType === "Gasto"
              ? "Expense"
              : undefined),
        };

        TransactionService.getTransactionsByMonth(1, ITEMS_PER_PAGE, apiFilters)
          .then((data) => {
            if (!data || data.length === 0) {
              setTransactions([]);
              setHasMore(false);
            } else {
              setTransactions(data);
              const totalTransactions = countTotalTransactions(data);
              setHasMore(totalTransactions === ITEMS_PER_PAGE);
            }
            setLoading(false);
          })
          .catch((error) => {
            logger.error("Error al aplicar filtros:", error);
            setTransactions([]);
            setLoading(false);
          });
      },
      [
        categories,
        selectedBanks,
        selectedMonths,
        selectedCategories,
        selectedType,
        countTotalTransactions,
      ]
    );

    const clearAllFilters = useCallback(async () => {
      setLoading(true);
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
      setHasMore(true);

      setReadyToFetch(true);
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
        return (
          <TransactionList
            transaction={transaction}
            index={index}
            transactions={transactions}
            handleEditTransaction={handleEditTransaction}
          />
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
              style={[
                tw`text-xs mt-1 text-white`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
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
              style={[
                tw`text-base text-[#606A84]/70`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
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

    const onRefresh = useCallback(() => {
      setRefreshing(true);
      setPage(1);
      setHasMore(true);
      setTimeout(() => {
        fetchTransactions(1, false);
      }, 50);
    }, [fetchTransactions]);

    return (
      <Screen
        safeAreaEdges={["top"]}
        preset="fixed"
        statusBarStyle={"dark"}
        backgroundColor="#FAFAFA"
        header={
          <View style={tw`w-full`}>
            <View style={tw`justify-between flex-row items-center`}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
              >
                <BackIconSvg width={15} height={15} color={colors.black} />
              </TouchableOpacity>
              <Text
                style={[
                  tw`text-[#110627] text-lg align-center`,
                  { fontFamily: "SFUIDisplayMedium" },
                ]}
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

            if (isCloseToBottom && !loading && hasMore) {
              logger.debug("Reached near bottom, triggering loadMore");
              loadMore();
            }
          }}
          scrollEventThrottle={200}
          onMomentumScrollEnd={() => {
            if (!loading && hasMore) {
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
                style={tw`w-9 h-9 rounded-lg border border-[#606A84]/20 ${
                  selectedBanks.length > 0 ||
                  selectedMonths.length > 0 ||
                  selectedCategories.length > 0 ||
                  selectedType !== null
                    ? `bg-[${colors.primary}]`
                    : `bg-[${colors.white}]`
                } items-center justify-center`}
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

          <View style={tw`px-4 bg-[#FAFAFA] mt-4`}>
            {loading && page === 1 ? (
              <View style={tw`flex-1 items-center justify-center py-8`}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={tw`mt-4 text-base text-[#606A84]`}>
                  {translate("transactionScreen:chargingTransaction")}
                </Text>
              </View>
            ) : transactions.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center py-12`}>
                <KeboSadIconSvg width={60} height={60} />
                <Text style={tw`text-[#606A84] text-base mt-4`}>
                  {translate("transactionScreen:noTransaction")}
                </Text>
              </View>
            ) : (
              <View
                style={tw`border border-[#EBEBEF] rounded-[18px] overflow-hidden bg-white`}
              >
                {transactions.map((group) => (
                  <View key={group.name}>
                    {renderMonthGroup({
                      item: group,
                      index: transactions.indexOf(group),
                    })}
                  </View>
                ))}
              </View>
            )}
            {loading && page > 1 && (
              <View style={tw`py-4 items-center`}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={tw`mt-2 text-sm text-[#606A84]`}>
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

        <CustomAlert
          visible={isDeleteAlertVisible}
          title={translate("transactionScreen:deleteTransaction")}
          message={translate("transactionScreen:confirmDeleteTransaction")}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteAlertVisible(false);
            setTransactionToDelete(null);
          }}
          type="danger"
          confirmText={translate("transactionScreen:delete")}
          cancelText={translate("transactionScreen:cancel")}
        />

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
