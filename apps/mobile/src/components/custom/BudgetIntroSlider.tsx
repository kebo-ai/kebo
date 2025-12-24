import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { colors } from "../../theme/colors";
import CustomButton from "./CustomButton";
import { translate } from "../../i18n/translate";

interface Slide {
  key: string;
  title: string;
  text: string;
  image: any;
}

interface BudgetIntroSliderProps {
  slides: Slide[];
  onDone: () => void;
  name: string;
}

const BudgetIntroSlider: React.FC<BudgetIntroSliderProps> = ({
  slides,
  onDone,
  name,
}) => {
  const sliderRef = useRef<AppIntroSlider>(null);
  const { width } = useWindowDimensions();

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {translate("budgetOnboarding:welcome", {
            name: name?.trim() ? name.trim().split(" ")[0] : "",
          })}
        </Text>
        <Image
          source={item.image}
          style={[styles.image, { width: width * 0.8, height: width * 0.8 }]}
          resizeMode="contain"
        />
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <AppIntroSlider
      ref={sliderRef}
      data={slides}
      renderItem={renderItem}
      onDone={onDone}
      showSkipButton={false}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      renderNextButton={() => (
        <View style={styles.buttonContainer}>
          <CustomButton
            variant="primary"
            title="Siguiente"
            onPress={() =>
              sliderRef.current?.goToSlide(
                sliderRef.current.state.activeIndex + 1
              )
            }
            isEnabled={true}
          />
        </View>
      )}
      renderDoneButton={() => (
        <View style={styles.buttonContainer}>
          <CustomButton
            variant="primary"
            title="Listo"
            onPress={onDone}
            isEnabled={true}
          />
        </View>
      )}
      bottomButton
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -130,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: "SFUIDisplayBold",
    fontSize: 20,
    marginBottom: 2,
    color: colors.black,
    textAlign: "center",
  },
  text: {
    fontFamily: "SFUIDisplayLight",
    fontSize: 14,
    textAlign: "center",
    color: colors.black,
    marginTop: 2,
    paddingHorizontal: 10,
  },
  image: {
    marginVertical: 10,
  },
  dot: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "android" ? 100 : 100,
    backgroundColor: colors.white,
  },
});

export default BudgetIntroSlider;
