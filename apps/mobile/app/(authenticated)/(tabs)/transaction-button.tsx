import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Keyboard, InteractionManager } from "react-native";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { TransactionType } from "@/types/transaction";

export default function TransactionButton() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  useFocusEffect(
    useCallback(() => {
      // Prevent double navigation
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      // Wait for native tab transition to complete
      const task = InteractionManager.runAfterInteractions(() => {
        Keyboard.dismiss();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
          pathname: "/(authenticated)/transaction",
          params: { transactionType: TransactionType.EXPENSE },
        });
      });

      return () => {
        hasNavigated.current = false;
        task.cancel();
      };
    }, [router]),
  );

  return <View />;
}
