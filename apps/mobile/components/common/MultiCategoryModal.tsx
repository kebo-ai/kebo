import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import { useStores } from "@/models";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { colors } from "@/theme";
import { SvgUri } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { translateCategoryName } from "@/utils/categoryTranslations";
import { useTheme } from "@/hooks/useTheme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 50) / 3;

interface MultiCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (categories: { id: string; name: string }[]) => void;
  selectedCategories: { id: string; name: string }[];
  onApply?: (categories: { id: string; name: string }[]) => void;
}

export const MultiCategoryModal = observer(
  ({
    visible,
    onClose,
    onSelect,
    selectedCategories,
    onApply,
  }: MultiCategoryModalProps) => {
    const { categoryStoreModel } = useStores();
    const { t: translate } = useTranslation();
    const { theme } = useTheme();
    const [tempSelectedCategories, setTempSelectedCategories] =
      useState<{ id: string; name: string }[]>(selectedCategories);

    useEffect(() => {
      setTempSelectedCategories(selectedCategories);
    }, [selectedCategories]);

    const handleSelectCategory = useCallback(
      (category: { id: string; name: string }) => {
        setTempSelectedCategories((prev) => {
          const exists = prev.some((cat) => cat.id === category.id);
          if (exists) {
            return prev.filter((cat) => cat.id !== category.id);
          }
          return [...prev, category];
        });
      },
      []
    );

    const handleApply = useCallback(() => {
      onSelect(tempSelectedCategories);
      if (onApply) onApply(tempSelectedCategories);
      onClose();
    }, [tempSelectedCategories, onSelect, onClose, onApply]);

    const renderItem = useCallback(
      ({ item }: { item: any }) => {
        const isSelected = tempSelectedCategories.some(
          (cat) => cat.id === item.id
        );
        const isEmoji = item.icon_url && !item.icon_url.startsWith("/storage/");

        return (
          <View style={[tw`items-center mb-6`, { width: ITEM_WIDTH }]}>
            <TouchableOpacity
              onPress={() => handleSelectCategory(item)}
              activeOpacity={0.85}
            >
              <View
                style={tw`w-14 h-14 rounded-2xl items-center justify-center ${
                  isSelected ? "bg-[#6934D2]/20" : "bg-transparent"
                }`}
              >
                {isEmoji ? (
                  <Text style={tw`text-3xl`}>{item.icon_url}</Text>
                ) : (
                  <SvgUri
                    width={48}
                    height={48}
                    uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.icon_url}`}
                  />
                )}
              </View>
            </TouchableOpacity>
            <Text style={[tw`text-xs text-center mt-2`, { color: theme.textSecondary }]}>
              {translateCategoryName(item.name, item.id, item.icon_url)}
            </Text>
          </View>
        );
      },
      [tempSelectedCategories, handleSelectCategory, theme]
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View
            style={[tw`rounded-t-3xl max-h-[60%]`, { backgroundColor: theme.surface }]}
          >
            <View
              style={tw`flex-row justify-between items-center p-5 px-4`}
            >
              <TouchableOpacity
                onPress={() => setTempSelectedCategories([])}
                style={tw`flex-1`}
              >
                <Text style={tw`text-[${colors.primary}] font-medium`}>
                  {translate("transactionScreen:transactions:clear")}
                </Text>
              </TouchableOpacity>
              <Text style={[tw`text-lg font-medium text-center flex-1`, { color: theme.textPrimary }]}>
                {translate("transactionScreen:transactions:categories")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={tw`flex-1 items-end`}
              >
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={tw`px-5`}
              showsVerticalScrollIndicator={false}
            >
              <FlatList
                data={categoryStoreModel.categories}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={tw`items-center pb-4`}
              />
            </ScrollView>
            <View style={tw`px-5 pb-6`}>
              <TouchableOpacity
                onPress={handleApply}
                style={tw`bg-[${colors.primary}] rounded-[40px] p-4 items-center mt-2`}
              >
                <Text style={tw`text-white font-medium`}>
                  {translate("transactionScreen:transactions:apply")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);
