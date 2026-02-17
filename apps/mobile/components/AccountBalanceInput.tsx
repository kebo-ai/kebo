import logger from "@/utils/logger";
import React, { useRef, useState, useEffect, forwardRef } from "react";
import {
  TextInput,
  Platform,
  View,
  TextInputProps,
  Keyboard,
  Pressable,
} from "react-native";
import { Text } from "@/components/ui";
import * as Localization from "expo-localization";
import tw from "@/hooks/useTailwind";
import { colors } from "@/theme/colors";
import { useCurrencyFormatter, currencyMap } from "./common/CurrencyFormatter";

const locale = Localization.getLocales()[0]?.languageTag || "en-US";

const getDecimalSeparator = () => {
  const numberWithDecimal = 1.1;
  const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal);
  return formatted.replace(/\d/g, "")[0];
};

const decimalSeparator = getDecimalSeparator();

interface AccountBalanceInputProps {
  value: number;
  onChange: (value: string) => void;
  label?: string;
  style?: TextInputProps["style"];
  containerStyle?: any;
}

const mergeRefs =
  (...refs: any[]) =>
  (node: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(node);
      else if (ref && "current" in ref) ref.current = node;
    });
  };

export const AccountBalanceInput = forwardRef<
  TextInput,
  AccountBalanceInputProps
