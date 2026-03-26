import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";

const { width, height } = Dimensions.get("window");

function AnimatedDot({ delay, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[style, { opacity }]} />;
}

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.safe}>
      <StatusBar style="dark" />

      {/* Dot grid */}
      <View style={styles.dotGrid} pointerEvents="none">
        {Array.from({ length: 18 }).map((_, i) => (
          <AnimatedDot
            key={i}
            delay={i * 120}
            style={[styles.dot, {
              top: Math.floor(i / 6) * (height / 3) + 30,
              left: (i % 6) * (width / 5) - 10,
            }]}
          />
        ))}
      </View>

      {/* Blobs */}
      <View style={styles.blobOrange} pointerEvents="none" />
      <View style={styles.blobBlue} pointerEvents="none" />

      <View style={styles.screen}>

        {/* ── HERO / ILLUSTRATION ── */}
        <Animated.View
          style={[styles.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.illustrationFrame}>
            <Image
              source={require("../../assets/welcome_illustration.png")}
              style={styles.illustration}
              resizeMode="cover"
            />

            {/* Pill — top left */}
            <View style={[styles.floatingPill, styles.pillTopLeft]}>
              <MaterialIcons name="location-on" size={13} color="#B84B00" />
              <Text style={styles.pillTextWarm}>From Jaipur</Text>
            </View>

            {/* Pill — bottom right */}
            <View style={[styles.floatingPill, styles.pillBottomRight]}>
              <MaterialIcons name="explore" size={13} color="#1553C7" />
              <Text style={styles.pillTextCool}>Now in Bengaluru</Text>
            </View>

            <View style={styles.frameShine} pointerEvents="none" />
          </View>
        </Animated.View>

        {/* ── BOTTOM SHEET ── */}
        <Animated.View
          style={[styles.bottomSheet, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* ══ LOGO BLOCK — centered, flanked by decorative rules ══ */}
          <View style={styles.logoBlock}>
            <View style={styles.logoRule} />
            <View style={styles.logoInner}>
              <Image
                source={require("../../assets/Logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.logoBadgeRow}>
                <MaterialIcons name="verified" size={11} color="#F97316" />
                <Text style={styles.logoBadgeText}>India's Hometown Network</Text>
              </View>
            </View>
            <View style={styles.logoRule} />
          </View>

          {/* ── HEADLINE ── */}
          <View style={styles.headlineBlock}>
            <Text style={styles.eyebrow}>DISCOVER • CONNECT • BELONG</Text>
            <Text style={styles.headline}>
              Find Your{" "}
              <Text style={styles.headlineAccent}>People</Text>
              {"\n"}Everywhere
            </Text>
            <Text style={styles.subheadline}>
              Your hometown never felt this close. Connect with familiar faces in any city, anytime.
            </Text>
          </View>

          {/* ── SOCIAL PROOF ── */}
          <View style={styles.socialProofRow}>
            <View style={styles.avatarStack}>
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCs5zGXiZ4HhE0jhZ2bUvLtSzskWgRU4t5b3KCVQOsGEiYhGR2Bk67Z-iphsos429xSn0RcRgx_iLmUr8Z5bZVgQ72g5fOuK1jVA2ZaB3uiiInV6W4jgr-DBVKFs62ee3c4dc09hZdnSePxlK75DmZzr4rcCILEhtycrsm3qc9hEgzXujGGhIAr1rHtACXiXFhcVOkOCwxc8FIrreBnvCtIaRWr6fNTYkJM2H3FeAsQZ3JPfvkk_eVc-8f9fo3XT9b6-fp3bQ16OzQ",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuC5LMYdPkFnqZQzah-N2VfZoXB9BQDVTFj1FSZzHUNCdR6b71mjFH6148Q2dyYRib9Emfw4uqRKIZNPMmT4idG3Ahg_phbeONhmDuWxc7pOWDNNdh7-s85unHpvtU6_Hqa8FMYBJWyT4N-TAH8KCCyGK6oOH3vY2Q1-pUbAtMufE8OXc7w6rcAclYLauwC7xEOUDOkVdpJly8F_YGsGOkw2S4oFcPLqj6rkecEaOpq0oG3dBaT-0p1ZHE0opMQDQ1YGWbsGLIaBh_Y",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuATWy_aYuHv-IDEUsM8yOiqiVZfAj34shIIqt8hz3osjxuQxCfYeR4yMxJTNLnrZPvFhVYDoUNMNIV7AdP8dDDi3YIbHKo2t72c8BEejhsNWwl6tP6LqH9WVtxdHElzq543NexKKHsBQ34arhLdD8MBPbpA_5xKi4PXdE1s3pEZ99MKcBil0F8lquCon8qQP8NNlZOSStFciNaqKo5-XxwRF5weV3293bRQ89tB1tXTxwRrLx8MRVdNAFABOECIbyt_45pQngaX70w",
              ].map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}
                />
              ))}
            </View>

            <View style={styles.proofTextBlock}>
              <Text style={styles.proofCount}>10,000+</Text>
              <Text style={styles.proofLabel}>Yaaris connected</Text>
            </View>

            <View style={styles.proofDivider} />

            <View style={styles.proofStat}>
              <Text style={styles.proofCount}>50+</Text>
              <Text style={styles.proofLabel}>Cities</Text>
            </View>
          </View>

          {/* ── CTA ── */}
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            onPress={() => navigation.navigate("Onboarding")}
          >
            <LinearGradient
              colors={["#2563EB", "#1A4FCC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <View style={styles.ctaArrowBubble}>
                <MaterialIcons name="arrow-forward" size={18} color="#2563EB" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms</Text> &{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  screen: {
    flex: 1,
  },

  /* Dot grid */
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  dot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },

  /* Blobs */
  blobOrange: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FFF0E6",
    top: -60,
    right: -60,
    zIndex: 0,
  },
  blobBlue: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#EBF0FF",
    top: height * 0.3,
    left: -50,
    zIndex: 0,
  },

  /* Hero */
  heroSection: {
    flex: 1,
    zIndex: 1,
  },
  illustrationFrame: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#E8EEFF",
    position: "relative",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  frameShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  /* Pills */
  floatingPill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pillTopLeft: {
    top: 24,
    left: 16,
    backgroundColor: "#FFF0E4",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.2)",
    transform: [{ rotate: "-2deg" }],
  },
  pillBottomRight: {
    bottom: 28,
    right: 16,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
    transform: [{ rotate: "2deg" }],
  },
  pillTextWarm: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B84B00",
    letterSpacing: 0.4,
  },
  pillTextCool: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1553C7",
    letterSpacing: 0.4,
  },

  /* Bottom sheet */
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 32,
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
    zIndex: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 18,
  },

  /* ── Logo block ── */
  logoBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  logoRule: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  logoInner: {
    alignItems: "center",
    gap: 5,
  },
  logo: {
    width: 118,
    height: 38,
  },
  logoBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logoBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  /* Headline */
  headlineBlock: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#F97316",
    marginBottom: 8,
  },
  headline: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: 10,
  },
  headlineAccent: {
    color: "#2563EB",
  },
  subheadline: {
    fontSize: 13.5,
    lineHeight: 21,
    color: "#64748B",
    fontWeight: "400",
  },

  /* Social proof */
  socialProofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  proofTextBlock: {
    flex: 1,
  },
  proofCount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 17,
  },
  proofLabel: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 1,
  },
  proofDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#E2E8F0",
  },
  proofStat: {
    alignItems: "center",
    paddingHorizontal: 4,
  },

  /* CTA */
  ctaButton: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  ctaGradient: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ctaArrowBubble: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Terms */
  termsText: {
    textAlign: "center",
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 18,
  },
  termsLink: {
    color: "#2563EB",
    fontWeight: "600",
  },
});