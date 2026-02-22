import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, BackHandler, Animated, useColorScheme } from "react-native";
import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { ImageCustom } from "@/components/assets/Image";
import {
  isUserAuthenticated,
  subscribeAuthChanges,
} from "@/utils/auth-utils";
import { BannerService } from "@/services/banner-service";
import i18n from "@/i18n/i18n";
import { useAnalytics } from "@/hooks/useAnalytics";
import logger from "@/utils/logger";
import { colors } from "@/theme/colors";

const SplashIndex = observer(function SplashIndex() {
  const animation = useRef<LottieView>(null);
  const analytics = useAnalytics();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const bgColor = isDark ? colors.dark.background : colors.light.background;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isTimeoutCompleted, setIsTimeoutCompleted] = useState(false);
  const [bannerData, setBannerData] = useState<{
    shouldShow: boolean;
    banners: any[];
  } | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

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

  // Handle redirects
  if (isTimeoutCompleted && isAuthenticated !== null) {
    if (!isAuthenticated) {
      return <Redirect href="/(auth)/welcome" />;
    } else if (bannerData && bannerData.shouldShow) {
      return <Redirect href="/(authenticated)/banner-features" />;
    } else {
      return <Redirect href="/(authenticated)/(tabs)/home" />;
    }
  }

  return (
    <Animated.View style={[styles.animationContainer, { opacity: fadeAnim, backgroundColor: bgColor }]}>
      {isDark ? (
        <ImageCustom
          icon="keboLogoHeaderDark"
          size={{ width: 256, height: 116 }}
        />
      ) : (
        <>
          <LottieView
            ref={animation}
            style={{ width: "100%", height: 250 }}
            resizeMode="contain"
            source={require("../assets/animations/splashAnimation.json")}
            autoPlay
            loop={false}
          />
          <View>
            <ImageCustom
              icon="keboLogoHeader"
              size={{ width: 256, height: 116 }}
            />
          </View>
        </>
      )}
    </Animated.View>
  );
});

const styles = {
  animationContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flex: 1,
  },
};

export default SplashIndex;
