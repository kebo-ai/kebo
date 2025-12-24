import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { colors } from "../../theme/colors";
import { useStores } from "../../models/helpers/useStores";
const Loader = observer(() => {
  const {
    uiStoreModel: { isLoading },
  } = useStores();
  if (!isLoading) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;
