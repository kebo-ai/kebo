import logger from "@/utils/logger";
import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, ActivityIndicator, Image } from "react-native";
import { Text } from "@/components/ui";
import { observer } from "mobx-react-lite";
import { BannerService } from "@/services/banner-service";
import CustomButton from "@/components/common/custom-button";
import { useRouter } from "expo-router";
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

const BannerFeaturesRoute = observer(function BannerFeaturesRoute() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sliderRef = useRef<AppIntroSlider>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const shouldShow = await BannerService.shouldShowBanner();
        if (!shouldShow) {
          router.replace("/(authenticated)/(tabs)/home");
          return;
        }

        const data = await BannerService.getDynamicBanners(i18n.language);
        if (data && data.length > 0) {
          const formattedSlides = data.map((item: any, index: number) => ({
            key: `slide-${index}`,
            title: item.banner?.title || "",
            subtitle: item.banner?.subtitle || "",
            description: item.banner?.description || "",
            image: item.banner?.image_url || "",
          }));
          setSlides(formattedSlides);
        } else {
          router.replace("/(authenticated)/(tabs)/home");
        }
      } catch (error) {
        logger.error("Error fetching banners:", error);
        router.replace("/(authenticated)/(tabs)/home");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [router]);

  const handleDone = async () => {
    await BannerService.markBannerAsSeen();
    router.replace("/(authenticated)/(tabs)/home");
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      sliderRef.current?.goToSlide(currentSlideIndex + 1);
    } else {
      handleDone();
    }
  };

  const renderItem = ({ item }: { item: Slide }) => {
    const isLastSlide = slides.indexOf(item) === slides.length - 1;
    const isSvg = item.image?.endsWith(".svg");

    return (
      <View style={tw`flex-1 items-center justify-center px-6 bg-white`}>
        <View style={tw`w-full h-[300px] items-center justify-center`}>
          {isSvg ? (
            <SvgUri
              width="100%"
              height="100%"
              uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.image}`}
            />
          ) : (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${item.image}`,
              }}
              style={tw`w-full h-full`}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={tw`mt-8 items-center`}>
          <Text
            style={tw`text-2xl text-center text-[${colors.secondary}]`}
            weight="bold"
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={tw`text-base text-center text-gray-600 mt-2`}
              weight="medium"
            >
              {item.subtitle}
            </Text>
          )}
          {item.description && (
            <Text
              style={tw`text-sm text-center text-gray-500 mt-4 px-4`}
              weight="normal"
            >
              {item.description}
            </Text>
          )}
        </View>
        <View style={tw`mt-auto mb-12 w-full px-4`}>
          <CustomButton
            variant="primary"
            isEnabled={true}
            onPress={handleNext}
            title={
              isLastSlide
                ? translate("common:continue")
                : translate("common:continue")
            }
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <AppIntroSlider
        ref={sliderRef}
        data={slides}
        renderItem={renderItem}
        showNextButton={false}
        showDoneButton={false}
        onSlideChange={(index: number) => setCurrentSlideIndex(index)}
        dotStyle={tw`bg-gray-300 w-2 h-2`}
        activeDotStyle={tw`bg-[${colors.primary}] w-2 h-2`}
      />
    </View>
  );
});

export default BannerFeaturesRoute;
