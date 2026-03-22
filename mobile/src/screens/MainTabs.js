import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import AppTopHeader from "../components/AppTopHeader";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

const C = {
  blue: "#2563EB",
  blueXLight: "#EFF6FF",
  orange: "#F97316",
  orangeDark: "#C2520F",
  ink: "#0F172A",
  inkFaint: "#94A3B8",
  white: "#FFFFFF",
  bg: "#F1F5F9",
  border: "#E2E8F0",
  surface: "#FFFFFF",
  cardBorder: "#DCE8F8",
};

const TAB_CONFIG = {
  Home: { icon: "home" },
  Messages: { icon: "chat-bubble" },
  Post: { icon: "add", isPost: true },
  Search: { icon: "search" },
  Account: { icon: "person" },
};

const SPRING = { tension: 200, friction: 18 };
const BAR_HEIGHT = 68;
const NOTCH_W = 88;
const NOTCH_D = 32;
const FAB_SIZE = 62;
const FAB_LIFT = 22;

function NotchedBar({ bottomPad }) {
  const totalH = BAR_HEIGHT + bottomPad;
  const cx = width / 2;
  const path = [
    "M0,0",
    `L${cx - NOTCH_W / 2 - 24},0`,
    `C${cx - NOTCH_W / 2 - 8},0 ${cx - NOTCH_W / 2},${NOTCH_D} ${cx},${NOTCH_D}`,
    `C${cx + NOTCH_W / 2},${NOTCH_D} ${cx + NOTCH_W / 2 + 8},0 ${cx + NOTCH_W / 2 + 24},0`,
    `L${width},0`,
    `L${width},${totalH}`,
    `L0,${totalH}`,
    "Z",
  ].join(" ");

  return (
    <Svg width={width} height={totalH} style={StyleSheet.absoluteFill}>
      <Path d={path} fill={C.surface} />
    </Svg>
  );
}

function TabIcon({ icon, focused }) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const animNative = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      ...SPRING,
      useNativeDriver: false,
    }).start();
    Animated.spring(animNative, {
      toValue: focused ? 1 : 0,
      ...SPRING,
      useNativeDriver: true,
    }).start();
  }, [anim, animNative, focused]);

  const pillWidth = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });
  const pillOpacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });
  const iconScale = animNative.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const iconTranslateY = animNative.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] });

  return (
    <View style={ss.tabItem}>
      <View style={ss.pillArea}>
        <Animated.View style={[ss.pill, { width: pillWidth, opacity: pillOpacity }]} />
        <Animated.View style={{ transform: [{ scale: iconScale }, { translateY: iconTranslateY }] }}>
          <MaterialIcons name={icon} size={26} color={focused ? C.blue : C.inkFaint} />
        </Animated.View>
      </View>
    </View>
  );
}

