import logger from "@/utils/logger";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { useStores } from "@/models/helpers/use-stores";
import {
  Category,
  CategorySnapshotIn,
  CategorySnapshotOut,
} from "@/models/category/category";
import { SvgUri } from "react-native-svg";
import { CategoryItem } from "./category-item";
import { observer } from "mobx-react-lite";
import { MotiView } from "moti";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { showToast } from "@/components/ui/custom-toast";
import CustomAlert from "./custom-alert";
import {
  deleteCategoryService,
  getCategoriesUsers,
} from "@/services/category-service";
import { translate } from "@/i18n";
import { translateCategoryName } from "@/utils/category-translations";

const ICON_SIZE = 50;

interface CustomCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: React.Dispatch<
    React.SetStateAction<CategorySnapshotIn | undefined>
  >;
  navigation: any;
  categories: Category[];
  screenName?: string;
  hideActions?: boolean;
  multipleSelection?: boolean;
  selectedCategories?: { id: string; name: string }[];
}

const EditButtons = React.memo(
  ({ onRemove, onEdit }: { onRemove: () => void; onEdit: () => void }) => (
    <>
      <TouchableOpacity style={styles.deleteButton} onPress={onRemove}>
        <View style={styles.deleteCircle}>
          <Ionicons name="close" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <View style={styles.editCircle}>
          <Ionicons name="pencil" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
    </>
  )
);

const EditableCategoryItem = React.memo(
  ({
    item,
    editMode,
    removeCategory,
    editCategory,
    onSelect,
    screenName,
  }: {
    item: any;
    editMode: boolean;
    removeCategory: (id: string) => void;
    editCategory: (id: string) => void;
    onSelect: () => void;
    screenName?: string;
  }) => {
    return (
      <View style={styles.categoryContainer}>
        {editMode && (
          <EditButtons
            onRemove={() => removeCategory(item.id ?? "")}
            onEdit={() => {
              editCategory(item.id ?? "");
            }}
          />
        )}
        <CategoryItem
          item={item}
          showActions={false}
          setShowActions={() => {}}
          onSelect={onSelect}
          screenName={screenName}
        />
      </View>
    );
  }
);

