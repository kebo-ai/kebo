import logger from "@/utils/logger";
import { useFormik } from "formik";
import moment from "moment";
import { useStores } from "@/models/helpers/use-stores";
import { translate, TxKeyPath } from "@/i18n";
import { RecurrenceType, RecurrenceCadenceEnum, TransactionType } from "@/types/transaction";
import { showToast } from "@/components/ui/custom-toast";
import i18n from "@/i18n/i18n";
import { runInAction } from "mobx";
import { useCreateTransaction, useCreateTransfer } from "@/lib/api/hooks";

type TransactionSuccessMessages = {
  [key in TransactionType]: TxKeyPath;
};

const successMessages: TransactionSuccessMessages = {
  [TransactionType.INCOME]: "transactionScreen:successMessageIncome" as TxKeyPath,
  [TransactionType.EXPENSE]: "transactionScreen:successMessageExpense" as TxKeyPath,
  [TransactionType.TRANSFER]: "transactionScreen:successMessageTransfer" as TxKeyPath,
};

const DEFAULT_SUCCESS_MESSAGE = "transactionScreen:successMessageTransaction" as TxKeyPath;
const ERROR_MESSAGE = "transactionScreen:errorMessageTransaction" as TxKeyPath;

export const useTransactionForm = (navigation: any) => {
  const {
    transactionModel,
    uiStoreModel: { showLoader, hideLoader },
  } = useStores();

  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();

  const currentLocale = i18n.language.startsWith("es") ? "es" : "en";

  const formik = useFormik({
    initialValues: {
      account: "",
      date: moment().toISOString(),
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
        const selectedDateMoment = moment(values.date);
        const now = moment();
        let formattedDate;

        if (selectedDateMoment.isValid()) {
          const datePart = selectedDateMoment.format("YYYY-MM-DD");
          const timePart = now.format("HH:mm:ss.SSS Z");
          formattedDate = `${datePart} ${timePart}`;
        } else {
          formattedDate = now.format("YYYY-MM-DD HH:mm:ss.SSS Z");
        }

        runInAction(() => {
          transactionModel.updateField("date", formattedDate);
          transactionModel.setMetadata({ note: values.note });

          if (values.recurrence !== RecurrenceType.NEVER) {
            transactionModel.setRecurrenceDetails(
              values.recurrence_cadence,
              values.recurrence_end_date
            );
          } else {
            transactionModel.setRecurrenceDetails(
              RecurrenceCadenceEnum.NEVER,
              undefined
            );
          }
        });

        const successMessage = translate(
          successMessages[transactionModel.transaction_type as TransactionType] || DEFAULT_SUCCESS_MESSAGE
        );

        // Capture mutation data before navigation/reset
        // API expects ISO 8601 datetime — combine selected date with current time
        const apiDate = selectedDateMoment.isValid()
          ? moment(selectedDateMoment.format("YYYY-MM-DD") + "T" + now.format("HH:mm:ss.SSSZ")).toISOString()
          : now.toISOString();
        const isTransfer = transactionModel.transaction_type === "Transfer";
        const mutationData = isTransfer
          ? {
              from_account_id: transactionModel.from_account_id,
              to_account_id: transactionModel.to_account_id,
              amount: transactionModel.amount,
              currency: transactionModel.currency,
              date: apiDate,
              description: transactionModel.description || undefined,
            }
          : {
              account_id: transactionModel.account_id,
              amount: transactionModel.amount,
              currency: transactionModel.currency,
              transaction_type: transactionModel.transaction_type as "Expense" | "Income",
              date: apiDate,
              description: transactionModel.description || undefined,
              category_id: transactionModel.category_id || undefined,
              is_recurring: transactionModel.is_recurring,
              recurrence_cadence: transactionModel.recurrence_cadence || undefined,
              recurrence_end_date: transactionModel.recurrence_end_date || undefined,
            };

        // Fire mutation FIRST so onMutate updates cache before home screen renders
        if (isTransfer) {
          createTransfer.mutate(mutationData as any);
        } else {
          createTransaction.mutate(mutationData as any);
        }

        // Then navigate — home screen will see optimistically updated cache
        navigation.navigate("Home", { transactionCreated: true });
        resetForm();
        showToast("success", successMessage);

        runInAction(() => {
          transactionModel.updateField("amount", 0);
          transactionModel.updateField("description", "");
        });
      } catch (error) {
        logger.error("Error submitting transaction:", error);
        showToast("error", translate(ERROR_MESSAGE));
      }
    },
  });

  return formik;
}; 