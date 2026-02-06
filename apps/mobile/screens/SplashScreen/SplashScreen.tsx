import logger from "@/utils/logger";
import { FC, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { View, StyleSheet, BackHandler, Animated } from "react-native";
import { AppStackScreenProps } from "@/navigators";
import { observer } from "mobx-react-lite";
import { ImageCustom } from "@/components/assets/Image";
import {
  isUserAuthenticated,
  subscribeAuthChanges,
} from "@/utils/authUtils";
import { BannerService } from "@/services/BannerService";
import i18n from "@/i18n/i18n";
import { DynamicBanner } from "@/types/banner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ONBOARDING_EVENTS } from "@/services/AnalyticsService";

interface SplashScreenProps extends AppStackScreenProps<"Splash"> {}

export const SplashScreen: FC<SplashScreenProps> = observer(
  function SplashScreen({ navigation }) {
    const animation = useRef<LottieView>(null);
    const analytics = useAnalytics();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
      null
    );
    const [isTimeoutCompleted, setIsTimeoutCompleted] = useState(false);
    const [bannerData, setBannerData] = useState<{
      shouldShow: boolean;
      banners: DynamicBanner[];
    } | null>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const fadeOut = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      navigation.setOptions({
        gestureEnabled: false,
      });

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          return true;
        }
      );

      return () => backHandler.remove();
    }, [navigation]);

    useEffect(() => {
      analytics.trackAppLaunch();
      analytics.trackSplashScreen();
      analytics.trackScreen("Splash");

      const initialize = async () => {
        try {
          animation.current?.play();
          const authStatus = await isUserAuthenticated();
          setIsAuthenticated(authStatus);

          if (authStatus) {
            const shouldShowBanner = await BannerService.shouldShowBanner();
            if (shouldShowBanner) {
              const data = await BannerService.getDynamicBanners(i18n.language);
              if (data && data.length > 0) {
                setBannerData({
                  shouldShow: true,
                  banners: data,
                });
              }
            }
          }
        } catch (error) {
          logger.error("Error in initialization:", error);
        } finally {
          setTimeout(() => {
            analytics.trackOnboardingEvent(
              ONBOARDING_EVENTS.SPLASH_ANIMATION_COMPLETED
            );
            setIsTimeoutCompleted(true);
          }, 1000);
        }
      };

      initialize();

      const { data: authListener } = subscribeAuthChanges((authStatus) => {
        setIsAuthenticated(authStatus);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }, [analytics]);

    useEffect(() => {
      if (isTimeoutCompleted && isAuthenticated !== null) {
        if (!isAuthenticated) {
          navigation.replace("Welcome");
        } else if (bannerData && bannerData.shouldShow) {
          navigation.replace("BannerFeatures", {
            preloadedBanners: bannerData.banners,
          });
        } else {
          navigation.replace("Dashboard");
        }
      }
    }, [isTimeoutCompleted, isAuthenticated, bannerData, navigation]);

    return (
      <Animated.View style={[styles.animationContainer, { opacity: fadeAnim }]}>
        <LottieView
          ref={animation}
          style={{ width: 650, height: 250 }}
          source={require("@/assets/animations/splashAnimation.json")}
          autoPlay
          loop={false}
        />
        <View>
          <ImageCustom
            icon={"keboLogoHeader"}
            size={{ width: 256, height: 116 }}
          />
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

export default SplashScreen;
