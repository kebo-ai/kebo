import logger from "@/utils/logger";
import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  TextInput,
  Platform,
  TextInputProps,
  Pressable,
  Text,
} from "react-native";
import tw from "@/hooks/useTailwind";
import { colors } from "@/theme/colors";
import { useCurrencyFormatter } from "./common/CurrencyFormatter";
import { useStores } from "@/models/helpers/use-stores";

interface InputAmountProps {
  value: string;
  onChange: (value: string) => void;
  showSymbol?: boolean;
  currency?: string;
  style?: TextInputProps["style"];
  inputAccessoryViewID?: string;
}

const mergeRefs =
  (...refs: any[]) =>
  (node: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(node);
      else if (ref && "current" in ref) ref.current = node;
    });
  };

export const InputAmount = React.forwardRef<TextInput, InputAmountProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      showSymbol = true,
      currency, 
      style,
      inputAccessoryViewID,
      ...restProps
    } = props;

    useStores();
    const inputRef = useRef<TextInput>(null);
    const { getSymbol, userCurrency, locale } = useCurrencyFormatter();
    
    const activeCurrency = currency || userCurrency || "USD";
    const symbol = getSymbol(activeCurrency);

    const decimalSeparator = useMemo(() => {
      try {
        const decimal = new Intl.NumberFormat(locale).format(1.1).replace(/\d/g, "")[0] || ".";
        return decimal;
      } catch {
        return ".";
      }
    }, [locale]);

    const [displayValue, setDisplayValue] = useState<string>(value || "0");
    const [selection, setSelection] = useState<{ start: number; end: number }>({
      start: (value || "0").length,
      end: (value || "0").length,
    });
    const [isInitialZero, setIsInitialZero] = useState<boolean>(
      value === "0" || displayValue === "0"
    );
    const [hasBeenFocused, setHasBeenFocused] = useState<boolean>(false);

    useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value);
        setIsInitialZero(value === "0");

        const cursorPosition = value.length;
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

    // useEffect(() => {
    //   if (transactionModel && transactionModel.amount !== undefined) {
    //     const newValue = transactionModel.amount.toString();
    //     setDisplayValue(newValue);
    //     setIsInitialZero(newValue === "0");

    //     const cursorPosition = newValue.length;
    //     setSelection({
    //       start: cursorPosition,
    //       end: cursorPosition,
    //     });

    //     if (Platform.OS === "android" && inputRef.current) {
    //       setTimeout(() => {
    //         if (inputRef.current) {
    //           inputRef.current.setNativeProps({
    //             selection: { start: cursorPosition, end: cursorPosition },
    //           });
    //         }
    //       }, 100);
    //     }
    //   }
    // }, [transactionModel.amount]);

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

      let cleaned = text.replace(/[^0-9.,]/g, "");

      if (cleaned === "" || cleaned === decimalSeparator) {
        setDisplayValue("0");
        setIsInitialZero(true);
        onChange("0");
        setSelection({ start: 1, end: 1 });
        return;
      }

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
      if (!displayValue || displayValue === "0")
        return showSymbol ? `${symbol} 0` : "0";

      try {
        const normalizedValue = displayValue.replace(/[.,]/g, decimalSeparator);

        const [intPart, decimalPart] = normalizedValue.includes(
          decimalSeparator
        )
          ? normalizedValue.split(decimalSeparator)
          : [normalizedValue, ""];

        const formattedInt = new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
          useGrouping: true,
        }).format(parseInt(intPart || "0"));

        if (normalizedValue.includes(decimalSeparator)) {
          return `${
            showSymbol ? symbol + " " : ""
          }${formattedInt}${decimalSeparator}${decimalPart || ""}`;
        }

        return `${showSymbol ? symbol + " " : ""}${formattedInt}`;
      } catch (error) {
        logger.error("Error formatting value:", error);
        return showSymbol ? `${symbol} ${displayValue}` : displayValue;
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
                selection: { start: 0, end: 1 }, // Select the entire "0"
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
          tw`bg-[${colors.white}] h-[120px] rounded-[20px] border border-[#E3E3E5] justify-center`,
          style,
        ]}
      >
        <TextInput
          ref={mergeRefs(inputRef, ref)}
          value={displayValue}
          onChangeText={handleChange}
          onSelectionChange={handleSelectionChange}
          onFocus={handleFocus}
          keyboardType="decimal-pad"
          caretHidden={Platform.OS === "android"}
          // caretHidden={false}
          showSoftInputOnFocus={true}
          keyboardAppearance="default"
          selection={selection}
          // selectionColor={colors.primary}
          selectionColor={"transparent"}
          style={[
            tw`text-center ml-10 absolute w-full h-full`,
            {
              color: "transparent",
              backgroundColor: "transparent",
              // fontSize: 32,
              // fontWeight: "300",
            },
          ]}
          inputAccessoryViewID={inputAccessoryViewID}
          {...restProps}
        />

        {/* The visible formatted text */}
        <Text
          style={[
            tw`text-center`,
            {
              fontFamily: Platform.select({
                ios: "SF UI Display",
                android: "sans-serif-light",
              }),
              fontWeight: "300",
              fontSize: 40,
              lineHeight: 41,
              letterSpacing: 0.4,
              color: "rgba(96, 106, 132, 1)",
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getFormattedValue()}
        </Text>
      </Pressable>
    );
  }
);
