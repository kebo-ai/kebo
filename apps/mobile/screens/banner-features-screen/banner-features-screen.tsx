import logger from "@/utils/logger";
import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, ActivityIndicator, Image } from "react-native";
import { Text } from "@/components/ui";
import { observer } from "mobx-react-lite";
import { BannerService } from "@/services/banner-service";
import CustomButton from "@/components/common/custom-button";
import { useRouter, useLocalSearchParams } from "expo-router";
import tw from "@/hooks/use-tailwind";
import { SvgUri } from "react-native-svg";
import i18n from "@/i18n/i18n";
import AppIntroSlider from "react-native-app-intro-slider";
import { translate } from "@/i18n/translate";
import { colors } from "@/theme/colors";
import { supabase } from "@/config/supabase";

const { width } = Dimensions.get("window");

interface Slide {
  key: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
}

export const BannerFeaturesScreen = observer(function BannerFeaturesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preloadedBanners?: string }>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sliderRef = useRef<AppIntroSlider>(null);
  const [allSlides, setAllSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigateToHome = () => {
    router.replace("/(authenticated)/(tabs)/home");
  };

  useEffect(() => {
    const initializeBanner = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/(auth)/welcome");
          return;
        }

        let availableBanners = params.preloadedBanners
          ? JSON.parse(params.preloadedBanners)
          : undefined;

        if (!availableBanners) {
          const shouldShowBanner = await BannerService.shouldShowBanner();

          if (!shouldShowBanner) {
            navigateToHome();
            return;
          }

          const data = await BannerService.getDynamicBanners(i18n.language);
          if (!data || data.length === 0) {
            await BannerService.markBannerAsSeen();
            navigateToHome();
            return;
          }
          availableBanners = data;
        }

        const processedSlides = availableBanners.flatMap((banner: any) =>
          banner.banner.slides.map((slide: any) => ({
            key: `${banner.id}-${slide.title}`,
            title: slide.title,
            subtitle: slide.subtitle || "",
            description: slide.description || "",
            image: slide.asset.url,
          }))
        );
        setAllSlides(processedSlides);
      } catch (error) {
        logger.error("Error loading banner:", error);
        navigateToHome();
      } finally {
        setIsLoading(false);
      }
    };

    initializeBanner();
  }, [router, params.preloadedBanners]);

  const handleNext = () => {
    if (currentSlideIndex < allSlides.length - 1) {
      sliderRef.current?.goToSlide(currentSlideIndex + 1);
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleDone = async () => {
    await BannerService.markBannerAsSeen();
    navigateToHome();
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={tw`flex-1 bg-white`}>
        <View
          style={tw`items-center justify-center px-5 position-absolute top-1/6`}
        >
          <Text style={tw`text-black text-center text-xl font-bold mb-1`}>
            {item.title}
          </Text>
          {item.image && item.image.includes("svg") ? (
            <SvgUri
              uri={item.image}
              style={{
                width: width * 0.8,
                height: width * 0.8,
                marginVertical: 20,
              }}
            />
          ) : (
            <Image
              source={{ uri: item.image }}
              style={{
                width: width * 0.8,
                height: width * 0.8,
                marginVertical: 20,
                resizeMode: "contain",
              }}
            />
          )}
          {item.subtitle && (
            <Text
              style={tw`text-black text-center text-lg mt-1 px-2`}
              weight="medium"
            >
              {item.subtitle}
            </Text>
          )}
          {item.description && (
            <Text
              style={tw`text-black text-center text-base mt-4 px-2`}
              weight="light"
            >
              {item.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const isLastSlide = currentSlideIndex === allSlides.length - 1;

  return (
    <View style={tw`flex-1 bg-white`}>
      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : allSlides.length > 0 ? (
        <AppIntroSlider
          ref={sliderRef}
          data={allSlides}
          renderItem={renderSlide}
          onDone={handleDone}
          onSlideChange={(index) => setCurrentSlideIndex(index)}
          showSkipButton={false}
          dotStyle={{
            backgroundColor: "rgba(0,0,0,0.2)",
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
          }}
          activeDotStyle={{
            backgroundColor: colors.primary,
            width: 8,
            height: 8,
            borderRadius: 4,
          }}
          renderNextButton={() => (
            <View style={tw`px-5`}>
              <CustomButton
                variant="primary"
                title={translate("common:continue")}
                onPress={handleNext}
                isEnabled={!isLastSlide}
              />
            </View>
          )}
          renderDoneButton={() => (
            <View style={tw`px-5`}>
              <CustomButton
                variant="primary"
                title={translate("common:great")}
                onPress={handleDone}
                isEnabled={true}
              />
            </View>
          )}
          bottomButton
        />
      ) : (
        <View style={tw`flex-1 bg-white`} />
      )}
    </View>
  );
});
