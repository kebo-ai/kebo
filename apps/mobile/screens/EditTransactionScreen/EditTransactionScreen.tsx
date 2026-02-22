import logger from "@/utils/logger";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Keyboard,
  InputAccessoryView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { Screen } from "@/components";
import CustomHeader from "@/components/common/CustomHeader";
import { useRouter, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import { translate } from "@/i18n";
import CustomSegmentedControl from "@/components/common/CustomSegmentedControl";
import CustomListItemOption from "@/components/common/CustomListItemOption";
import CustomButtonDisabled from "@/components/common/CustomButtonDisabled";
import CustomCategoryModal from "@/components/common/CustomCategoryModal";
import CustomModal from "@/components/common/CustomModal";
import { useStores } from "@/models/helpers/useStores";
import { InputAmount } from "@/components/InputAmount";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import i18n from "@/i18n/i18n";
import moment from "moment";
import RecurrenceModal from "@/components/common/CustomModal";
import CustomButton from "@/components/common/CustomButton";
import CustomBankModal from "@/components/common/CustomBankModal";
import { useFormik } from "formik";
import { showToast } from "@/components/ui/CustomToast";
import CurrencyInput from "react-native-currency-input";
import {
  currencyMap,
  useCurrencyFormatter,
} from "@/components/common/CurrencyFormatter";
import { TransactionService } from "@/services/TransactionService";
import { supabase } from "@/config/supabase";
import {
  RecurrenceCadenceEnum,
  TransactionType,
  RecurrenceType,
} from "@/types/transaction";
import { CategorySnapshotIn } from "@/models/category/category";
import { useTransactionDates } from "@/hooks/useTransactionDates";

interface EditTransactionScreenProps {}

const recurrenceDisplayMap: Record<RecurrenceType, string> = {
  [RecurrenceType.NEVER]: "editTransaction:never",
  [RecurrenceType.DAILY]: "editTransaction:daily",
  [RecurrenceType.WEEKLY]: "editTransaction:weekly",
  [RecurrenceType.MONTHLY]: "editTransaction:monthly",
  [RecurrenceType.YEARLY]: "editTransaction:yearly",
};

const recurrenceOptions = Object.values(recurrenceDisplayMap);

export const EditTransactionScreen: FC<EditTransactionScreenProps> = observer(
  function EditTransactionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
      transactionId: string;
      transactionType?: string;
      transaction?: string;
    }>();
    const transaction = params.transaction
      ? JSON.parse(params.transaction)
      : null;

    const [isCategoryModalVisible, setCategoryModalVisible] =
      useState<boolean>(false);
    const [isBankModalVisible, setBankModalVisible] = useState<boolean>(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] =
      useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isFromAccount, setIsFromAccount] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<
      CategorySnapshotIn | undefined
    >(undefined);

    const amountInputRef = useRef<CurrencyInput>(null);
    const { region } = useCurrencyFormatter();
    const inputAccessoryViewID = "uniqueID";

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

    const loadTransactionData = async () => {
      try {
        setIsLoading(true);
        logger.warn("transaction", transaction);
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

    const handleDateConfirm = (date: Date) => {
      const displayDate = moment(date)
        .locale(currentLocale)
        .format("dddd, D MMMM")
        .replace(/^\w/, (c) => c.toUpperCase());

      const selectedDateOnly = moment(date).format("YYYY-MM-DD");

      formik.setFieldValue("date", selectedDateOnly);
      formik.setFieldValue("displayDate", displayDate);
      setDatePickerVisibility(false);
    };

    const handleEndDateConfirm = (date: Date) => {
      const displayDate = moment(date)
        .locale(currentLocale)
        .format("dddd, D MMMM")
        .replace(/^\w/, (c) => c.toUpperCase());

      const backendDate = moment(date).format("YYYY-MM-DD HH:mm:ss.SSS Z");

      formik.setFieldValue("recurrence_end_date", backendDate);
      formik.setFieldValue("displayEndDate", displayDate);
      setEndDatePickerVisibility(false);
    };

    const mappedTransactionTypes = [
      TransactionType.EXPENSE,
      TransactionType.INCOME,
      TransactionType.TRANSFER,
    ];

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

    const { handleRecurrenceChange } = useTransactionDates(formik);

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

    const handleListItemPress = () => {
      Keyboard.dismiss();
    };

    // Determine which categories to show based on the current transaction type
    const categoriesForModal =
      transaction_type === "Income" ? incomeCategories : expenseCategories;

    const handleCloseRecurrenceModal = useCallback(() => {
      setModalVisible(false);
    }, [setModalVisible]);

    const handleConfirmDate = useCallback(
      (date: Date) => {
        handleListItemPress();
        handleDateConfirm(date);
      },
      [handleListItemPress, handleDateConfirm]
    );

    const handleOpenEndDatePicker = useCallback(() => {
      handleListItemPress();
      setEndDatePickerVisibility(true);
    }, [handleListItemPress, setEndDatePickerVisibility]);

    const handleCloseEndDatePicker = useCallback(() => {
      setEndDatePickerVisibility(false);
    }, [setEndDatePickerVisibility]);

    const handleConfirmEndDate = useCallback(
      (date: Date) => {
        handleEndDateConfirm(date);
      },
      [handleEndDateConfirm]
    );
    const handleCloseDatePicker = useCallback(() => {
      handleListItemPress();
      setDatePickerVisibility(false);
    }, [handleListItemPress, setDatePickerVisibility]);
    const handleSelectRecurrence = useCallback(
      (selected: string) => {
        const recurrenceValue = (
          Object.keys(recurrenceDisplayMap) as Array<
            keyof typeof recurrenceDisplayMap
          >
        ).find(
          (key) => translate(recurrenceDisplayMap[key] as any) === selected
        );

        if (recurrenceValue && recurrenceValue in recurrenceDisplayMap) {
          handleRecurrenceChange(recurrenceValue as RecurrenceType, translate);
        }
        setModalVisible(false);
      },
      [handleRecurrenceChange, setModalVisible, translate]
    );

    const getAccountDescription = useCallback(
      (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account?.customized_name || "";
      },
      [accounts]
    );

    if (isLoading) {
      return (
        <Screen
          safeAreaEdges={["top"]}
          preset="scroll"
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor={colors.primary}
        >
          <View style={tw`flex-1 justify-center items-center`}>
            <Text>{translate("editTransaction:loading")}</Text>
          </View>
        </Screen>
      );
    }

    return (
      <>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "#FAFAFA" }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <Screen
            safeAreaEdges={["top"]}
            preset="scroll"
            backgroundColor="#FAFAFA"
            statusBarBackgroundColor={colors.primary}
            header={
              <CustomHeader
                onPress={() => router.back()}
                title={translate("editTransaction:editTransaction")}
              />
            }
            contentContainerStyle={
              Platform.OS === "android" ? { paddingBottom: 70 } : undefined
            }
          >
            <View style={[tw`flex-1 p-6`]}>
              <View style={{ flex: 1 }}>
                <InputAmount
                  ref={amountInputRef}
                  value={amount.toString()}
                  onChange={(text) => {
                    const normalizedValue = text.replace(/[.,]/g, ".");

                    const numericValue = Number(normalizedValue);

                    if (!isNaN(numericValue) && numericValue <= 999999999) {
                      updateField("amount", numericValue);
                    }
                  }}
                  showSymbol={true}
                  currency={currencyMap[region] || "USD"}
                  inputAccessoryViewID={inputAccessoryViewID}
                />

                <View style={tw`mt-4 justify-center items-center`}>
                  <CustomSegmentedControl
                    selected={transaction_type}
                    onSelect={(option) => {
                      handleListItemPress();
                      const previousType = transaction_type;
                      updateField(
                        "transaction_type",
                        option as
                          | "Expense"
                          | "Income"
                          | "Transfer"
                          | "Investment"
                          | "Other"
                      );

                      if (option === "Expense") {
                        // If there are expense categories, select the first one
                        if (expenseCategories.length > 0) {
                          const firstExpenseCategory = expenseCategories[0];
                          updateField("category_id", firstExpenseCategory.id);
                          updateField(
                            "category_name",
                            firstExpenseCategory.name || ""
                          );
                          updateField(
                            "icon_url",
                            firstExpenseCategory.icon_url || ""
                          );
                        }
                        updateField("from_account_id", "");
                        updateField("to_account_id", "");
                      } else if (option === "Income") {
                        // If there are income categories, select the first one
                        if (incomeCategories.length > 0) {
                          const firstIncomeCategory = incomeCategories[0];
                          updateField("category_id", firstIncomeCategory.id);
                          updateField(
                            "category_name",
                            firstIncomeCategory.name || ""
                          );
                          updateField(
                            "icon_url",
                            firstIncomeCategory.icon_url || ""
                          );
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
                    }}
                    activeColor={`bg-[${colors.primary}]`}
                    inactiveColor={`bg-[${colors.bgClear}]`}
                    mappedValues={mappedTransactionTypes}
                    hiddenOptions={["Transfer"]}
                  />
                </View>
                <View style={tw`mt-11 justify-center items-center`}>
                  {transaction_type === "Transfer" ? (
                    <>
                      <CustomListItemOption
                        icon="accountToFrom"
                        label={translate("editTransaction:from")}
                        labelSelected={from_account_name}
                        iconSelected={from_account_url}
                        isImage={from_account_url ? true : false}
                        onPress={() => {
                          handleListItemPress();
                          setIsFromAccount(true);
                          setBankModalVisible(true);
                        }}
                      />
                      <CustomListItemOption
                        icon="accountToFrom"
                        label={translate("editTransaction:to")}
                        labelSelected={to_account_name}
                        iconSelected={to_account_url}
                        isImage={to_account_url ? true : false}
                        onPress={() => {
                          handleListItemPress();
                          setIsFromAccount(false);
                          setBankModalVisible(true);
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <CustomListItemOption
                        icon="category"
                        label={translate("editTransaction:category")}
                        labelSelected={category_name}
                        iconSelected={icon_url}
                        isEmoji={
                          !!(icon_url && !icon_url.startsWith("/storage/"))
                        }
                        onPress={() => {
                          handleListItemPress();
                          setCategoryModalVisible(true);
                        }}
                        categoryId={category_id}
                      />
                      <CustomListItemOption
                        icon="account"
                        label={translate("editTransaction:account")}
                        labelSelected={account_name}
                        iconSelected={account_url}
                        isImage={account_url ? true : false}
                        onPress={() => {
                          handleListItemPress();
                          setBankModalVisible(true);
                        }}
                        value={getAccountDescription(account_id)}
                      />
                    </>
                  )}
                  <CustomListItemOption
                    icon="note"
                    label={translate("editTransaction:note")}
                    showChevron={false}
                    onPress={() => {
                      handleListItemPress();
                      setCategoryModalVisible(true);
                    }}
                    inputValue={description}
                    setInputValue={(text) => updateField("description", text)}
                    returnKeyType="done"
                  />
                  <CustomListItemOption
                    icon="calendar"
                    label={translate("editTransaction:date")}
                    selectedDate={formik.values.displayDate}
                    onPress={() => {
                      handleListItemPress();
                      setDatePickerVisibility(true);
                    }}
                  />
                  <CustomListItemOption
                    icon="recurrence"
                    label={translate("editTransaction:recurrence")}
                    recurrenceSelected={
                      recurrenceDisplayMap[
                        formik.values.recurrence as RecurrenceType
                      ]
                    }
                    onPress={() => {
                      handleListItemPress();
                      setModalVisible(true);
                    }}
                  />
                  {formik.values.recurrence !== RecurrenceType.NEVER && (
                    <CustomListItemOption
                      icon="endDate"
                      label={translate("editTransaction:endDate")}
                      selectedDate={formik.values.displayEndDate}
                      onPress={() => {
                        handleListItemPress();
                        setEndDatePickerVisibility(true);
                      }}
                    />
                  )}
                </View>
              </View>
            </View>

            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID={inputAccessoryViewID}>
                <View
                  style={tw`bg-[#f8f8f8] border-t border-[#d8d8d8] p-2 items-end`}
                >
                  <TouchableOpacity
                    onPress={handleListItemPress}
                    style={tw`px-4 py-2`}
                  >
                    <Text
                      style={tw`text-[${colors.primary}] text-base font-medium`}
                    >
                      {translate("editTransaction:ready")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}

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

            <DateTimePickerModal
              locale={i18n.language.startsWith("es") ? "es" : "en"}
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={handleCloseDatePicker}
              confirmTextIOS={translate("transactionScreen:confirm")}
              cancelTextIOS={translate("transactionScreen:cancel")}
            />

            <DateTimePickerModal
              locale={i18n.language.startsWith("es") ? "es" : "en"}
              isVisible={isEndDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmEndDate}
              onCancel={handleCloseEndDatePicker}
              confirmTextIOS={translate("transactionScreen:confirm")}
              cancelTextIOS={translate("transactionScreen:cancel")}
            />

            <CustomModal
              visible={modalVisible}
              onClose={handleCloseRecurrenceModal}
              onSelect={handleSelectRecurrence}
              selectedValue={translate(
                recurrenceDisplayMap[formik.values.recurrence] as any
              )}
              data={Object.values(recurrenceDisplayMap).map((value) => ({
                label: translate(value as any),
                value: value,
              }))}
              title={translate("transactionScreen:selectRecurrence")}
            />
          </Screen>
          <CustomButton
            variant="primary"
            isEnabled={
              amount !== 0 &&
              !!formik.values.date &&
              (transaction_type === "Transfer"
                ? !!from_account_name && !!to_account_name
                : !!category_id && !!account_name) &&
              (formik.values.recurrence !== RecurrenceType.NEVER
                ? !!formik.values.recurrence_end_date
                : true)
            }
            onPress={formik.handleSubmit}
            title={translate("editTransaction:update")}
            adaptToKeyboard={true}
          />
        </KeyboardAvoidingView>
      </>
    );
  }
);
