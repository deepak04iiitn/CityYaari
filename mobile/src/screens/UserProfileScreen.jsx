import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Pressable,
  StatusBar,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserProfile } from "../services/users/userService";
import AppTopHeader from "../components/AppTopHeader";

// ─── Avatar palette (preserved) ──────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: '#EDE9FE', text: '#6D28D9' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEE2E2', text: '#B91C1C' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#F0FDF4', text: '#166534' },
];
function getAvatarColor(name) {
  const index = (name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

const GENDER_ICON  = { Male: 'male', Female: 'female', Other: 'transgender' };
const GENDER_COLOR = { Male: '#3B82F6', Female: '#EC4899', Other: '#8B5CF6' };

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:           "#004AC6",
  onPrimary:         "#FFFFFF",
  secondary:         "#9D4300",
  secondaryFixed:    "#FFDBCA",
  onSecondaryFixed:  "#341100",
  surfaceLowest:     "#FFFFFF",
  surfaceLow:        "#F2F4F6",
  surfaceHigh:       "#E6E8EA",
  onSurface:         "#191C1E",
  onSurfaceVariant:  "#434655",
  outline:           "#737686",
};

const AVATAR_SIZE = 116;
// cover.png is 1200×480 — compute hero height to exactly fit full image width
const HERO_HEIGHT = Math.round(Dimensions.get('window').width * (480 / 1200));
const CARD_SHADOW = {
  shadowColor: "#004AC6",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.07,
  shadowRadius: 16,
  elevation: 3,
};

// ─── Small reusable sub-components ───────────────────────────────────────────

function StatItem({ value, label }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function BentoCard({ icon, iconColor, label, value, style, labelStyle, valueStyle }) {
  return (
    <View style={[s.bentoCard, style]}>
      <MaterialIcons name={icon} size={28} color={iconColor ?? C.primary} />
      <View>
        <Text style={[s.bentoLabel, labelStyle]}>{label}</Text>
        <Text style={[s.bentoValue, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Nominatim geocoding helper ──────────────────────────────────────────────
async function geocodePlace(city, state) {
  const q = [city, state].filter(Boolean).join(', ');
  if (!q) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'CityYaari/1.0' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch (_) {}
  return null;
}

// ─── Auto-fit region for two coordinates ─────────────────────────────────────
function getRegionForTwo(a, b, padding = 1.6) {
  const minLat = Math.min(a.latitude, b.latitude);
  const maxLat = Math.max(a.latitude, b.latitude);
  const minLon = Math.min(a.longitude, b.longitude);
  const maxLon = Math.max(a.longitude, b.longitude);
  const latDelta = Math.max((maxLat - minLat) * padding, 0.25);
  const lonDelta = Math.max((maxLon - minLon) * padding, 0.25);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}

// ─── JourneyMap ───────────────────────────────────────────────────────────────
function JourneyMap({ hometownCity, hometownState, currentCity, currentState }) {
  const [homeCoords, setHomeCoords]       = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [loading, setLoading]             = useState(true);

  const homeLabel    = [hometownCity, hometownState].filter(Boolean).join(', ');
  const currentLabel = [currentCity,  currentState ].filter(Boolean).join(', ');

  useEffect(() => {
    Promise.all([
      geocodePlace(hometownCity, hometownState),
      geocodePlace(currentCity,  currentState),
    ]).then(([home, current]) => {
      setHomeCoords(home);
      setCurrentCoords(current);
      setLoading(false);
    });
  }, [hometownCity, hometownState, currentCity, currentState]);

  const bothExist = homeCoords && currentCoords;
  const region = bothExist
    ? getRegionForTwo(homeCoords, currentCoords)
    : homeCoords
    ? { ...homeCoords, latitudeDelta: 0.25, longitudeDelta: 0.25 }
    : null;

  return (
    <View style={s.mapCard}>
      {loading ? (
        <View style={s.mapLoading}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : region ? (
        <>
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {bothExist && (
              <Polyline
                coordinates={[homeCoords, currentCoords]}
                strokeWidth={3}
                strokeColor={C.primary}
                lineDashPattern={[8, 6]}
                geodesic
              />
            )}
            {homeCoords && (
              <Marker coordinate={homeCoords} pinColor="#004AC6" title="Hometown" description={homeLabel} />
            )}
            {currentCoords && (
              <Marker coordinate={currentCoords} pinColor="#16A34A" title="Current City" description={currentLabel} />
            )}
          </MapView>
          <View style={s.mapBar}>
            {homeLabel ? (
              <View style={s.mapBarCity}>
                <View style={[s.mapBarDot, { backgroundColor: '#004AC6' }]} />
                <Text style={s.mapBarCityText} numberOfLines={1}>{homeLabel}</Text>
              </View>
            ) : null}
            {bothExist && (
              <MaterialIcons name="arrow-forward" size={14} color={C.outline} style={{ marginHorizontal: 6 }} />
            )}
            {currentLabel ? (
              <View style={s.mapBarCity}>
                <View style={[s.mapBarDot, { backgroundColor: '#16A34A' }]} />
                <Text style={s.mapBarCityText} numberOfLines={1}>{currentLabel}</Text>
              </View>
            ) : null}
          </View>
        </>
      ) : (
        <View style={s.mapFallback}>
          <MaterialIcons name="map" size={40} color={C.outline} />
          <Text style={s.mapFallbackText}>Location unavailable</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function UserProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { username } = route.params;
  const [profile, setProfile]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const data = await getUserProfile(username);
      setProfile(data);
      setIsLoading(false);
    };
    fetchProfile();
  }, [username]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Search');
  };

  if (isLoading) {
    return (
      <View style={s.screen}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <AppTopHeader onBackPress={handleBack} onNotificationPress={() => navigation.navigate('Notifications')} notificationCount={3} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Loading profile…</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={s.screen}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <AppTopHeader onBackPress={handleBack} onNotificationPress={() => navigation.navigate('Notifications')} notificationCount={3} />
        <View style={s.center}>
          <MaterialIcons name="error-outline" size={56} color={C.outline} />
          <Text style={s.errorText}>User not found</Text>
        </View>
      </View>
    );
  }

  const avatarColor = getAvatarColor(profile.fullName);
  const genderIcon  = GENDER_ICON[profile.gender];
  const genderColor = GENDER_COLOR[profile.gender] ?? C.outline;

  const occupation = profile.occupationType === 'student' ? 'Student' : 'Working Professional';
  const occupationDetail =
    profile.studyOrPost && profile.organization
      ? `${profile.studyOrPost} at ${profile.organization}`
      : profile.studyOrPost || profile.organization || occupation;

  const hometownLabel = [profile.hometownCity, profile.hometownState].filter(Boolean).join(', ');
  const currentLabel  = [profile.city, profile.state].filter(Boolean).join(', ');
  const hasHometown    = !!hometownLabel;
  const hasCurrentCity = !!currentLabel;
  const firstName      = profile.fullName.split(' ')[0];

  return (
    <View style={s.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <AppTopHeader
        onBackPress={handleBack}
        onNotificationPress={() => navigation.navigate('Notifications')}
        notificationCount={3}
        absolute
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero banner ── */}
        <View style={[s.heroWrap, { height: HERO_HEIGHT + insets.top, backgroundColor: '#FAFCFF' }]}>
          {/* Image sits below the status bar, exactly fits screen width */}
          <Image
            source={require("../../assets/cover.png")}
            style={{ position: 'absolute', top: insets.top, left: 0, right: 0, height: HERO_HEIGHT }}
            resizeMode="contain"
          />

          {/* Floating profile picture */}
          <View style={s.floatingAvatarOuter}>
            <View style={{ position: 'relative' }}>
              <View style={s.floatingAvatarBorder}>
                {profile.profileImageUri ? (
                  <Image source={{ uri: profile.profileImageUri }} style={s.floatingAvatarImg} />
                ) : (
                  <View style={[s.floatingAvatarFallback, { backgroundColor: avatarColor.bg }]}>
                    <Text style={[s.floatingAvatarInitial, { color: avatarColor.text }]}>
                      {profile.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              {genderIcon && (
                <View style={[s.genderBadge, { backgroundColor: genderColor }]}>
                  <MaterialIcons name={genderIcon} size={11} color="#fff" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── Profile detail section ── */}
        <View style={s.profileSection}>
          <View style={s.nameRow}>
            <View style={s.nameBlock}>
              <Text style={s.heroName}>{profile.fullName}</Text>
              <Text style={s.heroHandle}>@{profile.username}</Text>
            </View>
            <View style={s.actionButtons}>
              <Pressable style={s.connectBtn}>
                <Text style={s.connectBtnText}>Connect</Text>
              </Pressable>
              <Pressable style={s.messageBtn}>
                <Text style={s.messageBtnText}>Message</Text>
              </Pressable>
            </View>
          </View>

          {!!profile.bio && (
            <View style={s.bioSection}>
              <Text style={s.bioLabel}>BIO</Text>
              <Text style={s.bioText}>{profile.bio}</Text>
            </View>
          )}

          <View style={s.statsBar}>
            <StatItem value={profile.connectionsCount ?? '—'} label="Connections" />
            <View style={s.statDivider} />
            <StatItem value={profile.postsCount ?? '—'} label="Posts" />
            <View style={s.statDivider} />
            <StatItem value={profile.yaariCount ?? '—'} label="Yaaris" />
          </View>

          <View style={s.bentoGrid}>
            <View style={s.bentoRow}>
              <BentoCard icon="work" iconColor={C.primary} label="OCCUPATION" value={occupationDetail} style={{ flex: 1, backgroundColor: C.surfaceLowest }} />
              {hasHometown && (
                <View style={[s.bentoCard, { flex: 1, backgroundColor: C.secondaryFixed }]}>
                  <MaterialIcons name="location-city" size={28} color={C.onSecondaryFixed} />
                  <View>
                    <Text style={[s.bentoLabel, { color: C.onSecondaryFixed, opacity: 0.7 }]}>HOMETOWN</Text>
                    <Text style={[s.bentoValue, { color: C.onSecondaryFixed }]}>{hometownLabel}</Text>
                  </View>
                </View>
              )}
            </View>

            {(hasCurrentCity || !!profile.gender) && (
              <View style={s.bentoRow}>
                {hasCurrentCity && (
                  <BentoCard icon="near-me" iconColor={C.primary} label="CURRENT LOCATION" value={currentLabel} style={{ flex: 1, backgroundColor: C.surfaceLowest }} />
                )}
                {!!profile.gender && (
                  <BentoCard icon={genderIcon ?? 'person'} iconColor={C.primary} label="GENDER" value={profile.gender} style={{ flex: 1, backgroundColor: C.surfaceLowest }} />
                )}
              </View>
            )}

            {hasHometown && (
              <LinearGradient
                colors={['#004AC6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.bentoCard, s.featuredCard]}
              >
                <View style={s.featuredText}>
                  <Text style={s.featuredTitle}>Same Hometown!</Text>
                  <Text style={s.featuredSubtitle}>
                    {firstName} is also from {profile.hometownCity || profile.hometownState}.
                    Connect and explore your roots together!
                  </Text>
                </View>
                <MaterialIcons name="people" size={52} color="rgba(255,255,255,0.35)" />
              </LinearGradient>
            )}
          </View>

          {(hasHometown || hasCurrentCity) && (
            <JourneyMap
              hometownCity={profile.hometownCity}
              hometownState={profile.hometownState}
              currentCity={profile.city}
              currentState={profile.state}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#F7F9FB' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.outline, fontWeight: '500' },
  errorText:   { fontSize: 16, color: C.outline, fontWeight: '600' },
  scroll:      { paddingBottom: 120 },

  // ── Hero ──
  heroWrap: {
    position: 'relative',
  },

  // Floating avatar
  floatingAvatarOuter: {
    position: 'absolute',
    bottom: -(AVATAR_SIZE / 2 + 5),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingAvatarBorder: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    ...CARD_SHADOW,
  },
  floatingAvatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 24,
  },
  floatingAvatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAvatarInitial: {
    fontSize: 44,
    fontWeight: '800',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },

  // ── Profile section ──
  profileSection: {
    marginTop: AVATAR_SIZE / 2 + 18,
    paddingHorizontal: 20,
    gap: 28,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  nameBlock:  { flex: 1, gap: 4 },
  heroName:   { fontSize: 26, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5 },
  heroHandle: { fontSize: 15, fontWeight: '500', color: C.onSurfaceVariant },
  actionButtons: { flexDirection: 'row', gap: 10 },
  connectBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: C.primary,
    borderRadius: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 5,
  },
  connectBtnText:  { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  messageBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0,74,198,0.20)',
  },
  messageBtnText: { color: C.primary, fontWeight: '800', fontSize: 13 },

  // ── Bio ──
  bioSection: { gap: 8 },
  bioLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, color: 'rgba(0,74,198,0.55)' },
  bioText:  { fontSize: 17, lineHeight: 27, color: C.onSurface, fontWeight: '500' },

  // ── Stats bar ──
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(195,198,215,0.35)',
  },
  statItem:    { flex: 1, alignItems: 'center', gap: 3 },
  statValue:   { fontSize: 22, fontWeight: '800', color: C.onSurface },
  statLabel:   { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant },
  statDivider: { width: 1, height: 34, backgroundColor: 'rgba(195,198,215,0.5)' },

  // ── Bento grid ──
  bentoGrid: { gap: 12 },
  bentoRow:  { flexDirection: 'row', gap: 12 },
  bentoCard: { borderRadius: 16, padding: 18, gap: 10, ...CARD_SHADOW },
  bentoLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: C.outline },
  bentoValue: { fontSize: 15, fontWeight: '700', color: C.onSurface, marginTop: 2 },
  featuredCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featuredText:    { flex: 1, gap: 6 },
  featuredTitle:   { fontSize: 19, fontWeight: '800', color: '#FFFFFF' },
  featuredSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 19 },

  // ── Map ──
  mapCard: { height: 260, borderRadius: 24, overflow: 'hidden', ...CARD_SHADOW },
  mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.surfaceLow },
  mapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: C.surfaceLow },
  mapFallbackText: { fontSize: 13, color: C.outline, fontWeight: '500' },
  mapBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 14, paddingVertical: 11,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapBarCity:     { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  mapBarDot:      { width: 8, height: 8, borderRadius: 4 },
  mapBarCityText: { fontSize: 13, fontWeight: '700', color: C.onSurface, flex: 1 },
});