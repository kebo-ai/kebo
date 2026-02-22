import { ErrorInfo } from "react";
import { Text } from "react-native";
import { Screen } from "@/components";

export interface ErrorDetailsProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset(): void;
}

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails(props: ErrorDetailsProps) {
  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]}>
      <Text>Error</Text>
    </Screen>
  );
}
