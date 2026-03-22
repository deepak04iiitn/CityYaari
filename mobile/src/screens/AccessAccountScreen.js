import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react-native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Line, Rect, G } from 'react-native-svg';
import AuthBottomSheet from '../components/AuthBottomSheet';

const { width } = Dimensions.get('window');

// ─── Design Tokens ─────────────────────────────────────────────────────────
const T = {
  blueDeep:   '#0a1628',
  blueDark:   '#0f2044',
  blueMid:    '#1a3a6e',
  blueMain:   '#1e4fc2',
  blueBright: '#2563eb',
  blueSoft:   '#3b82f6',
  bluePale:   '#dbeafe',
  blueIce:    '#eff6ff',
  accent:     '#60a5fa',
  white:      '#ffffff',
  ink:        '#0a1628',
  ink2:       '#334155',
  ink3:       '#64748b',
  surface:    '#f0f5ff',
  surface2:   '#e2ecff',
};

// ─── Hero Geometry ──────────────────────────────────────────────────────────
const HeroGeometry = () => (
  <Svg
    width="100%"
    height="100%"
    style={StyleSheet.absoluteFill}
    viewBox={`0 0 ${width} 338`}
    pointerEvents="none"
  >
    {/* Concentric circles anchored top-right */}
    <Circle cx={width - 20} cy={-10} r={210} stroke="rgba(255,255,255,0.05)" strokeWidth={1} fill="none" />
    <Circle cx={width - 20} cy={-10} r={145} stroke="rgba(255,255,255,0.06)" strokeWidth={1} fill="none" />
    <Circle cx={width - 20} cy={-10} r={88}  stroke="rgba(255,255,255,0.08)" strokeWidth={1} fill="none" />
    {/* Blue glow orb */}
    <Circle cx={width - 20} cy={-10} r={48}  fill="rgba(37,99,235,0.15)" />

    {/* Vertical grid lines */}
    <Line x1={58}  y1={0}   x2={58}  y2={230} stroke="rgba(96,165,250,0.20)" strokeWidth={1} />
    <Line x1={98}  y1={60}  x2={98}  y2={240} stroke="rgba(96,165,250,0.12)" strokeWidth={1} />

    {/* Horizontal scan line */}
    <Line x1={0} y1={195} x2={230} y2={195} stroke="rgba(96,165,250,0.16)" strokeWidth={1} />

    {/* Rotating rect frames */}
    <G rotation={14} origin="67, 92">
      <Rect x={25} y={50} width={84} height={84}
        stroke="rgba(96,165,250,0.18)" strokeWidth={1} fill="none" />
    </G>
    <G rotation={34} origin="74, 98">
      <Rect x={52} y={76} width={44} height={44}
        stroke="rgba(96,165,250,0.10)" strokeWidth={1} fill="none" />
    </G>

    {/* Accent dots */}
    <Circle cx={57}  cy={195} r={3.5} fill={T.accent}  opacity={0.9} />
    <Circle cx={215} cy={212} r={5}   fill={T.blueSoft} opacity={0.55} />
    <Circle cx={98}  cy={60}  r={2.5} fill={T.accent}  opacity={0.8} />
    <Circle cx={162} cy={142} r={2}   fill="#93c5fd"    opacity={0.6} />

    {/* Crosshair detail */}
    <Line x1={156} y1={135} x2={168} y2={135} stroke={T.accent} strokeWidth={1} opacity={0.5} />
    <Line x1={162} y1={129} x2={162} y2={141} stroke={T.accent} strokeWidth={1} opacity={0.5} />

    {/* Top-right connector cluster */}
    <Circle cx={width - 48} cy={32} r={2}   fill="#93c5fd" opacity={0.7} />
    <Circle cx={width - 33} cy={48} r={1.5} fill={T.accent} opacity={0.5} />
    <Line
      x1={width - 50} y1={34}
      x2={width - 35} y2={46}
      stroke="rgba(96,165,250,0.30)" strokeWidth={1}
    />
  </Svg>
);

