import { observer } from "mobx-react-lite";
import logger from "@/utils/logger";
import React, { FC, useEffect, useState, useCallback, memo } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Keyboard,
  Pressable,
  Alert,
} from "react-native";
import Animated, {
  FadeIn,
  Easing,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, Icon } from "@/components/ui";
import tw from "twrnc";
import moment from "moment";
import "moment/locale/es";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/use-theme";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCurrencyFormatter } from "@/components/common/currency-formatter";
import { useQueryClient } from "@tanstack/react-query";
import { useBalance, useRecentTransactions, useDeleteTransaction, useProfile } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/keys";
import type { Transaction } from "@/lib/api/types";
import { SpentSvg } from "@/components/icons/spent-svg";
import { TranferSvg } from "@/components/icons/tranfer-svg";
import { IncomeSvg } from "@/components/icons/income-svg";
import { NewAccountSvg } from "@/components/icons/new-account-svg";
import { KebitoWiseBudgetSvg } from "@/components/icons/kebito-wise-budget-svg";
import { KebitoWiseSuggestsSvg } from "@/components/icons/kebito-wise-suggests-svg";
import { KebitoWiseProjectSvg } from "@/components/icons/kebito-wise-project-svg";
import { SvgUri } from "react-native-svg";
import { useStores } from "@/models/helpers/use-stores";
import { translate } from "@/i18n";
import i18n from "@/i18n/i18n";
import { RowMap } from "react-native-swipe-list-view";
import * as Haptics from "expo-haptics";
import { InteractionManager } from "react-native";
import { TransactionType } from "@/types/transaction";
import { SwipeableListWrapper } from "@/components/swipeable-list-wrapper/swipeable-list-wrapper";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import { RecurrenceIconHomeSvg } from "@/components/icons/recurrence-icon-home-svg";
import { translateCategoryName } from "@/utils/category-translations";
import { useReviewModal } from "@/hooks/use-review-modal";
import CustomModalReview from "@/components/common/custom-modal-review";
import { loadString, saveString } from "@/utils/storage/storage";
import { BALANCE_VISIBILITY } from "@/utils/storage/storage-keys";
import { useAnalytics } from "@/hooks/use-analytics";
import { initializeUserAnalytics } from "@/utils/analytics-utils";

interface HomeScreenProps {}

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
    const { theme } = useTheme();
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
      <Pressable onPress={handlePress} style={tw`bg-[#FAFAFA] dark:bg-black`}>
        <View style={tw`py-4 bg-white dark:bg-[#1C1C1E] border-b border-[#EBEBEF] dark:border-[#3A3A3C] pl-4`}>
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
                    tw`absolute -bottom-1 -right-1 bg-white dark:bg-[#1C1C1E] rounded-full`,
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
                  <Text weight="medium" color={theme.textPrimary}>
                    {categoryText}
                  </Text>
                  {!!transaction.metadata?.auto_generated && (
                    <View style={tw`ml-1 w-5 h-5 items-center justify-center`}>
                      <RecurrenceIconHomeSvg width={20} height={20} />
                    </View>
                  )}
                </View>
                <Text type="xs" weight="light" color={theme.textSecondary}>
                  {descriptionText}
                </Text>
              </View>
            </View>
            <View style={tw`items-end pr-4`}>
              <Text weight="bold" color={isExpense ? theme.textSecondary : "#6934D2"}>
                {amountText}
              </Text>
              <Text type="xs" weight="normal" color={theme.textSecondary} style={tw`mt-0.5`}>
                {dateText}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
);

// Animated balance toggle — inspired by Fuse's 3D flip pattern
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BALANCE_DURATION = 175;
const BALANCE_EASING = Easing.out(Easing.ease);
const LONG_PRESS_DELAY = 500;

const TRANSFORM_SECURE = [
  { translateY: -35 },
  { translateX: -4 },
  { skewX: "45deg" },
  { rotateX: "90deg" },
  { rotateY: "3deg" },
];
const TRANSFORM_INSECURE = [
  { translateY: 30 },
  { translateX: 4 },
  { skewX: "45deg" },
  { rotateX: "90deg" },
  { rotateY: "3deg" },
];
const TRANSFORM_ZERO = [
  { translateY: 0 },
  { translateX: 0 },
  { skewX: "0deg" },
  { rotateX: "0deg" },
  { rotateY: "0deg" },
];

