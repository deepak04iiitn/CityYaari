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
import { TAB_COLORS as C } from "../components/tabs/TabShared";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

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
