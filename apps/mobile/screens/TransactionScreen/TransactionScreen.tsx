import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  InputAccessoryView,
  Platform,
  TextInput,
  InteractionManager,
  KeyboardAvoidingView,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { Screen } from "@/components";
import CustomHeader from "@/components/common/CustomHeader";
import { observer } from "mobx-react-lite";
import { translate } from "@/i18n";
import CustomSegmentedControl from "@/components/common/CustomSegmentedControl";
import CustomListItemOption from "@/components/common/CustomListItemOption";
import CustomButton from "@/components/common/CustomButton";
import CustomCategoryModal from "@/components/common/CustomCategoryModal";
import { useStores } from "@/models/helpers/useStores";
import { InputAmount } from "@/components/InputAmount";
import logger from "@/utils/logger";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomBankModal from "@/components/common/CustomBankModal";
import CustomModal from "@/components/common/CustomModal";
import {
  useCurrencyFormatter,
  currencyMap,
} from "@/components/common/CurrencyFormatter";
import {
  TransactionType,
  TransactionScreenProps,
  recurrenceDisplayMap,
  recurrenceDisplayValueMap,
} from "@/types/transaction";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useTransactionDates } from "@/hooks/useTransactionDates";
import { useTransactionType } from "@/hooks/useTransactionType";
import { useTransactionModals } from "@/hooks/useTransactionModals";
import i18n from "@/i18n/i18n";
import { RootStore } from "@/models/RootStore";
import { ITransaction } from "@/models/transaction/transaction";
import { RecurrenceType } from "@/types/transaction";

