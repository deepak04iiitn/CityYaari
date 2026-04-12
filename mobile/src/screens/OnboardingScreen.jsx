import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const P = {
  cream:       "#FFFAF5",
  creamDeep:   "#F5EDE3",
  peach:       "#FFECD2",
  peachSoft:   "#FFF3ED",
  orange:      "#E8580D",
  orangeLight: "#FF8A50",
  orangeDark:  "#B8430A",
  orangeGhost: "#FFF0E8",
  brown:       "#2D1A0E",
  brownSoft:   "#6B5E52",
  brownMid:    "#8B7D72",
  beige:       "#E8DDD0",
  beigeDark:   "#D4C5B3",
  white:       "#FFFFFF",
};

const ONBOARDING_DATA = [
  {
    image: require("../../assets/onboarding_illustration_1.png"),
    pillText: "The Challenge",
    title: "New City, Same Loneliness?",
    accentedPart: "Loneliness?",
    subtitle:
      "Moving away from home is exciting but isolating. Finding familiar faces in a new city shouldn't be this hard.",
  },
  {
    image: require("../../assets/onboarding_illustration_2.png"),
    pillText: "The Solution",
    title: "Find Your People First.",
    accentedPart: "People",
    subtitle:
      "Discover people from your hometown already living in your new city. Build your circle before you even arrive.",
  },
  {
    image: require("../../assets/onboarding_illustration_3.png"),
    pillText: "The Community",
    title: "Meet, Bond, Belong.",
    accentedPart: "Belong",
    subtitle:
      "From weekend chai meetups to festive dinners — join a community that speaks your language and knows your roots.",
  },
];

function StepIllustration({ image, step }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0.85);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  return (
    <Animated.View
      style={[
        styles.illustrationWrapper,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Image source={image} style={styles.illustrationImage} resizeMode="cover" />
    </Animated.View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();

  const contentFade = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;

  const animateContentIn = () => {
    contentFade.setValue(0);
    contentSlide.setValue(20);
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(contentSlide, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
      animateContentIn();
    } else {
      navigation.navigate("AccessAccount");
    }
  };

  const handleSkip = () => {
    navigation.navigate("AccessAccount");
  };

  const data = ONBOARDING_DATA[currentStep];

  return (
    <View style={styles.safe}>
      <StatusBar style="dark" />

      {/* Background gradient */}
      <LinearGradient
        colors={[P.cream, P.peachSoft, P.cream]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Image
          source={require("../../assets/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
          <MaterialIcons name="chevron-right" size={16} color={P.brownSoft} />
        </Pressable>
      </View>

      {/* Illustration Section */}
      <View style={styles.illustrationContainer}>
        <StepIllustration
          image={data.image}
          step={currentStep}
        />
      </View>

      {/* Content Card (Bottom Sheet Style) */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.textContent}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{data.pillText}</Text>
            </View>
            <Text style={styles.headline}>
              {data.title.includes(data.accentedPart) ? (
                <>
                  {data.title.split(data.accentedPart)[0]}
                  <Text style={styles.headlineAccent}>{data.accentedPart}</Text>
                  {data.title.split(data.accentedPart)[1]}
                </>
              ) : (
                data.title
              )}
            </Text>
            <Text style={styles.subheadline}>{data.subtitle}</Text>
          </View>

          <View style={styles.footer}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {ONBOARDING_DATA.map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            {/* CTA Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { transform: [{ scale: 0.975 }] },
              ]}
              onPress={handleNext}
            >
              <LinearGradient
                colors={[P.orangeLight, P.orange, P.orangeDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGrad}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep === 2 ? "Get Started" : "Next"}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color={P.white} />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.cream,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 10,
    zIndex: 10,
  },
  logo: {
    width: 80,
    height: 30,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "700",
    color: P.brownSoft,
  },

  /* Illustration */
  illustrationContainer: {
    flex: 1,
    width: width,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "visible",
  },
  illustrationWrapper: {
    width: width,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  illustrationImage: {
    width: width,
    height: "100%",
  },

  /* Bottom Sheet */
  bottomSheet: {
    height: height * 0.48,
    backgroundColor: P.white,
    marginTop: -20,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: P.orange,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: P.beige,
    alignSelf: "center",
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  textContent: {
    alignItems: "center",
  },
  pill: {
    backgroundColor: P.orangeGhost,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: P.peach,
  },
  pillText: {
    color: P.orangeDark,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headline: {
    fontSize: 30,
    fontWeight: "800",
    color: P.brown,
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  headlineAccent: {
    color: P.orange,
  },
  subheadline: {
    fontSize: 15,
    color: P.brownSoft,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 310,
    fontWeight: "400",
  },

  /* Footer */
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: P.orange,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: P.beige,
  },

  /* CTA */
  primaryButton: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: P.orange,
    shadowOpacity: 0.30,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryButtonGrad: {
    height: 58,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: P.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
