import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenShell } from "./TabShared";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#004ac6",
  primaryContainer: "#2563eb",
  onPrimary: "#ffffff",
  surface: "#f7f9fb",
  onSurface: "#191c1e",
  onSurfaceVariant: "#434655",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainerLowest: "#ffffff",
  secondaryFixed: "#ffdbca",
  onSecondaryFixed: "#341100",
  outline: "#737686",
  outlineVariant: "#c3c6d7",
  error: "#ba1a1a",
};

export default function PostTab({ navigation }) {
  const [mode, setMode] = useState("Post"); // Post or Meetup
  const [category, setCategory] = useState("Food");

  const categories = [
    { name: "Food", icon: "restaurant" },
    { name: "Sports", icon: "fitness-center" },
    { name: "Travel", icon: "flight" },
    { name: "Arts", icon: "palette" },
  ];

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Post"
      title={null} // We are using a custom hero
      subtitle={null}
      noPadding
      absoluteHeader
    >
      <View style={styles.container}>
        {/* Immersive Hero Background */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLVLMPF_BQtkvxYa_Mbl2DyLbAP47Cqar_uTodGLxseKVWXeR-KAoMhlybtbiu6jadQjiRXvXhkqDX4pak6fC8STEEyojU13DmwIwWBgbfSXZsHnRWh481z7jYdczC12AR-_ycQg5TLPA1nXnVmL142qsZzE__GfK9ThEHCQBCGeRSKcoo-FLV4NksXDU-vtFBNsmIDuTIHtzGMjL79CQ9EYXVH2Ulcc9C0oK7Wy449riNkGz5urGb1dIYJ6OvGO9k42g9xinGpP8",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.2)", "transparent", COLORS.surface]}
            style={styles.heroGradient}
          />
        </View>

        {/* Floating Creation Card */}
        <View style={styles.card}>
          {/* Segmented Control */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setMode("Post")}
              style={[
                styles.segmentButton,
                mode === "Post" && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "Post" && styles.segmentTextActive,
                ]}
              >
                Post
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("Meetup")}
              style={[
                styles.segmentButton,
                mode === "Meetup" && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "Meetup" && styles.segmentTextActive,
                ]}
              >
                Meetup
              </Text>
            </Pressable>
          </View>

          {/* Form Content */}
          <View style={styles.form}>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CHOOSE CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {categories.map((cat) => (
                  <Pressable
                    key={cat.name}
                    onPress={() => setCategory(cat.name)}
                    style={[
                      styles.chip,
                      category === cat.name
                        ? styles.chipActive
                        : styles.chipInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={cat.icon}
                      size={18}
                      color={
                        category === cat.name
                          ? COLORS.onSecondaryFixed
                          : COLORS.onSurfaceVariant
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        category === cat.name
                          ? styles.chipTextActive
                          : styles.chipTextInactive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WHAT'S THE YAARI?</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="Travel partner to Jaipur"
                placeholderTextColor={COLORS.outline}
              />
            </View>

            {/* Description Textarea */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DETAILS</Text>
              <TextInput
                style={[styles.textArea, { height: 120 }]}
                placeholder="Share details about your yaari..."
                placeholderTextColor={COLORS.outline}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Media Upload Zone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ADD IMAGE (optional)</Text>
              <Pressable style={styles.uploadZone}>
                <View style={styles.uploadIconCircle}>
                  <MaterialIcons name="add-a-photo" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.uploadMainText}>Drop your image here</Text>
                <Text style={styles.uploadSubText}>
                  High quality JPEGs or PNGs (max 10MB)
                </Text>
              </Pressable>
            </View>

            {/* Submission Button */}
            <Pressable style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Share Yaari</Text>
            </Pressable>

            {/* Bottom Spacer */}
            <View style={{ height: 40 }} />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  heroContainer: {
    width: "100%",
    height: 340,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    marginTop: -80,
    marginHorizontal: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surfaceContainerLowest,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
    paddingLeft: 4,
  },
  mainInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    fontWeight: "450",
    color: COLORS.onSurface,
  },
  textArea: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: COLORS.onSurface,
    minHeight: 120,
  },
  chipScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: COLORS.secondaryFixed,
    borderColor: "rgba(253, 118, 26, 0.2)",
  },
  chipInactive: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: "transparent",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.onSecondaryFixed,
  },
  chipTextInactive: {
    color: COLORS.onSurfaceVariant,
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 4,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  dateScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  dateCard: {
    minWidth: 64,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  dateCardInactive: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  dateDayText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dateDayActive: {
    color: COLORS.onPrimary,
    opacity: 0.8,
  },
  dateDayInactive: {
    color: COLORS.onSurfaceVariant,
  },
  dateNumText: {
    fontSize: 20,
    fontWeight: "800",
  },
  dateNumActive: {
    color: COLORS.onPrimary,
  },
  dateNumInactive: {
    color: COLORS.onSurfaceVariant,
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 74, 198, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },
  uploadSubText: {
    fontSize: 10,
    color: COLORS.outline,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
});