export const TransactionScreen: FC<TransactionScreenProps> = observer(
  function TransactionScreen({ navigation, route }) {
    const amountInputRef = useRef<TextInput>(null);
    const { region } = useCurrencyFormatter();
    const inputAccessoryViewID = "uniqueID";
    const hasFocusedRef = useRef(false);

    const rootStore = useStores() as RootStore;
    const {
      transactionModel,
      categoryStoreModel: {
        expenseCategories,
        incomeCategories,
      },
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

    const mappedTransactionTypes = [
      TransactionType.EXPENSE,
      TransactionType.INCOME,
      TransactionType.TRANSFER,
    ];

    const handleListItemPress = useCallback(() => {
      Keyboard.dismiss();
    }, []);

    const focusAmountInput = useCallback(() => {
      if (!hasFocusedRef.current && amountInputRef.current) {
        amountInputRef.current.focus();
        hasFocusedRef.current = true;
      }
    }, []);

    useEffect(() => {
      const interaction = InteractionManager.runAfterInteractions(() => {
        const timer = setTimeout(() => {
          if (
            !route.params?.transactionId &&
            route.params?.transactionType &&
            !route.params?.fromCategoryScreen
          ) {
            focusAmountInput();
          }
        }, 500);

        return () => clearTimeout(timer);
      });
      return () => {
        interaction.cancel();
        hasFocusedRef.current = false;
        Keyboard.dismiss();
      };
    }, [focusAmountInput, route.params]);

    useEffect(() => {
      const unsubscribeFocus = navigation.addListener("focus", () => {
        hasFocusedRef.current = false;

        if (route.params?.fromCategoryScreen) {
          Keyboard.dismiss();
          if (amountInputRef.current) {
            amountInputRef.current.blur();
          }
          return;
        }

        const interaction = InteractionManager.runAfterInteractions(() => {
          const isReturningFromCategoryScreen =
            route.params?.fromCategoryScreen;

          if (
            route.params?.transactionType &&
            !route.params?.transactionId &&
            !isReturningFromCategoryScreen
          ) {
            const typeToReset = route.params.transactionType;
            logger.debug(
              "[TransactionScreen Focus - New Type]: Resetting model for type:",
              typeToReset
            );
            updateField("amount", 0);
            resetForNewTransaction(typeToReset);

            const timer = setTimeout(() => {
              focusAmountInput();
            }, 1000);

            return () => clearTimeout(timer);
          } else if (route.params?.transactionId) {
            logger.debug(
              "[TransactionScreen Focus - Edit]: Screen focused for existing ID:",
              route.params.transactionId
            );  
            const timer = setTimeout(() => {
              focusAmountInput();
            }, 1000);

            return () => clearTimeout(timer);
          } else {
            logger.debug(
              "[TransactionScreen Focus - Return]: Returning to screen, preserving state."
            );
          }
        });

        return () => interaction.cancel();
      });

      const unsubscribeBlur = navigation.addListener("blur", () => {
        hasFocusedRef.current = false;
        Keyboard.dismiss();
      });

      return () => {
        unsubscribeFocus();
        unsubscribeBlur();
        Keyboard.dismiss();
      };
    }, [
      navigation,
      route.params?.transactionId,
      route.params?.transactionType,
      route.params?.fromCategoryScreen,
      resetForNewTransaction,
      focusAmountInput,
      updateField,
    ]);

    const categoriesForModal = useMemo(() => {
      return transaction_type === "Income"
        ? incomeCategories
        : expenseCategories;
    }, [transaction_type, incomeCategories, expenseCategories]);

    const handleAmountChange = useCallback(
      (text: string) => {
        const normalizedValue = text.replace(/[.,]/g, ".");

        const numericValue = Number(normalizedValue);

        if (!isNaN(numericValue) && numericValue <= 999999999) {
          updateField("amount", numericValue);
        }
      },
      [updateField]
    );

    const handleDescriptionChange = useCallback(
      (text: string) => {
        updateField("description", text);
      },
      [updateField]
    );

    const handleTypeChange = useCallback(
      (option: string) => {
        handleTransactionTypeChange(option as TransactionType);
      },
      [handleTransactionTypeChange]
    );

    const handleOpenCategoryModal = useCallback(() => {
      handleListItemPress();
      setCategoryModalVisible(true);
    }, [handleListItemPress, setCategoryModalVisible]);

    const handleCloseCategoryModal = useCallback(() => {
      handleListItemPress();
      setCategoryModalVisible(false);
    }, [handleListItemPress, setCategoryModalVisible]);

    const handleSelectCategory = useCallback(
      (selected: any) => {
        handleListItemPress();
        handleCategoryModalSelect(selected);
      },
      [handleListItemPress, handleCategoryModalSelect]
    );

    const handleOpenBankModal = useCallback(
      (isFrom: boolean | undefined = undefined) => {
        handleListItemPress();
        if (isFrom !== undefined) {
          setIsFromAccount(isFrom);
        }
        setBankModalVisible(true);
      },
      [handleListItemPress, setIsFromAccount, setBankModalVisible]
    );

    const handleCloseBankModal = useCallback(() => {
      handleListItemPress();
      setBankModalVisible(false);
    }, [handleListItemPress, setBankModalVisible]);

    const handleSelectBank = useCallback(
      (selected: any) => {
        handleListItemPress();
        handleBankModalSelect(selected);
      },
      [handleListItemPress, handleBankModalSelect]
    );

    const handleOpenDatePicker = useCallback(() => {
      handleListItemPress();
      setDatePickerVisibility(true);
    }, [handleListItemPress, setDatePickerVisibility]);

    const handleCloseDatePicker = useCallback(() => {
      handleListItemPress();
      setDatePickerVisibility(false);
    }, [handleListItemPress, setDatePickerVisibility]);

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

    const handleOpenRecurrenceModal = useCallback(() => {
      handleListItemPress();
      setModalVisible(true);
    }, [handleListItemPress, setModalVisible]);

    const handleCloseRecurrenceModal = useCallback(() => {
      setModalVisible(false);
    }, [setModalVisible]);

    const handleSelectRecurrence = useCallback(
      (selected: string) => {
        // const recurrenceValue = (
        //   Object.keys(recurrenceDisplayMap) as Array<
        //     keyof typeof recurrenceDisplayMap
        //   >
        // ).find(
        //   (key) => translate(recurrenceDisplayMap[key] as any) === selected
        // );

        const recurrenceValue = recurrenceDisplayValueMap[selected];
        if (recurrenceValue && recurrenceValue in recurrenceDisplayMap) {
          handleRecurrenceChange(recurrenceValue as RecurrenceType, translate);
        }
        setModalVisible(false);
      },
      [handleRecurrenceChange, setModalVisible, translate]
    );

    const dismissKeyboard = useCallback(() => {
      Keyboard.dismiss();
    }, []);

    const handleSubmit = useCallback(() => {
      formik.handleSubmit();
    }, [formik.handleSubmit]);

    const isFormValidForSubmission = useMemo(() => {

      const baseValid = amount >= 0.01 && !!formik.values.date;
      const typeSpecificValid =
        transaction_type === "Transfer"
          ? !!from_account_id && !!to_account_id
          : !!category_id && !!account_id;
      const recurrenceValid =
        formik.values.recurrence !== "Never"
          ? !!formik.values.recurrence_end_date
          : true;

      return baseValid && typeSpecificValid && recurrenceValid;
    }, [
      amount,
      formik.values.date,
      transaction_type,
      from_account_id,
      to_account_id,
      category_id,
      account_id,
      formik.values.recurrence,
      formik.values.recurrence_end_date,
    ]);

    const getAccountDescription = useCallback(
      (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account?.customized_name || "";
      },
      [accounts]
    );

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
                onPress={() => navigation.navigate("Home")}
                title={translate("components:header.newTransaction")}
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
                  onChange={handleAmountChange}
                  showSymbol={true}
                  currency={currencyMap[region] || "USD"}
                  inputAccessoryViewID={inputAccessoryViewID}
                />
                <View style={tw`mt-4 justify-center items-center`}>
                  <CustomSegmentedControl
                    selected={transaction_type}
                    onSelect={handleTypeChange}
                    activeColor={`bg-[${colors.primary}]`}
                    inactiveColor={`bg-[${colors.bgClear}]`}
                    mappedValues={mappedTransactionTypes}
                  />
                </View>

                <View style={tw`mt-11 justify-center items-center`}>
                  {transaction_type === "Transfer" ? (
                    <>
                      <CustomListItemOption
                        icon="accountToFrom"
                        label={translate("transactionScreen:from")}
                        labelSelected={from_account_name}
                        iconSelected={from_account_url}
                        isImage={!!from_account_url}
                        onPress={() => handleOpenBankModal(true)}
                        value={getAccountDescription(from_account_id)}
                      />
                      <CustomListItemOption
                        icon="accountToFrom"
                        label={translate("transactionScreen:to")}
                        labelSelected={to_account_name}
                        iconSelected={to_account_url}
                        isImage={!!to_account_url}
                        onPress={() => handleOpenBankModal(false)}
                        value={getAccountDescription(to_account_id)}
                      />
                    </>
                  ) : (
                    <>
                      <CustomListItemOption
                        icon="category"
                        label={translate("transactionScreen:category")}
                        labelSelected={category_name}
                        iconSelected={icon_url}
                        isEmoji={
                          !!(icon_url && !icon_url.startsWith("/storage/"))
                        }
                        onPress={handleOpenCategoryModal}
                        categoryId={category_id}
                      />
                      <CustomListItemOption
                        icon="account"
                        label={translate("transactionScreen:account")}
                        labelSelected={account_name}
                        iconSelected={account_url}
                        isImage={!!account_url}
                        onPress={() => handleOpenBankModal()}
                        value={getAccountDescription(account_id)}
                      />
                    </>
                  )}

                  <CustomListItemOption
                    icon="note"
                    label={translate("transactionScreen:note")}
                    showChevron={false}
                    onPress={handleListItemPress}
                    inputValue={description}
                    setInputValue={handleDescriptionChange}
                    returnKeyType="done"
                  />

                  <CustomListItemOption
                    icon="calendar"
                    label={translate("transactionScreen:date")}
                    selectedDate={formik.values.displayDate}
                    onPress={handleOpenDatePicker}
                  />

                  <CustomListItemOption
                    icon="recurrence"
                    label={translate("transactionScreen:recurrence")}
                    recurrenceSelected={translate(
                      recurrenceDisplayMap[formik.values.recurrence] as any
                    )}
                    onPress={handleOpenRecurrenceModal}
                  />

                  {formik.values.recurrence !== "Never" && (
                    <CustomListItemOption
                      icon="endDate"
                      label={translate("transactionScreen:endDate")}
                      selectedDate={formik.values.displayEndDate}
                      onPress={handleOpenEndDatePicker}
                    />
                  )}
                </View>
              </View>
            </View>

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

            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID={inputAccessoryViewID}>
                <View
                  style={tw`bg-[#f8f8f8] border-t border-[#d8d8d8] p-2 items-end`}
                >
                  <TouchableOpacity
                    onPress={dismissKeyboard}
                    style={tw`px-4 py-2`}
                  >
                    <Text
                      style={tw`text-[${colors.primary}] text-base font-medium`}
                    >
                      {translate("transactionScreen:ready")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}
          </Screen>
          <CustomButton
            variant="primary"
            isEnabled={isFormValidForSubmission}
            onPress={handleSubmit}
            title={translate("transactionScreen:continue")}
            adaptToKeyboard={true}
            enableAnalytics={true}
            // analyticsEvent="transaction_continue_button_clicked"
            // analyticsProperties={{
            //   screen_name: "TransactionScreen",
            //   transaction_type: transaction_type,
            //   action: "continue",
            //   form_valid: isFormValidForSubmission
            // }}
          />
        </KeyboardAvoidingView>
      </>
    );
  }
);
