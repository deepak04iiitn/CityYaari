import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// ─── TOKENS (Shared with CommentsSheet) ──────────────────────────────────────
const T = {
  bg0: "#080a0d",
  bg1: "#0f1117",
  bg2: "#161b24",
  bg3: "#1e2535",
  b1:  "#1d2535",
  b2:  "#263047",
  b3:  "#2e3a52",
  t1:  "#eef0f4",
  t2:  "#8b95a8",
  t3:  "#4d5769",
  red:   "#f03e1b",
  redBg: "#1a0b07",
  redBd: "#3d1208",
  blu:   "#3b82f6",
  bluBg: "#07111f",
  bluBd: "#0e2447",
  gld:   "#f59e0b",
  gldBg: "#160d01",
  gldBd: "#3d2802",
  hdl: "#1f2736",
};

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useFadeIn(trigger) {
  const v = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.timing(v, { toValue: trigger ? 1 : 0, duration: 280, useNativeDriver: true }).start();
  }, [trigger]);
  return v;
}

function useSlideUp(trigger) {
  const v = useMemo(() => new Animated.Value(300), []);
  useEffect(() => {
    Animated.spring(v, {
      toValue: trigger ? 0 : 300,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [trigger]);
  return v;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FilterChip({ label, active, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      {icon && <MaterialIcons name={icon} size={14} color={active ? T.t1 : T.t3} style={{ marginRight: 4 }} />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function FilterModal({ 
  visible, 
  onClose, 
  onApply, 
  initialFilters 
}) {
  const fade = useFadeIn(visible);
  const slide = useSlideUp(visible);

  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "newest");
  const [category, setCategory] = useState(initialFilters.category || null);
  const [hasImage, setHasImage] = useState(initialFilters.hasImage); // "true" | "false" | null
  const [gender, setGender] = useState(initialFilters.gender || null);
  const [hometown, setHometown] = useState(initialFilters.hometown || "");
  const [location, setLocation] = useState(initialFilters.location || "");

  // Sync with initial filters when modal opens
  useEffect(() => {
    if (visible) {
      setSortBy(initialFilters.sortBy || "newest");
      setCategory(initialFilters.category || null);
      setHasImage(initialFilters.hasImage);
      setGender(initialFilters.gender || null);
      setHometown(initialFilters.hometown || "");
      setLocation(initialFilters.location || "");
    }
  }, [visible, initialFilters]);

  const handleReset = () => {
    setSortBy("newest");
    setCategory(null);
    setHasImage(null);
    setGender(null);
    setHometown("");
    setLocation("");
  };

  const handleApply = () => {
    onApply({
      sortBy,
      category,
      hasImage,
      gender,
      hometown,
      location,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={T.t2} />
              </Pressable>
              <Text style={styles.headerTitle}>Filters</Text>
            </View>
            <Pressable onPress={handleReset} hitSlop={10}>
              <Text style={styles.resetBtn}>Reset All</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Sort Section */}
            <Section title="Sort By">
              <View style={styles.chipGrid}>
                {[
                  { label: "Newest First", value: "newest" },
                  { label: "Oldest First", value: "oldest" },
                  { label: "Most Liked", value: "top_liked" },
                  { label: "Most Disliked", value: "top_disliked" },
                ].map((s) => (
                  <FilterChip 
                    key={s.value} 
                    label={s.label} 
                    active={sortBy === s.value} 
                    onPress={() => setSortBy(s.value)} 
                  />
                ))}
              </View>
            </Section>

            {/* Category Section */}
            <Section title="Category">
              <View style={styles.chipGrid}>
                {[
                  "General", 
                  "Flatmate / Housing", 
                  "Travelmate", 
                  "Trip", 
                  "Hangouts", 
                  "Help / Questions"
                ].map((cat) => (
                  <FilterChip 
                    key={cat} 
                    label={cat} 
                    active={category === cat} 
                    onPress={() => setCategory(prev => prev === cat ? null : cat)} 
                  />
                ))}
              </View>
            </Section>

            {/* Media Section */}
            <Section title="Media">
              <View style={styles.chipGrid}>
                <FilterChip 
                  label="With Image" 
                  icon="image" 
                  active={hasImage === "true"} 
                  onPress={() => setHasImage(prev => prev === "true" ? null : "true")} 
                />
                <FilterChip 
                  label="Text Only" 
                  icon="notes" 
                  active={hasImage === "false"} 
                  onPress={() => setHasImage(prev => prev === "false" ? null : "false")} 
                />
              </View>
            </Section>

            {/* Author Section */}
            <Section title="Author Attributes">
              <Text style={styles.subTitle}>Gender</Text>
              <View style={[styles.chipGrid, { marginBottom: 16 }]}>
                {["Male", "Female", "Other"].map((g) => (
                  <FilterChip 
                    key={g} 
                    label={g} 
                    active={gender === g} 
                    onPress={() => setGender(prev => prev === g ? null : g)} 
                  />
                ))}
              </View>

              <Text style={styles.subTitle}>Location</Text>
              <View style={styles.inputGroup}>
                <View style={styles.inputBox}>
                  <MaterialIcons name="home" size={16} color={T.t3} />
                  <TextInput
                    style={styles.input}
                    placeholder="Hometown City"
                    placeholderTextColor={T.t3}
                    value={hometown}
                    onChangeText={setHometown}
                  />
                </View>
                <View style={styles.inputBox}>
                  <MaterialIcons name="location-on" size={16} color={T.t3} />
                  <TextInput
                    style={styles.input}
                    placeholder="Current City"
                    placeholderTextColor={T.t3}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>
            </Section>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  outer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "85%",
    borderWidth: 1,
    borderColor: T.b3,
    borderBottomWidth: 0,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.hdl,
    alignSelf: "center",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: T.b1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: T.t1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.bg2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.b2,
  },
  resetBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: T.red,
  },
  body: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: T.t2,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: T.t3,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.b2,
  },
  chipActive: {
    backgroundColor: T.bluBg,
    borderColor: T.blu,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: T.t2,
  },
  chipTextActive: {
    color: T.t1,
    fontWeight: "600",
  },
  inputGroup: {
    gap: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: T.bg2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: T.b2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: T.t1,
    padding: 0,
  },
  footer: {
    padding: 20,
    borderTopWidth: 0.5,
    borderTopColor: T.b1,
    backgroundColor: T.bg1,
  },
  applyBtn: {
    backgroundColor: T.blu,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.blu,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