function PostFAB({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.9, tension: 300, friction: 10, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={ss.fabPressable}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={[C.orange, C.orangeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={ss.fab}
        >
          <MaterialIcons name="add" size={33} color={C.white} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 0);
  const totalH = BAR_HEIGHT + bottomPad;
  const visibleRoutes = state.routes.filter((route) => TAB_CONFIG[route.name]);

  return (
    <View style={[ss.outerWrap, { height: totalH + FAB_LIFT }]}>
      <View style={[ss.barBg, { height: totalH, marginTop: FAB_LIFT }]}>
        <NotchedBar bottomPad={bottomPad} />
        <View style={[ss.topBorder, { width: width / 2 - NOTCH_W / 2 - 20 }]} />
        <View style={[ss.topBorderRight, { width: width / 2 - NOTCH_W / 2 - 20 }]} />
      </View>

      <View style={[ss.tabRow, { height: BAR_HEIGHT, marginTop: FAB_LIFT }]}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((item) => item.key === route.key);
          const focused = state.index === routeIndex;
          const config = TAB_CONFIG[route.name] || {};

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (config.isPost) {
            return (
              <View key={route.key} style={ss.fabSlot}>
                <PostFAB onPress={onPress} />
              </View>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={ss.tabTouchable}
              android_ripple={{ color: "transparent" }}
            >
              <TabIcon icon={config.icon} focused={focused} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ScreenShell({ navigation, routeName, title, subtitle, children }) {
  const canGoBack = navigation.canGoBack();

  const handleBack = () => {
    if (canGoBack) {
      navigation.goBack();
      return;
    }

    if (routeName !== "Home") {
      navigation.navigate("Home");
    }
  };

  return (
    <SafeAreaView style={ss.screen}>
      <StatusBar style="dark" />
      <AppTopHeader
        onBackPress={handleBack}
        onNotificationPress={() => navigation.navigate("Notifications")}
        backDisabled={!canGoBack && routeName === "Home"}
        notificationCount={3}
      />
      <ScrollView
        contentContainerStyle={ss.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#EEF5FF", "#FFFFFF"]} style={ss.heroCard}>
          <Text style={ss.heroTitle}>{title}</Text>
          <Text style={ss.heroSubtitle}>{subtitle}</Text>
        </LinearGradient>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ title, meta, body }) {
  return (
    <View style={ss.infoCard}>
      <Text style={ss.infoTitle}>{title}</Text>
      {meta ? <Text style={ss.infoMeta}>{meta}</Text> : null}
      <Text style={ss.infoBody}>{body}</Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Home"
      title="Your people are already active."
      subtitle="Meetups, useful conversations, and familiar faces across the city."
    >
      <View style={ss.metricRow}>
        <View style={[ss.metricCard, ss.metricBlue]}>
          <Text style={ss.metricValue}>18</Text>
          <Text style={ss.metricLabel}>Meetups this week</Text>
        </View>
        <View style={[ss.metricCard, ss.metricOrange]}>
          <Text style={ss.metricValue}>24</Text>
          <Text style={ss.metricLabel}>Unread messages</Text>
        </View>
      </View>
      <InfoCard
        title="Bangalore Yaaris"
        meta="Tonight, 8:30 PM"
        body="A rooftop chai meetup in Indiranagar is filling up fast. New members from Lucknow and Jaipur joined this afternoon."
      />
      <InfoCard
        title="Community Highlights"
        meta="Recommended for you"
        body="Flat leads, job referrals, and weekend sports meetups are trending near your area."
      />
    </ScreenShell>
  );
}

function MessagesScreen({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Messages"
      title="Keep your city conversations warm."
      subtitle="Recent chats and group threads stay easy to reach."
    >
      <InfoCard
        title="Ananya Sharma"
        meta="Seen 2 min ago"
        body="Breakfast meetup in Koramangala on Sunday. A few new members are joining too."
      />
      <InfoCard
        title="Delhi to Pune Group"
        meta="18 unread messages"
        body="Members are sharing rental leads, intern openings, and a Holi dinner plan."
      />
    </ScreenShell>
  );
}

function PostScreen({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Post"
      title="Share something worth showing up for."
      subtitle="Create a meetup, ask a question, or post a trusted lead."
    >
      <View style={ss.composerCard}>
        <View style={ss.composerPill}>
          <MaterialIcons name="event-available" size={18} color={C.blue} />
          <Text style={ss.composerPillText}>Event</Text>
        </View>
        <View style={ss.composerPill}>
          <MaterialIcons name="home-work" size={18} color={C.blue} />
          <Text style={ss.composerPillText}>Room</Text>
        </View>
        <View style={ss.composerPill}>
          <MaterialIcons name="help-outline" size={18} color={C.blue} />
          <Text style={ss.composerPillText}>Question</Text>
        </View>
        <Pressable style={ss.primaryButton}>
          <Text style={ss.primaryButtonText}>Start Posting</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

function SearchScreen({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Search"
      title="Search by city, language, or vibe."
      subtitle="Find communities, people, and events without digging."
    >
      <View style={ss.searchCard}>
        <View style={ss.searchInputMock}>
          <MaterialIcons name="search" size={18} color={C.inkFaint} />
          <Text style={ss.searchPlaceholder}>Search Bangalore, Tamil, cricket...</Text>
        </View>
      </View>
      <InfoCard
        title="Hyderabad in Mumbai"
        meta="3.4K members"
        body="Active hometown group with weekend events, city tips, and useful roommate threads."
      />
    </ScreenShell>
  );
}

function AccountScreen({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Account"
      title="Your identity, trust, and settings."
      subtitle="Keep your profile polished and community-ready."
    >
      <View style={ss.accountCard}>
        <View style={ss.accountAvatar}>
          <Text style={ss.accountAvatarText}>CY</Text>
        </View>
        <Text style={ss.accountName}>CityYaari Member</Text>
        <Text style={ss.accountMeta}>Verified hometown profile</Text>
      </View>
    </ScreenShell>
  );
}

function NotificationsScreen({ navigation }) {
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={ss.screen}>
      <StatusBar style="dark" />
      <AppTopHeader
        onBackPress={() => {
          if (canGoBack) {
            navigation.goBack();
            return;
          }
          navigation.navigate("Home");
        }}
        onNotificationPress={() => {}}
        notificationCount={3}
      />
      <ScrollView contentContainerStyle={ss.screenContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#FFF3EA", "#FFFFFF"]} style={ss.heroCard}>
          <Text style={ss.heroTitle}>Notifications</Text>
          <Text style={ss.heroSubtitle}>Important updates from your city circle, all in one place.</Text>
        </LinearGradient>
        <InfoCard
          title="Meetup Reminder"
          meta="5 min ago"
          body="Your Bangalore chai meetup starts in 40 minutes. 12 people confirmed."
        />
        <InfoCard
          title="New Message Request"
          meta="18 min ago"
          body="A member from Lucknow wants to connect about a flat near HSR Layout."
        />
        <InfoCard
          title="Community Update"
          meta="Today"
          body="Pune food walk registrations just opened for this Saturday evening."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      backBehavior="history"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

const ss = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  screenContent: {
    paddingHorizontal: 18,
    paddingBottom: 150,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 22,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5B6475",
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  metricBlue: {
    backgroundColor: "#EAF2FF",
    borderColor: "#D3E3FF",
  },
  metricOrange: {
    backgroundColor: "#FFF0E7",
    borderColor: "#F7D9C8",
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "800",
    color: C.ink,
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#5B6475",
  },
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
  },
  infoMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#738199",
  },
  infoBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#5B6475",
  },
  composerCard: {
    backgroundColor: C.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
    gap: 12,
  },
  composerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#DEE8F8",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  composerPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  primaryButton: {
    marginTop: 6,
    height: 54,
    borderRadius: 18,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
  },
  searchCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
  },
  searchInputMock: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#DEE8F8",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: C.inkFaint,
  },
  accountCard: {
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 24,
  },
  accountAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  accountAvatarText: {
    color: C.white,
    fontSize: 28,
    fontWeight: "800",
  },
  accountName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
  },
  accountMeta: {
    marginTop: 6,
    fontSize: 14,
    color: "#738199",
  },
  outerWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width,
  },
  barBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 1,
    backgroundColor: C.border,
  },
  topBorderRight: {
    position: "absolute",
    top: 0,
    right: 0,
    height: 1,
    backgroundColor: C.border,
  },
  tabRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  tabTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingBottom: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -5 }],
  },
  pillArea: {
    width: 64,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    position: "absolute",
    height: 40,
    borderRadius: 20,
    backgroundColor: C.blueXLight,
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -FAB_LIFT + 4,
  },
  fabPressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.orange,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
    borderWidth: 4,
    borderColor: C.white,
  },
});
