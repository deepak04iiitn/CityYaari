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
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  getUserProfile,
  removeConnection,
  respondToConnectionRequest,
  sendConnectionRequest,
} from "../services/users/userService";
import { getUnreadNotificationsCount } from "../services/notifications/notificationService";
import AppTopHeader from "../components/AppTopHeader";
import { useSnackbar } from "../store/SnackbarContext";

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
  primary:           "#004ac6",
  onPrimary:         "#ffffff",
  secondary:         "#e8380d",
  secondaryFixed:    "#fff8e6",
  onSecondaryFixed:  "#8f6207",
  surfaceLowest:     "#ffffff",
  surfaceLow:        "#f5f2ed",
  surfaceHigh:       "#ede9e2",
  onSurface:         "#0a0a0a",
  onSurfaceVariant:  "#888888",
  outline:           "#e0dbd4",
};

const AVATAR_SIZE = 96;
const CARD_SHADOW = {
  shadowColor: "#0a0a0a",
  shadowOffset: { width: 3, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 5,
};

// ─── Small reusable sub-components ───────────────────────────────────────────

function StatItem({ value, label }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value, last }) {
  return (
    <View style={[s.detailRow, !last && s.detailRowBorder]}>
      <View style={s.detailIconWrap}>
        <MaterialIcons name={icon} size={16} color={C.primary} />
      </View>
      <View style={s.detailBody}>
        <Text style={s.detailLabel}>{label}</Text>
        <Text style={s.detailValue}>{value || "Not available"}</Text>
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

// ─── Journey Map ──────────────────────────────────────────────────────────────

function JourneyBadge({ from, to }) {
  return (
    <View style={s.journeyBadgeContainer}>
      <BlurView intensity={80} tint="light" style={s.journeyBadgePill}>
        <View style={s.badgeCity}>
          <MaterialIcons name="home" size={14} color={C.primary} />
          <Text style={s.badgeCityText} numberOfLines={1}>{from}</Text>
        </View>
        <MaterialIcons name="east" size={18} color={C.primary} style={{ marginHorizontal: 8 }} />
        <View style={s.badgeCity}>
          <MaterialIcons name="location-city" size={14} color={C.primary} />
          <Text style={s.badgeCityText} numberOfLines={1}>{to}</Text>
        </View>
      </BlurView>
    </View>
  );
}

function JourneyFallback({ homeLabel, currentLabel }) {
  // Use a beautiful OSM static map of a fallback region (e.g., India center)
  const fallbackMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=22.9734,78.6569&zoom=4&size=600x400&maptype=mapnik`;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={{ uri: fallbackMapUrl }} style={s.fallbackImage} />
      <View style={s.fallbackOverlay} />
      <JourneyBadge from={homeLabel?.split(',')[0] || "Hometown"} to={currentLabel?.split(',')[0] || "Current City"} />
    </View>
  );
}

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
            <View style={s.mapBarCity}>
              <View style={[s.mapBarDot, { backgroundColor: '#004AC6' }]} />
              <Text style={s.mapBarCityText} numberOfLines={1}>{homeLabel?.split(',')[0]}</Text>
            </View>
            {bothExist && (
              <MaterialIcons name="east" size={14} color={C.outline} style={{ marginHorizontal: 6 }} />
            )}
            {currentLabel ? (
              <View style={s.mapBarCity}>
                <View style={[s.mapBarDot, { backgroundColor: '#16A34A' }]} />
                <Text style={s.mapBarCityText} numberOfLines={1}>{currentLabel?.split(',')[0]}</Text>
              </View>
            ) : null}
          </View>
        </>
      ) : (
        <JourneyFallback homeLabel={homeLabel} currentLabel={currentLabel} />
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function UserProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const { username } = route.params;
  const [profile, setProfile]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectBusy, setIsConnectBusy] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const data = await getUserProfile(username);
      setProfile(data);
      setIsLoading(false);
    };
    fetchProfile();
  }, [username]);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      const loadUnread = async () => {
        const result = await getUnreadNotificationsCount();
        if (mounted && result.success) {
          setUnreadNotifications(result.count || 0);
        }
      };
      loadUnread();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Search');
  };

  if (isLoading) {
    return (
      <View style={s.screen}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <AppTopHeader onBackPress={handleBack} onNotificationPress={() => navigation.navigate('Notifications')} notificationCount={unreadNotifications} />
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
        <AppTopHeader onBackPress={handleBack} onNotificationPress={() => navigation.navigate('Notifications')} notificationCount={unreadNotifications} />
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
  const connectLabel =
    profile.connectionStatus === "connected"
      ? "Connected"
      : profile.connectionStatus === "request_sent"
      ? "Requested"
      : profile.connectionStatus === "request_received"
      ? "Accept"
      : "Connect";

  const onConnectPress = async () => {
    if (!profile?._id || isConnectBusy) return;
    setIsConnectBusy(true);
    const result =
      profile.connectionStatus === "connected"
        ? await removeConnection(profile._id)
        : profile.connectionStatus === "request_received"
        ? await respondToConnectionRequest(profile._id, "accept")
        : profile.connectionStatus === "request_sent"
        ? { success: false, message: "Request already sent and pending response." }
        : await sendConnectionRequest(profile._id);
    setIsConnectBusy(false);

    if (!result.success) {
      showSnackbar(result.message || "Unable to perform this action", "error");
      return;
    }

    const refreshed = await getUserProfile(username);
    if (refreshed) setProfile(refreshed);
    showSnackbar(
      profile.connectionStatus === "connected"
        ? "Connection removed."
        : profile.connectionStatus === "request_received"
        ? "Connection request accepted."
        : "Connection request sent.",
      "success"
    );
  };

  return (
    <View style={s.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <AppTopHeader
        onBackPress={handleBack}
        onNotificationPress={() => navigation.navigate('Notifications')}
        notificationCount={unreadNotifications}
        absolute
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 74 }]}
      >
        <LinearGradient
          colors={["#fdfcf9", "#f5f2ed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroTop}>
            <View style={s.memberPill}>
              <View style={s.memberDot} />
              <Text style={s.memberText}>CityYaari Member</Text>
            </View>
          </View>

          <View style={s.profileRow}>
            <View style={s.avatarWrap}>
              {profile.profileImageUri ? (
                <Image source={{ uri: profile.profileImageUri }} style={s.avatarImg} />
              ) : (
                <View style={[s.avatarFallback, { backgroundColor: avatarColor.bg }]}>
                  <Text style={[s.avatarInitial, { color: avatarColor.text }]}>
                    {profile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {genderIcon && (
                <View style={[s.genderBadge, { backgroundColor: genderColor }]}>
                  <MaterialIcons name={genderIcon} size={11} color="#fff" />
                </View>
              )}
            </View>

            <View style={s.nameBlock}>
              <Text style={s.heroName}>{profile.fullName}</Text>
              <Text style={s.heroHandle}>@{profile.username}</Text>
              <View style={s.nameAccent} />
            </View>
          </View>

          <View style={s.heroActions}>
            <Pressable
              style={[
                s.connectBtn,
                profile.connectionStatus === "connected" && s.connectedBtn,
              ]}
              onPress={onConnectPress}
            >
              <Text style={s.connectBtnText}>
                {isConnectBusy ? "..." : connectLabel}
              </Text>
            </Pressable>
            <Pressable style={s.messageBtn}>
              <Text style={s.messageBtnText}>Message</Text>
            </Pressable>
          </View>

          <View style={s.metaChips}>
            <View style={s.metaChip}>
              <MaterialIcons name="work" size={14} color={C.primary} />
              <Text style={s.metaChipText}>{occupation}</Text>
            </View>
            {hasCurrentCity ? (
              <View style={[s.metaChip, s.metaChipAlt]}>
                <MaterialIcons name="location-on" size={14} color={C.onSecondaryFixed} />
                <Text style={[s.metaChipText, { color: C.onSecondaryFixed }]} numberOfLines={1}>
                  {currentLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        <View style={s.profileSection}>
          {!!profile.bio && (
            <View style={s.sectionCard}>
              <Text style={s.bioLabel}>BIO</Text>
              <Text style={s.bioText}>{profile.bio}</Text>
            </View>
          )}

          <View style={s.statsRow}>
            <StatItem value={profile.postsCount ?? "—"} label="Posts" />
            <StatItem value={profile.yaariCount ?? "—"} label="Yaaris" />
          </View>

          <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Profile Details</Text>
            </View>
            <DetailRow icon="work-outline" label="Occupation" value={occupationDetail} />
            <DetailRow icon="person-outline" label="Gender" value={profile.gender || "Not specified"} />
            <DetailRow icon="home" label="Hometown" value={hometownLabel || "Not set"} />
            <DetailRow
              icon="location-city"
              label="Current Location"
              value={currentLabel || "Not set"}
              last
            />
          </View>

          {(hasHometown || hasCurrentCity) && (
            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Journey Map</Text>
                <Text style={s.sectionMeta}>From hometown to current city</Text>
              </View>
              <JourneyMap
                hometownCity={profile.hometownCity}
                hometownState={profile.hometownState}
                currentCity={profile.city}
                currentState={profile.state}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: C.surfaceLow },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.onSurfaceVariant, fontWeight: '600' },
  errorText:   { fontSize: 16, color: C.onSurfaceVariant, fontWeight: '700' },
  scroll:      { paddingHorizontal: 20, paddingBottom: 120, gap: 16 },

  heroCard: {
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.outline,
    backgroundColor: C.surfaceLowest,
    padding: 16,
    gap: 14,
    ...CARD_SHADOW,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.2,
    borderColor: C.secondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.secondary,
  },
  memberText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: C.secondary,
    textTransform: "uppercase",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    position: "relative",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 16,
    padding: 3,
    borderWidth: 2,
    borderColor: C.primary,
    backgroundColor: "#d7e3ff",
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '900',
  },
  genderBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },

  // ── Profile section ──
  profileSection: {
    gap: 18,
  },
  nameBlock:  { flex: 1, gap: 3 },
  heroName:   { fontSize: 24, fontWeight: '900', color: C.onSurface, letterSpacing: -0.5 },
  heroHandle: { fontSize: 13, fontWeight: '700', color: C.onSurfaceVariant },
  nameAccent: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.secondary,
    marginTop: 6,
  },
  heroActions: { flexDirection: 'row', gap: 10 },
  connectBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: C.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  connectedBtn: {
    backgroundColor: "#2d7a55",
  },
  connectBtnText:  { color: '#FFFFFF', fontWeight: '900', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  messageBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.outline,
    alignItems: "center",
  },
  messageBtnText: { color: C.onSurface, fontWeight: '900', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  metaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c9d8ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: "100%",
  },
  metaChipAlt: {
    backgroundColor: C.secondaryFixed,
    borderColor: "#f0da9e",
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },

  // ── Bio ──
  sectionCard: {
    backgroundColor: C.surfaceLowest,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.outline,
    padding: 14,
    ...CARD_SHADOW,
  },
  bioLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, color: C.onSurfaceVariant },
  bioText:  { fontSize: 14, lineHeight: 22, color: C.onSurface, fontWeight: '500', fontStyle: 'italic', marginTop: 6 },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.outline,
    backgroundColor: C.surfaceLowest,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
    ...CARD_SHADOW,
  },
  statValue:   { fontSize: 22, fontWeight: '900', color: C.onSurface },
  statLabel:   { fontSize: 10, fontWeight: '900', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.1 },

  // ── Detail Rows ──
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: C.onSurface,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionMeta: {
    marginTop: 4,
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 11,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#ece7e0",
  },
  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c9d8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  detailBody: { flex: 1 },
  detailLabel: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.onSurfaceVariant,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: C.onSurface,
    lineHeight: 20,
  },

  // ── Map ──
  mapCard: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#d8d8d8",
  },
  mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.surfaceLow },
  mapFallback: { flex: 1, backgroundColor: C.surfaceLow },
  fallbackImage: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  fallbackOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.02)' },
  journeyBadgeContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  journeyBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: C.outline,
    ...CARD_SHADOW,
  },
  badgeCity: { gap: 2, alignItems: 'center', maxWidth: 100 },
  badgeCityText: { fontSize: 13, fontWeight: '800', color: C.onSurface, textAlign: 'center' },
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
  mapBarCityText: { fontSize: 13, fontWeight: '800', color: C.onSurface, flex: 1 },
});