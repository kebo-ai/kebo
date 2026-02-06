import { useWindowDimensions } from "react-native";

export const useResponsiveTailwind = (baseHeight: number, margins: Record<string, number>) => {
    const { height } = useWindowDimensions();
    const scaleFactor = height / baseHeight;

    return Object.entries(margins)
        .map(([key, value]) => `${key}-${Math.round(value * scaleFactor)}`)
        .join(" ");
};
