import logger from "@/utils/logger";
import { useFormik } from "formik";
import moment from "moment";
import { useStores } from "@/models/helpers/use-stores";
import { translate, TxKeyPath } from "@/i18n";
import { RecurrenceType, RecurrenceCadenceEnum, TransactionType } from "@/types/transaction";
import { showToast } from "@/components/ui/custom-toast";
import i18n from "@/i18n/i18n";
import { runInAction } from "mobx";

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

  const currentLocale = i18n.language.startsWith("es") ? "es" : "en";

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

        // Navigate immediately (optimistic)
        navigation.navigate("Home", { transactionCreated: true });
        resetForm();
        showToast("success", successMessage);

        // Save in background
        await transactionModel.saveTransaction();

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