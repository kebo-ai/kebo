import { TransactionScreen as TransactionScreenComponent } from "@/screens/TransactionScreen/TransactionScreen";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createNavigationAdapter } from "@/utils/routerNavigation";

export default function TransactionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    transactionType?: "Expense" | "Income" | "Transfer";
    transactionId?: string;
    fromCategoryScreen?: string;
  }>();

  // Create a navigation adapter that maps expo-router to React Navigation API
  const navigation = {
    navigate: (route: string, navParams?: any) => {
      if (route === "Home") {
        router.replace("/(authenticated)/(tabs)/home");
      } else if (route === "NewCategoryScreen") {
        router.push({
          pathname: "/(authenticated)/new-category",
          params: navParams,
        });
      } else {
        router.push(route as any);
      }
    },
    goBack: () => router.back(),
    setOptions: () => {},
    addListener: (event: string, callback: () => void) => {
      // Return a function to unsubscribe
      return () => {};
    },
  };

  const route = {
    params: {
      transactionType: params.transactionType,
      transactionId: params.transactionId,
      fromCategoryScreen: params.fromCategoryScreen === "true",
    },
  };

  return (
    <TransactionScreenComponent
      navigation={navigation as any}
      route={route as any}
    />
  );
}
