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

export default function WelcomeScreen({ navigation }) {
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(1.06)).current;
  const sheetY = useRef(new Animated.Value(80)).current;
  const sheetFade = useRef(new Animated.Value(0)).current;

  const logoAnim = useRef(new Animated.Value(0)).current;
  const headlineAnim = useRef(new Animated.Value(0)).current;
  const proofAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(heroScale, { toValue: 1, tension: 50, friction: 14, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(sheetY, { toValue: 0, tension: 55, friction: 13, useNativeDriver: true }),
        Animated.timing(sheetFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const stagger = Animated.stagger(90, [
      Animated.spring(logoAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.spring(headlineAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.spring(proofAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.spring(ctaAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
    ]);
    setTimeout(() => stagger.start(), 550);
  }, []);

  const makeSlide = (anim) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ─── HERO ─── */}
      <Animated.View
        style={[styles.hero, { opacity: heroFade, transform: [{ scale: heroScale }] }]}
      >
        <Image
          source={require("../../assets/welcome_illustration.png")}
          style={styles.illustration}
          resizeMode="cover"
        />

        {/* Gradient scrim for smooth blend into panel */}
        <LinearGradient
          colors={["transparent", "rgba(255,250,245,0.5)", P.cream]}
          style={styles.heroScrim}
          pointerEvents="none"
        />
      </Animated.View>

      {/* ─── BOTTOM PANEL ─── */}
      <Animated.View
        style={[styles.panel, { opacity: sheetFade, transform: [{ translateY: sheetY }] }]}
      >
        <View style={styles.handle} />

        {/* Logo */}
        <Animated.View style={[styles.logoWrap, makeSlide(logoAnim)]}>
          <Image
            source={require("../../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Headline */}
        <Animated.View style={[styles.headlineWrap, makeSlide(headlineAnim)]}>
          <View style={styles.badgeRow}>
            <LinearGradient
              colors={["#FFF0E8", "#FFE0CC"]}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="public" size={12} color={P.orange} />
              <Text style={styles.badgeText}>WORLD'S 1ST HOMETOWN NETWORK</Text>
            </LinearGradient>
          </View>

          <Text style={styles.headline}>
            Your{" "}
            <Text style={styles.headlineAccent}>Hometown</Text>
            ,{"\n"}Everywhere
          </Text>
          <Text style={styles.subText}>
            Find people from your hometown in any city.{"\n"}
            Connect with familiar faces, make it feel like home.
          </Text>
        </Animated.View>

        {/* Social proof */}
        <Animated.View style={[styles.proofCard, makeSlide(proofAnim)]}>
          <View style={styles.avatarRow}>
            {[
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCs5zGXiZ4HhE0jhZ2bUvLtSzskWgRU4t5b3KCVQOsGEiYhGR2Bk67Z-iphsos429xSn0RcRgx_iLmUr8Z5bZVgQ72g5fOuK1jVA2ZaB3uiiInV6W4jgr-DBVKFs62ee3c4dc09hZdnSePxlK75DmZzr4rcCILEhtycrsm3qc9hEgzXujGGhIAr1rHtACXiXFhcVOkOCwxc8FIrreBnvCtIaRWr6fNTYkJM2H3FeAsQZ3JPfvkk_eVc-8f9fo3XT9b6-fp3bQ16OzQ",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuC5LMYdPkFnqZQzah-N2VfZoXB9BQDVTFj1FSZzHUNCdR6b71mjFH6148Q2dyYRib9Emfw4uqRKIZNPMmT4idG3Ahg_phbeONhmDuWxc7pOWDNNdh7-s85unHpvtU6_Hqa8FMYBJWyT4N-TAH8KCCyGK6oOH3vY2Q1-pUbAtMufE8OXc7w6rcAclYLauwC7xEOUDOkVdpJly8F_YGsGOkw2S4oFcPLqj6rkecEaOpq0oG3dBaT-0p1ZHE0opMQDQ1YGWbsGLIaBh_Y",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuATWy_aYuHv-IDEUsM8yOiqiVZfAj34shIIqt8hz3osjxuQxCfYeR4yMxJTNLnrZPvFhVYDoUNMNIV7AdP8dDDi3YIbHKo2t72c8BEejhsNWwl6tP6LqH9WVtxdHElzq543NexKKHsBQ34arhLdD8MBPbpA_5xKi4PXdE1s3pEZ99MKcBil0F8lquCon8qQP8NNlZOSStFciNaqKo5-XxwRF5weV3293bRQ89tB1tXTxwRrLx8MRVdNAFABOECIbyt_45pQngaX70w",
            ].map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={[styles.avatar, { marginLeft: i === 0 ? 0 : -11, zIndex: 3 - i }]}
              />
            ))}
            <View style={styles.avatarMore}>
              <Text style={styles.avatarMoreText}>+99</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>10K+</Text>
              <Text style={styles.statLabel}>Yaaris</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>50+</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>4.9★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={makeSlide(ctaAnim)}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && { transform: [{ scale: 0.975 }] }]}
            onPress={() => navigation.navigate("Onboarding")}
          >
            <LinearGradient
              colors={[P.orangeLight, P.orange, P.orangeDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <View style={styles.ctaCircle}>
                <MaterialIcons name="arrow-forward-ios" size={15} color={P.orange} />
              </View>
            </LinearGradient>
          </Pressable>

          <Text style={styles.terms}>
            By continuing you agree to our{" "}
            <Text style={styles.termsLink}>Terms</Text>
            {" "}&amp;{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/* ─────────────────────── STYLES ─────────────────────── */
const PANEL_RADIUS = 36;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.cream,
  },

  /* ── Hero ── */
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.54,
    overflow: "hidden",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  heroScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  /* ── Panel ── */
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: height * 0.44,
    backgroundColor: P.white,
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    paddingHorizontal: 26,
    paddingBottom: 28,
    paddingTop: 10,
    shadowColor: P.orange,
    shadowOpacity: 0.10,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: P.beige,
    alignSelf: "center",
    marginBottom: 16,
  },

  /* ── Logo ── */
  logoWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 200,
    height: 40,
  },

  /* ── Headline ── */
  headlineWrap: {
    marginBottom: 14,
  },
  badgeRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(232,88,13,0.15)",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: P.orange,
    letterSpacing: 1.4,
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: P.brown,
    lineHeight: 38,
    letterSpacing: -0.8,
    textAlign: "center",
    marginBottom: 8,
  },
  headlineAccent: {
    color: P.orange,
  },
  subText: {
    fontSize: 13,
    lineHeight: 20,
    color: P.brownSoft,
    fontWeight: "400",
    textAlign: "center",
  },

  /* ── Proof card ── */
  proofCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: P.peachSoft,
    borderWidth: 1,
    borderColor: "rgba(232,88,13,0.10)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    gap: 10,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    borderWidth: 2.5,
    borderColor: P.white,
  },
  avatarMore: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    backgroundColor: "#FFE0CC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -11,
    borderWidth: 2.5,
    borderColor: P.white,
  },
  avatarMoreText: {
    fontSize: 9,
    fontWeight: "800",
    color: P.orangeDark,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statNum: {
    fontSize: 14,
    fontWeight: "800",
    color: P.brown,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: P.brownMid,
    fontWeight: "500",
    marginTop: 1,
  },
  statSep: {
    width: 1,
    height: 24,
    backgroundColor: P.beige,
  },

  /* ── CTA ── */
  ctaBtn: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: P.orange,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  ctaGrad: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  ctaText: {
    color: P.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  ctaCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: P.white,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Terms */
  terms: {
    textAlign: "center",
    fontSize: 11,
    color: P.brownMid,
    lineHeight: 17,
  },
  termsLink: {
    color: P.orange,
    fontWeight: "600",
  },
});
