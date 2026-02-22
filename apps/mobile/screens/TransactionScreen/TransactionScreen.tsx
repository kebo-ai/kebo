import React, { FC, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableScale } from "pressto";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { observer } from "mobx-react-lite";
import { translate } from "@/i18n";
import { useStores } from "@/models/helpers/use-stores";
import { useTheme } from "@/hooks/useTheme";
import { useShakeAnimation } from "@/hooks/useShakeAnimation";
import { useHighlightAnimation } from "@/hooks/useHighlightAnimation";
import { useNumberEntry } from "@/hooks/useNumberEntry";
import { colors } from "@/theme/colors";
import { CalendarPicker } from "@/components/common/CalendarPicker";
import CustomBankModal from "@/components/common/CustomBankModal";
import CustomCategoryModal from "@/components/common/CustomCategoryModal";
import CustomModal from "@/components/common/CustomModal";
import {
  TransactionType,
  TransactionScreenProps,
  recurrenceDisplayMap,
  recurrenceDisplayValueMap,
  RecurrenceType,
} from "@/types/transaction";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useTransactionDates } from "@/hooks/useTransactionDates";
import { useTransactionType } from "@/hooks/useTransactionType";
import { useTransactionModals } from "@/hooks/useTransactionModals";
import { RootStore } from "@/models/root-store";
import { ITransaction } from "@/models/transaction/transaction";
import i18n from "@/i18n/i18n";
import logger from "@/utils/logger";

import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { NumberPad } from "@/components/transaction/NumberPad";
import { AmountDisplay } from "@/components/transaction/AmountDisplay";
import { TransactionTypeToggle } from "@/components/transaction/TransactionTypeToggle";
import { TransactionFieldRow } from "@/components/transaction/TransactionFieldRow";
import { useSharedValue } from "react-native-reanimated";

