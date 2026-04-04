import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const isProfileCompleteForConnections = (user) =>
  !!(user?.hometownCountry && user?.country && user?.organization && user?.bio);

export default function ProfileCompletionGateModal({
  visible,
  onClose,
  onCompleteProfile,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="diversity-3" size={22} color="#004ac6" />
          </View>

          <Text style={styles.title}>Complete Profile to Build Yaari</Text>
          <Text style={styles.subtitle}>
            Share your hometown, current location, organization, and bio so
            people can connect with your journey.
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Later</Text>
            </Pressable>
            <Pressable onPress={onCompleteProfile} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Go to Account</Text>
              <MaterialIcons name="arrow-forward" size={15} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.45)",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0dbd4",
    padding: 20,
    shadowColor: "#0a0a0a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c9d8ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0a0a0a",
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 8,
    color: "#555555",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e0dbd4",
    backgroundColor: "#f8f6f2",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6c6c6c",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  primaryBtn: {
    flex: 1.3,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#004ac6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
