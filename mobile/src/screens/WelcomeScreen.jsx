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
  ScrollView,
} from "react-native";
import { useEffect, useRef } from "react";

const { width, height } = Dimensions.get("window");


/* ─── Floating badge / pill chip ─── */
function FloatingChip({ icon, label, subLabel, position, colorScheme, rotate = "0deg" }) {
  const slideY = useRef(new Animated.Value(12)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(colorScheme === "warm" ? 600 : 900),
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    /* gentle bob */
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(slideY, { toValue: -5, duration: 2200, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 5, duration: 2200, useNativeDriver: true }),
      ])
    );
    setTimeout(() => bob.start(), 1400);
    return () => bob.stop();
  }, []);

  const isWarm = colorScheme === "warm";
  return (
    <Animated.View
      style={[
        styles.chip,
        position,
        {
          opacity: fade,
          transform: [{ translateY: slideY }, { rotate }],
          backgroundColor: isWarm ? "#FFF3E8" : "#EEF4FF",
          borderColor: isWarm ? "rgba(249,115,22,0.22)" : "rgba(37,99,235,0.22)",
        },
      ]}
    >
      <View
        style={[
          styles.chipIcon,
          { backgroundColor: isWarm ? "#FDE8D4" : "#DBEAFE" },
        ]}
      >
        <MaterialIcons name={icon} size={14} color={isWarm ? "#C2440C" : "#1D4ED8"} />
      </View>
      <View>
        <Text style={[styles.chipLabel, { color: isWarm ? "#92350A" : "#1E40AF" }]}>
          {label}
        </Text>
        {subLabel ? (
          <Text style={[styles.chipSub, { color: isWarm ? "#C2440C" : "#3B82F6" }]}>
            {subLabel}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function WelcomeScreen({ navigation }) {
  /* master entrance */
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(1.06)).current;
  const sheetY = useRef(new Animated.Value(80)).current;
  const sheetFade = useRef(new Animated.Value(0)).current;

  /* staggered inner elements */
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

    /* stagger inner */
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
      <StatusBar style="light" />

      {/* ─── HERO: full-bleed illustration ─── */}
      <Animated.View
        style={[styles.hero, { opacity: heroFade, transform: [{ scale: heroScale }] }]}
      >
        <Image
          source={require("../../assets/welcome_illustration.png")}
          style={styles.illustration}
          resizeMode="cover"
        />

        {/* deep gradient scrim so bottom sheet bleeds in nicely */}
        <LinearGradient
          colors={["rgba(10,14,26,0)", "rgba(10,14,26,0.18)", "rgba(10,14,26,0.72)"]}
          style={styles.scrim}
          pointerEvents="none"
        />



        {/* Top status bar area — logo teaser */}
        <View style={styles.topBar}>
          <View style={styles.topBadge}>
            <View style={styles.topBadgeDot} />
            <Text style={styles.topBadgeText}>India's Hometown Network</Text>
          </View>
        </View>

        {/* Floating chips */}
        <FloatingChip
          icon="location-on"
          label="From Jaipur"
          subLabel="Rajasthan"
          colorScheme="warm"
          position={{ position: "absolute", top: height * 0.14, left: 18 }}
          rotate="-2deg"
        />
        <FloatingChip
          icon="flight-land"
          label="Now in Bengaluru"
          subLabel="Karnataka"
          colorScheme="cool"
          position={{ position: "absolute", bottom: height * 0.18, right: 18 }}
          rotate="2deg"
        />
      </Animated.View>

      {/* ─── BOTTOM PANEL ─── */}
      <Animated.View
        style={[styles.panel, { opacity: sheetFade, transform: [{ translateY: sheetY }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* ── LOGO ── */}
        <Animated.View style={[styles.logoWrap, makeSlide(logoAnim)]}>
          <Image
            source={require("../../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        

        {/* ── HEADLINE ── */}
        <Animated.View style={[styles.headlineWrap, makeSlide(headlineAnim)]}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDash} />
            <Text style={styles.eyebrow}>DISCOVER  ·  CONNECT  ·  BELONG</Text>
            <View style={styles.eyebrowDash} />
          </View>
          <Text style={styles.headline}>
            Find Your{"\n"}
            <Text style={styles.headlineAccent}>People</Text>
            {" "}Everywhere
          </Text>
          <Text style={styles.subText}>
            Your hometown, in every city. Connect with familiar faces wherever life takes you.
          </Text>
        </Animated.View>

        {/* ── SOCIAL PROOF ── */}
        <Animated.View style={[styles.proofCard, makeSlide(proofAnim)]}>
          {/* Avatar stack */}
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

          {/* Stats */}
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

        {/* ── CTA ── */}
        <Animated.View style={makeSlide(ctaAnim)}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && { transform: [{ scale: 0.975 }] }]}
            onPress={() => navigation.navigate("Onboarding")}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <View style={styles.ctaCircle}>
                <MaterialIcons name="arrow-forward-ios" size={15} color="#2563EB" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Terms */}
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
    backgroundColor: "#0A0E1A",
  },

  /* ── Hero ── */
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.56,
    overflow: "hidden",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  topBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.6,
  },

  /* ── Chips ── */
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  chipSub: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
    opacity: 0.8,
  },

  /* ── Panel ── */
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: height * 0.46,           /* overlaps hero slightly */
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    paddingHorizontal: 26,
    paddingBottom: 28,
    paddingTop: 10,
    shadowColor: "#0A0E1A",
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -10 },
    elevation: 20,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDE3EE",
    alignSelf: "center",
    marginBottom: 20,
  },

  /* ── Logo ── */
  logoWrap: {
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 160,
    height: 52,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: "#EEF2F8",
    marginBottom: 16,
    marginHorizontal: -4,
  },

  /* ── Headline ── */
  headlineWrap: {
    marginBottom: 16,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  eyebrowDash: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5EDFF",
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    color: "#F97316",
    letterSpacing: 1.8,
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0C1222",
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  headlineAccent: {
    color: "#2563EB",
  },
  subText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    fontWeight: "400",
  },

  /* ── Proof card ── */
  proofCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6F8FF",
    borderWidth: 1,
    borderColor: "#E0E9FF",
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
    borderColor: "#FFFFFF",
  },
  avatarMore: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -11,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  avatarMoreText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1D4ED8",
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
    color: "#111827",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 1,
  },
  statSep: {
    width: 1,
    height: 24,
    backgroundColor: "#DDE6F5",
  },

  /* ── CTA ── */
  ctaBtn: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#2563EB",
    shadowOpacity: 0.42,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
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
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  ctaCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Terms */
  terms: {
    textAlign: "center",
    fontSize: 11,
    color: "#A1AABF",
    lineHeight: 17,
  },
  termsLink: {
    color: "#2563EB",
    fontWeight: "600",
  },
});