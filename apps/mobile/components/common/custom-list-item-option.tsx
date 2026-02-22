import React, { useState, useEffect, useMemo } from "react";
import {
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ReturnKeyTypeOptions,
} from "react-native";
import { Text } from "@/components/ui";
import { observer } from "mobx-react-lite";
import tw from "twrnc";
import { CategoryIconSvg } from "@/components/icons/category-icon";
import { AccountIconSvg } from "@/components/icons/account-svg";
import { NoteSvg } from "@/components/icons/note-svg";
import { CalendarIconSvg } from "@/components/icons/calendar-svg";
import { RecurrenceIconSvg } from "@/components/icons/recurrence-svg";
import { ChevronRightIconSvg } from "@/components/icons/chevron-right-icon-svg";
import { InfoIconSvg } from "@/components/icons/info-icon";
import { colors } from "@/theme/colors";
import moment from "moment";
import "moment/locale/es";
import { SvgUri } from "react-native-svg";
import { EndDateIconSvg } from "@/components/icons/end-date-svg";
import { translate } from "@/i18n";
import { translateCategoryName } from "@/utils/category-translations";
import { useTheme } from "@/hooks/use-theme";

interface CustomListItemOptionProps {
  icon?:
    | "category"
    | "account"
    | "note"
    | "calendar"
    | "recurrence"
    | "endDate"
    | "accountToFrom";
  label: string;
  labelSelected?: string;
  iconSelected?: string;
  value?: string;
  onPress: () => void;
  iconSize?: number;
  iconColor?: string;
  showChevron?: boolean;
  selectedDate?: string;
  recurrenceSelected?: string;
  showBorder?: boolean;
  labelText?: string;
  inputValue?: string;
  setInputValue?: (value: string) => void;
  isImage?: boolean;
  isEmoji?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  categoryId?: string;
}

const CustomListItemOption: React.FC<CustomListItemOptionProps> = observer(
  ({
    icon,
    label,
    onPress,
    value,
    showChevron = true,
    labelSelected,
    iconSelected,
    selectedDate,
    recurrenceSelected,
    showBorder = true,
    labelText = translate("editTransaction:recurrence"),
    inputValue,
    setInputValue,
    isImage = false,
    isEmoji = false,
    returnKeyType = "default",
    categoryId,
  }) => {
    const { theme } = useTheme();

    const renderDefaultIcon = () => {
      switch (icon) {
        case "category":
          return <CategoryIconSvg width={28} height={28} />;
        case "account":
          return <AccountIconSvg width={28} height={28} />;
        case "note":
          return <NoteSvg width={28} height={28} />;
        case "accountToFrom":
          return <NoteSvg width={28} height={28} />;
        case "calendar":
          return <CalendarIconSvg width={28} height={28} />;
        case "recurrence":
          return <RecurrenceIconSvg width={28} height={28} />;
        case "endDate":
          return <EndDateIconSvg width={28} height={28} />;
        default:
          return null;
      }
    };

    const iconUrl = useMemo(() => {
      if (!iconSelected) return "";
      return `${process.env.EXPO_PUBLIC_SUPABASE_URL}${iconSelected}`;
    }, [iconSelected]);

    const renderSelectedIcon = () => {
      if (!iconSelected) return null;

      if (isImage) {
        return (
          <View style={tw`w-7 h-7 items-center justify-center overflow-hidden`}>
            <Image
              source={{ uri: iconUrl }}
              style={[tw`w-full h-full rounded-lg`, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
              resizeMode="contain"
            />
          </View>
        );
      }

      if (isEmoji) {
        return (
          <View style={tw`w-7 h-7 items-center justify-center`}>
            <Text style={tw`text-lg`}>{iconSelected}</Text>
          </View>
        );
      }

      return (
        <View style={tw`w-7 h-7 items-center justify-center`}>
          <SvgUri uri={iconUrl} width="100%" height="100%" />
        </View>
      );
    };

    const renderLabel = () => {
      if (icon === "calendar") {
        return (
          selectedDate ||
          moment()
            .locale("es")
            .format("dddd, D MMMM")
            .replace(/^\w/, (c) => c.toUpperCase())
        );
      }
      if (icon === "endDate") {
        return selectedDate || label;
      }
      if (icon === "recurrence") {
        return recurrenceSelected
          ? translate(recurrenceSelected as any)
          : labelText;
      }
      return label;
    };

    const translatedLabelSelected =
      icon === "category" && labelSelected && categoryId
        ? translateCategoryName(labelSelected, categoryId, iconSelected)
        : labelSelected;

    return (
      <TouchableOpacity
        onPress={icon === "note" ? undefined : onPress}
        style={[
          tw`flex-row items-center py-3`,
          showBorder && { borderBottomWidth: 1, borderBottomColor: theme.border },
        ]}
        disabled={icon === "note"}
        activeOpacity={1}
      >
        {icon && (
          <View
            style={[
              tw`mr-3 rounded-lg w-7 h-7 items-center justify-center`,
              !isImage && { backgroundColor: "rgba(105, 52, 210, 0.15)", borderWidth: 1, borderColor: "rgba(105, 52, 210, 0.15)" },
            ]}
          >
            {labelSelected ? renderSelectedIcon() : renderDefaultIcon()}
          </View>
        )}
        <View style={tw`flex-1 flex-row items-center`}>
          {icon === "note" ? (
            <TextInput
              style={[
                tw`flex-1 text-base`,
                {
                  fontFamily: "SFUIDisplayLight",
                  color: theme.textSecondary,
                },
              ]}
              placeholder={label}
              placeholderTextColor={theme.textTertiary}
              value={inputValue}
              onChangeText={setInputValue}
              returnKeyType={returnKeyType}
            />
          ) : (
            <View style={tw`flex-row flex-1`}>
              <Text
                weight={
                  icon === "calendar" ||
                  icon === "endDate" ||
                  (icon === "recurrence" && recurrenceSelected)
                    ? "medium"
                    : "light"
                }
                style={tw`text-base`}
                color={theme.textSecondary}
              >
                {renderLabel()}
              </Text>
              {translatedLabelSelected && (
                <Text
                  weight="semibold"
                  style={tw`text-base flex-1`}
                  color={theme.textPrimary}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {`${translatedLabelSelected}${value ? ` - ${value}` : ""}`}
                </Text>
              )}
            </View>
          )}
        </View>

        {showChevron && icon !== "note" && (
          <View style={tw`ml-3`}>
            <ChevronRightIconSvg width={14} height={14} />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

export default CustomListItemOption;