// ─── Trust Row ──────────────────────────────────────────────────────────────
const TrustRow = () => (
  <View style={styles.trustRow}>
    {['Safe & private', 'Local verified', 'Always free'].map((label) => (
      <View key={label} style={styles.trustItem}>
        <View style={styles.trustDot} />
        <Text style={styles.trustText}>{label}</Text>
      </View>
    ))}
  </View>
);

// ─── Screen ─────────────────────────────────────────────────────────────────
const AccessAccountScreen = () => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [initialForm, setInitialForm]   = useState('login');

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const cardY       = useRef(new Animated.Value(44)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroOpacity, {
        toValue: 1, duration: 580, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardY, {
          toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1, duration: 420, useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const open = (form) => {
    setInitialForm(form);
    setSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Hero ── */}
      <Animated.View style={[styles.hero, { opacity: heroOpacity }]}>
        <HeroGeometry />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.wordmarkRow}>
            <View style={styles.wordmarkDot} />
            <Text style={styles.wordmark}>CityYaari</Text>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroHeadline}>
              Your city,{'\n'}
              <Text style={styles.heroItalic}>your people.</Text>
            </Text>
            <Text style={styles.heroSub}>
              Connect with your hometown community{'\n'}wherever life takes you.
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ── Card ── */}
      <Animated.View
        style={[
          styles.card,
          { opacity: cardOpacity, transform: [{ translateY: cardY }] },
        ]}
      >
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>50K+ members</Text>
          </View>
          <View style={[styles.pill, styles.pillBlue]}>
            <Text style={[styles.pillText, styles.pillBlueText]}>Trusted &amp; verified</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => open('login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Log In</Text>
          <View style={styles.btnArrow}>
            <ArrowRight size={13} color={T.white} />
            <Text style={styles.btnArrowIcon}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => open('signup')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnSecondaryText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.divRow}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>community built on trust</Text>
          <View style={styles.divLine} />
        </View>

        <TrustRow />
      </Animated.View>

      <AuthBottomSheet
        isVisible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        initialForm={initialForm}
      />
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.surface,
  },

  /* Hero */
  hero: {
    height: '56%',
    width: '100%',
    backgroundColor: T.blueDeep,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Platform.OS === 'ios' ? 8 : 220,
  },
  wordmarkDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: T.accent,
  },
  wordmark: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 12,
    fontWeight: '700',
    color: T.accent,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  heroContent: {
    position: 'absolute',
    bottom: 32,
    left: 28,
    right: 28,
  },
  heroHeadline: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 35,
    fontWeight: '700',
    color: '#e8f0fe',
    lineHeight: 41,
    letterSpacing: -0.8,
  },
  heroItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif',
    fontStyle: 'italic',
    color: T.accent,
  },
  heroSub: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(200,218,255,0.44)',
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 20
  },

  /* Card */
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '48%',
    backgroundColor: T.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: Platform.OS === 'ios' ? 36 : 26,
    gap: 13,
    shadowColor: T.blueMain,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 16,
  },

  /* Pills */
  pillRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 4,
  },
  pill: {
    backgroundColor: T.surface,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillBlue: {
    backgroundColor: T.bluePale,
  },
  pillText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 10,
    fontWeight: '600',
    color: T.ink2,
    letterSpacing: 0.15,
  },
  pillBlueText: {
    color: '#1e40af',
  },

  /* Buttons */
  btnPrimary: {
    width: '100%',
    height: 52,
    backgroundColor: T.blueMain,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: T.blueMain,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
  btnPrimaryText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 15,
    fontWeight: '600',
    color: T.white,
    letterSpacing: 0.1,
  },
  btnArrow: {
    width: 22,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnArrowIcon: {
    display: 'none',
  },
  btnSecondary: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c7d9f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 15,
    fontWeight: '500',
    color: T.blueMain,
    letterSpacing: 0.1,
  },

  /* Divider */
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 2,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.surface2,
  },
  divText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 10,
    color: T.ink3,
    letterSpacing: 0.2,
  },

  /* Trust row */
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 2,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#93c5fd',
  },
  trustText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 10,
    color: T.ink3,
  },
});

export default AccessAccountScreen;
