import logger from "@/utils/logger";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Keyboard,
} from "react-native";
import { PressableScale } from "pressto";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { observer } from "mobx-react-lite";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { translate } from "@/i18n";
import { useStores } from "@/models/helpers/useStores";
import { useTheme } from "@/hooks/useTheme";
import { useShakeAnimation } from "@/hooks/useShakeAnimation";
import { useNumberEntry } from "@/hooks/useNumberEntry";
import { colors } from "@/theme/colors";
import { Text } from "@/components/ui";
import { CalendarPicker } from "@/components/common/CalendarPicker";
import CustomBankModal from "@/components/common/CustomBankModal";
import CustomCategoryModal from "@/components/common/CustomCategoryModal";
import CustomModal from "@/components/common/CustomModal";
import {
  TransactionType,
  recurrenceDisplayMap,
  recurrenceDisplayValueMap,
  RecurrenceType,
  RecurrenceCadenceEnum,
} from "@/types/transaction";
import { useFormik } from "formik";
import { showToast } from "@/components/ui/CustomToast";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { TransactionService } from "@/services/TransactionService";
import { useTransactionDates } from "@/hooks/useTransactionDates";
import { CategorySnapshotIn } from "@/models/category/category";
import { useSharedValue } from "react-native-reanimated";
import i18n from "@/i18n/i18n";
import moment from "moment";

import { NumberPad } from "@/components/transaction/NumberPad";
import { AmountDisplay } from "@/components/transaction/AmountDisplay";
import { TransactionTypeToggle } from "@/components/transaction/TransactionTypeToggle";
import { TransactionFieldRow } from "@/components/transaction/TransactionFieldRow";

interface EditTransactionScreenProps {}

