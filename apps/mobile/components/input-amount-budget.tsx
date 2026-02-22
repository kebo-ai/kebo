import React, { forwardRef } from "react";
import { TextInputProps, Platform } from "react-native";
import CurrencyInput from "react-native-currency-input";
import tw from "@/hooks/use-tailwind";
import { useCurrencyFormatter } from "./common/currency-formatter";

interface InputAmountBudgetProps {
  value: string;
  onChange: (value: string) => void;
  showSymbol?: boolean;
  currency?: string;
  style?: TextInputProps["style"];
  inputAccessoryViewID?: string;
}

export const InputAmountBudget = forwardRef<
  CurrencyInput,
  InputAmountBudgetProps
>(
  (
    {
      value,
      onChange,
      showSymbol = true,
      currency,
      style,
      inputAccessoryViewID,
      ...props
    },
    ref
  ) => {
    const { getSymbol, userCurrency, locale } = useCurrencyFormatter();
    
    const activeCurrency = currency || userCurrency || "USD";
    const symbol = getSymbol(activeCurrency);
    
    const getLocaleSeparators = () => {
      try {
        const formatted = new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(1234.56);
        
        const thousandSeparator = formatted.charAt(1);
        const decimalSeparator = formatted.charAt(5);
        
        return {
          delimiter: thousandSeparator || ',',
          separator: decimalSeparator || '.',
        };
      } catch {
        return { delimiter: ',', separator: '.' };
      }
    };
    
    const { delimiter, separator } = getLocaleSeparators();

    return (
      <CurrencyInput
        ref={ref}
        value={Number(value)}
        onChangeValue={(value) => onChange(value?.toString() || "0")}
        prefix={showSymbol ? symbol + " " : ""}
        delimiter={delimiter}
        separator={separator}
        precision={2}
        minValue={0}
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
            textAlignVertical: "center",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: 20,
          },
          style,
        ]}
        placeholder="0.00"
        keyboardType="numeric"
        inputAccessoryViewID={inputAccessoryViewID}
        {...props}
      />
    );
  }
);
