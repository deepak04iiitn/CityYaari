import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import AccountTab from "../components/tabs/AccountTab";
import HomeTab from "../components/tabs/HomeTab";
import MessagesTab from "../components/tabs/MessagesTab";
import NotificationsTab from "../components/tabs/NotificationsTab";
import PostTab from "../components/tabs/PostTab";
import SearchTab from "../components/tabs/SearchTab";
import UserProfileScreen from "./UserProfileScreen";
import ActivityDetailScreen from "./ActivityDetailScreen";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

const C = {
  blue: "#004ac6",
  blueXLight: "#eef2ff",
  orange: "#e8380d",
  orangeDark: "#a13211",
  ink: "#0a0a0a",
  inkFaint: "#888888",
  white: "#ffffff",
  bg: "#f5f2ed",
  border: "#e0dbd4",
  surface: "#ffffff",
};

const TAB_CONFIG = {
  Home: { icon: "home", label: "Home" },
  Messages: { icon: "chat-bubble", label: "Messages" },
  Post: { icon: "add", isPost: true },
  Search: { icon: "search", label: "Search" },
  Account: { icon: "person", label: "Account" },
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

function TabIcon({ icon, label, focused }) {
  const animNative = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animNative, {
      toValue: focused ? 1 : 0,
      ...SPRING,
      useNativeDriver: true,
    }).start();
  }, [animNative, focused]);

  const pillOpacity = animNative.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const iconScale = animNative.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const iconTranslateY = animNative.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] });
  const labelOpacity = animNative.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const labelTranslateY = animNative.interpolate({ inputRange: [0, 1], outputRange: [0, -1] });

  return (
    <View style={ss.tabItem}>
      <View style={ss.pillArea}>
        <Animated.View
          style={[ss.pill, { opacity: pillOpacity }]}
        />
        <Animated.View style={{ transform: [{ scale: iconScale }, { translateY: iconTranslateY }] }}>
          <MaterialIcons name={icon} size={24} color={focused ? C.blue : C.inkFaint} />
        </Animated.View>
      </View>
      <Animated.Text
        style={[
          ss.tabLabel,
          focused && ss.tabLabelActive,
          { opacity: labelOpacity, transform: [{ translateY: labelTranslateY }] },
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
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
      <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
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
              <TabIcon icon={config.icon} label={config.label} focused={focused} />
            </Pressable>
          );
        })}
      </View>
    </View>
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
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Messages" component={MessagesTab} />
      <Tab.Screen name="Post" component={PostTab} />
      <Tab.Screen name="Search" component={SearchTab} />
      <Tab.Screen name="Account" component={AccountTab} />
      <Tab.Screen name="Notifications" component={NotificationsTab} />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

const ss = StyleSheet.create({
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
    shadowColor: "#0a0a0a",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
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
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -3 }],
  },
  pillArea: {
    width: 58,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    position: "absolute",
    width: 58,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.blueXLight,
    borderWidth: 1,
    borderColor: "#cfddff",
  },
  tabLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "700",
    color: C.inkFaint,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: C.blue,
    fontWeight: "900",
    letterSpacing: 0.8,
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
    shadowColor: "#9a2d10",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
    borderWidth: 4,
    borderColor: "#fff6f2",
  },
});
