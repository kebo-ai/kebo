import React, { useRef, useState } from 'react'
import { View, TextInput, Text, TouchableWithoutFeedback } from 'react-native'
import * as Localization from 'expo-localization'
import tw from 'twrnc'
import { colors } from '@/theme'

const locale = Localization.getLocales()[0]?.languageTag || 'en-US'

const getDecimalSeparator = () => {
  const numberWithDecimal = 1.1
  const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal)
  return formatted.replace(/\d/g, '')[0]
}

const decimalSeparator = getDecimalSeparator()

export const FormattedNumberInput = () => {
  const inputRef = useRef<TextInput>(null)
  const [rawValue, setRawValue] = useState<string>('0')

  const handleChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.,]/g, '')
    const parts = cleaned.split(/[.,]/)

    if (parts.length > 2) {
      cleaned = parts[0] + decimalSeparator + parts[1]
    }

    const [intPart, decimalPart] = cleaned.split(/[.,]/)
    if (decimalPart !== undefined) {
      cleaned = intPart + decimalSeparator + decimalPart.slice(0, 2)
    }

    if (cleaned === '') {
      setRawValue('0')
    } else if (rawValue === '0' && /^[0-9]$/.test(cleaned)) {
      setRawValue(cleaned)
    } else {
      setRawValue(cleaned)
    }
  }

  const getFormattedValue = () => {
    if (!rawValue) return '0'

    const [intPart, decimalPartRaw] = rawValue.split(/[.,]/)

    const formattedInt = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(parseInt(intPart || '0'))

    if (rawValue.includes(decimalSeparator)) {
      return `${formattedInt}${decimalSeparator}${decimalPartRaw || ''}`
    }

    return formattedInt
  }

  return (
    <View style={tw`p-4`}>
      <Text style={tw`text-[${colors.black}] mb-2`}>
        💸 Ingresa un monto:
      </Text>

      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View
          style={tw`border rounded-xl p-3 bg-[${colors.white}] justify-center`}
        >
          <Text style={tw`text-[${colors.primary}] text-base`}>
            {getFormattedValue()}
          </Text>
        </View>
      </TouchableWithoutFeedback>

      <TextInput
        ref={inputRef}
        value={rawValue}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        style={tw`absolute opacity-0 h-0`}
      />
    </View>
  )
}