export const EditTransactionScreen: FC<EditTransactionScreenProps> = observer(
  function EditTransactionScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { decimalSeparator } = useCurrencyFormatter();
    const params = useLocalSearchParams<{
      transactionId: string;
      transactionType?: string;
      transaction?: string;
    }>();
    const transaction = params.transaction
      ? JSON.parse(params.transaction)
      : null;

    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [isBankModalVisible, setBankModalVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isFromAccount, setIsFromAccount] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<
      CategorySnapshotIn | undefined
    >(undefined);

    const {
      categoryStoreModel: {
        getCategories,
        expenseCategories,
        incomeCategories,
        getInitialCategory,
      },
      transactionModel: {
        updateField,
        setSelectedCategory,
        setSelectedAccount,
        setSelectedFromAccount,
        setSelectedToAccount,
        category_name,
        icon_url,
        account_name,
        account_url,
        from_account_name,
        from_account_url,
        to_account_name,
        to_account_url,
        transaction_type,
        amount,
        description,
        category_id,
        from_account_id,
        to_account_id,
        account_id,
        setEditingMode,
      },
      bankStoreModel: { getListBanks },
      accountStoreModel: { getListAccountType, getListAccount, accounts },
      uiStoreModel: { showLoader, hideLoader },
    } = useStores();

    const currentLocale = i18n.language.startsWith("es") ? "es" : "en";

    // --- Number entry ---
    const numberEntry = useNumberEntry(2);

    // --- Shake animations ---
    const amountShake = useShakeAnimation();
    const categoryShake = useShakeAnimation();
    const accountShake = useShakeAnimation();

    // --- Tab transition shared values ---
    const activeTabIndex = useSharedValue(0);
    const prevActiveTabIndex = useSharedValue(0);

    // Sync number entry → MST amount
    useEffect(() => {
      updateField("amount", numberEntry.amountInCents / 100);
    }, [numberEntry.amountInCents, updateField]);

    const formik = useFormik({
      initialValues: {
        account: "",
        date: moment().format("YYYY-MM-DD HH:mm:ss.SSS Z"),
        displayDate: moment()
          .locale(currentLocale)
          .format("dddd, D MMMM")
          .replace(/^\w/, (c) => c.toUpperCase()),
        recurrence: RecurrenceType.NEVER,
        recurrence_cadence: RecurrenceCadenceEnum.NEVER,
        recurrence_end_date: "",
        displayEndDate: "",
        note: "",
      },
      onSubmit: async (values, { resetForm }) => {
        try {
          showLoader();
          const selectedDateMoment = moment(values.date);
          const originalDate = moment(transaction?.date);
          let formattedDate;

          if (selectedDateMoment.isValid()) {
            const datePart = selectedDateMoment.format("YYYY-MM-DD");
            const timePart = originalDate.format("HH:mm:ss.SSS Z");
            formattedDate = `${datePart} ${timePart}`;
          } else {
            formattedDate = originalDate.format("YYYY-MM-DD HH:mm:ss.SSS Z");
          }

          const result = await TransactionService.updateTransaction(
            params.transactionId!,
            {
              amount: amount,
              description: description,
              date: formattedDate,
              transaction_type: transaction_type as
                | "Expense"
                | "Income"
                | "Transfer",
              category_id: category_id || undefined,
              account_id:
                transaction_type === "Transfer"
                  ? undefined
                  : account_id || undefined,
              from_account_id: from_account_id || undefined,
              to_account_id: to_account_id || undefined,
              is_recurring: values.recurrence !== RecurrenceType.NEVER,
              recurrence_cadence: values.recurrence_cadence,
              recurrence_end_date: values.recurrence_end_date,
              metadata: { note: values.note },
            }
          );

          if (result) {
            router.back();
            showToast(
              "success",
              translate("editTransaction:successMessageEdit")
            );
          } else {
            showToast(
              "error",
              translate("transactionScreen:errorMessageTransaction")
            );
          }
          updateField("amount", 0);
        } catch (error) {
          logger.error("Error updating transaction:", error);
          showToast(
            "error",
            translate("transactionScreen:errorMessageTransaction")
          );
        } finally {
          resetForm();
          hideLoader();
        }
      },
    });

    const { handleRecurrenceChange } = useTransactionDates(formik);

    const loadTransactionData = async () => {
      try {
        setIsLoading(true);
        if (transaction) {
          updateField("Transaction_id", params.transactionId);
          updateField(
            "transaction_type",
            transaction.transaction_type as
              | "Expense"
              | "Income"
              | "Transfer"
              | "Investment"
              | "Other"
          );
          updateField("amount", Number(transaction.amount.toFixed(2)));
          updateField("description", transaction.description || "");
          updateField("category_id", transaction.category_id || "");
          updateField("category_name", transaction.category_name || "");
          updateField("icon_url", transaction.category_icon_url || "");
          updateField("account_id", transaction.account_id || "");
          updateField("account_name", transaction.account_name || "");
          updateField("account_url", transaction.bank_url || "");
          updateField("from_account_id", transaction.from_account_id || "");
          updateField("from_account_name", transaction.from_account_name || "");
          updateField("from_account_url", transaction.from_account_url || "");
          updateField("to_account_id", transaction.to_account_id || "");
          updateField("to_account_name", transaction.to_account_name || "");
          updateField("to_account_url", transaction.to_account_url || "");

          // Initialize number entry with the transaction amount
          const cents = Math.round(Number(transaction.amount.toFixed(2)) * 100);
          numberEntry.setFromCents(cents);

          formik.setValues({
            account: transaction.account_id || "",
            date: transaction.date,
            displayDate: moment(transaction.date)
              .locale(currentLocale)
              .format("dddd, D MMMM")
              .replace(/^\w/, (c) => c.toUpperCase()),
            recurrence: transaction.is_recurring
              ? transaction.recurrence_cadence
              : RecurrenceType.NEVER,
            recurrence_cadence:
              transaction.recurrence_cadence || RecurrenceCadenceEnum.NEVER,
            recurrence_end_date: transaction.recurrence_end_date || "",
            displayEndDate: transaction.recurrence_end_date
              ? moment(transaction.recurrence_end_date)
                  .format("dddd, D MMMM YYYY")
                  .replace(/^\w/, (c) => c.toUpperCase())
              : "",
            note: transaction.metadata?.note || "",
          });
        }
      } catch (error) {
        logger.error("Error loading transaction:", error);
        showToast(
          "error",
          translate("editTransaction:errorLoadingTransaction")
        );
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      loadTransactionData();
      getListBanks();
      getListAccountType();
      getListAccount();
    }, [params.transactionId]);

    useEffect(() => {
      setEditingMode(true);
      return () => {
        setEditingMode(false);
      };
    }, []);

    useEffect(() => {
      if (transaction_type === "Transfer") {
        const categoryInitial = getInitialCategory();
        updateField("category_id", categoryInitial?.id || "");
      }
    }, [transaction_type]);

    useEffect(() => {
      if (selectedCategoryForModal) {
        updateField("category_id", selectedCategoryForModal.id);
        updateField("category_name", selectedCategoryForModal.name || "");
        updateField("icon_url", selectedCategoryForModal.icon_url || "");
        formik.setFieldValue("category", selectedCategoryForModal.id);
      }
    }, [selectedCategoryForModal]);

    // --- Transaction type ---
    const mappedTransactionTypes = [
      TransactionType.EXPENSE,
      TransactionType.INCOME,
      TransactionType.TRANSFER,
    ];

    const handleTypeChange = useCallback(
      (option: string) => {
        const previousType = transaction_type;
        updateField(
          "transaction_type",
          option as "Expense" | "Income" | "Transfer" | "Investment" | "Other"
        );

        if (option === "Expense") {
          if (expenseCategories.length > 0) {
            const first = expenseCategories[0];
            updateField("category_id", first.id);
            updateField("category_name", first.name || "");
            updateField("icon_url", first.icon_url || "");
          }
          updateField("from_account_id", "");
          updateField("to_account_id", "");
        } else if (option === "Income") {
          if (incomeCategories.length > 0) {
            const first = incomeCategories[0];
            updateField("category_id", first.id);
            updateField("category_name", first.name || "");
            updateField("icon_url", first.icon_url || "");
          }
          updateField("from_account_id", "");
          updateField("to_account_id", "");
        } else if (option === "Transfer") {
          updateField("category_id", "");
          updateField("category_name", "");
          updateField("icon_url", "");
        }

        if (previousType === "Transfer") {
          updateField("from_account_id", "");
          updateField("to_account_id", "");
        }
      },
      [transaction_type, expenseCategories, incomeCategories, updateField]
    );

    // --- Categories ---
    const categoriesForModal = useMemo(
      () =>
        transaction_type === "Income" ? incomeCategories : expenseCategories,
      [transaction_type, incomeCategories, expenseCategories]
    );

    const categoryDisplay = useMemo(() => {
      if (!category_name) return undefined;
      return category_name;
    }, [category_name]);

    const categoryEmoji = useMemo(() => {
      if (!icon_url || icon_url.startsWith("/storage/")) return undefined;
      return icon_url;
    }, [icon_url]);

    // --- Account description helper ---
    const getAccountDescription = useCallback(
      (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account?.customized_name || "";
      },
      [accounts]
    );

    // --- Description ---
    const handleDescriptionChange = useCallback(
      (text: string) => {
        updateField("description", text);
      },
      [updateField]
    );

    // --- Modal handlers ---
    const handleOpenCategoryModal = useCallback(() => {
      Keyboard.dismiss();
      setCategoryModalVisible(true);
    }, []);

    const handleOpenBankModal = useCallback(
      (isFrom: boolean | undefined = undefined) => {
        Keyboard.dismiss();
        if (isFrom !== undefined) setIsFromAccount(isFrom);
        setBankModalVisible(true);
      },
      []
    );

    const handleOpenDatePicker = useCallback(() => {
      Keyboard.dismiss();
      setDatePickerVisibility(true);
    }, []);

    const handleOpenEndDatePicker = useCallback(() => {
      Keyboard.dismiss();
      setEndDatePickerVisibility(true);
    }, []);

    const handleOpenRecurrenceModal = useCallback(() => {
      Keyboard.dismiss();
      setModalVisible(true);
    }, []);

    const handleDateConfirm = useCallback(
      (date: Date) => {
        const displayDate = moment(date)
          .locale(currentLocale)
          .format("dddd, D MMMM")
          .replace(/^\w/, (c) => c.toUpperCase());
        const selectedDateOnly = moment(date).format("YYYY-MM-DD");
        formik.setFieldValue("date", selectedDateOnly);
        formik.setFieldValue("displayDate", displayDate);
        setDatePickerVisibility(false);
      },
      [currentLocale]
    );

    const handleEndDateConfirm = useCallback(
      (date: Date) => {
        const displayDate = moment(date)
          .locale(currentLocale)
          .format("dddd, D MMMM")
          .replace(/^\w/, (c) => c.toUpperCase());
        const backendDate = moment(date).format("YYYY-MM-DD HH:mm:ss.SSS Z");
        formik.setFieldValue("recurrence_end_date", backendDate);
        formik.setFieldValue("displayEndDate", displayDate);
        setEndDatePickerVisibility(false);
      },
      [currentLocale]
    );

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
      [handleRecurrenceChange]
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

    if (isLoading) {
      return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <Stack.Screen
            options={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
            }}
          />
          <View style={styles.loadingContainer}>
            <Text color={theme.textPrimary}>
              {translate("editTransaction:loading")}
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        {/* Header */}
        <View style={styles.header}>
          <PressableScale
            onPress={() => router.back()}
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

        {/* Amount display */}
        <AmountDisplay
          entryType={numberEntry.entryType}
          amountInCents={numberEntry.amountInCents}
          wholePart={numberEntry.wholePart}
          decimalSuffix={numberEntry.decimalSuffix}
          onBackspace={numberEntry.handleBackspace}
          shakeOffset={amountShake.offset}
        />

        {/* Note */}
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

        {/* Account row */}
        <View style={styles.bottomRow}>
          {transaction_type === "Transfer" ? (
            <>
              <View style={styles.dateCell}>
                <TransactionFieldRow
                  icon="swap-horizontal-outline"
                  label={translate("editTransaction:from")}
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
                  label={translate("editTransaction:to")}
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
                label={translate("editTransaction:account")}
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

        {/* Recurrence row */}
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
          <View
            style={
              formik.values.recurrence !== "Never"
                ? styles.categoryCell
                : { flex: 1 }
            }
          >
            <TransactionFieldRow
              icon="repeat-outline"
              label={translate("editTransaction:recurrence")}
              value={translate(
                recurrenceDisplayMap[formik.values.recurrence] as any
              )}
              onPress={handleOpenRecurrenceModal}
              showChevron={false}
            />
          </View>
        </View>

        {/* Date & Category row */}
        <View style={styles.bottomRow}>
          <View style={styles.dateCell}>
            <TransactionFieldRow
              icon="calendar-outline"
              label={translate("editTransaction:date")}
              value={formik.values.displayDate}
              onPress={handleOpenDatePicker}
              showChevron={false}
            />
          </View>
          {transaction_type !== "Transfer" && (
            <View style={styles.categoryCell}>
              <TransactionFieldRow
                icon="folder-outline"
                label={translate("editTransaction:category")}
                value={categoryDisplay}
                emoji={categoryEmoji}
                onPress={handleOpenCategoryModal}
                shakeOffset={categoryShake.offset}
                showChevron={false}
              />
            </View>
          )}
        </View>

        {/* Number pad */}
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
          onClose={() => setBankModalVisible(false)}
          onSelect={(selected: {
            id: string;
            name?: string;
            icon_url?: string;
          }) => {
            Keyboard.dismiss();
            if (transaction_type === "Transfer") {
              if (isFromAccount) {
                setSelectedFromAccount(selected);
                formik.setFieldValue("from_account", selected.id);
              } else {
                setSelectedToAccount(selected);
                formik.setFieldValue("to_account", selected.id);
              }
            } else {
              setSelectedAccount(selected);
              formik.setFieldValue("account", selected.id);
            }
            setBankModalVisible(false);
          }}
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
          screenName="EditTransaction"
        />

        <CustomCategoryModal
          categories={categoriesForModal}
          visible={isCategoryModalVisible}
          onClose={() => setCategoryModalVisible(false)}
          onSelect={setSelectedCategoryForModal}
          screenName="EditTransaction"
        />

        <CalendarPicker
          isVisible={isDatePickerVisible}
          onDateChange={handleDateConfirm}
          onClose={() => setDatePickerVisibility(false)}
        />

        <CalendarPicker
          isVisible={isEndDatePickerVisible}
          onDateChange={handleEndDateConfirm}
          onClose={() => setEndDatePickerVisibility(false)}
          title={translate("transactionScreen:recurrenceEndHint")}
        />

        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={handleSelectRecurrence}
          isRecurrence={true}
          selectedValue={translate(
            recurrenceDisplayMap[formik.values.recurrence] as any
          )}
          data={Object.values(recurrenceDisplayMap).map((value) => ({
            label: value,
            value: value,
          }))}
          title={translate("transactionScreen:selectRecurrence")}
        />
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
