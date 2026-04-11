import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const T = {
  bg: "#f5f2ed",
  surface: "#ffffff",
  surfaceAlt: "#f8f6f2",
  ink: "#0a0a0a",
  soft: "#888888",
  mute: "#a6a6a6",
  line: "#e0dbd4",
  lineLight: "#ece7e0",
  blue: "#004ac6",
  bluePale: "#eef2ff",
  blueLight: "#c7d8ff",
  coral: "#C05A5A",
  coralPale: "#FAEAEA",
  white: "#ffffff",
  accent: "#e8380d",
};

const REPORT_REASONS = [
  { key: "harassment", label: "Harassment or bullying", icon: "mood-bad" },
  { key: "spam", label: "Spam or scam", icon: "report" },
  { key: "fake", label: "Fake profile or impersonation", icon: "person-off" },
  { key: "inappropriate", label: "Inappropriate content", icon: "visibility-off" },
  { key: "hate", label: "Hate speech or discrimination", icon: "do-not-disturb" },
  { key: "threatening", label: "Threatening behaviour", icon: "warning-amber" },
  { key: "other", label: "Other", icon: "more-horiz" },
];

export default function ReportSheet({ visible, onClose, onSubmit, userName, busy }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherText, setOtherText] = useState("");
  const fade = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setSelectedReason(null);
      setOtherText("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!selectedReason) return;
    const reason =
      selectedReason === "other"
        ? otherText.trim() || "Other"
        : REPORT_REASONS.find((r) => r.key === selectedReason)?.label || selectedReason;
    const details = selectedReason === "other" ? "" : otherText.trim();
    onSubmit(reason, details);
  };

  const canSubmit =
    selectedReason && (selectedReason !== "other" || otherText.trim().length > 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Animated.View style={[st.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={st.sheetOuter}>
        <View style={st.sheetInner}>
          <View style={st.sheetHandle} />

          <View style={st.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.sheetTitle}>Report User</Text>
              <Text style={st.sheetSub}>
                Why are you reporting{" "}
                <Text style={{ fontWeight: "800", color: T.ink }}>
                  {userName || "this user"}
                </Text>
                ?
              </Text>
            </View>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <MaterialIcons name="close" size={16} color={T.soft} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={st.reasonsList}>
              {REPORT_REASONS.map((r) => {
                const active = selectedReason === r.key;
                return (
                  <Pressable
                    key={r.key}
                    onPress={() => setSelectedReason(r.key)}
                    style={[st.reasonRow, active && st.reasonRowActive]}
                  >
                    <View
                      style={[
                        st.reasonIcon,
                        active && st.reasonIconActive,
                      ]}
                    >
                      <MaterialIcons
                        name={r.icon}
                        size={18}
                        color={active ? T.white : T.soft}
                      />
                    </View>
                    <Text
                      style={[
                        st.reasonLabel,
                        active && st.reasonLabelActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    <View
                      style={[st.radioOuter, active && st.radioOuterActive]}
                    >
                      {active && <View style={st.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {selectedReason === "other" && (
              <View style={st.otherWrap}>
                <Text style={st.otherLabel}>PLEASE DESCRIBE</Text>
                <TextInput
                  style={st.otherInput}
                  placeholder="Tell us what happened..."
                  placeholderTextColor={T.mute}
                  multiline
                  textAlignVertical="top"
                  value={otherText}
                  onChangeText={setOtherText}
                  maxLength={500}
                />
                <Text style={st.charCount}>{otherText.length}/500</Text>
              </View>
            )}

            {selectedReason && selectedReason !== "other" && (
              <View style={st.otherWrap}>
                <Text style={st.otherLabel}>
                  ADDITIONAL DETAILS (OPTIONAL)
                </Text>
                <TextInput
                  style={[st.otherInput, { minHeight: 70 }]}
                  placeholder="Add more context if you'd like..."
                  placeholderTextColor={T.mute}
                  multiline
                  textAlignVertical="top"
                  value={otherText}
                  onChangeText={setOtherText}
                  maxLength={500}
                />
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || busy}
              style={({ pressed }) => [
                st.submitBtn,
                (!canSubmit || busy) && st.submitBtnDisabled,
                pressed && canSubmit && { opacity: 0.82 },
              ]}
            >
              <MaterialIcons
                name="flag"
                size={16}
                color={canSubmit ? T.white : T.mute}
              />
              <Text
                style={[
                  st.submitBtnText,
                  !canSubmit && { color: T.mute },
                ]}
              >
                {busy ? "Submitting..." : "Submit Report"}
              </Text>
            </Pressable>

            <Text style={st.disclaimer}>
              Reports are reviewed by our team. False reports may result in
              action on your account.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.5)",
  },
  sheetOuter: { flex: 1, justifyContent: "flex-end" },
  sheetInner: {
    maxHeight: "85%",
    backgroundColor: T.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.bluePale,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: T.ink,
    letterSpacing: -0.4,
  },
  sheetSub: {
    fontSize: 13,
    color: T.soft,
    marginTop: 4,
    lineHeight: 19,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.bluePale,
    borderWidth: 1,
    borderColor: T.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },

  reasonsList: { gap: 6 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: T.lineLight,
    backgroundColor: T.surfaceAlt,
  },
  reasonRowActive: {
    borderColor: T.coral,
    backgroundColor: T.coralPale,
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.line,
    alignItems: "center",
    justifyContent: "center",
  },
  reasonIconActive: {
    backgroundColor: T.coral,
  },
  reasonLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: T.ink,
  },
  reasonLabelActive: {
    color: T.coral,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: T.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: T.coral,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: T.coral,
  },

  otherWrap: {
    marginTop: 14,
  },
  otherLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: T.soft,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  otherInput: {
    minHeight: 100,
    borderRadius: 14,
    backgroundColor: T.surfaceAlt,
    borderWidth: 1.5,
    borderColor: T.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: T.ink,
    fontWeight: "500",
  },
  charCount: {
    fontSize: 11,
    color: T.mute,
    textAlign: "right",
    marginTop: 4,
  },

  submitBtn: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: T.coral,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: T.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: T.line,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: T.white,
    letterSpacing: 0.2,
  },

  disclaimer: {
    fontSize: 11,
    color: T.mute,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 16,
    fontWeight: "500",
  },
});
