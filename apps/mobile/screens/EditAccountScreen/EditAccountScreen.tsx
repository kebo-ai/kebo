import logger from "@/utils/logger";
import React, { FC, useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import tw from "@/hooks/useTailwind";
import { View, Text, Image, Platform, TextInput, Keyboard } from "react-native";
import { colors } from "@/theme/colors";
import CustomHeader from "@/components/common/CustomHeader";
import { FixedScreen } from "@/components/FixedScreen";
import CustomButton from "@/components/common/CustomButton";
import CustomListItemOption from "@/components/common/CustomListItemOption";
import { useStores } from "@/models/helpers/useStores";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalAccountType from "@/components/ModalAccountType";
import { showToast } from "@/components/ui/CustomToast";
import {
  getAccountDetailService,
  updateAccountService,
} from "@/services/AccountService";
import { translate } from "@/i18n";
import { AccountBalanceInput } from "@/components/AccountBalanceInput";
import * as Localization from "expo-localization";

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

const locale = Localization.getLocales()[0]?.languageTag || "en-US";

const getDecimalSeparator = () => {
  const numberWithDecimal = 1.1;
  const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal);
  return formatted.replace(/\d/g, "")[0];
};

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
    const amountInputRef = useRef<TextInput>(null);
    const hasFocusedRef = useRef(false);

    // Check if the bank is "efectivo" (cash)
    const isCashBank = accountData?.name?.toLowerCase() === "efectivo";

    // Filter out "efectivo" account types if not a cash bank
    const filteredAccountTypes = isCashBank
      ? accountTypes
      : accountTypes.filter(
          (type) => type.type_name?.toLowerCase() !== "efectivo"
        );

    useEffect(() => {
      getListAccountType();
      if (accountId) {
        fetchAccountDetail();
      }
    }, [accountId]);

    // Focus the input when component mounts
    useEffect(() => {
      const focusTimeout = setTimeout(() => {
        if (amountInputRef.current && !hasFocusedRef.current) {
          Keyboard.dismiss();
          requestAnimationFrame(() => {
            setTimeout(() => {
              amountInputRef.current?.focus();
              hasFocusedRef.current = true;
            }, 100);
          });
        }
      }, 500);

      return () => {
        clearTimeout(focusTimeout);
        hasFocusedRef.current = false;
        Keyboard.dismiss();
      };
    }, []);

    const fetchAccountDetail = async () => {
      setIsLoading(true);
      try {
        const result = await getAccountDetailService(accountId || "");
        if (result.kind === "ok" && result.data) {
          setAccountDetail(result.data);
          // Update form values with fetched data
          formik.setValues({
            balance: Number(result.data.balance ?? 0),
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

    const formik = useFormik({
      initialValues: {
        balance: Number(accountData?.balance ?? 0),
        accountType: (() => {
          const foundType = accountTypes.find(
            (type) => type.id === accountData?.account_type_id
          );
          // Clone the account type to avoid MobX reference issues
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
            // Update the accounts list
            await getListAccount();

            showToast(
              "success",
              translate("accountBalanceScreen:accountSuccess")
            );
            Keyboard.dismiss();
            setTimeout(() => {
              router.back();
            }, 100);
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

    if (isLoading) {
      return (
        <FixedScreen
          safeAreaEdges={["top"]}
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor={colors.primary}
          header={
            <CustomHeader
              onPress={() => router.back()}
              title={translate("accountBalanceScreen:editAccount")}
            />
          }
        >
          <View style={tw`flex-1 justify-center items-center`}>
            <Text>{translate("editTransaction:loading")}</Text>
          </View>
        </FixedScreen>
      );
    }

    return (
      <>
        <FixedScreen
          safeAreaEdges={["top"]}
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor={colors.primary}
          header={
            <CustomHeader
              onPress={() => router.back()}
              title={translate("accountBalanceScreen:editAccount")}
            />
          }
        >
          <View style={tw`p-4 bg-white rounded-2xl shadow-md w-full`}>
            <AccountBalanceInput
              ref={amountInputRef}
              value={formik.values.balance}
              onChange={(textValue) => {
                // Parse numeric value from the string
                const separator = getDecimalSeparator();
                // Replace the separator with a dot for proper parsing
                const numericValue =
                  parseFloat(textValue.replace(separator, ".")) || 0;
                // Set value for validation and form submission
                formik.setFieldValue("balance", numericValue);
              }}
              label={translate("accountBalanceScreen:accountBalance")}
            />
            <View
              style={tw`flex-row items-center justify-between h-[60px]
                border-t border-b border-[rgba(96,106,132,0.15)] border-solid`}
            >
              <View style={tw`flex-row items-center gap-[9px]`}>
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${accountData.bank_url}`,
                  }}
                  style={tw`w-[22px] h-[22px] border border-[#6934D2]/15 rounded-full`}
                />
                <Text
                  style={[
                    tw`text-base`,
                    {
                      color: "rgba(96, 106, 132, 1)",
                      fontFamily: "SFUIDisplaySemiBold",
                    },
                  ]}
                >
                  {accountData.name || ""}
                </Text>
              </View>
            </View>
            <View style={tw`flex-row items-center justify-between h-[60px] `}>
              <View style={tw`flex-row items-center`}>
                <CustomListItemOption
                  showBorder={false}
                  icon="note"
                  label={translate("accountBalanceScreen:description")}
                  showChevron={false}
                  onPress={() => true}
                  inputValue={formik.values.description}
                  setInputValue={formik.handleChange("description")}
                  returnKeyType="done"
                />
              </View>
            </View>
            {!isCashBank && (
              <View
                style={tw`flex-row items-center justify-between h-[60px]
                  border-t border-b border-[rgba(96,106,132,0.15)] border-solid`}
              >
                <View style={tw`flex-row items-center`}>
                  <CustomListItemOption
                    icon="recurrence"
                    label={translate("accountBalanceScreen:typeAccountTitle")}
                    labelText={translate(
                      "accountBalanceScreen:typeAccountTitle"
                    )}
                    showBorder={false}
                    recurrenceSelected={formik.values.accountType?.type_name}
                    onPress={() => setModalVisible(true)}
                  />
                </View>
              </View>
            )}
          </View>
          <ModalAccountType
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSelect={(selected) => {
              // Clone the selected account type to avoid MobX reference issues
              formik.setFieldValue("accountType", cloneAccountType(selected));
              setModalVisible(false);
            }}
            selectedValue={formik.values.accountType as any}
            data={filteredAccountTypes}
            title={translate("accountBalanceScreen:typeAccountTitle")}
          />
        </FixedScreen>
        <CustomButton
          variant="primary"
          isEnabled={
            !!(
              formik.isValid &&
              formik.values.balance !== 0 &&
              formik.values.accountType.id
            )
          }
          onPress={formik.handleSubmit}
          title={translate("accountBalanceScreen:continue")}
          adaptToKeyboard={true}
        />
      </>
    );
  }
);
