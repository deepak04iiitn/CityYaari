import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  blue: "#2563EB",
  blueLight: "#EEF5FF",
  ink: "#0F172A",
  inkSoft: "#6B7280",
  white: "#FFFFFF",
  border: "#DCE7F7",
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
        colors={transparent ? ["transparent", "transparent"] : ["rgba(255,255,255,0.98)", "#FFFFFF"]}
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
            size={20}
            color={backDisabled ? "#B8C2D3" : (transparent ? "#FFF" : C.ink)}
          />
        </Pressable>

        <View style={styles.brandWrap}>
          <Text style={styles.brandText}>
            <Text style={[styles.brandCity, transparent && { color: "#FFF" }]}>City</Text>
            <Text style={[styles.brandYaari, transparent && { color: "#FFF" }]}>Yaari</Text>
          </Text>
          <View style={[styles.brandUnderline, transparent && { backgroundColor: "#FFF" }]} />
        </View>

        <Pressable onPress={onNotificationPress} style={styles.notificationButton}>
          <LinearGradient
            colors={transparent ? ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"] : ["#F3F8FF", "#EAF2FF"]}
            style={[styles.notificationInner, transparent && styles.notificationInnerTransparent]}
          >
            <MaterialIcons name="notifications-none" size={22} color={transparent ? "#FFF" : C.blue} />
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
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFD",
    borderWidth: 1,
    borderColor: "#E6EDF8",
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
  },
  brandText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  brandCity: {
    color: C.ink,
  },
  brandYaari: {
    color: C.blue,
  },
  brandUnderline: {
    marginTop: 5,
    width: 34,
    height: 4,
    borderRadius: 999,
    backgroundColor: C.blue,
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    overflow: "hidden",
  },
  notificationInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE7F7",
    borderRadius: 18,
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
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: C.white,
  },
  badgeText: {
    color: C.white,
    fontSize: 9,
    fontWeight: "800",
  },
});
