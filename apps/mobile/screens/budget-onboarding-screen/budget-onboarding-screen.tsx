// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   Image,
//   useWindowDimensions,
//   StyleSheet,
// } from "react-native";
// import AppIntroSlider from "react-native-app-intro-slider";
// import { colors } from "@/theme/colors";
// import { translate } from "@/i18n";
// import { supabase } from "@/config/supabase";
// import CustomButton from "@/components/common/custom-button";
// import { AppStackScreenProps } from "@/navigators/AppNavigator";
// import CustomHeader from "@/components/common/custom-header";
// import CustomHeaderSecondary from "@/components/common/custom-header-secondary";

// interface BudgetOnboardingScreenProps
//   extends AppStackScreenProps<"OnboarningBudget"> {}

// interface Slide {
//   key: string;
//   title: string;
//   text: string;
//   image: any;
// }

// const TRANSLATIONS = {
//   welcome: "budgetOnboarding:welcome" as const,
//   slide1Text: "budgetOnboarding:slide1.text" as const,
//   slide2Text: "budgetOnboarding:slide2.text" as const,
//   buttonNext: "budgetOnboarding:buttons.next" as const,
//   buttonDone: "budgetOnboarding:buttons.done" as const,
// };

// const formatName = (fullName: string): string => {
//   const firstName = fullName.split(" ")[0];
//   return firstName.length > 15 ? `${firstName.substring(0, 15)}...` : firstName;
// };

// export const BudgetOnboardingScreen: React.FC<BudgetOnboardingScreenProps> = ({
//   navigation,
// }) => {
//   const { width } = useWindowDimensions();
//   const [userName, setUserName] = useState("");
//   const sliderRef = useRef<AppIntroSlider>(null);

//   useEffect(() => {
//     const getUserData = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (user) {
//         const { data: profileData, error } = await supabase
//           .from("profiles")
//           .select("full_name")
//           .eq("user_id", user.id)
//           .single();

//         if (profileData && profileData.full_name) {
//           setUserName(formatName(profileData.full_name));
//         } else if (user.user_metadata?.name) {
//           setUserName(formatName(user.user_metadata.name));
//         }
//       }
//     };
//     getUserData();
//   }, []);

//   const slides: Slide[] = [
//     {
//       key: "budget-management",
//       title: translate(TRANSLATIONS.welcome, { name: userName }),
//       text: translate(TRANSLATIONS.slide1Text),
//       image: require("../../assets/images/budget-management.png"),
//     },
//     {
//       key: "budget-goals",
//       title: translate(TRANSLATIONS.welcome, { name: userName }),
//       text: translate(TRANSLATIONS.slide2Text),
//       image: require("../../assets/images/budget-goals.png"),
//     },
//   ];

//   const handleDone = () => {
//             navigation.replace("NewBudget");
//   };

//   const renderItem = ({ item }: { item: Slide }) => {
//     return (
//       <View style={styles.slide}>
//         <View style={styles.contentContainer}>
//           <Text style={styles.title}>{item.title}</Text>
//           <Image
//             source={item.image}
//             style={[styles.image, { width: width * 0.8, height: width * 0.8 }]}
//             resizeMode="contain"
//           />
//           <Text style={styles.text}>{item.text}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <CustomHeaderSecondary
//         onPress={() =>
//           navigation.reset({
//             index: 0,
//             routes: [{ name: "Dashboard" }],
//           })
//         }
//       />
//       <AppIntroSlider
//         ref={sliderRef}
//         data={slides}
//         renderItem={renderItem}
//         onDone={handleDone}
//         showSkipButton={false}
//         dotStyle={styles.dot}
//         activeDotStyle={styles.activeDot}
//         renderNextButton={() => (
//           <View style={styles.buttonContainer}>
//             <CustomButton
//               variant="primary"
//               title={translate(TRANSLATIONS.buttonNext)}
//               onPress={() =>
//                 sliderRef.current?.goToSlide(
//                   sliderRef.current.state.activeIndex + 1
//                 )
//               }
//               isEnabled={true}
//             />
//           </View>
//         )}
//         renderDoneButton={() => (
//           <View style={styles.buttonContainer}>
//             <CustomButton
//               variant="primary"
//               title={translate(TRANSLATIONS.buttonDone)}
//               onPress={handleDone}
//               isEnabled={true}
//             />
//           </View>
//         )}
//         bottomButton
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//     paddingTop: 40,
//   },
//   slide: {
//     marginBottom: 40,
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   contentContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingTop: 2,
//     paddingBottom: 100,
//   },
//   title: {
//     fontFamily: "SFUIDisplayBold",
//     fontSize: 24,
//     marginBottom: 2,
//     color: colors.black,
//     textAlign: "center",
//   },
//   text: {
//     fontFamily: "SFUIDisplayLight",
//     fontSize: 16,
//     textAlign: "center",
//     color: colors.black,
//     marginTop: 2,
//     paddingHorizontal: 10,
//   },
//   image: {
//     marginVertical: 10,
//   },
//   dot: {
//     backgroundColor: "rgba(0, 0, 0, 0.2)",
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   activeDot: {
//     backgroundColor: colors.primary,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//   },
//   buttonContainer: {
//     paddingHorizontal: 20,
//   },
// });
