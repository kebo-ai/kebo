import React, { FC, useState, useEffect, useRef, useMemo } from "react";
import logger from "../../utils/logger";
import { AppStackScreenProps } from "../../navigators/AppNavigator";
import { observer } from "mobx-react-lite";
import tw from "../../utils/useTailwind";
import {
  View,
  Text,
  Image,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { colors } from "../../theme/colors";
import CustomHeader from "../../components/custom/CustomHeader";
import { FixedScreen } from "../../components/FixedScreen";
import CustomButton from "../../components/custom/CustomButton";
import CustomListItemOption from "../../components/custom/CustomListItemOption";
import CustomModal from "../../components/custom/CustomModal";
import { useStores } from "../../models/helpers/useStores";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AccountModel } from "../../models/account/account";
import { getUserInfo } from "../../utils/authUtils";
import ModalAccountType from "../../components/ModalAccountType";
import { AccountTypeSnapshotIn } from "../../models/account-type-store/account-type";
import { showToast } from "../../components/ui/CustomToast";
import {
  getAccountDetailService,
  updateAccountService,
} from "../../services/AccountService";
import {
  currencyMap,
  useCurrencyFormatter,
} from "../../components/custom/CurrencyFormatter";
import { translate } from "../../i18n";
import * as Localization from "expo-localization";
import { AccountBalanceInput } from "../../components/AccountBalanceInput";

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

interface AccountBalanceRouteParams {
  selectedBank: {
    id: string;
    name: string;
    bank_url: string;
  };
  accountId?: string;
  isEditing?: boolean;
  accountData?: BankOption;
  isTransfer?: boolean;
  transferType?: "from" | "to";
  fromScreen?: string;
}

interface AccountBalanceScreenProps
  extends AppStackScreenProps<"AccountBalance"> {}

const locale = Localization.getLocales()[0]?.languageTag || "en-US";

const getDecimalSeparator = () => {
  const numberWithDecimal = 1.1;
  const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal);
  return formatted.replace(/\d/g, "")[0];
};

