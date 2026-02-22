import logger from "@/utils/logger";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { useStores } from "@/models/helpers/use-stores";
import { Category, CategorySnapshotIn } from "@/models/category/category";
import { SvgUri } from "react-native-svg";
import { CategoryItem } from "./CategoryItem";
import { observer } from "mobx-react-lite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { showToast } from "@/components/ui/custom-toast";
import CustomAlert from "./CustomAlert";
import { deleteCategoryService } from "@/services/category-service";
import { translate } from "@/i18n";
import { translateCategoryName } from "@/utils/category-translations";
import { useTheme } from "@/hooks/use-theme";

const ICON_SIZE = 50;

interface CustomCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: React.Dispatch<
    React.SetStateAction<CategorySnapshotIn | undefined>
  >;
  navigation?: any;
  categories: Category[];
  screenName?: string;
  hideActions?: boolean;
  multipleSelection?: boolean;
  selectedCategories?: { id: string; name: string }[];
  disableTouch?: boolean;
}

const AddCategoryButton = React.memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={tw`w-[50px] h-[50px] bg-[#6934D2] rounded-lg items-center justify-center`}
    onPress={onPress}
  >
    <Ionicons name="add" size={24} color={colors.white} />
  </TouchableOpacity>
));

const AddButtonLabel = React.memo(({ color }: { color?: string }) => (
  <Text style={[tw`text-xs mt-2 text-center`, { color: color || "#606A84" }]}>
    {translate("components:categoryModal.add")}
  </Text>
));

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
    disableTouch,
  }: {
    item: any;
    editMode: boolean;
    removeCategory: (id: string) => void;
    editCategory: (id: string) => void;
    onSelect: () => void;
    screenName?: string;
    disableTouch?: boolean;
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
          disableTouch={disableTouch}
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
    disableTouch = false,
  }) => {
    const {
      transactionModel,
      categoryStoreModel: { getCategories },
    } = useStores();
    const { theme } = useTheme();

    const [showActions, setShowActions] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
      null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [forceRender, setForceRender] = useState(0);

    useEffect(() => {
      if (visible) {
        const timer = setTimeout(() => {
          setForceRender((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [visible, categories.length]);

    const toggleEditMode = useCallback(() => {
      setEditMode((prevMode) => !prevMode);
    }, []);

    const removeCategory = useCallback((categoryId: string) => {
      setCategoryToDelete(categoryId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!categoryToDelete) return;

      setIsDeleting(true);
      try {
        const result = await deleteCategoryService(categoryToDelete);
        if (result.kind === "ok") {
          setIsUpdating(true);
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
          showToast(
            "success",
            translate("components:categoryModal.deleteCategorySuccess")
          );
        } else {
          showToast(
            "error",
            translate("components:categoryModal.errorCategory")
          );
        }
      } catch (error) {
        showToast("error", translate("components:categoryModal.errorCategory"));
      } finally {
        setIsDeleting(false);
        setIsUpdating(false);
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
            transactionModel.setSelectedCategory({
              id: item.id ?? "",
              name: item.name ?? "",
              icon_url: item.icon_url ?? "",
            });
            onClose();
          }
        }
      },
      [editMode, onClose, transactionModel, multipleSelection, onSelect]
    );

    const renderItem = useCallback(
      ({ item }: { item: any }) => {
        if (hideActions) {
          const isEmoji =
            item.icon_url && !item.icon_url.startsWith("/storage/");
          return (
            <View style={tw`items-center p-2 mb-4`}>
              <TouchableOpacity
                style={[tw`flex-row items-center p-3 rounded-lg w-full border ${
                  selectedCategories.some((cat) => cat.id === item.id)
                    ? `border-[${colors.primary}]`
                    : `border-[${theme.border}]`
                }`, { backgroundColor: theme.surface }]}
                onPress={() => handleSelectCategory(item)}
              >
                <View style={tw`flex-row items-center flex-1`}>
                  <View
                    style={tw`bg-[#6934D226] w-[40px] h-[40px] rounded-3xl p-2 items-center justify-center mr-3`}
                  >
                    {isEmoji ? (
                      <Text style={tw`text-2xl`}>{item.icon_url}</Text>
                    ) : (
                      <SvgUri
                        width={24}
                        height={24}
                        uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.icon_url}`}
                      />
                    )}
                  </View>
                  <Text style={[tw`text-base`, { color: theme.textPrimary }]} numberOfLines={2}>
                    {translateCategoryName(item.name, item.id, item.icon_url)}
                  </Text>
                </View>
                <View
                  style={tw`w-6 h-6 rounded-full border-2 ${
                    selectedCategories.some((cat) => cat.id === item.id)
                      ? `border-[${colors.primary}]`
                      : `border-[${theme.border}]`
                  } items-center justify-center`}
                >
                  {selectedCategories.some((cat) => cat.id === item.id) && (
                    <View
                      style={tw`w-3 h-3 rounded-full bg-[${colors.primary}]`}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        }
        if (!("category_id" in item)) {
          return (
            <View style={tw`w-[70px] h-[90px] items-center justify-center`}>
              <View>
                <AddCategoryButton onPress={navigateToNewCategory} />
                <AddButtonLabel color={theme.textTertiary} />
              </View>
            </View>
          );
        }
        return (
          <View style={tw`items-center justify-center`}>
            <EditableCategoryItem
              item={item}
              editMode={editMode}
              removeCategory={removeCategory}
              editCategory={() => {
                setEditMode(false);
                editCategory(item.id ?? "");
              }}
              onSelect={() => handleSelectCategory(item)}
              screenName={screenName}
              disableTouch={disableTouch}
            />
          </View>
        );
      },
      [
        editMode,
        navigateToNewCategory,
        removeCategory,
        editCategory,
        handleSelectCategory,
        hideActions,
        disableTouch,
        onSelect,
        onClose,
        multipleSelection,
        selectedCategories,
      ]
    );

    const keyExtractor = useCallback((item: any) => {
      return "category_id" in item ? item.category_id ?? item.id : item.id;
    }, []);

    const listData = useMemo(() => {
      if (hideActions) return visibleCategories;
      return [{ id: "add-button" } as const, ...visibleCategories];
    }, [visibleCategories, hideActions]);

    const handleClose = () => {
      if (editMode) {
        setEditMode(false);
        logger.debug("Finalizó edición. Cambios listos.");
      }

      setShowActions(false);
      setDraggingId(null);
      setIsDeleteAlertVisible(false);
      setCategoryToDelete(null);
      setIsDeleting(false);
      setIsUpdating(false);

      onClose();
    };

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <TouchableWithoutFeedback
            onPress={handleClose}
            disabled={isDeleting || isUpdating}
          >
            <View style={tw`flex-1`} />
          </TouchableWithoutFeedback>
          {(isDeleting || isUpdating) && (
            <View
              style={[
                tw`absolute left-0 top-0 w-full h-full z-50 items-center justify-center`,
                { backgroundColor: theme.background + "B3" },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={tw`mt-2 text-[${colors.primary}] font-medium`}>
                {translate("common:deleting") + "..."}
              </Text>
            </View>
          )}
          <View style={[tw`p-4 rounded-t-3xl h-[60%]`, { backgroundColor: theme.background }]}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              {!hideActions && (
                <TouchableOpacity onPress={toggleEditMode} style={tw`px-2`}>
                  <Text style={[tw`text-base`, { color: theme.textSecondary }]}>
                    {editMode
                      ? translate("components:categoryModal.made")
                      : translate("components:categoryModal.edit")}
                  </Text>
                </TouchableOpacity>
              )}
              <View>
                <Text style={[tw`text-lg font-medium`, { color: theme.textPrimary }]}>
                  {translate("components:categoryModal.category")}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={tw`px-2`}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <GestureHandlerRootView style={tw`flex-1`}>
              <FlatList
                key={`category-list-${forceRender}`}
                data={listData}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-4`}
                columnWrapperStyle={tw`justify-between px-7`}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                scrollEnabled={true}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={10}
                removeClippedSubviews={false}
                getItemLayout={(data, index) => ({
                  length: 90,
                  offset: 90 * Math.floor(index / 3),
                  index,
                })}
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
