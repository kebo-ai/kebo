import { useLocalSearchParams, useRouter } from "expo-router";
import { View, FlatList, Pressable } from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { Text } from "@/components/ui";
import { translate } from "@/i18n";
import { useStores } from "@/models/helpers/useStores";

interface DataItem {
  label: string;
  value: string;
}

export default function SelectionSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    data: string;
    selectedValue: string;
    isRecurrence?: string;
    storeKey: string;
  }>();

  const rootStore = useStores();
  const data: DataItem[] = params.data ? JSON.parse(params.data) : [];
  const isRecurrence = params.isRecurrence === "true";

  const getDisplayValue = (item: DataItem): string => {
    if (isRecurrence) {
      return translate(item.label as any);
    }
    return item.label;
  };

  const handleSelect = (value: string) => {
    if (params.storeKey) {
      rootStore.uiStoreModel.setSheetSelection(params.storeKey, value);
    }
    router.back();
  };

  return (
    <View style={tw`flex-1 bg-white pt-2`}>
      <View style={tw`px-4 pb-3 items-center`}>
        <Text type="lg" weight="semibold">
          {params.title}
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.value}
        contentContainerStyle={tw`px-4`}
        renderItem={({ item, index }) => {
          const isSelected = item.value === params.selectedValue;
          const isLastItem = index === data.length - 1;
          return (
            <Pressable
              onPress={() => handleSelect(item.value)}
              style={({ pressed }) => [
                tw`p-4 rounded-xl`,
                !isLastItem && {
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(96, 106, 132, 0.15)",
                },
                pressed && { backgroundColor: colors.primaryBg },
                isSelected && { backgroundColor: colors.primaryBg },
              ]}
            >
              <Text
                weight={isSelected ? "semibold" : "normal"}
                color={isSelected ? colors.primary : colors.textGray}
              >
                {getDisplayValue(item)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
