import { observer } from "mobx-react-lite";
import logger from "@/utils/logger";
import React, { FC, useEffect, useState, useCallback, memo } from "react";
import { Screen } from "@/components/Screen";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Keyboard,
  Pressable,
} from "react-native";
import { TransactionService } from "@/services/TransactionService";
import tw from "twrnc";
import moment from "moment";
import "moment/locale/es";
import { colors } from "@/theme/colors";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { getUserInfo } from "@/utils/authUtils";
import { SettingsSvg } from "@/components/icons/SettingsSvg";
import { SpentSvg } from "@/components/icons/SpentSvg";
import { TranferSvg } from "@/components/icons/TranferSvg";
import { IncomeSvg } from "@/components/icons/IncomeSvg";
import { NewAccountSvg } from "@/components/icons/NewAccountSvg";
import { KebitoWiseBudgetSvg } from "@/components/icons/KebitoWiseBudgetSvg";
import { KebitoWiseSuggestsSvg } from "@/components/icons/KebitoWiseSuggestsSvg";
import { KebitoWiseProjectSvg } from "@/components/icons/KebitoWiseProjectSvg";
import { SvgUri } from "react-native-svg";
import CustomAlert from "@/components/common/CustomAlert";
import { useStores } from "@/models";
import { translate } from "@/i18n";
import i18n from "@/i18n/i18n";
import { RowMap } from "react-native-swipe-list-view";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { InteractionManager } from "react-native";
import { TransactionType } from "@/types/transaction";
import { SwipeableListWrapper } from "@/components";
import { KeboSadIconSvg } from "@/components/icons/KeboSadIconSvg";
import { RecurrenceIconHomeSvg } from "@/components/icons/RecurrenceIconHomeSvg";
import { translateCategoryName } from "@/utils/categoryTranslations";
import { useReviewModal } from "@/hooks/useReviewModal";
import CustomModalReview from "@/components/common/CustomModalReview";
import { loadString, saveString } from "@/utils/storage/storage";
import { BALANCE_VISIBILITY } from "@/utils/storage/storage-keys";
import { useAnalytics } from "@/hooks/useAnalytics";
import { initializeUserAnalytics } from "@/utils/analyticsUtils";
// import CustomModalReview from "@/components/common/CustomModalReview";

interface HomeScreenProps {}

// Define a type for transactions
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  transaction_type: string;
  category_icon_url?: string;
  bank_url?: string;
  category_name?: string;
  category_id?: string;
  is_recurring?: boolean;
  metadata?: {
    auto_generated?: boolean;
  };
}

