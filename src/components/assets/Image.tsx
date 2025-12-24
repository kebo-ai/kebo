import { ComponentType } from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

export type ImagesTypes = keyof typeof imageRegistry;

interface ImagesProps extends TouchableOpacityProps {
  /**
   * The name of the icon
   */
  icon: ImagesTypes;

  /**
   * An optional tint color for the icon
   */
  color?: string;

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: { width: number; height: number };

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>;

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * An optional function to be called when the icon is pressed
   */
  onPress?: TouchableOpacityProps["onPress"];
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export function ImageCustom(props: ImagesProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...WrapperProps
  } = props;

  const isPressable = !!WrapperProps.onPress;
  const Wrapper = (
    WrapperProps?.onPress ? TouchableOpacity : View
  ) as ComponentType<TouchableOpacityProps | ViewProps>;

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    size,
    $imageStyleOverride,
  ];

  return (
    <Wrapper
      accessibilityRole={isPressable ? "imagebutton" : undefined}
      {...WrapperProps}
      style={$containerStyleOverride}
    >
      <Image style={$imageStyle} source={imageRegistry[icon]} />
    </Wrapper>
  );
}

export const imageRegistry = {
  keboLogoHeader: require("../../assets/images/kebo-app-logo-header.png"),
  successToast: require("../../assets/images/success-toast.png"),
  errorToast: require("../../assets/images/error-toast.png"),
  warningToast: require("../../assets/images/warning-toast.png"),
  chatbotEmpty: require("../../assets/images/kebo-wise.png"),
  reports: {
    spanish: {
      reportCard1: require("../../assets/images/report-card-spanish-1.png"),
      reportCard2: require("../../assets/images/report-card-spanish-2.png"),
      reportCard3: require("../../assets/images/report-card-spanish-3.png"),
      reportCard4: require("../../assets/images/report-card-spanish-4.png"),
    },
    english: {
      reportCard1: require("../../assets/images/report-card-english-1.png"),
      reportCard2: require("../../assets/images/report-card-english-2.png"),
      reportCard3: require("../../assets/images/report-card-english-3.png"),
      reportCard4: require("../../assets/images/report-card-english-4.png"),
    },
    // Add more languages here in the future
  },
};
const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
};
