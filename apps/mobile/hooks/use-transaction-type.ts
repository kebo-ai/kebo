import { useEffect } from 'react';
import { TransactionType } from '@/types/transaction';
import { useStores } from '@/models/helpers/use-stores';
import { useAccounts, useBanks, useAccountTypes } from '@/lib/api/hooks';

export const useTransactionType = (route: any) => {
  const { transactionModel } = useStores();
  const {
    transaction_type,
    setTransactionType,
  } = transactionModel;

  // React Query auto-fetches these — no manual loadData needed
  useAccounts();
  useBanks();
  useAccountTypes();

  useEffect(() => {
    const initialTransactionType =
      route?.params?.transactionType ||
      transaction_type ||
      TransactionType.EXPENSE;

    setTransactionType(initialTransactionType);
  }, [route?.params?.transactionType]);

  const handleTransactionTypeChange = (option: TransactionType) => {
    setTransactionType(option);
  };

  return {
    handleTransactionTypeChange,
    transaction_type,
  };
};
