import { useState } from 'react';
import { useStores } from '@/models/helpers/useStores';
import { FormikProps } from 'formik';
import { TransactionFormValues, TransactionType } from '@/types/transaction';
import { ITransaction } from '@/models/transaction/transaction';
import { Account } from '@/models/account/account';
import { Category } from '@/models/category/category';

interface TransactionModalsProps {
  transaction_type: TransactionType;
}

export const useTransactionModals = (
  formik: FormikProps<TransactionFormValues>,
  props: TransactionModalsProps
) => {
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isBankModalVisible, setBankModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFromAccount, setIsFromAccount] = useState(true);

  const {
    transactionModel,
    accountStoreModel,
  } = useStores();

  const { 
    setSelectedAccount, 
    setSelectedFromAccount, 
    setSelectedToAccount, 
    setSelectedCategory,
    from_account_id,
    to_account_id
  } = transactionModel as ITransaction;

  const { accounts } = accountStoreModel;

  const handleBankModalSelect = (selected: { id: string; name?: string; icon_url?: string }) => {
    const accountData = {
      id: selected.id,
      name: selected.name,
      icon_url: selected.icon_url,
    };

    if (props.transaction_type === TransactionType.TRANSFER) {
      if (isFromAccount) {
        setSelectedFromAccount(accountData);
        formik.setFieldValue("from_account", selected.id);
      } else {
        setSelectedToAccount(accountData);
        formik.setFieldValue("to_account", selected.id);
      }
    } else {
      setSelectedAccount(accountData);
      formik.setFieldValue("account", selected.id);
    }
    setBankModalVisible(false);
  };

  const handleCategoryModalSelect = (selectedCategory: Category) => {
    const categoryData = {
      id: selectedCategory.id,
      name: selectedCategory.name ?? undefined,
      icon_url: selectedCategory.icon_url ?? undefined,
    };
    setSelectedCategory(categoryData);
    formik.setFieldValue("category", selectedCategory.id);
    setCategoryModalVisible(false);
  };

  return {
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
  };
}; 