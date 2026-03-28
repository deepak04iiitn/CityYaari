import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getUserProfile } from "../services/users/userService";
import { TAB_COLORS } from "../components/tabs/TabShared";
import AppTopHeader from "../components/AppTopHeader";

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

const GENDER_ICON = { Male: 'male', Female: 'female', Other: 'transgender' };
const GENDER_COLOR = { Male: '#3B82F6', Female: '#EC4899', Other: '#8B5CF6' };

export default function UserProfileScreen({ route, navigation }) {
  const { username } = route.params;
  const [profile, setProfile] = useState(null);
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
      <SafeAreaView style={styles.screen}>
        <AppTopHeader
          onBackPress={handleBack}
          onNotificationPress={() => navigation.navigate('Notifications')}
          notificationCount={3}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TAB_COLORS.blue} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <AppTopHeader
          onBackPress={handleBack}
          onNotificationPress={() => navigation.navigate('Notifications')}
          notificationCount={3}
        />
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={56} color={TAB_COLORS.inkFaint} />
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarColor = getAvatarColor(profile.fullName);
  const occupation = profile.occupationType === 'student' ? 'Student' : 'Working Professional';
  const genderIcon = GENDER_ICON[profile.gender];
  const genderColor = GENDER_COLOR[profile.gender] ?? TAB_COLORS.inkFaint;

  const hometownCity = profile.hometownCity;
  const hometownState = profile.hometownState;
  const currentCity = profile.city;
  const currentState = profile.state;
  const hasJourney = (hometownCity || hometownState) && (currentCity || currentState);
  const hasAbout = profile.studyOrPost || profile.organization || profile.gender;

  return (
    <SafeAreaView style={styles.screen}>
      <AppTopHeader
        onBackPress={handleBack}
        onNotificationPress={() => navigation.navigate('Notifications')}
        notificationCount={3}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>

          {/* Left — circular avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
              {profile.profileImageUri ? (
                <Image source={{ uri: profile.profileImageUri }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarInitial, { color: avatarColor.text }]}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            {genderIcon && (
              <View style={[styles.genderBadge, { backgroundColor: genderColor }]}>
                <MaterialIcons name={genderIcon} size={11} color="#fff" />
              </View>
            )}
          </View>

          {/* Right — text info */}
          <View style={styles.profileInfo}>
            <Text style={styles.heroName}>{profile.fullName}</Text>
            <Text style={styles.heroUsername}>@{profile.username}</Text>

            <View style={styles.accentDash} />

            <View style={[
              styles.occupationPill,
              profile.occupationType === 'student' ? styles.pillStudent : styles.pillPro,
            ]}>
              <MaterialIcons
                name={profile.occupationType === 'student' ? 'school' : 'work'}
                size={13}
                color={profile.occupationType === 'student' ? '#7C3AED' : TAB_COLORS.blue}
              />
              <Text style={[
                styles.occupationText,
                profile.occupationType === 'student' ? styles.occupationTextStudent : styles.occupationTextPro,
              ]}>
                {occupation}
              </Text>
            </View>
          </View>

        </View>

        {/* ── Cards ── */}
        <View style={styles.body}>

          {/* Journey Card — hometown → current city */}
          {hasJourney && (
            <View style={styles.card}>
              {/* Card header */}
              <View style={styles.journeyCardHeader}>
                <View style={styles.journeyTitleRow}>
                  <LinearGradient colors={['#FFEDD5', '#FED7AA']} style={styles.journeyTitleIcon}>
                    <MaterialIcons name="flight" size={15} color={TAB_COLORS.orange} />
                  </LinearGradient>
                  <Text style={styles.journeyTitleText}>Journey</Text>
                </View>
                <Text style={styles.journeySubtitle}>Where they come from</Text>
              </View>

              {/* hometown ——✈—— current city */}
              <View style={styles.journeyRow}>

                {/* Hometown node */}
                <View style={styles.journeyNode}>
                  <View style={[styles.journeyNodeIcon, styles.journeyNodeIconHome]}>
                    <MaterialIcons name="home" size={26} color={TAB_COLORS.orange} />
                  </View>
                  <View style={[styles.journeyNodeTag, styles.journeyNodeTagHome]}>
                    <Text style={[styles.journeyNodeTagText, { color: TAB_COLORS.orange }]}>HOME</Text>
                  </View>
                  <Text style={styles.journeyNodeCity} numberOfLines={1}>
                    {hometownCity || hometownState}
                  </Text>
                  {hometownCity && hometownState && (
                    <Text style={styles.journeyNodeState} numberOfLines={1}>{hometownState}</Text>
                  )}
                </View>

                {/* Connector */}
                <View style={styles.connectorWrap}>
                  <View style={styles.connectorTrack}>
                    <View style={[styles.connectorDot, { backgroundColor: '#FDBA74' }]} />
                    {[0, 1, 2, 3].map((i) => (
                      <View key={i} style={styles.connectorDash} />
                    ))}
                    <View style={[styles.connectorDot, { backgroundColor: '#93C5FD' }]} />
                  </View>
                  <LinearGradient
                    colors={[TAB_COLORS.orange, '#FB923C']}
                    style={styles.connectorPlane}
                  >
                    <MaterialIcons name="flight" size={15} color="#fff" />
                  </LinearGradient>
                </View>

                {/* Current city node */}
                <View style={styles.journeyNode}>
                  <View style={[styles.journeyNodeIcon, styles.journeyNodeIconCity]}>
                    <MaterialIcons name="location-on" size={26} color={TAB_COLORS.blue} />
                  </View>
                  <View style={[styles.journeyNodeTag, styles.journeyNodeTagCity]}>
                    <Text style={[styles.journeyNodeTagText, { color: TAB_COLORS.blue }]}>NOW IN</Text>
                  </View>
                  <Text style={styles.journeyNodeCity} numberOfLines={1}>
                    {currentCity || currentState}
                  </Text>
                  {currentCity && currentState && (
                    <Text style={styles.journeyNodeState} numberOfLines={1}>{currentState}</Text>
                  )}
                </View>

              </View>
            </View>
          )}

          {/* About Card */}
          {hasAbout && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>

              {(profile.studyOrPost || profile.organization) && (
                <InfoRow
                  icon={profile.occupationType === 'student' ? 'school' : 'business-center'}
                  iconBg={profile.occupationType === 'student' ? '#EDE9FE' : '#DBEAFE'}
                  iconColor={profile.occupationType === 'student' ? '#7C3AED' : TAB_COLORS.blue}
                  label={profile.occupationType === 'student' ? 'Programme' : 'Role'}
                  value={
                    profile.studyOrPost && profile.organization
                      ? `${profile.studyOrPost} at ${profile.organization}`
                      : profile.studyOrPost || profile.organization
                  }
                />
              )}

              {profile.gender && (
                <InfoRow
                  icon={genderIcon ?? 'person'}
                  iconBg={genderColor + '22'}
                  iconColor={genderColor}
                  label="Gender"
                  value={profile.gender}
                />
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, iconBg, iconColor, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TAB_COLORS.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: TAB_COLORS.inkFaint,
    fontWeight: '600',
  },
  scroll: {
    paddingBottom: 120,
  },

  // ── Profile Card ──
  profileCard: {
    backgroundColor: TAB_COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: TAB_COLORS.cardBorder,
    paddingVertical: 24,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
    alignItems: 'flex-end',
  },

  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  genderBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TAB_COLORS.surface,
  },

  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: TAB_COLORS.ink,
    letterSpacing: -0.4,
    textAlign: 'right',
  },
  heroUsername: {
    fontSize: 13,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
    textAlign: 'right',
  },

  accentDash: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: TAB_COLORS.orange,
  },

  occupationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillStudent: { backgroundColor: '#EDE9FE' },
  pillPro: { backgroundColor: '#EFF6FF' },
  occupationText: { fontSize: 12, fontWeight: '700' },
  occupationTextStudent: { color: '#7C3AED' },
  occupationTextPro: { color: TAB_COLORS.blue },

  // ── Body ──
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  // ── Card base ──
  card: {
    backgroundColor: TAB_COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: TAB_COLORS.cardBorder,
    padding: 20,
    gap: 18,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TAB_COLORS.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Journey card ──
  journeyCardHeader: {
    gap: 3,
  },
  journeyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  journeyTitleIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: TAB_COLORS.ink,
    letterSpacing: -0.3,
  },
  journeySubtitle: {
    fontSize: 12,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
    marginLeft: 39,
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  journeyNode: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  journeyNodeIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  journeyNodeIconHome: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  journeyNodeIconCity: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  journeyNodeTag: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  journeyNodeTagHome: { backgroundColor: '#FFEDD5' },
  journeyNodeTagCity: { backgroundColor: '#DBEAFE' },
  journeyNodeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  journeyNodeCity: {
    fontSize: 14,
    fontWeight: '700',
    color: TAB_COLORS.ink,
    textAlign: 'center',
  },
  journeyNodeState: {
    fontSize: 11,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Connector
  connectorWrap: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    position: 'relative',
  },
  connectorTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 3,
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  connectorDash: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CBD5E1',
  },
  connectorPlane: {
    position: 'absolute',
    top: 17,
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: TAB_COLORS.orange,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  // ── About info rows ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoTextWrap: {
    flex: 1,
    gap: 3,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TAB_COLORS.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: TAB_COLORS.ink,
  },
});
