import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    image: require("../../assets/onboarding_illustration_1.png"),
    title: "New City, Same Loneliness?",
    accentedPart: "Loneliness?",
    subtitle:
      "Moving for work or study can feel isolating. We know the feeling of being a stranger in a bustling city."
  },
  {
    image: require("../../assets/onboarding_illustration_2.png"),
    title: "Connect Before You Pack.",
    accentedPart: "Connect",
    subtitle:
      "Find people from your hometown who are already there. Get tips, find roommates, and build your circle early."
  },
  {
    image: require("../../assets/onboarding_illustration_3.png"),
    title: "Your Hometown, Your Meetups.",
    accentedPart: "Meetups",
    subtitle:
      "From weekend cricket to festive dinners, organize and join meetups with people who speak your language."
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
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
      
      {/* Header with safe area padding */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Image 
          source={require("../../assets/logo_only.png")} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Illustration Section */}
      <View style={styles.illustrationContainer}>
        <Image 
          source={data.image} 
          style={styles.illustration} 
          resizeMode="cover" 
        />
        <LinearGradient
          colors={["transparent", "rgba(247, 249, 251, 0.5)", "#F7F9FB"]}
          style={styles.tonalOverlay}
        />
      </View>

      {/* Content Card (Bottom Sheet Style) */}
      <View style={styles.bottomSheet}>
        <View style={styles.contentContainer}>
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
          
          <View style={styles.footer}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {ONBOARDING_DATA.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
            </View>

            {/* CTA Button */}
            <Pressable style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>
                {currentStep === 2 ? "Get Started" : "Next"}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FB"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 16,
    paddingVertical: 10,
    zIndex: 10
  },
  logo: {
    width: 120,
    height: 30,
    marginLeft: -15
  },
  skipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#434655"
  },
  illustrationContainer: {
    height: height * 0.52,
    width: "100%",
    overflow: "hidden"
  },
  illustration: {
    width: "100%",
    height: "100%"
  },
  tonalOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#004AC6",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between"
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: "#191C1E",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 16
  },
  headlineAccent: {
    color: "#004AC6"
  },
  subheadline: {
    fontSize: 16,
    color: "#434655",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
    marginTop: -25
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 32
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dot: {
    height: 8,
    borderRadius: 4
  },
  activeDot: {
    width: 32,
    backgroundColor: "#004AC6"
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "#E0E3E5"
  },
  primaryButton: {
    width: "100%",
    height: 60,
    backgroundColor: "#004AC6",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#004AC6",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700"
  }
});
