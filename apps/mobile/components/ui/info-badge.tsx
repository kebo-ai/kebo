import React, { useState } from "react";
import { Modal, Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./text";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";

interface InfoBadgeProps {
  /** Inline label shown next to the icon */
  label: string;
  /** Modal title */
  title: string;
  /** Modal body text */
  message: string;
  /** Optional dismiss button text */
  dismissLabel?: string;
  /** Called when the modal is dismissed */
  onDismiss?: () => void;
}

export function InfoBadge({
  label,
  title,
  message,
  dismissLabel = "OK",
  onDismiss,
}: InfoBadgeProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.badge}
        hitSlop={8}
      >
        <Text type="sm" weight="medium" color={theme.textPrimary}>
          {label}
        </Text>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.primary}
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleDismiss}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surfaceSecondary },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text type="lg" weight="semibold" color={theme.textPrimary}>
              {title}
            </Text>

            <Text
              type="sm"
              weight="normal"
              color={theme.textSecondary}
              style={styles.message}
            >
              {message}
            </Text>

            <Pressable
              onPress={handleDismiss}
              style={[
                styles.dismissButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text type="sm" weight="semibold" color="#FFFFFF">
                {dismissLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  message: {
    marginTop: 12,
    lineHeight: 22,
  },
  dismissButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
});
