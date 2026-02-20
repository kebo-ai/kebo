import logger from "@/utils/logger";
import React, { useMemo } from "react";
import * as Localization from "expo-localization";
import { useStores } from "@/models/helpers/useStores";

// Number format → separators mapping
const FORMAT_SEPARATORS: Record<string, { thousands: string; decimal: string }> = {
  "1,234.56": { thousands: ",", decimal: "." },
  "1.234,56": { thousands: ".", decimal: "," },
  "1 234.56": { thousands: " ", decimal: "." },
  "1 234,56": { thousands: " ", decimal: "," },
};

function formatWithSeparators(
  value: number,
  thousands: string,
  decimal: string,
  minDecimals: number = 2,
  maxDecimals: number = 2,
): string {
  const fixed = value.toFixed(maxDecimals);
  const [wholePart, decPart] = fixed.split(".");
  const wholeWithSep = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  if (maxDecimals === 0) return wholeWithSep;
  return `${wholeWithSep}${decimal}${decPart}`;
}

interface CurrencyFormatterProps {
  amount: string | number;
  showSymbol?: boolean;
  locale?: string;
  currency?: string;
}
export const currencyMap: { [key: string]: string } = {
  PE: "PEN",
  CO: "COP",
  MX: "MXN",
  EC: "USD",
  AR: "ARS",
  VE: "VES",
  ES: "EUR",
  CL: "CLP",
  US: "USD",
  BO: "BOB",
  DO: "DOP",
  HN: "HNL",
  SV: "USD",
  GT: "GTQ",
  PY: "PYG",
  CR: "CRC",
  PA: "PAB",
  UY: "UYU",
  BR: "BRL",
  NI: "NIO",
  HT: "HTG",
};

export const useCurrencyFormatter = () => {
  const { profileModel } = useStores();
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";
  const deviceRegion = Localization.getLocales()[0]?.regionCode || "US";

  const userCurrency = profileModel?.currency;
  const userCountry = profileModel?.country;
  const numberFormat = profileModel?.number_format ?? "1,234.56";
  const separators = FORMAT_SEPARATORS[numberFormat] ?? FORMAT_SEPARATORS["1,234.56"];
  
  const { region, locale } = useMemo(() => {
    const calculatedRegion = userCountry || deviceRegion;
    
    const countryToLocaleMap: { [key: string]: string } = {
      PE: "es-PE",
      CO: "es-CO",
      MX: "es-MX",
      EC: "es-EC",
      AR: "es-AR",
      VE: "es-VE",
      ES: "es-ES",
      CL: "es-CL",
      US: "en-US",
      BO: "es-BO",
      DO: "es-DO",
      HN: "es-HN",
      SV: "es-SV",
      GT: "es-GT",
      PY: "es-PY",
      CR: "es-CR",
      PA: "es-PA",
      UY: "es-UY",
      BR: "pt-BR",
      NI: "es-NI",
    };
    
    const calculatedLocale = countryToLocaleMap[calculatedRegion] || `${deviceLanguage}-${calculatedRegion}` || "en-US";
    
    return {
      region: calculatedRegion,
      locale: calculatedLocale,
    };
  }, [userCountry, deviceRegion, deviceLanguage]);

  const getSymbol = useMemo(() => {
    const customSymbols: { [key: string]: string } = {
      PEN: "S/",
      COP: "$",
      MXN: "$",
      USD: "$",
      ARS: "$",
      VES: "Bs.",
      EUR: "€",
      CLP: "$",
      BOB: "Bs",
      DOP: "RD$",
      HNL: "L",
      GTQ: "Q",
      PYG: "₲",
      CRC: "₡",
      PAB: "B/.",
      UYU: "$U",
      BRL: "R$",
      NIO: "C$",
      HTG: "G",
    };

    return (currencyCode: string): string => {
      if (customSymbols[currencyCode]) {
        return customSymbols[currencyCode];
      }

      try {
        const formatted = new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currencyCode,
          currencyDisplay: "narrowSymbol",
        }).format(0);
        return formatted.replace(/\d|,|\.|\s/g, "").trim() || "$";
      } catch {
        return "$";
      }
    };
  }, [locale]);

  const getSymbolCurrency = useMemo(() => {
    const currencyCode = userCurrency || currencyMap[region] || "USD";
    try {
      const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      }).format(0);
      return formatted.replace(/\d|,|\.|\s/g, "").trim() || "$";
    } catch {
      return "$";
    }
  }, [locale, region, userCurrency]);

  const formatAmount = useMemo(() => {
    return (
      amount: string | number,
      showSymbol: boolean = true,
      customLocale?: string,
      customCurrency?: string
    ): string => {
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      const currencyCode = customCurrency || userCurrency || currencyMap[region] || "USD";
      const symbol = getSymbol(currencyCode);

      try {
        const formatted = formatWithSeparators(
          numericAmount,
          separators.thousands,
          separators.decimal,
        );
        return showSymbol ? `${symbol} ${formatted}` : formatted;
      } catch (error) {
        logger.error("Error formatting amount:", error);
        return showSymbol
          ? `${symbol} ${numericAmount.toFixed(2)}`
          : numericAmount.toFixed(2);
      }
    };
  }, [region, userCurrency, getSymbol, separators]);

  const parseLocaleNumber = (stringNumber: string): number => {
    const thousandSeparator = Intl.NumberFormat(locale)
      .format(1111)
      .replace(/1/g, "");
    const decimalSeparator = Intl.NumberFormat(locale)
      .format(1.1)
      .replace(/1/g, "");

    return Number(
      stringNumber
        .replace(new RegExp("\\" + thousandSeparator, "g"), "")
        .replace(new RegExp("\\" + decimalSeparator), ".")
    );
  };

  return {
    formatAmount,
    parseLocaleNumber,
    getSymbol,
    getSymbolCurrency,
    locale,
    region,
    userCurrency,
    decimalSeparator: separators.decimal,
    thousandsSeparator: separators.thousands,
  };
};

export const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
  amount,
  showSymbol = true,
  locale,
  currency,
}) => {
  const { formatAmount } = useCurrencyFormatter();
  return formatAmount(amount, showSymbol, locale, currency);
};

export default CurrencyFormatter;