// Extracted Transaction Item Component for Memoization
const TransactionItem = memo(
  ({
    transaction,
    onPress,
    formatAmount,
  }: {
    transaction: Transaction;
    onPress: (transaction: Transaction) => void;
    formatAmount: (amount: number) => string;
  }) => {
    const isExpense = transaction.transaction_type === "Expense";
    const currentLocale = i18n.language.split("-")[0];

    const handlePress = useCallback(() => {
      onPress(transaction);
    }, [onPress, transaction]);

    const handleImageError = useCallback((e: any) => {
      logger.debug("Error loading bank icon:", e.nativeEvent.error);
    }, []);

    const descriptionText = transaction.description
      ? transaction.description.length > 18
        ? `${transaction.description.substring(0, 18)}...`
        : transaction.description
      : translate("homeScreen:noDescription");

    const categoryText = transaction.category_name
      ? transaction.category_name.length > 18
        ? `${translateCategoryName(
            transaction.category_name,
            transaction.category_id,
            transaction.category_icon_url
          ).substring(0, 18)}...`
        : translateCategoryName(
            transaction.category_name,
            transaction.category_id,
            transaction.category_icon_url
          )
      : translate("homeScreen:noCategory");

    const formatDate = (date: string) => {
      const today = moment().startOf("day");
      const transactionDate = moment(date).startOf("day");
      const yesterday = moment().subtract(1, "days").startOf("day");

      if (transactionDate.isSame(today)) {
        return translate("homeScreen:today");
      } else if (transactionDate.isSame(yesterday)) {
        return translate("homeScreen:yesterday");
      } else {
        return moment(date)
          .locale(currentLocale)
          .format("MMM DD")
          .replace(/^\w/, (c) => c.toUpperCase());
      }
    };

    const dateText = formatDate(transaction.date);

    const amountText =
      (isExpense ? "- " : "") + formatAmount(Math.abs(transaction.amount));

    return (
      <Pressable onPress={handlePress} style={tw`bg-[#FAFAFA]`}>
        <View style={tw`py-4 bg-white border-b border-[#EBEBEF] pl-4`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center mr-3 relative`,
                  {
                    borderWidth: 1.3,
                    borderColor: isExpense ? colors.bgGray : colors.primary,
                  },
                ]}
              >
                <View style={tw`w-full h-full items-center justify-center`}>
                  {transaction.category_icon_url ? (
                    transaction.category_icon_url.startsWith("/storage/") ? (
                      <SvgUri
                        width="100%"
                        height="100%"
                        uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${transaction.category_icon_url}`}
                      />
                    ) : (
                      <Text style={tw`text-2xl`}>
                        {transaction.category_icon_url}
                      </Text>
                    )
                  ) : (
                    <KeboSadIconSvg width={32} height={32} />
                  )}
                </View>
                <View
                  style={[
                    tw`absolute -bottom-1 -right-1 bg-white rounded-full`,
                    {
                      borderWidth: 1.3,
                      borderColor: isExpense ? colors.bgGray : colors.primary,
                    },
                  ]}
                >
                  {transaction.bank_url ? (
                    <Image
                      source={{
                        uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${transaction.bank_url}`,
                      }}
                      style={tw`w-[13px] h-[13px] rounded-full`}
                      onError={handleImageError}
                    />
                  ) : (
                    <KeboSadIconSvg width={13} height={13} />
                  )}
                </View>
              </View>
              <View>
                <View style={tw`flex-row items-center`}>
                  <Text
                    style={[
                      tw`text-base text-[#110627]`,
                      { fontFamily: "SFUIDisplayMedium" },
                    ]}
                  >
                    {categoryText}
                  </Text>
                  {transaction.metadata?.auto_generated && (
                    <View style={tw`ml-1 w-5 h-5 items-center justify-center`}>
                      <RecurrenceIconHomeSvg width={20} height={20} />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    tw`text-xs text-[#606A84]`,
                    { fontFamily: "SFUIDisplayLight" },
                  ]}
                >
                  {descriptionText}
                </Text>
              </View>
            </View>
            <View style={tw`items-end pr-4`}>
              <Text
                style={[
                  tw`text-base ${
                    isExpense ? "text-[#606A84]" : "text-[#6934D2]"
                  }`,
                  { fontFamily: "SFUIDisplayBold" },
                ]}
              >
                {amountText}
              </Text>
              <Text
                style={[
                  tw`text-xs text-[#606A84] mt-0.5`,
                  { fontFamily: "SFUIDisplayRegular" },
                ]}
              >
                {dateText}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
);

enum KeboWiseKeys {
  Sample1 = "chatbotScreen:sampleQuestions",
  Sample2 = "chatbotScreen:sampleQuestions1",
  Sample3 = "chatbotScreen:sampleQuestions2",
}

const keboWiseOptions = [
  {
    id: 1,
    icon: <KebitoWiseBudgetSvg />,
    text: KeboWiseKeys.Sample1,
  },
  {
    id: 2,
    icon: <KebitoWiseSuggestsSvg />,
    text: KeboWiseKeys.Sample2,
  },
  {
    id: 3,
    icon: <KebitoWiseProjectSvg />,
    text: KeboWiseKeys.Sample3,
  },
];

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<any>(null);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [openRow, setOpenRow] = useState<string | null>(null);
  const { formatAmount } = useCurrencyFormatter();
  const rootStore = useStores();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const analytics = useAnalytics();

  const {
    isVisible: isReviewModalVisible,
    checkEligibility,
    closeModal: closeReviewModal,
    handleConfirm: handleReviewConfirm,
    handleCancel: handleReviewCancel,
    getModalTexts,
  } = useReviewModal();

  const {
    categoryStoreModel: { getCategories },
    accountStoreModel: { getListAccount },
    profileModel: { full_name },
  } = useStores();

  useEffect(() => {
    const loadBalanceVisibility = async () => {
      const savedVisibility = await loadString(BALANCE_VISIBILITY);
      if (savedVisibility !== null) {
        setIsBalanceVisible(savedVisibility === "true");
      }
    };
    loadBalanceVisibility();
  }, []);

  // Check review modal eligibility when user returns to Home
  // Only if coming from creating a transaction
  useFocusEffect(
    useCallback(() => {
      const checkReviewModal = async () => {
        // Check review eligibility when returning to home
        // The transaction created flag would be passed via search params if needed
        setTimeout(async () => {
          await checkEligibility();
        }, 1000);
      };

      checkReviewModal();
    }, [checkEligibility])
  );

  const fetchUserBalance = useCallback(async () => {
    try {
      const balance = await TransactionService.getUserBalance();
      setUserBalance(balance);
    } catch (error) {
      logger.error("Error fetching user balance:", error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const userInfo = await getUserInfo(rootStore);
      setUser(userInfo);

      await initializeUserAnalytics(analytics, rootStore);

      const data = await TransactionService.getTransactions();
      const sortedTransactions =
        data?.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ) || [];
      setTransactions(sortedTransactions);
      await fetchUserBalance();
    } catch (error) {
      logger.error("Error fetching transactions:", error);
    }
  }, [rootStore, fetchUserBalance]);

  useEffect(() => {
    getCategories();
    fetchTransactions();
    getListAccount();
  }, [getCategories, fetchTransactions, getListAccount]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const handleDelete = useCallback((transactionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      // analytics.trackEvent("home_transaction_delete_initiated", {
      //   screen_name: "HomeScreen",
      //   action_type: "delete",
      //   interaction_type: "swipe",
      //   transaction_id: transactionId,
      // });
    } catch (error) {
      logger.debug("Error tracking delete:", error);
    }
    setTransactionToDelete(transactionId);
    setIsDeleteAlertVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (transactionToDelete) {
      try {
        await TransactionService.deleteTransaction(transactionToDelete);
        try {
          // analytics.trackEvent("home_transaction_delete_confirmed", {
          //   screen_name: "HomeScreen",
          //   action_type: "confirm",
          //   interaction_type: "modal",
          //   transaction_id: transactionToDelete,
          //   success: true,
          // });
        } catch (error) {
          logger.debug("Analytics error:", error);
        }

        fetchTransactions();
      } catch (error) {
        logger.error("Error deleting transaction:", error);
        try {
          // analytics.trackEvent("home_transaction_delete_failed", {
          //   screen_name: "HomeScreen",
          //   action_type: "confirm",
          //   interaction_type: "modal",
          //   transaction_id: transactionToDelete,
          //   success: false,
          //   error_message:
          //     error instanceof Error ? error.message : "Unknown error",
          // });
        } catch (analyticsError) {
          logger.debug("Analytics error:", analyticsError);
        }
      }
    }
    setIsDeleteAlertVisible(false);
    setTransactionToDelete(null);
  }, [transactionToDelete, fetchTransactions, analytics]);

  const handleTransactionPress = useCallback(
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

  const renderTransactionItemWrapper = useCallback(
    (item: Transaction) => {
      return (
        <TransactionItem
          transaction={item}
          onPress={handleTransactionPress}
          formatAmount={formatAmount}
        />
      );
    },
    [handleTransactionPress, formatAmount]
  );

  const renderHiddenItem = useCallback(
    (data: { item: Transaction }, rowMap: RowMap<Transaction>) => (
      <View
        style={[
          tw`flex-1 flex-row justify-end items-stretch h-full`,
          { position: "absolute", right: 0, top: 0, bottom: 0, width: "100%" },
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
            {translate("homeScreen:delete")}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [handleDelete]
  );

  const handleProfileNavigation = useCallback(() => {
    try {
      // analytics.trackEvent("home_profile_button_clicked", {
      //   screen_name: "HomeScreen",
      //   action_type: "click",
      //   interaction_type: "button",
      // });
    } catch (error) {
      logger.debug("Analytics error:", error);
    }
    router.push("/(authenticated)/profile");
  }, [router]);

  const renderHeader = useCallback(() => {
    return (
      <View
        style={tw`px-4 py-6 flex-row justify-between items-center bg-[#FAFAFA]`}
      >
        <View style={tw`flex-row items-center gap-4`}>
          <View
            style={tw`w-16 h-16 rounded-full overflow-hidden bg-[${colors.primary}]`}
          >
            <Image
              source={
                user?.profile?.avatar_url ||
                user?.user?.user_metadata?.avatar_url
                  ? {
                      uri:
                        user?.profile?.avatar_url ||
                        user?.user?.user_metadata?.avatar_url,
                    }
                  : require("@/assets/icons/kebo-profile.png")
              }
              style={tw`w-full h-full`}
            />
          </View>
          <View>
            <Text
              style={[
                tw`text-lg text-[rgba(17, 6, 39, 1)]`,
                { fontFamily: "SFUIDisplayBold" },
              ]}
            >
              {translate("homeScreen:greetings", {
                full_name: (full_name || "").split(" ")[0],
              })}
            </Text>
            <Text style={tw`text-sm text-[rgba(17, 6, 39, 1)]`}>
              {translate("homeScreen:slogan")}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={tw`p-2`} onPress={handleProfileNavigation}>
          <View style={tw`w-8 h-8 items-center justify-center rounded-full`}>
            <SettingsSvg />
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [user, full_name, handleProfileNavigation]);

  const navigateToTransaction = useCallback(
    (type: TransactionType) => {
      Keyboard.dismiss();
      try {
        // analytics.trackHomeTransactionButtonClick(type);
      } catch (error) {
        logger.debug("Analytics error:", error);
      }
      router.push({
        pathname: "/(authenticated)/transaction",
        params: { transactionType: type },
      });
    },
    [router]
  );

  const navigateToSelectBank = useCallback(() => {
    Keyboard.dismiss();
    try {
      // analytics.trackEvent("home_account_button_clicked", {
      //   screen_name: "HomeScreen",
      //   action_type: "click",
      //   interaction_type: "button",
      // });
    } catch (error) {
      logger.debug("Analytics error:", error);
    }
    router.push({
      pathname: "/(authenticated)/accounts",
      params: { visible: "true" },
    });
  }, [router]);

  const handleBalanceVisibilityToggle = useCallback(async () => {
    const newVisibility = !isBalanceVisible;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      // analytics.trackEvent("home_balance_visibility_toggle", {
      //   screen_name: "HomeScreen",
      //   action_type: "toggle",
      //   interaction_type: "button",
      //   old_value: isBalanceVisible.toString(),
      //   new_value: newVisibility.toString(),
      //   success: true,
      // });
    } catch (error) {
      logger.debug("Analytics error:", error);
    }
    setIsBalanceVisible(newVisibility);
    await saveString(BALANCE_VISIBILITY, newVisibility.toString());
  }, [isBalanceVisible]);

  const renderBudgetCard = useCallback(() => {
    return (
      <View
        style={tw`bg-[#6934D226] px-[17px] pt-[19px] pb-[15px] rounded-[18px] mb-6 relative`}
      >
        <TouchableOpacity
          onPress={handleBalanceVisibilityToggle}
          style={tw`absolute top-3 right-3 p-1`}
        >
          <MaterialIcons
            name={isBalanceVisible ? "visibility" : "visibility-off"}
            size={20}
            color="#6934D2"
          />
        </TouchableOpacity>
        <View style={tw`flex-row items-center justify-center`}>
          <Text
            style={[
              tw`text-center text-[#110627] text-sm`,
              { fontFamily: "SFUIDisplayLight" },
            ]}
          >
            {translate("homeScreen:balance")}
          </Text>
        </View>

        <View style={tw`flex-row justify-center items-center mt-2`}>
          <Text
            style={[
              tw`text-center text-3xl text-black`,
              { fontFamily: "SFUIDisplayMedium" },
            ]}
          >
            {isBalanceVisible
              ? userBalance
                ? formatAmount(userBalance.total_balance)
                : formatAmount(0)
              : "••••••••"}
          </Text>
        </View>
        <View style={tw`flex-row justify-between mt-4`}>
          {[
            {
              label: translate("homeScreen:expense"),
              icon: <SpentSvg />,
              onNavigate: () => navigateToTransaction(TransactionType.EXPENSE),
            },
            {
              label: translate("homeScreen:income"),
              icon: <IncomeSvg />,
              onNavigate: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigateToTransaction(TransactionType.INCOME);
              },
            },
            {
              label: translate("homeScreen:transfer"),
              icon: <TranferSvg />,
              onNavigate: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigateToTransaction(TransactionType.TRANSFER);
              },
            },
            {
              label: translate("homeScreen:newAccount"),
              icon: <NewAccountSvg />,
              onNavigate: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigateToSelectBank();
              },
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={tw`items-center`}
              onPress={item.onNavigate}
            >
              <View
                style={tw`bg-[#6934D2] w-14 h-14 rounded-[18px] items-center justify-center`}
              >
                {item.icon}
              </View>
              <Text
                style={[
                  tw`text-[10px] text-[#110627] mt-1`,
                  { fontFamily: "SFUIDisplaySemiBold" },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [
    userBalance,
    formatAmount,
    navigateToTransaction,
    navigateToSelectBank,
    handleBalanceVisibilityToggle,
    isBalanceVisible,
  ]);

  const navigateToChatbot = useCallback(
    (initialQuestionKey: KeboWiseKeys) => {
      const initialQuestion = translate(initialQuestionKey);
      try {
        // analytics.trackEvent("home_kebo_wise_clicked", {
        //   screen_name: "HomeScreen",
        //   action_type: "click",
        //   interaction_type: "button",
        //   question_key: initialQuestionKey,
        //   question_text: initialQuestion,
        // });
      } catch (error) {
        logger.debug("Analytics error:", error);
      }
      router.push({
        pathname: "/(authenticated)/(tabs)/chatbot",
        params: { initialQuestion },
      });
    },
    [router]
  );

  const handleSeeMoreTransactions = useCallback(() => {
    try {
      // analytics.trackEvent("home_see_more_transactions_clicked", {
      //   screen_name: "HomeScreen",
      //   action_type: "click",
      //   interaction_type: "button",
      //   origin: "Home",
      // });
    } catch (error) {
      logger.debug("Analytics error:", error);
    }
    router.push({
      pathname: "/(authenticated)/transactions",
      params: { origin: "Home" },
    });
  }, [router]);

  const keyExtractorMain = useCallback(() => "main-content", []);

  const keyExtractorSwipe = useCallback((item: Transaction) => item.id, []);

  const onRowClose = useCallback(() => setOpenRow(null), []);

  const renderMainContent = useCallback(
    () => (
      <View style={tw`px-4 py-4 bg-[#FAFAFA]`}>
        {renderBudgetCard()}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={[tw`text-base`, { fontFamily: "SFUIDisplaySemiBold" }]}>
            {translate("homeScreen:titleTransaction")}
            <Text>💸👀</Text>
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleSeeMoreTransactions();
            }}
          >
            <Text
              style={[
                tw`text-[${colors.primary}] text-xs bg-[#6934D21A] px-2 py-1 rounded-2xl`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {translate("homeScreen:seeMore")}
            </Text>
          </TouchableOpacity>
        </View>
        {transactions.length === 0 ? (
          <View
            style={tw`border border-[#EBEBEF] bg-white p-6 rounded-[18px] items-center justify-center`}
          >
            <KeboSadIconSvg width={60} height={60} />
            <Text style={tw`text-[#606A84] text-center`}>
              {translate("homeScreen:noTransactions")}
            </Text>
          </View>
        ) : (
          <View
            style={tw`border border-[#EBEBEF] bg-white rounded-[18px] overflow-hidden`}
          >
            <SwipeableListWrapper
              data={transactions.slice(0, 5)}
              renderItem={renderTransactionItemWrapper}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-80}
              disableRightSwipe
              keyExtractor={keyExtractorSwipe}
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
        )}
        <View style={tw`flex-row justify-between items-center mb-4 mt-6`}>
          <Text style={[tw`text-base`, { fontFamily: "SFUIDisplaySemiBold" }]}>
            Kebo Wise <Text>🐨🔎</Text>
          </Text>
        </View>
        <View style={tw`flex-row flex-wrap justify-between gap-3 mb-18`}>
          {keboWiseOptions.map(
            (option: { id: number; icon: JSX.Element; text: KeboWiseKeys }) => (
              <TouchableOpacity
                key={option.id}
                style={tw`items-center flex-col p-4 rounded-[20px] bg-[#606A84]/5 w-[30%] mb-3`}
                onPress={() => navigateToChatbot(option.text)}
              >
                <View style={tw``}>{option.icon}</View>
                <Text
                  style={[
                    tw`mt-2 text-center text-[10px]`,
                    { fontFamily: "SFUIDisplayMedium" },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {translate(option.text)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    ),
    [
      renderBudgetCard,
      handleSeeMoreTransactions,
      transactions,
      renderTransactionItemWrapper,
      renderHiddenItem,
      keyExtractorSwipe,
      onRowClose,
      navigateToChatbot,
      handleDelete,
    ]
  );

  const handleCloseDeleteAlert = useCallback(() => {
    setIsDeleteAlertVisible(false);
    setTransactionToDelete(null);
  }, []);

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      preset="fixed"
      statusBarStyle={"dark"}
      header={renderHeader()}
      backgroundColor="#FAFAFA"
    >
      <FlatList
        data={[1]}
        renderItem={renderMainContent}
        keyExtractor={keyExtractorMain}
        showsVerticalScrollIndicator={false}
      />

      <CustomAlert
        visible={isDeleteAlertVisible}
        title={translate("homeScreen:titleAlert")}
        message={translate("homeScreen:messageAlert")}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteAlert}
        type="danger"
        confirmText={translate("homeScreen:delete")}
        cancelText={translate("homeScreen:cancel")}
      />
      <CustomModalReview
        visible={isReviewModalVisible}
        title={getModalTexts().title}
        message={getModalTexts().message}
        onConfirm={handleReviewConfirm}
        onCancel={handleReviewCancel}
        confirmText={getModalTexts().confirmText}
        cancelText={getModalTexts().cancelText}
      />
    </Screen>
  );
});
