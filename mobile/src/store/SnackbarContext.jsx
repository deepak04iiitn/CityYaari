import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const SnackbarContext = createContext({
  showSnackbar: () => {},
});

const TYPE_COLORS = {
  success: {
    bg: "#e8f6ee",
    border: "#b7e4c7",
    text: "#1f6f43",
  },
  error: {
    bg: "#fdeeee",
    border: "#f6c5c5",
    text: "#a93232",
  },
  info: {
    bg: "#eef2ff",
    border: "#c9d8ff",
    text: "#1e40af",
  },
};

const TYPE_ICONS = {
  success: "check-circle",
  error: "error-outline",
  info: "info-outline",
};

export function SnackbarProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [snack, setSnack] = useState({ visible: false, message: "", type: "info" });
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  const hideSnackbar = useCallback(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setSnack((prev) => ({ ...prev, visible: false }));
    });
  }, [anim]);

  const showSnackbar = useCallback(
    (message, type = "info", duration = 2600) => {
      if (!message) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);

      const safeType = TYPE_COLORS[type] ? type : "info";
      setSnack({ visible: true, message, type: safeType });

      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 140,
        friction: 14,
      }).start();

      hideTimer.current = setTimeout(() => {
        hideSnackbar();
      }, Math.max(1200, duration));
    },
    [anim, hideSnackbar]
  );

  const ctx = useMemo(() => ({ showSnackbar }), [showSnackbar]);
  const colors = TYPE_COLORS[snack.type] || TYPE_COLORS.info;

  return (
    <SnackbarContext.Provider value={ctx}>
      {children}
      <View pointerEvents="none" style={styles.layer}>
        {snack.visible ? (
          <Animated.View
            style={[
              styles.snackbar,
              {
                bottom: 96 + insets.bottom,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.row}>
              <MaterialIcons
                name={TYPE_ICONS[snack.type] || TYPE_ICONS.info}
                size={16}
                color={colors.text}
              />
              <Text style={[styles.message, { color: colors.text }]} numberOfLines={3}>
                {snack.message}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => useContext(SnackbarContext);

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  snackbar: {
    maxWidth: "97%",
    minWidth: "84%",
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: "#0a0a0a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  message: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
    flex: 1,
  },
});
