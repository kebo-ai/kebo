import { observer } from "mobx-react-lite";
import logger from "@/utils/logger";
import React, { FC, useCallback, useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Button } from "@/components/ui";
import { RowMap } from "react-native-swipe-list-view";
import { SwipeListView } from "react-native-swipe-list-view";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { translate } from "@/i18n";
import { colors } from "@/theme";
import { largeTitleHeader } from "@/theme/header-options";
import tw from "@/hooks/use-tailwind";
import { useTheme } from "@/hooks/use-theme";
import {
  deleteAccountService,
  getAccountsWithBalance,
} from "@/services/account-service";
import { useStores } from "@/models/helpers/use-stores";
import { showToast } from "@/components/ui/custom-toast";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { KeboSadIconSvg } from "@/components/icons/KeboSadIconSvg";
import { Stack, useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";

interface BankOption {
  id: string;
  name: string;
  icon_url: string | null;
  description: string;
  balance: number;
  sum__total_balance?: number;
  account_type_id: string;
  account_type: string;
}

interface AccountsScreenProps {
  onClose?: () => void;
  selectedBank?: string;
  selectedBanks?: string[];
  multipleSelection?: boolean;
  isTransfer?: boolean;
  transferType?: "from" | "to";
  otherAccountId?: string;
  screenName?: string;
  hideBankActions?: boolean;
}

export const AccountsScreen: FC<AccountsScreenProps> = observer(
  function AccountsScreen({
    onClose,
    selectedBank,
    selectedBanks = [],
    multipleSelection = false,
    isTransfer,
    transferType,
    otherAccountId,
    screenName,
    hideBankActions = false,
  }) {
    const router = useRouter();
    const params = useLocalSearchParams<{ visible?: string }>();
    const visible = params.visible !== "false";
    const { theme } = useTheme();

    const {
      accountStoreModel: {
        getListAccount,
        accounts,
        deleteAccountById,
        AccountsWithBalance,
      },
      transactionModel: { updateField },
    } = useStores();
    const { getSymbol, formatAmount } = useCurrencyFormatter();
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [accountsWithBalance, setAccountsWithBalance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(
      async (pageNumber: number = 1, append: boolean = false) => {
        if (visible) {
          try {
            const accountsResult = await getListAccount();
            const balanceResult = await getAccountsWithBalance();

            if (balanceResult) {
              const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
              const endIndex = startIndex + ITEMS_PER_PAGE;
              const paginatedResults = balanceResult.slice(
                startIndex,
                endIndex
              );
              if (append) {
                setAccountsWithBalance((prev) => [
                  ...prev,
                  ...paginatedResults,
                ]);
              } else {
                setAccountsWithBalance(paginatedResults);
              }
              setHasMore(endIndex < balanceResult.length);
            }
          } catch (error) {
            logger.error("Error fetching accounts:", error);
          } finally {
            setLoading(false);
          }
        }
      },
      [visible, getListAccount]
    );

    const loadMore = useCallback(() => {
      if (loading || !hasMore) return;

      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }, [loading, hasMore, page, fetchData]);

    useFocusEffect(
      useCallback(() => {
        logger.debug("Screen focused - refreshing accounts");
        setPage(1);
        setHasMore(true);
        fetchData(1, false);

        return () => {
          logger.debug("Screen unfocused - cleanup");
        };
      }, [fetchData])
    );

    const bankOptions = [
      ...accounts
        .filter((account) => !otherAccountId || account.id !== otherAccountId)
        .map((account) => ({
          id: account.id,
          name: account.name,
          icon_url: account.icon_url,
          description: account.customized_name,
          balance: account.balance,
          account_type_id: account.account_type_id,
          account_type: account.account_type,
        })),
    ];

    const handleDelete = (bankId: string) => {
      Alert.alert(
        translate("components:bankModal.deleteAccount"),
        translate("components:bankModal.deleteMessage"),
        [
          {
            text: translate("components:bankModal.cancelDelete"),
            style: "cancel",
          },
          {
            text: translate("components:bankModal.confirmDelete"),
            style: "destructive",
            onPress: () => confirmDelete(bankId),
          },
        ]
      );
    };

    const confirmDelete = async (bankId: string) => {
      setIsDeleting(true);
      try {
        const result = await deleteAccountService(bankId);
        if (result.kind === "ok") {
          setIsUpdating(true);
          await getListAccount();

          const remainingAccounts = bankOptions.filter(
            (account) => account.id !== bankToDelete
          );
          if (remainingAccounts.length > 0) {
            const nextAccount = remainingAccounts[0];
            if (isTransfer) {
              if (transferType === "from") {
                updateField("from_account_id", nextAccount.id);
                updateField(
                  "from_account_name",
                  nextAccount.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : nextAccount.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : nextAccount.name
                );
                updateField("from_account_url", nextAccount.icon_url ?? "");
              } else {
                updateField("to_account_id", nextAccount.id);
                updateField(
                  "to_account_name",
                  nextAccount.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : nextAccount.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : nextAccount.name
                );
                updateField("to_account_url", nextAccount.icon_url ?? "");
              }
            } else {
              updateField("account_id", nextAccount.id);
              updateField(
                "account_name",
                nextAccount.name === "Efectivo"
                  ? translate("modalAccount:cash")
                  : nextAccount.name === "Banco Personalizado"
                  ? translate("components:bankModal.customBank")
                  : nextAccount.name
              );
              updateField("account_url", nextAccount.icon_url ?? "");
            }
          } else {
            if (isTransfer) {
              if (transferType === "from") {
                updateField("from_account_id", "");
                updateField("from_account_name", "");
                updateField("from_account_url", "");
              } else {
                updateField("to_account_id", "");
                updateField("to_account_name", "");
                updateField("to_account_url", "");
              }
            } else {
              updateField("account_id", "");
              updateField("account_name", "");
              updateField("account_url", "");
            }
          }
          showToast(
            "success",
            translate("components:bankModal.deleteAccountSuccess")
          );
        } else {
          showToast("error", translate("components:bankModal.errorAccount"));
        }
      } catch (error) {
        showToast("error", translate("components:bankModal.errorAccount"));
      } finally {
        setIsDeleting(false);
        setIsUpdating(false);
      }
    };

    const getTotalBalance = (accountId: string) => {
      const found = accountsWithBalance.find(
        (acc) => acc.account_id === accountId
      );
      return found ? Number(found.sum__total_balance) : 0;
    };

    const getAccountType = (accountId: string) => {
      const found = accountsWithBalance.find(
        (acc) => acc.account_id === accountId
      );
      const accountType = found?.account_type ?? "-";

      switch (accountType.toLowerCase()) {
        case "cuenta corriente est\u00e1ndar":
          return translate("accountTypes:checkingAccount");
        case "cuenta de ahorro est\u00e1ndar":
          return translate("accountTypes:savingsAccount");
        case "cuenta de efectivo":
          return translate("accountTypes:cashAccount");
        case "cuenta de tarjeta de cr\u00e9dito":
          return translate("accountTypes:creditCardAccount");
        default:
          return accountType;
      }
    };

    const renderItem = (data: { item: BankOption; index: number }) => {
      const isSelected = multipleSelection
        ? selectedBanks.includes(data.item.id)
        : selectedBank === data.item.id;
      const isLastItem = data.index === bankOptions.length - 1;

      return (
        <Pressable
          onPress={() => {
            logger.debug("Navegando a Transactions con cuenta:", data.item.id);
            router.push({
              pathname: "/(authenticated)/transactions",
              params: {
                origin: "Accounts",
                initialFilters: JSON.stringify({
                  accountIds: [data.item.id],
                }),
              },
            });
          }}
          style={[
            tw`py-4 px-4`,
            { backgroundColor: theme.surface },
            !isLastItem && { borderBottomWidth: 1, borderBottomColor: theme.border },
          ]}
        >
          <View style={tw`flex-row justify-between items-center`}>
            {data.item.icon_url ? (
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${data.item.icon_url}`,
                }}
                style={[tw`w-10 h-10 rounded-full border mr-3`, { backgroundColor: theme.surface, borderColor: theme.border }]}
                resizeMode="contain"
              />
            ) : (
              <MaterialIcons
                name="account-balance"
                size={24}
                color={colors.primary}
                style={tw`mr-3`}
              />
            )}
            <View style={tw`flex-1`}>
              <View style={tw`flex-col items-start`}>
                <Text
                  style={{
                    fontWeight: "500",
                    fontSize: 16,
                    lineHeight: 20,
                    letterSpacing: 0,
                    flex: 1,
                  }}
                  weight="medium"
                  color={isSelected
                    ? colors.primary
                    : theme.textPrimary}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {data.item.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : data.item.name}
                </Text>
                <Text
                  style={tw`text-xs`}
                  weight="light"
                  color={theme.textSecondary}
                >
                  {data.item.description}
                </Text>
              </View>
            </View>
            <View style={tw`flex-col items-end`}>
              <Text
                style={tw`text-base`}
                weight="bold"
                color={
                  getAccountType(data.item.id) ===
                  translate("accountTypes:creditCardAccount")
                    ? theme.textSecondary
                    : colors.primary
                }
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {formatAmount(getTotalBalance(data.item.id), true)}
              </Text>
              <Text
                style={tw`text-xs mt-0.5`}
                weight="normal"
                color={theme.textSecondary}
              >
                {getAccountType(data.item.id)}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    };

    const renderHiddenItem = (
      data: { item: BankOption },
      rowMap: RowMap<BankOption>
    ) => {
      if (hideBankActions) return null;

      return (
        <View
          style={[
            tw`flex-1 flex-row justify-end h-[60px] my-1`,
            { zIndex: 1, position: "absolute", right: 0, top: 0, bottom: 0 },
          ]}
        >
          <TouchableOpacity
            style={[
              tw`w-[65px] h-full justify-center items-center`,
              { backgroundColor: openRow === data.item.id ? colors.primary : theme.surface },
            ]}
            onPress={() => {
              router.push({
                pathname: "/(authenticated)/edit-account/[accountId]",
                params: {
                  accountId: data.item.id,
                  selectedBank: JSON.stringify({
                    ...data.item,
                    bank_url: data.item.icon_url,
                  }),
                  isEditing: "true",
                  accountData: JSON.stringify(data.item),
                  fromScreen: screenName,
                },
              });
            }}
          >
            <MaterialIcons
              name="edit"
              size={24}
              color={openRow === data.item.id ? colors.white : colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`w-[65px] h-full justify-center items-center rounded-r-[20px]`,
              { backgroundColor: openRow === data.item.id ? colors.secondary : theme.surface },
            ]}
            onPress={() => handleDelete(data.item.id)}
          >
            <MaterialIcons
              name="delete"
              size={24}
              color={openRow === data.item.id ? colors.white : colors.secondary}
            />
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <>
        <Stack.Screen
          options={{
            ...largeTitleHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: translate("accountScreen:myAccounts"),
            contentStyle: { backgroundColor: theme.background },
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/(authenticated)/select-bank",
                    params: {
                      isTransfer: isTransfer ? "true" : "false",
                      transferType,
                      fromBankModal: "true",
                      fromScreen: screenName,
                    },
                  });
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "rgba(105, 52, 210, 0.1)",
                  borderRadius: 20,
                }}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
                <Text type="sm" weight="semibold" color={colors.primary}>
                  {translate("components:bankModal.addAccount")}
                </Text>
              </TouchableOpacity>
            ),
          }}
        />
        {loading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={tw`px-4 pt-4 pb-24`}
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback disabled={isDeleting || isUpdating}>
              <View>
                <View
                  style={[tw`rounded-2xl overflow-hidden border`, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  {bankOptions.length === 0 ? (
                    <View
                      style={tw`items-center justify-center py-12`}
                    >
                      <KeboSadIconSvg width={60} height={60} />
                      <Text style={tw`text-base mt-4`} color={theme.textTertiary}>
                        {translate("components:bankModal.noAccounts")}
                      </Text>
                    </View>
                  ) : (
                    <SwipeListView
                      data={bankOptions}
                      renderItem={renderItem}
                      renderHiddenItem={renderHiddenItem}
                      rightOpenValue={hideBankActions ? 0 : -130}
                      disableRightSwipe={hideBankActions}
                      keyExtractor={(item) => item.id}
                      onRowOpen={(rowKey) => setOpenRow(rowKey)}
                      onRowClose={() => setOpenRow(null)}
                      useNativeDriver={true}
                      swipeToOpenPercent={10}
                      swipeToClosePercent={90}
                      closeOnRowBeginSwipe={true}
                      recalculateHiddenLayout={true}
                      disableHiddenLayoutCalculation={false}
                      directionalDistanceChangeThreshold={5}
                      onEndReached={loadMore}
                      onEndReachedThreshold={0.5}
                      scrollEnabled={false}
                    />
                  )}
                </View>

              </View>
            </TouchableWithoutFeedback>

            {(isDeleting || isUpdating) && (
              <View
                style={[
                  tw`absolute left-0 top-0 w-full h-full z-50 items-center justify-center`,
                  { backgroundColor: theme.background + "B3" },
                ]}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={tw`mt-2 font-medium`} color={colors.primary}>
                  {translate("common:deleting") + "..."}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </>
    );
  }
);