const CustomCategoryModal: React.FC<CustomCategoryModalProps> = observer(
  ({
    visible,
    onClose,
    onSelect,
    navigation,
    categories,
    screenName,
    hideActions = false,
    multipleSelection = false,
    selectedCategories = [],
  }) => {
    const {
      transactionModel,
      categoryStoreModel: { getCategories },
    } = useStores();

    const [editMode, setEditMode] = useState(false);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
      null
    );

    const removeCategory = useCallback((categoryId: string) => {
      setCategoryToDelete(categoryId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!categoryToDelete) return;

      try {
        const result = await deleteCategoryService(categoryToDelete);
        if (result.kind === "ok") {
          await getCategories();

          const remainingCategories = categories.filter(
            (cat) => cat.id !== categoryToDelete
          );
          if (remainingCategories.length > 0) {
            const nextCategory = remainingCategories[0];
            transactionModel.setSelectedCategory({
              id: nextCategory.id,
              name: nextCategory.name || "",
              icon_url: nextCategory.icon_url || "",
            });
          } else {
            transactionModel.setSelectedCategory({
              id: "",
              name: "",
              icon_url: "",
            });
          }
        }
      } finally {
        setIsDeleteAlertVisible(false);
        setCategoryToDelete(null);
      }
    }, [categoryToDelete, categories, transactionModel, getCategories]);

    const editCategory = useCallback(
      (categoryId: string) => {
        const categoryToEdit = categories.find((cat) => cat.id === categoryId);
        if (categoryToEdit) {
          onClose();
          navigation.navigate("NewCategoryScreen", {
            isEditing: true,
            categoryData: {
              id: categoryToEdit.id,
              name: categoryToEdit.name,
              icon_url: categoryToEdit.icon_url,
              type: categoryToEdit.type,
            },
            previousScreen: screenName,
          });
        }
      },
      [categories, navigation, onClose, screenName]
    );

    const visibleCategories = useMemo(() => {
      return categories.filter((cat) => cat.is_visible !== false);
    }, [categories]);

    const navigateToNewCategory = useCallback(() => {
      onClose();
      navigation.navigate("NewCategoryScreen", {
        previousScreen: screenName,
        isNew: true,
      });
    }, [navigation, onClose, screenName]);

    const handleSelectCategory = useCallback(
      (item: any) => {
        if (!editMode) {
          if (multipleSelection) {
            onSelect(item);
          } else {
            onSelect(item);
            onClose();
          }
        }
      },
      [editMode, onClose, multipleSelection, onSelect]
    );

    const renderItem = useCallback(
      ({ item }: { item: any }) => {
        const isEmoji = item.icon_url && !item.icon_url.startsWith("/storage/");
        return (
          <View style={tw`items-center p-2 mb-4`}>
            <TouchableOpacity
              style={tw`items-center bg-white p-3  w-full`}
              onPress={() => handleSelectCategory(item)}
            >
              <View
                style={tw`w-[50px] h-[50px] rounded-3xl p-2 items-center justify-center mb-2`}
              >
                {isEmoji ? (
                  <Text style={tw`text-3xl`}>{item.icon_url}</Text>
                ) : (
                  <SvgUri
                    width={30}
                    height={30}
                    uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.icon_url}`}
                  />
                )}
              </View>
              <Text style={tw`text-xs text-black text-center`}>
                {translateCategoryName(item.name, item.id, item.icon_url)}
              </Text>
            </TouchableOpacity>
          </View>
        );
      },
      [handleSelectCategory, selectedCategories]
    );

    const keyExtractor = useCallback((item: any) => {
      return "category_id" in item ? item.category_id ?? item.id : item.id;
    }, []);

    const listData = useMemo(() => {
      if (hideActions) return visibleCategories;
      return visibleCategories;
    }, [visibleCategories, hideActions]);

    const handleClose = () => {
      if (editMode) {
        setEditMode(false);

        logger.debug("Finalizó edición. Cambios listos.");
      }

      onClose();
    };

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-white p-4 rounded-t-3xl h-[60%]`}>
            <View style={tw`relative items-center mb-4`}>
              <Text
                style={tw`text-lg font-medium text-center absolute left-0 right-0`}
              >
                {translate("components:categoryModal.category")}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={tw`absolute right-0 px-2`}
              >
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <GestureHandlerRootView style={tw`flex-1`}>
              <FlatList
                data={listData}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-4`}
                columnWrapperStyle={tw`justify-evenly`}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                scrollEnabled={true}
                initialNumToRender={9}
                maxToRenderPerBatch={9}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </GestureHandlerRootView>
            {multipleSelection && (
              <TouchableOpacity
                style={tw`bg-[${colors.primary}] py-3 rounded-lg mt-4`}
                onPress={handleClose}
              >
                <Text style={tw`text-white text-center font-medium`}>
                  {translate("common:continue")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <CustomAlert
            visible={isDeleteAlertVisible}
            title={translate("components:categoryModal.deleteCategory")}
            message={translate("components:categoryModal.deleteMessage")}
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setIsDeleteAlertVisible(false);
              setCategoryToDelete(null);
            }}
            type="danger"
            confirmText={translate("components:categoryModal.confirmDelete")}
            cancelText={translate("components:categoryModal.cancelDelete")}
          />
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  categoryContainer: {
    position: "relative",
    width: ICON_SIZE + 20,
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    top: -4,
    left: -4,
    zIndex: 2,
  },
  deleteCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editButton: {
    position: "absolute",
    top: -4,
    right: -4,
    zIndex: 2,
  },
  editCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default React.memo(CustomCategoryModal);