export const TransactionScreen: FC<TransactionScreenProps> = observer(
  function TransactionScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { decimalSeparator } = useCurrencyFormatter();

    const rootStore = useStores() as RootStore;
    const {
      transactionModel,
      categoryStoreModel: { expenseCategories, incomeCategories },
      accountStoreModel: { accounts },
    } = rootStore;

    const {
      updateField,
      category_name,
      icon_url,
      account_name,
      account_url,
      from_account_name,
      from_account_url,
      to_account_name,
      to_account_url,
      category_id,
      amount,
      description,
      resetForNewTransaction,
      account_id,
    } = transactionModel as ITransaction;

    const formik = useTransactionForm(navigation);
    const {
      isDatePickerVisible,
      setDatePickerVisibility,
      isEndDatePickerVisible,
      setEndDatePickerVisibility,
      handleDateConfirm,
      handleEndDateConfirm,
      handleRecurrenceChange,
    } = useTransactionDates(formik);

    const { handleTransactionTypeChange, transaction_type } =
      useTransactionType(route);

    const {
      isCategoryModalVisible,
      setCategoryModalVisible,
      isBankModalVisible,
      setBankModalVisible,
      modalVisible,
      setModalVisible,
      isFromAccount,
      setIsFromAccount,
      handleBankModalSelect,
      handleCategoryModalSelect,
      from_account_id,
      to_account_id,
    } = useTransactionModals(formik, {
      transaction_type: transaction_type as TransactionType,
    });

    // --- Number entry (Mode 2 = cent-less, default) ---
    const numberEntry = useNumberEntry(2);

    // Sync number entry → MST amount
    useEffect(() => {
      updateField("amount", numberEntry.amountInCents / 100);
    }, [numberEntry.amountInCents, updateField]);

    // Sync MST amount → number entry on initial load / edit
    useEffect(() => {
      if (route.params?.transactionId && amount > 0) {
        numberEntry.setFromCents(Math.round(amount * 100));
      }
    }, [route.params?.transactionId]);

    // Reset for new transaction on focus
    useEffect(() => {
      if (
        route.params?.transactionType &&
        !route.params?.transactionId &&
        !route.params?.fromCategoryScreen
      ) {
        const typeToReset = route.params.transactionType;
        logger.debug("[TransactionScreen] Resetting for new type:", typeToReset);
        updateField("amount", 0);
        resetForNewTransaction(typeToReset);
        numberEntry.reset();
      }
    }, [route.params?.transactionType]);

    // --- Shake animations ---
    const amountShake = useShakeAnimation();
    const categoryShake = useShakeAnimation();
    const accountShake = useShakeAnimation();

    // --- Category highlight animation ---
    const categoryHighlight = useHighlightAnimation();
    const prevCategoryId = useRef(category_id);

    useEffect(() => {
      if (category_id && category_id !== prevCategoryId.current) {
        categoryHighlight.highlight();
      }
      prevCategoryId.current = category_id;
    }, [category_id]);

    // --- Tab transition shared values (fuse-home-tabs-transition-animation) ---
    const activeTabIndex = useSharedValue(0);
    const prevActiveTabIndex = useSharedValue(0);

    // --- Transaction type options ---
    const mappedTransactionTypes = [
      TransactionType.EXPENSE,
      TransactionType.INCOME,
      TransactionType.TRANSFER,
    ];

    const handleTypeChange = useCallback(
      (option: string) => {
        handleTransactionTypeChange(option as TransactionType);
      },
      [handleTransactionTypeChange],
    );

    // --- Categories ---
    const categoriesForModal = useMemo(() => {
      return transaction_type === "Income"
        ? incomeCategories
        : expenseCategories;
    }, [transaction_type, incomeCategories, expenseCategories]);

    const handleOpenCategoryModal = useCallback(() => {
      Keyboard.dismiss();
      setCategoryModalVisible(true);
    }, [setCategoryModalVisible]);

    const handleCloseCategoryModal = useCallback(() => {
      setCategoryModalVisible(false);
    }, [setCategoryModalVisible]);

    const handleSelectCategory = useCallback(
      (selected: any) => {
        handleCategoryModalSelect(selected);
      },
      [handleCategoryModalSelect],
    );

    // --- Bank modal ---
    const handleOpenBankModal = useCallback(
      (isFrom: boolean | undefined = undefined) => {
        Keyboard.dismiss();
        if (isFrom !== undefined) {
          setIsFromAccount(isFrom);
        }
        setBankModalVisible(true);
      },
      [setIsFromAccount, setBankModalVisible],
    );

    const handleCloseBankModal = useCallback(() => {
      setBankModalVisible(false);
    }, [setBankModalVisible]);

    const handleSelectBank = useCallback(
      (selected: any) => {
        handleBankModalSelect(selected);
      },
      [handleBankModalSelect],
    );

    // --- Date / recurrence ---
    const handleOpenDatePicker = useCallback(() => {
      Keyboard.dismiss();
      setDatePickerVisibility(true);
    }, [setDatePickerVisibility]);

    const handleCloseDatePicker = useCallback(() => {
      setDatePickerVisibility(false);
    }, [setDatePickerVisibility]);

    const handleConfirmDate = useCallback(
      (date: Date) => {
        handleDateConfirm(date);
      },
      [handleDateConfirm],
    );

    const handleOpenEndDatePicker = useCallback(() => {
      Keyboard.dismiss();
      setEndDatePickerVisibility(true);
    }, [setEndDatePickerVisibility]);

    const handleCloseEndDatePicker = useCallback(() => {
      setEndDatePickerVisibility(false);
    }, [setEndDatePickerVisibility]);

    const handleConfirmEndDate = useCallback(
      (date: Date) => {
        handleEndDateConfirm(date);
      },
      [handleEndDateConfirm],
    );

    const handleOpenRecurrenceModal = useCallback(() => {
      Keyboard.dismiss();
      setModalVisible(true);
    }, [setModalVisible]);

    const handleCloseRecurrenceModal = useCallback(() => {
      setModalVisible(false);
    }, [setModalVisible]);

    const handleSelectRecurrence = useCallback(
      (selected: string) => {
        const recurrenceValue = recurrenceDisplayValueMap[selected];
        if (recurrenceValue && recurrenceValue in recurrenceDisplayMap) {
          handleRecurrenceChange(recurrenceValue as RecurrenceType, translate);
          if (recurrenceValue !== "Never") {
            setTimeout(() => setEndDatePickerVisibility(true), 400);
          }
        }
        setModalVisible(false);
      },
      [handleRecurrenceChange, setModalVisible, setEndDatePickerVisibility],
    );

    const handleDescriptionChange = useCallback(
      (text: string) => {
        updateField("description", text);
      },
      [updateField],
    );

    // --- Account description helper ---
    const getAccountDescription = useCallback(
      (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account?.customized_name || "";
      },
      [accounts],
    );

    // --- Submit with validation ---
    const handleSubmitWithValidation = useCallback(() => {
      let hasError = false;

      if (numberEntry.amountInCents < 1) {
        amountShake.shake();
        hasError = true;
      }

      if (transaction_type !== "Transfer" && !category_id) {
        categoryShake.shake();
        hasError = true;
      }

      if (transaction_type === "Transfer") {
        if (!from_account_id || !to_account_id) {
          accountShake.shake();
          hasError = true;
        }
      } else if (!account_id) {
        accountShake.shake();
        hasError = true;
      }

      if (hasError) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      formik.handleSubmit();
    }, [
      numberEntry.amountInCents,
      transaction_type,
      category_id,
      from_account_id,
      to_account_id,
      account_id,
      amountShake,
      categoryShake,
      accountShake,
      formik,
    ]);

    // --- Category display for the field row ---
    const categoryDisplay = useMemo(() => {
      if (!category_name) return undefined;
      return category_name;
    }, [category_name]);

    const categoryEmoji = useMemo(() => {
      if (!icon_url || icon_url.startsWith("/storage/")) return undefined;
      return icon_url;
    }, [icon_url]);

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <PressableScale
            onPress={() => navigation.navigate("Home")}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </PressableScale>

          <View style={styles.toggleContainer}>
            <TransactionTypeToggle
              selected={transaction_type}
              onSelect={handleTypeChange}
              options={mappedTransactionTypes}
              activeIndex={activeTabIndex}
              prevActiveIndex={prevActiveTabIndex}
            />
          </View>

          <View style={styles.closeButton} />
        </View>

        {/* Amount display — flex fills space between toggle and note */}
        <AmountDisplay
          entryType={numberEntry.entryType}
          amountInCents={numberEntry.amountInCents}
          wholePart={numberEntry.wholePart}
          decimalSuffix={numberEntry.decimalSuffix}
          onBackspace={numberEntry.handleBackspace}
          shakeOffset={amountShake.offset}
        />

        {/* Note — above accounts */}
        <View style={styles.noteContainer}>
          <TransactionFieldRow
            icon="create-outline"
            label={translate("transactionScreen:note")}
            isNote
            noteValue={description}
            onNoteChange={handleDescriptionChange}
            showChevron={false}
          />
        </View>

        {/* Account row — pinned above recurrence */}
        <View style={styles.bottomRow}>
          {transaction_type === "Transfer" ? (
            <>
              <View style={styles.dateCell}>
                <TransactionFieldRow
                  icon="swap-horizontal-outline"
                  label={translate("transactionScreen:from")}
                  value={
                    from_account_name
                      ? `${from_account_name}${getAccountDescription(from_account_id) ? ` · ${getAccountDescription(from_account_id)}` : ""}`
                      : undefined
                  }
                  imageUrl={from_account_url || undefined}
                  onPress={() => handleOpenBankModal(true)}
                  shakeOffset={accountShake.offset}
                  showChevron={false}
                />
              </View>
              <View style={styles.categoryCell}>
                <TransactionFieldRow
                  icon="swap-horizontal-outline"
                  label={translate("transactionScreen:to")}
                  value={
                    to_account_name
                      ? `${to_account_name}${getAccountDescription(to_account_id) ? ` · ${getAccountDescription(to_account_id)}` : ""}`
                      : undefined
                  }
                  imageUrl={to_account_url || undefined}
                  onPress={() => handleOpenBankModal(false)}
                  shakeOffset={accountShake.offset}
                  showChevron={false}
                />
              </View>
            </>
          ) : (
            <View style={{ flex: 1 }}>
              <TransactionFieldRow
                icon="wallet-outline"
                label={translate("transactionScreen:account")}
                value={
                  account_name
                    ? `${account_name}${getAccountDescription(account_id) ? ` · ${getAccountDescription(account_id)}` : ""}`
                    : undefined
                }
                imageUrl={account_url || undefined}
                onPress={() => handleOpenBankModal()}
                shakeOffset={accountShake.offset}
                showChevron={false}
              />
            </View>
          )}
        </View>

        {/* Recurrence row — pinned above date & category */}
        <View style={styles.bottomRow}>
          {formik.values.recurrence !== "Never" && (
            <View style={styles.dateCell}>
              <TransactionFieldRow
                icon="calendar-outline"
                label={translate("transactionScreen:endDate")}
                value={formik.values.displayEndDate}
                onPress={handleOpenEndDatePicker}
                showChevron={false}
              />
            </View>
          )}
          <View style={formik.values.recurrence !== "Never" ? styles.categoryCell : { flex: 1 }}>
            <TransactionFieldRow
              icon="repeat-outline"
              label={translate("transactionScreen:recurrence")}
              value={translate(
                recurrenceDisplayMap[formik.values.recurrence] as any,
              )}
              onPress={handleOpenRecurrenceModal}
              showChevron={false}
            />
          </View>
        </View>

        {/* Date & Category row — pinned above number pad */}
        <View style={styles.bottomRow}>
          <View style={styles.dateCell}>
            <TransactionFieldRow
              icon="calendar-outline"
              label={translate("transactionScreen:date")}
              value={formik.values.displayDate}
              onPress={handleOpenDatePicker}
              showChevron={false}
            />
          </View>
          <View style={styles.categoryCell}>
            <TransactionFieldRow
              icon="folder-outline"
              label={translate("transactionScreen:category")}
              value={categoryDisplay}
              emoji={categoryEmoji}
              onPress={handleOpenCategoryModal}
              shakeOffset={categoryShake.offset}
              highlightProgress={categoryHighlight.progress}
              highlightScale={categoryHighlight.scale}
              showChevron={false}
            />
          </View>
        </View>

        {/* Number pad — always pinned at bottom */}
        <NumberPad
          entryType={numberEntry.entryType}
          decimalSeparator={decimalSeparator}
          onDigit={numberEntry.handleDigit}
          onBackspace={numberEntry.handleBackspace}
          onDecimal={numberEntry.handleDecimal}
          onSubmit={handleSubmitWithValidation}
        />

        {/* Modals */}
        <CustomBankModal
          visible={isBankModalVisible}
          onClose={handleCloseBankModal}
          onSelect={handleSelectBank}
          selectedBank={
            transaction_type === "Transfer"
              ? isFromAccount
                ? from_account_id
                : to_account_id
              : account_id
          }
          isTransfer={transaction_type === "Transfer"}
          transferType={isFromAccount ? "from" : "to"}
          otherAccountId={isFromAccount ? to_account_id : from_account_id}
          screenName="Transaction"
        />

        <CustomCategoryModal
          categories={categoriesForModal}
          visible={isCategoryModalVisible}
          onClose={handleCloseCategoryModal}
          onSelect={handleSelectCategory}
          navigation={navigation}
          screenName="Transaction"
        />

        <CalendarPicker
          isVisible={isDatePickerVisible}
          onDateChange={handleConfirmDate}
          onClose={handleCloseDatePicker}
        />

        <CalendarPicker
          isVisible={isEndDatePickerVisible}
          onDateChange={handleConfirmEndDate}
          onClose={handleCloseEndDatePicker}
          title={translate("transactionScreen:recurrenceEndHint")}
        />

        <CustomModal
          visible={modalVisible}
          onClose={handleCloseRecurrenceModal}
          onSelect={handleSelectRecurrence}
          isRecurrence={true}
          selectedValue={translate(
            recurrenceDisplayMap[formik.values.recurrence] as any,
          )}
          data={Object.values(recurrenceDisplayMap).map((value) => ({
            label: value,
            value: value,
          }))}
          title={translate("transactionScreen:selectRecurrence")}
        />
      </SafeAreaView>
    );
  },
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  noteContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bottomRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  dateCell: {
    flex: 6,
  },
  categoryCell: {
    flex: 4,
  },
});
