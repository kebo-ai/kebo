import logger from "@/utils/logger";
import React, { FC, useState, useEffect } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { observer } from "mobx-react-lite";
import tw from "@/hooks/useTailwind";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { useStores } from "@/models/helpers/use-stores";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalAccountType from "@/components/ModalAccountType";
import { showToast } from "@/components/ui/CustomToast";
import {
  getAccountDetailService,
  updateAccountService,
} from "@/services/account-service";
import { translate } from "@/i18n";
import { useNumberEntry } from "@/hooks/useNumberEntry";
import { useShakeAnimation } from "@/hooks/useShakeAnimation";
import { AmountDisplay } from "@/components/transaction/AmountDisplay";
import { NumberPad } from "@/components/transaction/NumberPad";
import { TransactionFieldRow } from "@/components/transaction/TransactionFieldRow";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";

// Interface for safe account type to use with formik
interface SafeAccountType {
  id: string;
  type_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

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

interface EditAccountScreenProps {}

const validationSchema = Yup.object().shape({
  balance: Yup.number()
    .required(translate("accountBalanceScreen:requiredBalance"))
    .min(0.01, translate("accountBalanceScreen:higherBalance"))
    .typeError(translate("accountBalanceScreen:numberBalance")),
  accountType: Yup.object()
    .shape({
      id: Yup.string().required(translate("accountBalanceScreen:typeAccount")),
    })
    .required(translate("accountBalanceScreen:typeAccount")),
});

// Helper function to safely clone an AccountType to avoid MobX references
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

export const EditAccountScreen: FC<EditAccountScreenProps> = observer(
  function EditAccountScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { decimalSeparator } = useCurrencyFormatter();
    const params = useLocalSearchParams<{
      accountId: string;
      accountData?: string;
    }>();

    const accountId = params.accountId;

    // Parse account data from params
    let accountData: BankOption | undefined;
    try {
      accountData = params.accountData
        ? JSON.parse(params.accountData)
        : undefined;
    } catch (e) {
      accountData = undefined;
    }

    // Fallback if accountData wasn't passed
    if (!accountData) {
      accountData = { id: accountId, name: "", icon_url: null, description: "" };
    }

    const [modalVisible, setModalVisible] = useState(false);
    const {
      accountStoreModel: { getListAccountType, accountTypes, getListAccount },
      uiStoreModel: { showLoader, hideLoader },
    } = useStores();

    const [isLoading, setIsLoading] = useState(true);
    const [accountDetail, setAccountDetail] = useState<any>(null);

    const insets = useSafeAreaInsets();
    const numberEntry = useNumberEntry(2);
    const amountShake = useShakeAnimation();

    // Check if the bank is "efectivo" (cash)
    const isCashBank = accountData?.name?.toLowerCase() === "efectivo";

    // Filter out "efectivo" account types if not a cash bank
    const filteredAccountTypes = isCashBank
      ? accountTypes
      : accountTypes.filter(
          (type) => type.type_name?.toLowerCase() !== "efectivo"
        );

    const formik = useFormik({
      initialValues: {
        balance: Number(accountData?.balance ?? 0),
        accountType: (() => {
          const foundType = accountTypes.find(
            (type) => type.id === accountData?.account_type_id
          );
          if (!foundType) return { id: "" } as SafeAccountType;
          return cloneAccountType(foundType);
        })(),
        description: accountData?.description ?? "",
      },
      validationSchema,
      onSubmit: async (values) => {
        showLoader();
        try {
          const result = await updateAccountService(accountId, {
            customized_name:
              values.description || translate("accountBalanceScreen:myAccount"),
            account_type_id: values.accountType.id,
            balance: values.balance,
          });

          if (result.kind === "ok") {
            await getListAccount();
            showToast(
              "success",
              translate("accountBalanceScreen:accountSuccess")
            );
            router.back();
          } else {
            showToast("error", translate("accountBalanceScreen:accountError"));
          }
        } catch (error) {
          logger.error("Error updating account:", error);
          showToast(
            "error",
            translate("accountBalanceScreen:accountErrorProcess")
          );
        } finally {
          hideLoader();
        }
      },
    });

    useEffect(() => {
      getListAccountType();
      if (accountId) {
        fetchAccountDetail();
      }
    }, [accountId]);

    // Sync number entry → formik balance
    useEffect(() => {
      const balance = numberEntry.amountInCents / 100;
      formik.setFieldValue("balance", balance);
    }, [numberEntry.amountInCents]);

    const fetchAccountDetail = async () => {
      setIsLoading(true);
      try {
        const result = await getAccountDetailService(accountId || "");
        if (result.kind === "ok" && result.data) {
          setAccountDetail(result.data);

          const balance = Number(result.data.balance ?? 0);
          const cents = Math.round(balance * 100);
          numberEntry.setFromCents(cents);

          formik.setValues({
            balance,
            accountType: result.data.account_types
              ? cloneAccountType(result.data.account_types)
              : { id: "" },
            description: result.data.customized_name ?? "",
          });
        } else {
          showToast("error", translate("accountBalanceScreen:accountError"));
        }
      } catch (error) {
        logger.error("Error fetching account detail:", error);
        showToast("error", translate("accountBalanceScreen:accountError"));
      } finally {
        setIsLoading(false);
      }
    };

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
            headerShown: true,
            headerBackTitle: translate("common:back"),
            headerTintColor: colors.primary,
            title: translate("accountBalanceScreen:editAccount"),
            headerTitleStyle: {
              fontFamily: "SFUIDisplaySemiBold",
              color: theme.headerTitle,
            },
            headerStyle: { backgroundColor: theme.background },
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        {isLoading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text color={theme.textPrimary}>
              {translate("editTransaction:loading")}
            </Text>
          </View>
        ) : (
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
                label={accountData.name || ""}
                value={accountData.name || ""}
                imageUrl={accountData.bank_url}
                showChevron={false}
              />

              <TransactionFieldRow
                icon="create-outline"
                label={translate("accountBalanceScreen:description")}
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
        )}

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
