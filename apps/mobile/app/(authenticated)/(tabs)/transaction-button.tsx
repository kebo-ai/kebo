import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Keyboard } from "react-native";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { TransactionType } from "@/types/transaction";
import { useTheme } from "@/hooks/use-theme";

export default function TransactionButton() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: "/(authenticated)/transaction",
        params: { transactionType: TransactionType.EXPENSE },
      });

      return () => {
        hasNavigated.current = false;
      };
    }, [router]),
  );

  return <View style={{ flex: 1, backgroundColor: theme.background }} />;
}
