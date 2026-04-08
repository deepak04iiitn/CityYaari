import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Logo = require("../../assets/Logo.png");

const C = {
  blue: "#004ac6",
  blueLight: "#eef2ff",
  ink: "#0a0a0a",
  inkSoft: "#888888",
  white: "#ffffff",
  border: "#e0dbd4",
  surface: "#f8f6f2",
  accent: "#e8380d",
};

export default function AppTopHeader({
  onBackPress,
  onNotificationPress,
  backDisabled = false,
  notificationCount = 0,
  absolute = false,
  transparent = false,
}) {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (absolute || transparent ? 64 : 76);

  return (
    <View style={[styles.wrap, (absolute || transparent) && styles.wrapAbsolute]}>
      <LinearGradient
        colors={["rgba(248,246,242,0.98)", "#f8f6f2"]}
        style={[
          styles.shell,
          { paddingTop: insets.top + (absolute || transparent ? 0 : 8), height: headerHeight },
          transparent && styles.shellTransparent,
        ]}
      >
        <Pressable
          onPress={onBackPress}
          disabled={backDisabled}
          style={[
            styles.iconButton,
            backDisabled && styles.iconButtonDisabled,
            (absolute || transparent) && styles.iconButtonTransparent,
          ]}
        >
          <MaterialIcons
            name="arrow-back-ios-new"
            size={19}
            color={backDisabled ? "#B8C2D3" : C.ink}
          />
        </Pressable>

        <View style={styles.brandWrap}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
        </View>

        <Pressable onPress={onNotificationPress} style={styles.notificationButton}>
          <LinearGradient
            colors={transparent ? ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"] : ["#f3f6ff", "#eef2ff"]}
            style={[styles.notificationInner, transparent && styles.notificationInnerTransparent]}
          >
            <MaterialIcons name="notifications-none" size={22} color={C.blue} />
            {notificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount > 9 ? "9+" : notificationCount}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  wrapAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    marginBottom: 0,
  },
  shell: {
    borderRadius: 0,
    borderWidth: 1.2,
    borderColor: C.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0a0a0a",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  shellTransparent: {
    borderWidth: 0,
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  iconButtonText: {
    color: C.ink,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  iconButtonTransparent: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  iconButtonDisabled: {
    backgroundColor: "#FBFCFE",
  },
  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logo: {
    width: 120,
    height: 40,
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    overflow: "hidden",
  },
  notificationInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
  },
  notificationInnerTransparent: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  badge: {
    position: "absolute",
    top: 9,
    right: 9,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: C.white,
  },
  badgeText: {
    color: C.white,
    fontSize: 9,
    fontWeight: "900",
  },
});
