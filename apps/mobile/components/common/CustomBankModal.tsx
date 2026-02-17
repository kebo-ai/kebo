import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui";
import { SwipeListView, RowMap } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { navigate } from "@/navigators";
import { useStores } from "@/models/helpers/useStores";
import { observer } from "mobx-react-lite";
import {
  deleteAccountService,
  getAccountsWithBalance,
} from "@/services/AccountService";
import { showToast } from "@/components/ui/CustomToast";
import CustomAlert from "./CustomAlert";
import { translate } from "@/i18n";
import { useCurrencyFormatter, currencyMap } from "./CurrencyFormatter";
import * as Localization from "expo-localization";

interface BankOption {
  id: string;
  name: string;
  icon_url: string | null;
  description: string;
  balance: number;
  sum__total_balance?: number;
  account_type_id: string;
}

interface CustomBankModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (bank: { id: string; name?: string; icon_url?: string }) => void;
  selectedBank?: string;
  selectedBanks?: string[];
  multipleSelection?: boolean;
  isTransfer?: boolean;
  transferType?: "from" | "to";
  otherAccountId?: string;
  screenName?: string;
  hideBankActions?: boolean;
}

const CustomBankModal: React.FC<CustomBankModalProps> = observer(
  ({
    visible,
    onClose,
    onSelect,
    selectedBank,
    selectedBanks = [],
    multipleSelection = false,
    isTransfer,
    transferType,
    otherAccountId,
    screenName,
    hideBankActions = false,
  }) => {
    const {
      accountStoreModel: {
        getListAccount,
        accounts,
        deleteAccountById,
        AccountsWithBalance,
      },
      transactionModel: { updateField },
    } = useStores();
    const { getSymbol, formatAmount } = useCurrencyFormatter();

    const [openRow, setOpenRow] = useState<string | null>(null);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [bankToDelete, setBankToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [accountsWithBalance, setAccountsWithBalance] = useState<any[]>([]);

    useEffect(() => {
      if (visible) {
        getListAccount();
        getAccountsWithBalance().then((data) => {
          if (data) setAccountsWithBalance(data);
        });
      }
    }, [visible]);

    const bankOptions = [
      ...accounts
        .filter((account) => !otherAccountId || account.id !== otherAccountId)
        .map((account) => ({
          id: account.id,
          name: account.name,
          icon_url: account.icon_url,
          description: account.customized_name,
          balance: account.balance,
          account_type_id: account.account_type_id,
        })),
    ];

    const handleDelete = (bankId: string) => {
      setBankToDelete(bankId);
      setIsDeleteAlertVisible(true);
    };

    const handleConfirmDelete = async () => {
      if (!bankToDelete) return;

      setIsDeleting(true);
      try {
        const result = await deleteAccountService(bankToDelete);
        if (result.kind === "ok") {
          setIsUpdating(true);
          await getListAccount();

          const remainingAccounts = bankOptions.filter(
            (account) => account.id !== bankToDelete
          );
          if (remainingAccounts.length > 0) {
            const nextAccount = remainingAccounts[0];
            if (isTransfer) {
              if (transferType === "from") {
                updateField("from_account_id", nextAccount.id);
                updateField(
                  "from_account_name",
                  nextAccount.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : nextAccount.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : nextAccount.name
                );
                updateField("from_account_url", nextAccount.icon_url ?? "");
              } else {
                updateField("to_account_id", nextAccount.id);
                updateField(
                  "to_account_name",
                  nextAccount.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : nextAccount.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : nextAccount.name
                );
                updateField("to_account_url", nextAccount.icon_url ?? "");
              }
            } else {
              updateField("account_id", nextAccount.id);
              updateField(
                "account_name",
                nextAccount.name === "Efectivo"
                  ? translate("modalAccount:cash")
                  : nextAccount.name === "Banco Personalizado"
                  ? translate("components:bankModal.customBank")
                  : nextAccount.name
              );
              updateField("account_url", nextAccount.icon_url ?? "");
            }
          } else {
            if (isTransfer) {
              if (transferType === "from") {
                updateField("from_account_id", "");
                updateField("from_account_name", "");
                updateField("from_account_url", "");
              } else {
                updateField("to_account_id", "");
                updateField("to_account_name", "");
                updateField("to_account_url", "");
              }
            } else {
              updateField("account_id", "");
              updateField("account_name", "");
              updateField("account_url", "");
            }
          }
          showToast(
            "success",
            translate("components:bankModal.deleteAccountSuccess")
          );
        } else {
          showToast("error", translate("components:bankModal.errorAccount"));
        }
      } catch (error) {
        showToast("error", translate("components:bankModal.errorAccount"));
      } finally {
        setIsDeleting(false);
        setIsUpdating(false);
        setIsDeleteAlertVisible(false);
        setBankToDelete(null);
      }
    };

    const getTotalBalance = (accountId: string) => {
      const found = accountsWithBalance.find(
        (acc) => acc.account_id === accountId
      );
      return found ? Number(found.sum__total_balance) : 0;
    };

    const renderItem = (data: { item: BankOption }) => {
      const isSelected = multipleSelection
        ? selectedBanks.includes(data.item.id)
        : selectedBank === data.item.id;

      return (
        <Pressable
          onPress={() => {
            if (isTransfer) {
              if (transferType === "from") {
                updateField("from_account_id", data.item.id);
                updateField(
                  "from_account_name",
                  data.item.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : data.item.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : data.item.name
                );
                updateField("from_account_url", data.item.icon_url ?? "");
              } else {
                updateField("to_account_id", data.item.id);
                updateField(
                  "to_account_name",
                  data.item.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : data.item.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : data.item.name
                );
                updateField("to_account_url", data.item.icon_url ?? "");
              }
            } else {
              updateField("account_id", data.item.id);
              updateField(
                "account_name",
                data.item.name === "Efectivo"
                  ? translate("modalAccount:cash")
                  : data.item.name === "Banco Personalizado"
                  ? translate("components:bankModal.customBank")
                  : data.item.name
              );
              updateField("account_url", data.item.icon_url ?? "");
            }
            onSelect({
              id: data.item.id,
              name:
                data.item.name === "Efectivo"
                  ? translate("modalAccount:cash")
                  : data.item.name === "Banco Personalizado"
                  ? translate("components:bankModal.customBank")
                  : data.item.name,
              icon_url: data.item.icon_url ?? undefined,
            });
            if (!multipleSelection) {
              onClose();
            }
          }}
          style={[
            tw`my-1 bg-white`,
            {
              height: 60,
              borderWidth: 1,
              borderRadius: 20,
              borderTopRightRadius:
                !hideBankActions && openRow === data.item.id ? 0 : 20,
              borderBottomRightRadius:
                !hideBankActions && openRow === data.item.id ? 0 : 20,
              borderColor: isSelected
                ? colors.primary
                : "rgba(96, 106, 132, 0.15)",
              padding: 16,
              zIndex: 0,
            },
          ]}
        >
          <View style={tw`flex-row items-center h-full`}>
            {data.item.icon_url ? (
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${data.item.icon_url}`,
                }}
                style={tw`w-7 h-7 bg-white rounded-full border border-[#6934D2]/15 mr-3`}
                resizeMode="contain"
              />
            ) : (
              <MaterialIcons
                name="account-balance"
                size={24}
                color={colors.primary}
                style={tw`mr-3`}
              />
            )}
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center`}>
                <Text
                  weight="medium"
                  style={[
                    {
                      fontWeight: "500",
                      fontSize: 16,
                      lineHeight: 20,
                      letterSpacing: 0,
                      color: isSelected
                        ? colors.primary
                        : "rgba(96, 106, 132, 1)",
                      flex: 1,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {data.item.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : data.item.name}
                  {data.item.description
                    ? `: ${
                        data.item.description === "Efectivo"
                          ? translate("modalAccount:cash")
                          : data.item.description
                      }`
                    : ""}
                </Text>
              </View>

              <Text
                weight="light"
                style={[
                  {
                    fontSize: 12,
                    color: "rgba(96, 106, 132, 0.5)",
                    marginTop: 2,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {translate("components:bankModal.balance")} {": "}
                {formatAmount(getTotalBalance(data.item.id), true)}
              </Text>
            </View>
            {multipleSelection && (
              <MaterialIcons
                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                size={24}
                color={isSelected ? colors.primary : "rgba(96, 106, 132, 0.5)"}
              />
            )}
            {!hideBankActions && (
              <Ionicons
                name="chevron-back"
                size={14}
                color={colors.primary}
                style={tw`ml-2`}
              />
            )}
          </View>
        </Pressable>
      );
    };

    const renderHiddenItem = (
      data: { item: BankOption },
      rowMap: RowMap<BankOption>
    ) => {
      if (hideBankActions) return null;

      return (
        <View
          style={[
            tw`flex-1 flex-row justify-end h-[60px] my-1`,
            { zIndex: 1, position: "absolute", right: 0, top: 0, bottom: 0 },
          ]}
        >
          <TouchableOpacity
            style={[
              tw`${
                openRow === data.item.id ? `bg-[${colors.primary}]` : "bg-white"
              } w-[65px] h-full justify-center items-center`,
            ]}
            onPress={() => {
              navigate("AccountBalance", {
                selectedBank: {
                  ...data.item,
                  bank_url: data.item.icon_url,
                },
                accountId: data.item.id,
                isEditing: true,
                accountData: data.item,
                fromScreen: screenName,
              });
              onClose();
            }}
          >
            <MaterialIcons
              name="edit"
              size={24}
              color={openRow === data.item.id ? colors.white : colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`${
                openRow === data.item.id
                  ? `bg-[${colors.secondary}]`
                  : "bg-white"
              } w-[65px] h-full justify-center items-center rounded-r-[20px]`,
            ]}
            onPress={() => handleDelete(data.item.id)}
          >
            <MaterialIcons
              name="delete"
              size={24}
              color={openRow === data.item.id ? colors.white : colors.secondary}
            />
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback
          onPress={onClose}
          disabled={isDeleting || isUpdating}
        >
          <View style={tw`flex-1 justify-end bg-black/50`}>
            <View style={tw`bg-white p-4 rounded-t-3xl max-h-[70%]`}>
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <TouchableOpacity
                  onPress={() => {
                    if (multipleSelection && selectedBanks.length > 0) {
                      onSelect({ id: "" }); // Clear selection
                    }
                  }}
                  style={tw`flex-1`}
                >
                  {multipleSelection && (
                    <Text style={tw`text-[${colors.primary}] font-medium`}>
                      {/* {translate("transactionScreen:transactions:clear")} */}
                    </Text>
                  )}
                </TouchableOpacity>
                <Text style={tw`text-lg font-medium text-center flex-1`}>
                  {translate("components:bankModal.selectAccount")}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={tw`flex-1 items-end`}
                >
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {bankOptions.length === 0 ? (
                <View style={tw`items-center justify-center py-10`}>
                  <Text style={tw`text-base text-gray-500`}>
                    {translate("components:bankModal.noAccounts")}
                  </Text>
                </View>
              ) : (
                <SwipeListView
                  data={bankOptions}
                  renderItem={renderItem}
                  renderHiddenItem={renderHiddenItem}
                  rightOpenValue={hideBankActions ? 0 : -130}
                  disableRightSwipe={hideBankActions}
                  keyExtractor={(item) => item.id}
                  style={tw`mb-4`}
                  onRowOpen={(rowKey) => setOpenRow(rowKey)}
                  onRowClose={() => setOpenRow(null)}
                  useNativeDriver={true}
                  swipeToOpenPercent={10}
                  swipeToClosePercent={90}
                  closeOnRowBeginSwipe={true}
                  recalculateHiddenLayout={true}
                  disableHiddenLayoutCalculation={false}
                  directionalDistanceChangeThreshold={5}
                />
              )}

              {multipleSelection && (
                <TouchableOpacity
                  onPress={onClose}
                  style={tw`bg-[${colors.primary}] rounded-[40px] p-4 items-center mt-2 mb-6`}
                >
                  <Text style={tw`text-white font-medium`}>
                    {translate("transactionScreen:confirm")}
                  </Text>
                </TouchableOpacity>
              )}

              {!hideBankActions && (
                <TouchableOpacity
                  onPress={() => {
                    navigate("SelectBank", {
                      isTransfer,
                      transferType,
                      fromBankModal: true,
                      fromScreen: screenName,
                    });
                    onClose();
                  }}
                  style={tw`border border-[${colors.primary}] rounded-[40px] p-4 items-center mt-2 mb-6`}
                >
                  <Text style={tw`text-[${colors.primary}]`}>
                    {translate("components:bankModal.addAccount")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
        <CustomAlert
          visible={isDeleteAlertVisible}
          title={translate("components:bankModal.deleteAccount")}
          message={translate("components:bankModal.deleteMessage")}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteAlertVisible(false);
            setBankToDelete(null);
          }}
          type="danger"
          confirmText={translate("components:bankModal.confirmDelete")}
          cancelText={translate("components:bankModal.cancelDelete")}
        />
        {(isDeleting || isUpdating) && (
          <View
            style={[
              tw`absolute left-0 top-0 w-full h-full z-50 items-center justify-center`,
              { backgroundColor: "rgba(255,255,255,0.7)" },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={tw`mt-2 text-[${colors.primary}] font-medium`}>
              {translate("common:deleting") + "..."}
            </Text>
          </View>
        )}
      </Modal>
    );
  }
);

export default CustomBankModal;
