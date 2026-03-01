import React, { FC, useState, useEffect, useMemo } from "react";
import logger from "@/utils/logger";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { observer } from "mobx-react-lite";
import tw from "@/hooks/use-tailwind";
import { View, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import { useStores } from "@/models/helpers/use-stores";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalAccountType from "@/components/modal-account-type";
import { useAccountTypes, useCreateAccount, useUpdateAccount, useAccount } from "@/lib/api/hooks";
import { showToast } from "@/components/ui/custom-toast";
import { useCurrencyFormatter } from "@/components/common/currency-formatter";
import { translate } from "@/i18n";
import { useTheme } from "@/hooks/use-theme";
import { useNumberEntry } from "@/hooks/use-number-entry";
import { useShakeAnimation } from "@/hooks/use-shake-animation";
import { AmountDisplay } from "@/components/transaction/amount-display";
import { NumberPad } from "@/components/transaction/number-pad";
import { TransactionFieldRow } from "@/components/transaction/transaction-field-row";

interface BankOption {
  id: string;
  name: string;
  icon_url: string | null;
  description: string;
  balance?: number;
  account_type_id?: string;
  bank_url?: string;
  [key: string]: any;
}

interface SafeAccountType {
  id: string;
  type_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

interface AccountBalanceScreenProps {}

const cloneAccountType = (accountType: any): SafeAccountType => {
  if (!accountType) return { id: "" };

  return {
    id: accountType.id || "",
    type_name: accountType.type_name || "",
    description: accountType.description || "",
    created_at: accountType.created_at || "",
    updated_at: accountType.updated_at || "",
    deleted_at: accountType.deleted_at || null,
    is_deleted: accountType.is_deleted || false,
  };
};

export const AccountBalanceScreen: FC<AccountBalanceScreenProps> = observer(
  function AccountBalanceScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { decimalSeparator } = useCurrencyFormatter();
    const insets = useSafeAreaInsets();
    const numberEntry = useNumberEntry(2);
    const amountShake = useShakeAnimation();
    const params = useLocalSearchParams<{
      selectedBank?: string;
      accountId?: string;
      isEditing?: string;
      accountData?: string;
      isTransfer?: string;
      transferType?: "from" | "to";
      fromScreen?: string;
    }>();

    // Parse params
    let selectedBank: { id: string; name: string; bank_url: string };
    let accountData: BankOption | undefined;
    try {
      selectedBank = params.selectedBank
        ? JSON.parse(params.selectedBank)
        : { id: "", name: "", bank_url: "" };
    } catch (e) {
      selectedBank = { id: "", name: "", bank_url: "" };
    }
    try {
      accountData = params.accountData
        ? JSON.parse(params.accountData)
        : undefined;
    } catch (e) {
      accountData = undefined;
    }

    const accountId = params.accountId;
    const isEditing = params.isEditing === "true";
    const isTransfer = params.isTransfer === "true";
    const transferType = params.transferType;
    const fromScreen = params.fromScreen;

    const [modalVisible, setModalVisible] = useState(false);
    const {
      uiStoreModel: { showLoader, hideLoader },
      transactionModel: { updateField },
    } = useStores();
    const { data: accountTypes = [] } = useAccountTypes();
    const createAccountMutation = useCreateAccount();
    const updateAccountMutation = useUpdateAccount();
    const { data: accountDetailData, isLoading: isLoadingDetail } = useAccount(
      isEditing && accountId ? accountId : ""
    );

    const isCashBank =
      selectedBank.name?.toLowerCase() ===
        translate("modalAccount:cash").toLowerCase() ||
      selectedBank.name?.toLowerCase() === "efectivo";
    const filteredAccountTypes = isCashBank
      ? accountTypes
      : accountTypes.filter(
          (type) => type.type_name?.toLowerCase() !== "efectivo"
        );

    const bankDisplayName =
      selectedBank.name === "Banco Personalizado"
        ? translate("components:bankModal.customBank")
        : selectedBank.name === "Efectivo"
        ? translate("modalAccount:cash")
        : selectedBank.name || "";

    // Populate formik from fetched account detail (editing mode)
    useEffect(() => {
      if (isEditing && accountDetailData && accountTypes.length > 0) {
        const balance = Number(accountDetailData.balance ?? 0);
        const cents = Math.round(balance * 100);
        numberEntry.setFromCents(cents);

        const foundType = accountTypes.find(
          (t) => t.id === accountDetailData.account_type_id
        );
        formik.setValues({
          balance,
          accountType: foundType ? cloneAccountType(foundType) : { id: "" },
          description: accountDetailData.customized_name ?? "",
        });
      }
    }, [accountDetailData, accountTypes]);

    useEffect(() => {
      if (isCashBank) {
        const cashAccountType = accountTypes.find(
          (type) => type.type_name?.toLowerCase() === "efectivo"
        );
        if (cashAccountType) {
          formik.setFieldValue(
            "accountType",
            cloneAccountType(cashAccountType)
          );
        }
      }
    }, [accountTypes, isCashBank]);

    useEffect(() => {
      if (!isCashBank && !isEditing && accountTypes.length > 0) {
        const firstAccountType = accountTypes[2];
        formik.setFieldValue("accountType", cloneAccountType(firstAccountType));
      }
    }, [accountTypes, isCashBank, isEditing]);

    // Sync number entry -> formik balance
    useEffect(() => {
      const balance = numberEntry.amountInCents / 100;
      formik.setFieldValue("balance", balance);
    }, [numberEntry.amountInCents]);

    const validationSchema = useMemo(() => {
      const isCustom =
        selectedBank.name?.toLowerCase() === "banco personalizado";

      return Yup.object().shape({
        balance: Yup.number()
          .required(translate("accountBalanceScreen:requiredBalance"))
          .min(0, translate("accountBalanceScreen:higherBalance"))
          .typeError(translate("accountBalanceScreen:numberBalance")),
        accountType: Yup.object()
          .shape({
            id: Yup.string().required(
              translate("accountBalanceScreen:typeAccount")
            ),
          })
          .required(translate("accountBalanceScreen:typeAccount")),
        description: Yup.string().when([], {
          is: () => isCustom,
          then: (schema) =>
            schema.required(translate("accountBalanceScreen:requiredName")),
          otherwise: (schema) => schema,
        }),
      });
    }, [selectedBank.name]);

    const formik = useFormik({
      initialValues: isEditing
        ? {
            balance: Number(accountData?.balance ?? 0),
            accountType: (() => {
              const foundType = accountTypes.find(
                (type) => type.id === accountData?.account_type_id
              );
              if (!foundType) return { id: "" } as SafeAccountType;
              return cloneAccountType(foundType);
            })(),
            description: accountData?.description ?? "",
          }
        : {
            balance: 0,
            accountType: { id: "" } as SafeAccountType,
            description: "",
          },
      validationSchema,
      onSubmit: async (values, { resetForm }) => {
        showLoader();
        try {
          if (isEditing && accountId) {
            await updateAccountMutation.mutateAsync({
              id: accountId,
              data: {
                customized_name:
                  values.description ||
                  translate("accountBalanceScreen:myAccount"),
                account_type_id: values.accountType.id,
                balance: values.balance,
              },
            });

            showToast(
              "success",
              translate("accountBalanceScreen:accountSuccess")
            );
            Keyboard.dismiss();
            setTimeout(() => {
              if (fromScreen === "Transaction") {
                router.push({ pathname: "/(authenticated)/transaction" });
              } else {
                router.push({ pathname: "/(authenticated)/accounts" });
              }
            }, 100);
          } else {
            const bankName =
              selectedBank.name === "Banco Personalizado"
                ? translate("components:bankModal.customBank")
                : selectedBank.name === "Efectivo"
                ? translate("modalAccount:cash")
                : selectedBank.name;

            const result = await createAccountMutation.mutateAsync({
              name: bankName,
              customized_name:
                values.description ||
                translate("accountBalanceScreen:myAccount"),
              bank_id: selectedBank.id,
              icon_url: selectedBank.bank_url,
              account_type_id: values.accountType.id,
              balance: values.balance,
            });

            showToast(
              "success",
              translate("accountBalanceScreen:accountAddSuccess")
            );
            updateField("account_id", result.id);
            updateField("account_name", bankName);
            updateField("account_url", selectedBank.bank_url);

            if (isTransfer) {
              if (transferType === "from") {
                updateField("from_account_id", result.id);
                updateField("from_account_name", bankName);
                updateField("from_account_url", selectedBank.bank_url);
              } else {
                updateField("to_account_id", result.id);
                updateField("to_account_name", bankName);
                updateField("to_account_url", selectedBank.bank_url);
              }
            }

            if (fromScreen === "EditTransaction") {
              Keyboard.dismiss();
              setTimeout(() => {
                router.back();
                router.back();
              }, 100);
            } else if (fromScreen === "BankModal") {
              Keyboard.dismiss();
              setTimeout(() => {
                router.back();
                router.back();
              }, 100);
            } else {
              Keyboard.dismiss();
              setTimeout(() => {
                router.push({
                  pathname: "/(authenticated)/transaction",
                  params: {
                    transactionType: isTransfer ? "Transfer" : undefined,
                  },
                });
              }, 100);
            }
          }
        } catch (error) {
          showToast(
            "error",
            translate("accountBalanceScreen:accountErrorProcess")
          );
          logger.error(error as string);
        } finally {
          hideLoader();
          resetForm();
        }
      },
    });

    const handleSubmit = () => {
      if (numberEntry.amountInCents === 0) {
        amountShake.shake();
        return;
      }
      if (!formik.values.accountType?.id) {
        return;
      }
      formik.handleSubmit();
    };

    return (
      <>
        <Stack.Screen
          options={{
            ...standardHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: isEditing
              ? translate("accountBalanceScreen:editAccount")
              : translate("accountBalanceScreen:addAccount"),
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <View style={[tw`flex-1`, { paddingBottom: insets.bottom }]}>
          <AmountDisplay
            entryType={numberEntry.entryType}
            amountInCents={numberEntry.amountInCents}
            wholePart={numberEntry.wholePart}
            decimalSuffix={numberEntry.decimalSuffix}
            onBackspace={numberEntry.handleBackspace}
            shakeOffset={amountShake.offset}
          />

          <View style={tw`px-4`}>
            <TransactionFieldRow
              icon="business-outline"
              label={bankDisplayName}
              value={bankDisplayName}
              imageUrl={selectedBank.bank_url}
              showChevron={false}
            />

            <TransactionFieldRow
              icon="create-outline"
              label={translate("accountBalanceScreen:name")}
              isNote
              noteValue={formik.values.description}
              onNoteChange={formik.handleChange("description")}
              showChevron={false}
            />

            {!isCashBank && (
              <TransactionFieldRow
                icon="swap-horizontal-outline"
                label={translate("accountBalanceScreen:typeAccountTitle")}
                value={formik.values.accountType?.type_name}
                onPress={() => setModalVisible(true)}
              />
            )}
          </View>

          <NumberPad
            entryType={numberEntry.entryType}
            decimalSeparator={decimalSeparator}
            onDigit={numberEntry.handleDigit}
            onBackspace={numberEntry.handleBackspace}
            onDecimal={numberEntry.handleDecimal}
            onSubmit={handleSubmit}
          />
        </View>

        <ModalAccountType
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={(selected) => {
            formik.setFieldValue("accountType", cloneAccountType(selected));
            setModalVisible(false);
          }}
          selectedValue={formik.values.accountType as any}
          data={filteredAccountTypes}
          title={translate("accountBalanceScreen:typeAccountTitle")}
        />
      </>
    );
  }
);
