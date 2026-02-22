import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { Text } from "@/components/ui";
import { useStores } from "@/models/helpers/useStores";
import { observer } from "mobx-react-lite";
import { SvgUri } from "react-native-svg";
import { translate } from "@/i18n";
import { translateCategoryName } from "@/utils/category-translations";
import { Ionicons } from "@expo/vector-icons";
const ICON_SIZE = 50;

export default observer(function CategoryPicker() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: string;
    screenName?: string;
    hideActions?: string;
    storeKey: string;
  }>();

  const {
    categoryStoreModel: { expenseCategories, incomeCategories },
    uiStoreModel,
  } = useStores();

  const categories =
    params.type === "income" ? incomeCategories : expenseCategories;

  const [searchText, setSearchText] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const query = searchText.toLowerCase();
    return categories.filter((cat: any) => {
      const name = translateCategoryName(cat.name);
      return name.toLowerCase().includes(query);
    });
  }, [categories, searchText]);

  const handleSelect = useCallback(
    (category: any) => {
      const data = {
        id: category.id,
        name: category.name,
        icon_url: category.icon_url,
        icon_emoji: category.icon_emoji,
        color_id: category.color_id,
        type: category.type,
      };

      if (params.storeKey) {
        uiStoreModel.setSheetSelection(
          params.storeKey,
          JSON.stringify(data),
        );
      }
      router.back();
    },
    [router, uiStoreModel, params.storeKey],
  );

  const handleAddCategory = useCallback(() => {
    router.push({
      pathname: "/(authenticated)/new-category",
      params: { screenName: params.screenName },
    });
  }, [router, params.screenName]);

  return (
    <View style={tw`flex-1 bg-white pt-2`}>
      <View style={tw`px-4 pb-3 items-center`}>
        <Text type="lg" weight="semibold">
          {translate("components:categoryModal.category")}
        </Text>
      </View>

      {params.hideActions !== "true" && (
        <View style={tw`px-4 mb-3`}>
          <TouchableOpacity
            onPress={handleAddCategory}
            style={tw`flex-row items-center gap-2 p-3 bg-[${colors.primaryBg}] rounded-xl`}
          >
            <View
              style={tw`w-[${ICON_SIZE}px] h-[${ICON_SIZE}px] bg-[${colors.primary}] rounded-lg items-center justify-center`}
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </View>
            <Text weight="medium" color={colors.primary}>
              {translate("components:categoryModal.add")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredCategories}
        keyExtractor={(item: any) => item.id}
        numColumns={4}
        contentContainerStyle={tw`px-4 pb-8`}
        columnWrapperStyle={tw`gap-2 mb-3`}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={tw`flex-1 items-center gap-1 max-w-[25%]`}
          >
            {item.emoji ? (
              <View
                style={tw`w-[${ICON_SIZE}px] h-[${ICON_SIZE}px] bg-[${item.color || "#F0EBFB"}] rounded-lg items-center justify-center`}
              >
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              </View>
            ) : item.icon ? (
              <SvgUri
                width={ICON_SIZE}
                height={ICON_SIZE}
                uri={item.icon}
              />
            ) : (
              <View
                style={tw`w-[${ICON_SIZE}px] h-[${ICON_SIZE}px] bg-[${item.color || "#F0EBFB"}] rounded-lg items-center justify-center`}
              >
                <Ionicons name="help" size={24} color={colors.gray} />
              </View>
            )}
            <Text
              type="caption"
              weight="medium"
              numberOfLines={1}
              style={tw`text-center`}
            >
              {translateCategoryName(item.name)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
});
