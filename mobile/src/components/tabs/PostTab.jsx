import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";
import { useSnackbar } from "../../store/SnackbarContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenShell } from "./TabShared";
import { createMeetupWithImage } from "../../services/meetups/meetupService";

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  primary: "#004ac6",
  primaryContainer: "#2b66cd",
  onPrimary: "#ffffff",
  surface: "#f5f2ed",
  onSurface: "#0a0a0a",
  onSurfaceVariant: "#888888",
  surfaceContainerLow: "#ede9e2",
  surfaceContainerLowest: "#ffffff",
  secondaryFixed: "#fff8e6",
  onSecondaryFixed: "#8f6207",
  outline: "#a6a6a6",
  outlineVariant: "#e0dbd4",
  error: "#ba1a1a",
};

export default function PostTab({ navigation }) {
  
  const { token, user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [mode, setMode] = useState("Post"); // Post or Meetup
  const [category, setCategory] = useState("General");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [showProfileGuard, setShowProfileGuard] = useState(false);

  const [meetupTitle, setMeetupTitle] = useState("");
  const [meetupDetails, setMeetupDetails] = useState("");
  const [meetupMaxMembers, setMeetupMaxMembers] = useState("");
  const [meetupHometown, setMeetupHometown] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupVenue, setMeetupVenue] = useState("");
  const [meetupDate, setMeetupDate] = useState(new Date());
  const [meetupTime, setMeetupTime] = useState(new Date());
  const [meetupImage, setMeetupImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [meetupSuccess, setMeetupSuccess] = useState(false);
  
  const successAnim = useMemo(() => new Animated.Value(0), []);
  const errorAnim = useMemo(() => new Animated.Value(0), []);
  const profileGuardAnim = useMemo(() => new Animated.Value(0), []);

  const categories = [
    { name: "General", icon: "grid-view" },
    { name: "Flatmate / Housing", icon: "home" },
    { name: "Travelmate", icon: "groups" },
    { name: "Trip", icon: "map" },
    { name: "Hangouts", icon: "celebration" },
    { name: "Help / Questions", icon: "help-outline" },
  ];

  const API_BASE_URL = "http://192.168.31.65:5000/api";

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showSnackbar("Please allow access to your photos.", "info");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        showErrorMsg("Image too large. Please select an image smaller than 2MB.");
        return;
      }
      setImage(asset);
    }
  };

  const showErrorMsg = (msg) => {
    setErrorMsg(msg);
    setShowError(true);
    showSnackbar(msg, "error");
    Animated.spring(errorAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  const closeError = () => {
    Animated.timing(errorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowError(false));
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleShareYaari = async () => {
    if (!title.trim() || !details.trim()) {
      showSnackbar("Please provide both a title and details.", "info");
      return;
    }

    // Profile Completion Guard
    const isProfileComplete = user?.hometownCountry && user?.country && user?.organization && user?.bio;
    if (!isProfileComplete) {
      setShowProfileGuard(true);
      Animated.spring(profileGuardAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
      return;
    }

    if (mode === "Meetup") {
      handleCreateMeetup();
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title);
      formData.append("details", details);

      if (image) {
        const uri = image.uri;
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("postImage", {
          uri,
          name: filename,
          type,
        });
      }

      await axios.post(`${API_BASE_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Show animated success
      setShowSuccess(true);
      showSnackbar("Post shared successfully.", "success");
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();

      // Reset form
      setTitle("");
      setDetails("");
      setImage(null);
      setCategory("General");

    } catch (error) {
      console.error(error);
      showErrorMsg(error.response?.data?.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccess = () => {
    Animated.timing(successAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSuccess(false));
  };

  const closeProfileGuard = () => {
    Animated.timing(profileGuardAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowProfileGuard(false));
  };

  const pickMeetupImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showSnackbar("Please allow access to your photos.", "info");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        showErrorMsg("Image too large. Please select an image smaller than 2MB.");
        return;
      }
      setMeetupImage(asset);
    }
  };

  const handleCreateMeetup = async () => {
    if (!meetupTitle.trim() || !meetupDetails.trim()) {
      showSnackbar("Please provide a title and description.", "info");
      return;
    }
    if (!meetupMaxMembers || Number(meetupMaxMembers) < 2) {
      showSnackbar("Max members must be at least 2.", "info");
      return;
    }
    if (!meetupVenue.trim() || !meetupLocation.trim()) {
      showSnackbar("Please provide venue and location.", "info");
      return;
    }

    const isProfileComplete = user?.hometownCountry && user?.country && user?.organization && user?.bio;
    if (!isProfileComplete) {
      setShowProfileGuard(true);
      Animated.spring(profileGuardAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", meetupTitle.trim());
      formData.append("details", meetupDetails.trim());
      formData.append("maxMembers", String(Number(meetupMaxMembers)));
      formData.append("hometown", meetupHometown.trim());
      formData.append("meetupLocation", meetupLocation.trim());
      formData.append("venue", meetupVenue.trim());
      formData.append("date", meetupDate.toISOString());
      const hours = meetupTime.getHours().toString().padStart(2, "0");
      const mins = meetupTime.getMinutes().toString().padStart(2, "0");
      formData.append("time", `${hours}:${mins}`);

      if (meetupImage) {
        const uri = meetupImage.uri;
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("meetupImage", { uri, name: filename, type });
      }

      const res = await createMeetupWithImage(formData);
      if (!res.success) {
        showErrorMsg(res.message || "Failed to create meetup.");
        return;
      }

      setMeetupSuccess(true);
      showSnackbar("Meetup created successfully!", "success");
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();

      setMeetupTitle("");
      setMeetupDetails("");
      setMeetupMaxMembers("");
      setMeetupHometown("");
      setMeetupLocation("");
      setMeetupVenue("");
      setMeetupDate(new Date());
      setMeetupTime(new Date());
      setMeetupImage(null);
    } catch (error) {
      showErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMeetupSuccess = () => {
    Animated.timing(successAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMeetupSuccess(false));
  };

  const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Post"
      title={null} // We are using a custom hero
      subtitle={null}
      noPadding
      absoluteHeader
      noPaddingBottom
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
            {mode === "Meetup" ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>MEETUP TITLE</Text>
                  <TextInput
                    style={styles.mainInput}
                    placeholder="Ex. - Weekend Hiking Trip"
                    placeholderTextColor={COLORS.outline}
                    value={meetupTitle}
                    onChangeText={setMeetupTitle}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 20 }]}>
                  <Text style={styles.label}>DESCRIPTION</Text>
                  <TextInput
                    style={[styles.textArea, { height: 100 }]}
                    placeholder="What's this meetup about?"
                    placeholderTextColor={COLORS.outline}
                    multiline
                    textAlignVertical="top"
                    value={meetupDetails}
                    onChangeText={setMeetupDetails}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>MAX MEMBERS</Text>
                  <TextInput
                    style={styles.mainInput}
                    placeholder="e.g. 10"
                    placeholderTextColor={COLORS.outline}
                    keyboardType="number-pad"
                    value={meetupMaxMembers}
                    onChangeText={setMeetupMaxMembers}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>HOMETOWN</Text>
                  <TextInput
                    style={styles.mainInput}
                    placeholder="Target hometown (e.g. Patna, Lucknow)"
                    placeholderTextColor={COLORS.outline}
                    value={meetupHometown}
                    onChangeText={setMeetupHometown}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>MEETUP LOCATION</Text>
                  <TextInput
                    style={styles.mainInput}
                    placeholder="City, State, Country"
                    placeholderTextColor={COLORS.outline}
                    value={meetupLocation}
                    onChangeText={setMeetupLocation}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>VENUE</Text>
                  <TextInput
                    style={styles.mainInput}
                    placeholder="Venue name"
                    placeholderTextColor={COLORS.outline}
                    value={meetupVenue}
                    onChangeText={setMeetupVenue}
                  />
                </View>

                <View style={styles.meetupRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>DATE</Text>
                    <Pressable style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                      <MaterialIcons name="event" size={18} color={COLORS.primary} />
                      <Text style={styles.pickerBtnText}>{formatDate(meetupDate)}</Text>
                    </Pressable>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>TIME</Text>
                    <Pressable style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                      <MaterialIcons name="schedule" size={18} color={COLORS.primary} />
                      <Text style={styles.pickerBtnText}>{formatTime(meetupTime)}</Text>
                    </Pressable>
                  </View>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={meetupDate}
                    mode="date"
                    minimumDate={new Date()}
                    onChange={(e, d) => { setShowDatePicker(Platform.OS === "ios"); if (d) setMeetupDate(d); }}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={meetupTime}
                    mode="time"
                    onChange={(e, d) => { setShowTimePicker(Platform.OS === "ios"); if (d) setMeetupTime(d); }}
                  />
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ADD IMAGE (OPTIONAL)</Text>
                  <Pressable
                    style={[styles.uploadZone, meetupImage && { paddingVertical: 0, borderStyle: "solid", overflow: "hidden" }]}
                    onPress={pickMeetupImage}
                  >
                    {meetupImage ? (
                      <>
                        <Image source={{ uri: meetupImage.uri }} style={styles.previewImage} resizeMode="cover" />
                        <Pressable style={styles.removeImageIcon} onPress={() => setMeetupImage(null)}>
                          <MaterialIcons name="close" size={20} color={COLORS.onPrimary} />
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <View style={styles.uploadIconCircle}>
                          <MaterialIcons name="add-a-photo" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.uploadMainText}>Add a cover image</Text>
                        <Text style={styles.uploadSubText}>JPG or PNG (max 2MB)</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleCreateMeetup}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.onPrimary} />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Meetup</Text>
                  )}
                </Pressable>

                <View style={{ height: 120 }} />
              </>
            ) : (
              <>
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
                  <Text style={styles.label}>WHAT'S THE YAARI ABOUT?</Text>
                  <TextInput
                    style={styles.mainInput}
                    placeholder="Ex. - Looking for Travel partner to Jaipur"
                    placeholderTextColor={COLORS.outline}
                    value={title}
                    onChangeText={setTitle}
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
                    value={details}
                    onChangeText={setDetails}
                  />
                </View>

                {/* Media Upload Zone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ADD IMAGE (optional)</Text>
                  <Pressable
                    style={[
                      styles.uploadZone,
                      image && { paddingVertical: 0, borderStyle: "solid", overflow: "hidden" }
                    ]}
                    onPress={pickImage}
                  >
                    {image ? (
                      <>
                        <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
                        <Pressable style={styles.removeImageIcon} onPress={removeImage}>
                          <MaterialIcons name="close" size={20} color={COLORS.onPrimary} />
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <View style={styles.uploadIconCircle}>
                          <MaterialIcons name="add-a-photo" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.uploadMainText}>Drop your image here</Text>
                        <Text style={styles.uploadSubText}>
                          High quality JPEGs or PNGs (max 2MB)
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>

                {/* Submission Button */}
                <Pressable
                  style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleShareYaari}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.onPrimary} />
                  ) : (
                    <Text style={styles.submitButtonText}>Share Yaari</Text>
                  )}
                </Pressable>

                {/* Bottom Spacer to ensure button visibility above bottom bar */}
                <View style={{ height: 120 }} />
              </>
            )}
          </View>
        </View>
      </View>

      {/* Modern Success Modal */}
      <Modal visible={showSuccess} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successCard,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#ecfdf5", "#ffffff"]}
              style={styles.successGradient}
            >
              <View style={styles.successIconOuter}>
                <MaterialIcons name="auto-awesome" size={32} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Yaari Shared!</Text>
              <Text style={styles.successSub}>
                Your spark is now live and waiting for someone to connect.
              </Text>
              <Pressable style={styles.successBtn} onPress={closeSuccess}>
                <Text style={styles.successBtnText}>Great!</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Modern Error Modal */}
      <Modal visible={showError} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.errorCard,
              {
                opacity: errorAnim,
                transform: [
                  {
                    scale: errorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#fef2f2", "#ffffff"]}
              style={styles.successGradient}
            >
              <View style={styles.errorIconOuter}>
                <MaterialIcons name="error-outline" size={32} color="#ef4444" />
              </View>
              <Text style={styles.errorTitle}>Oops!</Text>
              <Text style={styles.errorSub}>{errorMsg}</Text>
              <Pressable 
                style={[styles.successBtn, { backgroundColor: "#ef4444" }]} 
                onPress={closeError}
              >
                <Text style={styles.successBtnText}>Got it</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Profile Completion Guard Modal */}
      <Modal visible={showProfileGuard} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.guardCard,
              {
                opacity: profileGuardAnim,
                transform: [
                  {
                    scale: profileGuardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#fefce8", "#ffffff"]}
              style={styles.successGradient}
            >
              <View style={styles.guardIconOuter}>
                <MaterialIcons name="security" size={32} color="#ca8a04" />
              </View>
              <Text style={styles.successTitle}>Profile Incomplete</Text>
              <Text style={styles.successSub}>
                Looks like you haven't completed your profile. Please fill in your details (Bio, Hometown, etc.) before posting a Yaari.
              </Text>
              <View style={styles.guardBtnRow}>
                <Pressable 
                  style={[styles.guardBtn, { backgroundColor: "#f3f4f6" }]} 
                  onPress={closeProfileGuard}
                >
                  <Text style={[styles.guardBtnText, { color: "#4b5563" }]}>Not Now</Text>
                </Pressable>
                <Pressable 
                  style={[styles.guardBtn, { backgroundColor: COLORS.primary }]} 
                  onPress={() => {
                    closeProfileGuard();
                    navigation.navigate("Account");
                  }}
                >
                  <Text style={styles.guardBtnText}>Complete Now</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Meetup Success Modal */}
      <Modal visible={meetupSuccess} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successCard,
              {
                opacity: successAnim,
                transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
              },
            ]}
          >
            <LinearGradient colors={["#ecfdf5", "#ffffff"]} style={styles.successGradient}>
              <View style={styles.successIconOuter}>
                <MaterialIcons name="celebration" size={32} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Meetup Created!</Text>
              <Text style={styles.successSub}>
                Your meetup is live! Others can now discover and join it.
              </Text>
              <Pressable style={styles.successBtn} onPress={closeMeetupSuccess}>
                <Text style={styles.successBtnText}>Awesome!</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
    marginBottom: 0,
    minHeight: SCREEN_HEIGHT - 260, // Adjust minHeight to reach bottom bar accurately
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f8f6f2",
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
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
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1.1,
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
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.onSurface,
    letterSpacing: 1.4,
    paddingLeft: 4,
    marginBottom: 4,
  },
  mainInput: {
    backgroundColor: "#f8f6f2",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
  },
  textArea: {
    backgroundColor: "#f8f6f2",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.onSurface,
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
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
    borderColor: "#f0da9e",
  },
  chipInactive: {
    backgroundColor: "#f8f6f2",
    borderColor: COLORS.outlineVariant,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
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
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#c9d8ff",
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f6ff",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e9efff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadMainText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.onSurface,
  },
  uploadSubText: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 4,
    fontWeight: "600",
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
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  successGradient: {
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.onSurface,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  successSub: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  successBtn: {
    marginTop: 8,
    backgroundColor: COLORS.onSurface,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    width: "100%",
    alignItems: "center",
  },
  successBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  errorCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.1)",
  },
  errorIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#b91c1c",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  errorSub: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  removeImageIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  guardCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(202, 138, 4, 0.1)",
  },
  guardIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(202, 138, 4, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  guardBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  guardBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  guardBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  meetupRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8f6f2",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
  },
});
