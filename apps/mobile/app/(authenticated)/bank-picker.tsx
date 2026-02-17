import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { Text } from "@/components/ui";
import { useStores } from "@/models/helpers/useStores";
import { observer } from "mobx-react-lite";
import { translate } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";

export default observer(function BankPicker() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    storeKey: string;
    hideBankActions?: string;
  }>();

  const {
    bankStoreModel: { banks },
    uiStoreModel,
  } = useStores();

  const handleSelect = useCallback(
    (bank: any) => {
      if (params.storeKey) {
        uiStoreModel.setSheetSelection(
          params.storeKey,
          JSON.stringify({
            id: bank.id,
            name: bank.name,
            icon_url: bank.icon_url,
          }),
        );
      }
      router.back();
    },
    [router, uiStoreModel, params.storeKey],
  );

  const handleAddBank = useCallback(() => {
    router.push("/(authenticated)/select-bank");
  }, [router]);

  return (
    <View style={tw`flex-1 bg-white pt-2`}>
      <View style={tw`px-4 pb-3 items-center`}>
        <Text type="lg" weight="semibold">
          {translate("components:bankModal.selectAccount")}
        </Text>
      </View>

      {params.hideBankActions !== "true" && (
        <View style={tw`px-4 mb-3`}>
          <TouchableOpacity
            onPress={handleAddBank}
            style={tw`flex-row items-center gap-3 p-3 bg-[${colors.primaryBg}] rounded-xl`}
          >
            <View
              style={tw`w-[44px] h-[44px] bg-[${colors.primary}] rounded-lg items-center justify-center`}
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </View>
            <Text weight="medium" color={colors.primary}>
              {translate("components:bankModal.addAccount")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={[...banks]}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={tw`px-4 pb-8`}
        renderItem={({ item, index }: { item: any; index: number }) => {
          const isLastItem = index === banks.length - 1;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={[
                tw`flex-row items-center gap-3 p-3`,
                !isLastItem && {
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(96, 106, 132, 0.15)",
                },
              ]}
            >
              {item.icon_url ? (
                <Image
                  source={{ uri: item.icon_url }}
                  style={tw`w-[44px] h-[44px] rounded-lg`}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={tw`w-[44px] h-[44px] bg-[${colors.bgClear}] rounded-lg items-center justify-center`}
                >
                  <Ionicons
                    name="business"
                    size={20}
                    color={colors.primary}
                  />
                </View>
              )}
              <Text weight="medium">{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
});