>((props, ref) => {
  const {
    value,
    onChange,
    label = "Account Balance",
    style,
    containerStyle,
    ...restProps
  } = props;

  const inputRef = useRef<TextInput>(null);
  const { getSymbol, region } = useCurrencyFormatter();

  const [displayValue, setDisplayValue] = useState<string>(
    value?.toString() || "0"
  );
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: (value?.toString() || "0").length,
    end: (value?.toString() || "0").length,
  });

  const [isInitialZero, setIsInitialZero] = useState<boolean>(
    value === 0 || displayValue === "0"
  );
  const [hasBeenFocused, setHasBeenFocused] = useState<boolean>(false);

  useEffect(() => {
    if (value !== undefined) {
      const valueString = value.toString();
      setDisplayValue(valueString);
      setIsInitialZero(value === 0 || valueString === "0");

      const cursorPosition = valueString.length;
      setSelection({
        start: cursorPosition,
        end: cursorPosition,
      });

      if (Platform.OS === "android" && inputRef.current) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setNativeProps({
              selection: { start: cursorPosition, end: cursorPosition },
            });
          }
        }, 100);
      }
    }
  }, [value]);

  useEffect(() => {
    if (displayValue === "0" && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          if (Platform.OS === "android") {
            inputRef.current.setNativeProps({
              selection: { start: 0, end: 1 },
            });
          }
        }
      }, 100);
    } else if (
      displayValue !== "0" &&
      inputRef.current &&
      Platform.OS === "android"
    ) {
      const cursorPosition = displayValue.length;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setNativeProps({
            selection: { start: cursorPosition, end: cursorPosition },
          });
        }
      }, 100);
    }
  }, [displayValue]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();

      setTimeout(() => {
        if (
          Platform.OS === "android" &&
          displayValue === "0" &&
          !hasBeenFocused
        ) {
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setNativeProps({
                selection: { start: 0, end: 1 },
              });
            }
          }, 50);
          setHasBeenFocused(true);
        } else if (Platform.OS === "android" && displayValue !== "0") {
          const cursorPosition = displayValue.length;

          if (inputRef.current) {
            inputRef.current.setNativeProps({
              selection: { start: cursorPosition, end: cursorPosition },
            });
          }
        } else {
          const length = displayValue.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setNativeProps({
                selection: { start: length, end: length },
              });
            }
          }, 50);
        }
      }, 10);
    }
  };

  const handleChange = (text: string) => {
    if (text.length > 12) {
      return;
    }

    if (
      Platform.OS === "android" &&
      !isInitialZero &&
      displayValue.length > 0
    ) {
      if (text.length === displayValue.length + 1) {
        if (text.substring(1) === displayValue) {
          const digitToAppend = text.charAt(0);
          const newValue = displayValue + digitToAppend;
          setDisplayValue(newValue);
          onChange(newValue);
          setSelection({ start: newValue.length, end: newValue.length });
          return;
        }
      }
    }

    if (
      Platform.OS === "android" &&
      isInitialZero &&
      displayValue === "0" &&
      text.length === 2 &&
      /^\d\d$/.test(text)
    ) {
      const actualDigitEntered = text.charAt(0);
      setDisplayValue(actualDigitEntered);
      setIsInitialZero(false);
      onChange(actualDigitEntered);
      setSelection({ start: 1, end: 1 });
      return;
    }

    if (isInitialZero && /^[1-9]$/.test(text)) {
      setDisplayValue(text);
      setIsInitialZero(false);
      onChange(text);
      setSelection({ start: 1, end: 1 });
      return;
    }

    let cleaned = text.replace(/[^0-9.,]/g, "");

    if (cleaned === "" || cleaned === decimalSeparator) {
      setDisplayValue("0");
      setIsInitialZero(true);
      onChange("0");
      setSelection({ start: 1, end: 1 });
      return;
    }

    const thousandSeparator = decimalSeparator === "." ? "," : ".";

    const parts = cleaned.split(/[.,]/);

    if (parts.length > 2) {
      const decimalPart = parts.pop();
      const integerPart = parts.join("");
      cleaned = integerPart + decimalSeparator + decimalPart;
    } else if (parts.length === 2) {
      const lastChar = cleaned[cleaned.length - 1];
      if (lastChar === decimalSeparator) {
        cleaned = parts[0] + decimalSeparator;
      } else {
        cleaned = parts[0] + decimalSeparator + parts[1];
      }
    }

    const [intPart, decimalPart] = cleaned.split(decimalSeparator);
    if (decimalPart !== undefined) {
      cleaned = intPart + decimalSeparator + decimalPart.slice(0, 2);
    }

    if (
      cleaned.startsWith("0") &&
      !cleaned.startsWith(`0${decimalSeparator}`) &&
      cleaned.length > 1
    ) {
      const numericCleaned = cleaned.replace(/^0+/, "");
      setDisplayValue(numericCleaned);
      setIsInitialZero(false);
      onChange(numericCleaned);
      setSelection({
        start: numericCleaned.length,
        end: numericCleaned.length,
      });
    } else {
      setDisplayValue(cleaned);
      setIsInitialZero(cleaned === "0");
      onChange(cleaned);
      setSelection({ start: cleaned.length, end: cleaned.length });
    }
  };

  const getFormattedValue = () => {
    if (!displayValue || displayValue === "0") {
      return `${getSymbol(currencyMap[region])} 0`;
    }

    try {
      const normalizedValue = displayValue.replace(/[.,]/g, decimalSeparator);

      const [intPartStr, decimalPartRaw] =
        normalizedValue.split(decimalSeparator);
      const intPart = parseInt(intPartStr || "0");

      const formattedInt = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(intPart);

      let result;
      if (normalizedValue.includes(decimalSeparator)) {
        if (decimalPartRaw === undefined || decimalPartRaw === "") {
          result = `${getSymbol(
            currencyMap[region]
          )} ${formattedInt}${decimalSeparator}`;
        } else {
          result = `${getSymbol(
            currencyMap[region]
          )} ${formattedInt}${decimalSeparator}${decimalPartRaw}`;
        }
      } else {
        result = `${getSymbol(currencyMap[region])} ${formattedInt}`;
      }

      return result;
    } catch (error) {
      logger.error("Error formatting value:", error);
      return `${getSymbol(currencyMap[region])} ${displayValue}`;
    }
  };

  const handleSelectionChange = (event: any) => {
    setSelection(event.nativeEvent.selection);
  };

  const handleFocus = () => {
    setTimeout(() => {
      if (
        Platform.OS === "android" &&
        displayValue === "0" &&
        !hasBeenFocused
      ) {
        setSelection({ start: 0, end: 1 });
        setHasBeenFocused(true);

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setNativeProps({
              selection: { start: 0, end: 1 },
            });
          }
        }, 50);
      } else if (Platform.OS === "android" && displayValue !== "0") {
        const length = displayValue.length;
        setSelection({ start: length, end: length });

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setNativeProps({
              selection: { start: length, end: length },
            });
          }
        }, 50);
      } else {
        const length = displayValue.length;
        setSelection({ start: length, end: length });

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setNativeProps({
              selection: { start: length, end: length },
            });
          }
        }, 50);
      }
    }, 10);
  };

  return (
    <Pressable
      onPress={focusInput}
      style={[
        tw`h-[120px] border border-[rgba(96,106,132,0.15)] border-solid rounded-xl px-[22px] py-[19px]`,
        containerStyle,
      ]}
    >
      {label && (
        <Text
          weight="light"
          style={tw`text-textGray text-sm flex-row items-center mb-2`}
        >
          {label}
        </Text>
      )}
      <View style={tw`flex-1 justify-center`}>
        <TextInput
          ref={mergeRefs(inputRef, ref)}
          value={displayValue}
          onChangeText={handleChange}
          onSelectionChange={handleSelectionChange}
          onFocus={handleFocus}
          keyboardType="decimal-pad"
          showSoftInputOnFocus={true}
          // selectionColor={colors.primary}
          selectionColor={"transparent"}
          style={[
            tw`absolute ml-16 w-full h-full`,
            {
              color: "transparent",
              backgroundColor: "transparent",
              // fontSize: 32,
              // fontWeight: "300",
            },
          ]}
          caretHidden={Platform.OS === "android"}
          // caretHidden={false}
          selection={selection}
          {...restProps}
        />
        <Text
          weight="light"
          color="rgba(96, 106, 132, 1)"
          style={[
            tw`text-4xl`,
            style,
          ]}
        >
          {getFormattedValue()}
        </Text>
      </View>
    </Pressable>
  );
});
