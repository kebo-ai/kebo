// Re-export shared types
export {
  RecurrenceCadenceEnum,
  TransactionType,
  RecurrenceType,
  recurrenceDisplayMap,
  recurrenceDisplayValueMap,
  type TransactionFormValues,
  type Budget,
  type BudgetLine,
  type TotalMetrics,
  type BudgetResponse,
} from "@kebo/shared/types";

// Mobile-specific types
export interface TransactionScreenProps {
  navigation: any;
  route: any & {
    params?: {
      transactionType?: import("@kebo/shared/types").TransactionType;
      transactionId?: string;
      fromCategoryScreen?: boolean;
      fromBankScreen?: boolean;
      fromModal?: boolean;
    };
  };
}