const isCustomBank = (selectedBank: { name?: string }) =>
  selectedBank.name?.toLowerCase() === "banco personalizado";

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
  function AccountBalanceScreen({ navigation, route }) {
    const {
      selectedBank,
      accountId,
      isEditing,
      accountData,
      isTransfer,
      transferType,
    } = route.params;

    const fromScreen = (route.params as any).fromScreen;
    const [modalVisible, setModalVisible] = useState(false);
    const {
      accountStoreModel: { getListAccountType, accountTypes, createAccount },
      uiStoreModel: { showLoader, hideLoader },
      transactionModel: { updateField },
    } = useStores();
    const rootStore = useStores();
    const [isLoading, setIsLoading] = useState(false);
    const [accountDetail, setAccountDetail] = useState<any>(null);
    const amountInputRef = useRef<TextInput>(null);
    const hasFocusedRef = useRef(false);

    const isCashBank =
      selectedBank.name?.toLowerCase() ===
        translate("modalAccount:cash").toLowerCase() ||
      selectedBank.name?.toLowerCase() === "efectivo";
    logger.debug("isCashBank", isCashBank);
    logger.debug("selectedBank", selectedBank.name);
    logger.debug("translate", translate("modalAccount:cash"));
    const filteredAccountTypes = isCashBank
      ? accountTypes
      : accountTypes.filter(
          (type) => type.type_name?.toLowerCase() !== "efectivo"
        );

    useEffect(() => {
      getListAccountType();
    }, []);

    useEffect(() => {
      if (isEditing && accountId) {
        fetchAccountDetail();
      }
    }, [accountId]);

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

    useEffect(() => {
      const focusTimeout = setTimeout(() => {
        if (amountInputRef.current && !hasFocusedRef.current) {
          Keyboard.dismiss();
          requestAnimationFrame(() => {
            setTimeout(() => {
              amountInputRef.current?.focus();
              if (
                Platform.OS === "android" &&
                isEditing &&
                formik.values.balance > 0
              ) {
                const length = formik.values.balance.toString().length;
                amountInputRef.current?.setNativeProps({
                  selection: { start: length, end: length },
                });
              }
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

    const validationSchema = useMemo(() => {
      const isCustomBank =
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
          is: () => isCustomBank,
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
          const { user } = await getUserInfo(rootStore);

          if (isEditing && accountId) {
            const result = await updateAccountService(accountId, {
              customized_name:
                values.description ||
                translate("accountBalanceScreen:myAccount"),
              account_type_id: values.accountType.id,
              balance: values.balance,
            });

            if (result.kind === "ok") {
              showToast(
                "success",
                translate("accountBalanceScreen:accountSuccess")
              );
              Keyboard.dismiss();
              setTimeout(() => {
                if (fromScreen === "Transaction") {
                  navigation.navigate("Transaction" as any);
                } else {
                  navigation.navigate("Accounts" as any);
                }
              }, 100);
            } else {
              showToast(
                "error",
                translate("accountBalanceScreen:accountError")
              );
            }
          } else {
            const result = await createAccount({
              id: "",
              user_id: user.id,
              name:
                selectedBank.name === "Banco Personalizado"
                  ? translate("components:bankModal.customBank")
                  : selectedBank.name === "Efectivo"
                  ? translate("modalAccount:cash")
                  : selectedBank.name,
              customized_name:
                values.description ||
                translate("accountBalanceScreen:myAccount"),
              bank_id: selectedBank.id,
              icon_url: selectedBank.bank_url,
              account_type_id: values.accountType.id,
              balance: values.balance,
            });
            if (result) {
              showToast(
                "success",
                translate("accountBalanceScreen:accountAddSuccess")
              );
              updateField("account_id", result.id);
              updateField(
                "account_name",
                selectedBank.name === "Banco Personalizado"
                  ? translate("components:bankModal.customBank")
                  : selectedBank.name === "Efectivo"
                  ? translate("modalAccount:cash")
                  : selectedBank.name
              );
              updateField("account_url", selectedBank.bank_url);

              if (isTransfer) {
                if (transferType === "from") {
                  updateField("from_account_id", result.id);
                  updateField(
                    "from_account_name",
                    selectedBank.name === "Banco Personalizado"
                      ? translate("components:bankModal.customBank")
                      : selectedBank.name === "Efectivo"
                      ? translate("modalAccount:cash")
                      : selectedBank.name
                  );
                  updateField("from_account_url", selectedBank.bank_url);
                } else {
                  updateField("to_account_id", result.id);
                  updateField(
                    "to_account_name",
                    selectedBank.name === "Banco Personalizado"
                      ? translate("components:bankModal.customBank")
                      : selectedBank.name === "Efectivo"
                      ? translate("modalAccount:cash")
                      : selectedBank.name
                  );
                  updateField("to_account_url", selectedBank.bank_url);
                }
              }

              if (fromScreen === "EditTransaction") {
                Keyboard.dismiss();
                setTimeout(() => {
                  navigation.goBack();
                  navigation.goBack();
                }, 100);
              } else if (fromScreen === "BankModal") {
                Keyboard.dismiss();
                setTimeout(() => {
                  navigation.goBack();
                  navigation.goBack();
                }, 100);
              } else {
                Keyboard.dismiss();
                setTimeout(() => {
                  navigation.navigate("Transaction" as any, {
                    transactionType: isTransfer ? "Transfer" : undefined,
                  });
                }, 100);
              }
            } else {
              showToast(
                "error",
                translate("accountBalanceScreen:accountErrorAdd")
              );
            }
          }
        } catch (error) {
          showToast(
            "error",
            translate("accountBalanceScreen:accountErrorProcess")
          );
          logger.error(error);
        } finally {
          hideLoader();
          resetForm();
        }
      },
    });

    const translateType = (type: string | undefined) => {
      logger.debug("type", type);
      switch (type) {
        case "Efectivo":
          return translate("modalAccount:cash");
        case "Transferencia":
          return translate("modalAccount:checkingAccount");
        case "Cuenta de Ahorro":
          return translate("modalAccount:savingsAccount");
        case "Tarjeta de Crédito":
          return translate("modalAccount:creditCard");
        case "Cuenta Corriente":
          return translate("modalAccount:currentAccount");

        default:
          return type;
      }
    };

    return (
      <>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <FixedScreen
            safeAreaEdges={["top"]}
            backgroundColor="#FAFAFA"
            statusBarBackgroundColor={colors.primary}
            header={
              <CustomHeader
                onPress={() => navigation.goBack()}
                title={
                  isEditing
                    ? translate("accountBalanceScreen:editAccount")
                    : translate("accountBalanceScreen:addAccount")
                }
              />
            }
            contentContainerStyle={
              Platform.OS === "android" ? { paddingBottom: 70 } : undefined
            }
          >
            <View style={tw`p-4 bg-white rounded-2xl shadow-md w-full`}>
              <AccountBalanceInput
                ref={amountInputRef}
                value={formik.values.balance}
                onChange={(textValue) => {
                  const separator = getDecimalSeparator();
                  const numericValue =
                    parseFloat(textValue.replace(separator, ".")) || 0;
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
                      uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${selectedBank.bank_url}`,
                    }}
                    style={tw`w-[22px] h-[22px] border border-[#6934D2]/15 rounded-full bg-white`}
                    resizeMode="contain"
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
                    {selectedBank.name === "Banco Personalizado"
                      ? translate("components:bankModal.customBank")
                      : selectedBank.name === "Efectivo"
                      ? translate("modalAccount:cash")
                      : selectedBank.name || "ABN AMRO Bank"}
                  </Text>
                </View>
              </View>
              <View style={tw`flex-row items-center justify-between h-[60px]`}>
                <View style={tw`flex-row items-center`}>
                  <CustomListItemOption
                    showBorder={false}
                    icon="note"
                    label={translate("accountBalanceScreen:name")}
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
                      recurrenceSelected={translateType(
                        formik.values.accountType?.type_name
                      )}
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
            isEnabled={!!(formik.isValid && formik.values.accountType.id)}
            onPress={formik.handleSubmit}
            title={translate("accountBalanceScreen:continue")}
            adaptToKeyboard={true}
          />
        </KeyboardAvoidingView>
      </>
    );
  }
);