const secureEntering = new Keyframe({
  0: { opacity: 0, transform: TRANSFORM_SECURE },
  100: { opacity: 1, transform: TRANSFORM_ZERO, easing: BALANCE_EASING },
});
const secureExiting = new Keyframe({
  0: { opacity: 1, transform: TRANSFORM_ZERO },
  100: { opacity: 0, transform: TRANSFORM_SECURE, easing: BALANCE_EASING },
});
const insecureEntering = new Keyframe({
  0: { opacity: 0, transform: TRANSFORM_INSECURE },
  100: { opacity: 1, transform: TRANSFORM_ZERO, easing: BALANCE_EASING },
});
const insecureExiting = new Keyframe({
  0: { opacity: 1, transform: TRANSFORM_ZERO },
  100: { opacity: 0, transform: TRANSFORM_INSECURE, easing: BALANCE_EASING },
});

const BalanceDisplay = memo(
  ({
    isVisible,
    onToggle,
    formattedBalance,
  }: {
    isVisible: boolean;
    onToggle: () => void;
    formattedBalance: string;
  }) => {
    const isTouched = useSharedValue(false);

    const rStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: withTiming(isTouched.get() ? (isVisible ? 5 : -4) : 0, {
            duration: LONG_PRESS_DELAY,
            easing: BALANCE_EASING,
          }),
        },
        {
          scale: withTiming(isTouched.get() ? 0.97 : 1, {
            duration: LONG_PRESS_DELAY,
            easing: BALANCE_EASING,
          }),
        },
        {
          rotateX: withTiming(isTouched.get() ? "5deg" : "0deg", {
            duration: LONG_PRESS_DELAY,
            easing: BALANCE_EASING,
          }),
        },
      ],
    }));

    const handleLongPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    };

    return (
      <Animated.View style={rStyle}>
        {isVisible ? (
          <AnimatedPressable
            key="balance-visible"
            entering={insecureEntering.duration(BALANCE_DURATION)}
            exiting={insecureExiting.duration(BALANCE_DURATION)}
            onTouchStart={() => isTouched.set(true)}
            onTouchEnd={() => isTouched.set(false)}
            onLayout={() => isTouched.set(false)}
            onLongPress={handleLongPress}
            delayLongPress={LONG_PRESS_DELAY}
            style={tw`flex-row justify-center items-center`}
          >
            <Text type="2xl" weight="medium" style={tw`text-center`}>
              {formattedBalance}
            </Text>
          </AnimatedPressable>
        ) : (
          <AnimatedPressable
            key="balance-hidden"
            entering={secureEntering.duration(BALANCE_DURATION)}
            exiting={secureExiting.duration(BALANCE_DURATION)}
            onTouchStart={() => isTouched.set(true)}
            onTouchEnd={() => isTouched.set(false)}
            onLayout={() => isTouched.set(false)}
            onLongPress={handleLongPress}
            delayLongPress={LONG_PRESS_DELAY}
            style={tw`flex-row justify-center items-center`}
          >
            <Text type="2xl" weight="medium" color="#606A84" style={tw`text-center`}>
              {"••••••••"}
            </Text>
          </AnimatedPressable>
        )}
      </Animated.View>
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
  const { theme } = useTheme();
  const [openRow, setOpenRow] = useState<string | null>(null);
  const { formatAmount } = useCurrencyFormatter();
  const rootStore = useStores();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const analytics = useAnalytics();

  const queryClient = useQueryClient();
  const { data: balance } = useBalance();
  const { data: txResponse } = useRecentTransactions(5);
  const { data: profile } = useProfile();
  const deleteTransaction = useDeleteTransaction();

  const transactions = txResponse?.data ?? [];

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

  useEffect(() => {
    getCategories();
    getListAccount();
  }, [getCategories, getListAccount]);

  useEffect(() => {
    if (profile) {
      initializeUserAnalytics(analytics, rootStore);
    }
  }, [profile, analytics, rootStore]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.balance.all }),
      queryClient.refetchQueries({ queryKey: queryKeys.transactions.all }),
      queryClient.refetchQueries({ queryKey: queryKeys.profile.all }),
    ]);
    setIsRefreshing(false);
  }, [queryClient]);

  const firstName = (full_name || "").split(" ")[0];

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
            deleteTransaction.mutate(transactionId);
          },
        },
      ]
    );
  }, [deleteTransaction]);

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
          <Icon symbol="trash" size={24} color={colors.white} />
          <Text type="xs" weight="medium" color={colors.white} style={tw`mt-1`}>
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
        style={tw`bg-[#6934D226] dark:bg-[#6934D240] px-[17px] pt-[19px] pb-[15px] rounded-[18px] mb-6`}
      >
        <View style={tw`flex-row items-center justify-center`}>
          <Text type="sm" weight="light" color={theme.textPrimary} style={tw`text-center`}>
            {translate("homeScreen:balance")}
          </Text>
        </View>

        <View style={tw`mt-2 overflow-hidden`}>
          <BalanceDisplay
            isVisible={isBalanceVisible}
            onToggle={handleBalanceVisibilityToggle}
            formattedBalance={
              balance
                ? formatAmount(balance.total_balance)
                : formatAmount(0)
            }
          />
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
              <Text type="xs" weight="semibold" color={theme.textPrimary} style={tw`mt-1`} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [
    balance,
    formatAmount,
    navigateToTransaction,
    navigateToSelectBank,
    handleBalanceVisibilityToggle,
    isBalanceVisible,
    theme,
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

  const keyExtractorSwipe = useCallback((item: Transaction) => item.id, []);

  const onRowClose = useCallback(() => setOpenRow(null), []);

  const avatarSource = profile?.avatar_url
    ? { uri: profile.avatar_url }
    : require("@/assets/icons/kebo-profile.png");

  return (
    <>
      <Stack.Screen
        options={{
          title: translate("homeScreen:greetings", { full_name: firstName }),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleProfileNavigation}
              style={{ width: 32, height: 32, transform: [{ translateX: 2 }] }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 16, overflow: "hidden" }}>
                <Image
                  source={avatarSource}
                  style={{ width: 32, height: 32 }}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Animated.View entering={FadeIn.duration(600).delay(100)} style={tw`px-4 py-4`}>
          {renderBudgetCard()}
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text weight="semibold">
              {translate("homeScreen:titleTransaction")}
              <Text>💸👀</Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleSeeMoreTransactions();
              }}
            >
              <Text type="xs" weight="medium" color={colors.primary} style={tw`bg-[#6934D21A] px-2 py-1 rounded-2xl`}>
                {translate("homeScreen:seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <View
              style={tw`border border-[#EBEBEF] dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] p-6 rounded-[18px] items-center justify-center`}
            >
              <KeboSadIconSvg width={60} height={60} />
              <Text color={theme.textSecondary} style={tw`text-center`}>
                {translate("homeScreen:noTransactions")}
              </Text>
            </View>
          ) : (
            <View
              style={tw`border border-[#EBEBEF] dark:border-[#3A3A3C] bg-white dark:bg-[#1C1C1E] rounded-[18px] overflow-hidden`}
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
            <Text weight="semibold">
              Kebo Wise <Text>🐨🔎</Text>
            </Text>
          </View>
          <View style={tw`flex-row flex-wrap justify-between gap-3 mb-18`}>
            {keboWiseOptions.map(
              (option: { id: number; icon: JSX.Element; text: KeboWiseKeys }) => (
                <TouchableOpacity
                  key={option.id}
                  style={tw`items-center flex-col p-4 rounded-[20px] bg-[#606A84]/5 dark:bg-[#1C1C1E] w-[30%] mb-3`}
                  onPress={() => navigateToChatbot(option.text)}
                >
                  <View style={tw``}>{option.icon}</View>
                  <Text
                    type="xs"
                    weight="medium"
                    style={tw`mt-2 text-center text-[10px]`}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {translate(option.text)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </Animated.View>
      </ScrollView>
      <CustomModalReview
        visible={isReviewModalVisible}
        title={getModalTexts().title}
        message={getModalTexts().message}
        onConfirm={handleReviewConfirm}
        onCancel={handleReviewCancel}
        confirmText={getModalTexts().confirmText}
        cancelText={getModalTexts().cancelText}
      />
    </>
  );
});
