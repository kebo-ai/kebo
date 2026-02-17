import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useStores } from "@/models/helpers/useStores";
import moment from "moment";
import "moment/locale/es";
import i18n from "@/i18n/i18n";

interface CustomFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter?: (filters: any) => void;
}

const CustomFilterModal: React.FC<CustomFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilter,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [type, setType] = useState("Ingreso");
  const [minAmount, setMinAmount] = useState("0");
  const [maxAmount, setMaxAmount] = useState("100");

  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);

  const { categoryStoreModel, accountStoreModel } = useStores();
  const { getCategories, expenseCategories, incomeCategories } =
    categoryStoreModel;
  const { accounts } = accountStoreModel;

  useEffect(() => {
    getCategories();
  }, []);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategory("");
    setAccount("");
    setType("Ingreso");
    setMinAmount("0");
    setMaxAmount("100");
  };

  const handleStartDateConfirm = (date: Date) => {
    const formattedDate = moment(date).locale("es").format("D/M/YYYY");
    setStartDate(formattedDate);
    setStartDatePickerVisibility(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    const formattedDate = moment(date).locale("es").format("D/M/YYYY");
    setEndDate(formattedDate);
    setEndDatePickerVisibility(false);
  };

  const handleCategorySelect = (selectedCategory: any) => {
    setCategory(selectedCategory.name);
    setCategoryModalVisible(false);
  };

  const handleAccountSelect = (selectedAccount: any) => {
    setAccount(selectedAccount.name);
    setAccountModalVisible(false);
  };

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType);
    setTypeModalVisible(false);
  };

  const categoriesForModal =
    type === "Ingreso" ? incomeCategories : expenseCategories;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/40`}>
          <TouchableWithoutFeedback>
            <View style={tw`bg-white p-5 rounded-t-3xl h-[80%]`}>
              <View style={tw`relative items-center justify-center mb-4`}>
                <Text
                  weight="medium"
                  style={tw`text-lg text-[#150627]`}
                >
                  Filtros
                </Text>

                <TouchableOpacity
                  onPress={onClose}
                  style={tw`absolute right-0 top-0 p-1`}
                >
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={tw`px-4`}>
                <Text
                  weight="medium"
                  style={tw`text-sm mb-2`}
                >
                  Rango de fecha
                </Text>
                <View style={tw`flex-row justify-between mb-4`}>
                  <View style={tw`flex-1 mr-2`}>
                    <Text
                      weight="light"
                      style={tw`text-xs mb-1 text-[#606A84]/30 ml-3`}
                    >
                      Desde
                    </Text>
                    <TouchableOpacity
                      onPress={() => setStartDatePickerVisibility(true)}
                      style={tw`flex-row items-center border border-[#606A84]/15 rounded-xl px-4 py-3`}
                    >
                      <Text style={tw`text-sm text-black flex-1`}>
                        {startDate || "Desde"}
                      </Text>
                      <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={tw`flex-1 ml-2`}>
                    <Text
                      weight="light"
                      style={tw`text-xs mb-1 text-[#606A84]/30 ml-3`}
                    >
                      Hasta
                    </Text>
                    <TouchableOpacity
                      onPress={() => setEndDatePickerVisibility(true)}
                      style={tw`flex-row items-center border border-[#606A84]/15 rounded-xl px-4 py-3`}
                    >
                      <Text style={tw`text-sm text-black flex-1`}>
                        {endDate || "Hasta"}
                      </Text>
                      <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text
                  weight="light"
                  style={tw`text-xs text-[#606A84]/30 mb-1 ml-3`}
                >
                  Categorías
                </Text>
                <TouchableOpacity
                  onPress={() => setCategoryModalVisible(true)}
                  style={tw`border border-[#606A84]/15 rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center`}
                >
                  <Text style={tw`text-sm text-black`}>
                    {category || "Seleccionar"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <Text
                  weight="light"
                  style={tw`text-xs text-[#606A84]/30 mb-1 ml-3`}
                >
                  Cuenta
                </Text>
                <TouchableOpacity
                  onPress={() => setAccountModalVisible(true)}
                  style={tw`border border-[#606A84]/15 rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center`}
                >
                  <Text style={tw`text-sm text-black`}>
                    {account || "Seleccionar"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <Text
                  weight="light"
                  style={tw`text-xs text-[#606A84]/30 mb-1 ml-3`}
                >
                  Tipo
                </Text>
                <TouchableOpacity
                  onPress={() => setTypeModalVisible(true)}
                  style={tw`border border-[#606A84]/15 rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center`}
                >
                  <Text style={tw`text-sm text-black`}>
                    {type || "Seleccionar"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <Text
                  weight="light"
                  style={tw`text-xs mb-1 text-[#606A84]/30 ml-3`}
                >
                  Monto
                </Text>
                <View style={tw`flex-row justify-between mb-6`}>
                  <TextInput
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                    placeholder="$ 0"
                    style={tw`flex-1 mr-2 border border-[#606A84]/15 rounded-xl px-4 py-3 text-sm text-black`}
                  />
                  <TextInput
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                    placeholder="$ 100"
                    style={tw`flex-1 ml-2 border border-[#606A84]/15 rounded-xl px-4 py-3 text-sm text-black`}
                  />
                </View>

                <View style={tw`flex-row justify-between`}>
                  <TouchableOpacity
                    style={tw`border border-[${colors.primary}] px-6 py-3 rounded-full flex-1 mr-2 items-center`}
                    onPress={resetFilters}
                  >
                    <Text style={tw`text-[${colors.primary}] font-medium`}>
                      Reset
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-[${colors.primary}] px-6 py-3 rounded-full flex-1 ml-2 items-center`}
                    onPress={() => {
                      onApplyFilter?.({
                        startDate,
                        endDate,
                        category,
                        account,
                        type,
                        minAmount,
                        maxAmount,
                      });
                      onClose();
                    }}
                  >
                    <Text style={tw`text-white font-medium`}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      <DateTimePickerModal
        locale={i18n.language.startsWith("es") ? "es" : "en"}
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartDatePickerVisibility(false)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />

      <DateTimePickerModal
        locale={i18n.language.startsWith("es") ? "es" : "en"}
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndDatePickerVisibility(false)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/40`}>
          <View style={tw`bg-white rounded-t-3xl p-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-lg font-medium`}>Seleccionar Categoría</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={tw`max-h-96`}>
              {categoriesForModal.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={tw`py-3 border-b border-gray-200`}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text style={tw`text-base`}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAccountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/40`}>
          <View style={tw`bg-white rounded-t-3xl p-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-lg font-medium`}>Seleccionar Cuenta</Text>
              <TouchableOpacity onPress={() => setAccountModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={tw`max-h-96`}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={tw`py-3 border-b border-gray-200`}
                  onPress={() => handleAccountSelect(acc)}
                >
                  <Text style={tw`text-base`}>{acc.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/40`}>
          <View style={tw`bg-white rounded-t-3xl p-5`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-lg font-medium`}>Seleccionar Tipo</Text>
              <TouchableOpacity onPress={() => setTypeModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={tw`max-h-96`}>
              {["Ingreso", "Gasto"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={tw`py-3 border-b border-gray-200`}
                  onPress={() => handleTypeSelect(t)}
                >
                  <Text style={tw`text-base`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default CustomFilterModal;
