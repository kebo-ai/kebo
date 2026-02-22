import { useEffect } from 'react';
import { TransactionType } from '@/types/transaction';
import { useStores } from '@/models/helpers/use-stores';
import logger from '@/utils/logger';

export const useTransactionType = (route: any) => {
  const { transactionModel, categoryStoreModel, bankStoreModel, accountStoreModel } = useStores();
  const {
    updateField,
    transaction_type,
    setTransactionType,
  } = transactionModel;
  const { getCategories, getInitialCategory } = categoryStoreModel;
  const { getListBanks } = bankStoreModel;
  const { getListAccountType, getListAccount, accounts } = accountStoreModel;


  useEffect(() => {
    let isMounted = true;

    const initialTransactionType =
      route?.params?.transactionType ||
      transaction_type ||
      TransactionType.EXPENSE;

     const loadData = async () => {
        try {
            logger.debug("[useTransactionType Effect] Starting data load...");
            await Promise.all([
              getListAccount(),
              getListBanks(),
              getListAccountType(),
            ]);
            logger.debug("[useTransactionType Effect] Data loaded.");

            if (isMounted && transactionModel.transaction_type === initialTransactionType) {
                logger.debug(`[useTransactionType Effect] Setting initial type: ${initialTransactionType}`);
                setTransactionType(initialTransactionType);
            } else if (isMounted) {
                logger.debug(`[useTransactionType Effect] Initial type setting skipped. Current type: ${transactionModel.transaction_type}, Initial intended: ${initialTransactionType}`);
            }
        } catch (error) {
            logger.error("[useTransactionType Effect] Error loading data:", error);
        }
     }
     loadData();
     
     return () => {
         isMounted = false;
         logger.debug("[useTransactionType Effect] Unmounted.");
     };

  }, [route?.params?.transactionType]);


  const handleTransactionTypeChange = (option: TransactionType) => {
    logger.debug(`Changing transaction type from ${transaction_type} to ${option}`);
    setTransactionType(option);
  };

  return {
    handleTransactionTypeChange,
    transaction_type,
  };
};
