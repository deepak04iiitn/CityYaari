import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { GetCity, GetCountries, GetState } from "react-country-state-city";
import { useAuth } from "../../store/AuthContext";
import { ScreenShell } from "./TabShared";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  // Neutrals
  void: "#080C14",
  ink: "#0E1726",
  inkMid: "#1E2D47",
  soft: "#5A6E8C",
  mute: "#8FA4BF",
  line: "#E2EAF4",
  lineLight: "#EEF4FB",
  bg: "#F5F8FD",
  surface: "#FFFFFF",

  // Brand Blue
  blue: "#1D4ED8",
  blueMid: "#2563EB",
  blueLight: "#3B82F6",
  bluePale: "#DBEAFE",
  blueGhost: "#EFF6FF",

  // Accent Amber/Orange (warmth / "Yaari")
  amber: "#F59E0B",
  amberDeep: "#D97706",
  amberPale: "#FEF3C7",

  // Accent Coral
  coral: "#F43F5E",
  coralPale: "#FFF1F2",

  // Utility
  white: "#FFFFFF",
  success: "#10B981",
  successPale: "#D1FAE5",

  // Gradients
  heroGrad: ["#0F1E3D", "#1D3461", "#163F7A"],
  sheetBg: "#FFFFFF",
};

const OTHER = { id: -1, name: "Other", isOther: true };

// ─── Tiny helpers ──────────────────────────────────────────────────────────
function useFade(trigger) {
  const anim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: trigger ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [trigger]);
  return anim;
}

// ─── Info Row ─────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[st.infoRow, !last && st.infoRowBorder]}>
      <View style={st.infoIcon}>
        <MaterialIcons name={icon} size={15} color={T.blueMid} />
      </View>
      <View style={st.infoBody}>
        <Text style={st.infoLabel}>{label}</Text>
        <Text style={st.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────
function Field({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={st.fieldWrap}>
      <Text style={st.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={T.mute}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[st.fieldInput, focused && st.fieldInputFocused]}
      />
    </View>
  );
}

// ─── SelectField ─────────────────────────────────────────────────────────
function SelectField({ label, value, placeholder, onPress, disabled }) {
  return (
    <View style={st.fieldWrap}>
      <Text style={st.fieldLabel}>{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          st.fieldInput,
          st.fieldSelect,
          disabled && st.fieldDisabled,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={[st.fieldSelectText, !value && { color: T.mute }]}>
          {value || placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={20} color={T.mute} />
      </Pressable>
    </View>
  );
}

// ─── Bottom Sheet ────────────────────────────────────────────────────────
function Sheet({ visible, title, subtitle, onClose, children }) {
  const fade = useFade(visible);
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
          {/* Handle */}
          <View style={st.sheetHandle} />
          {/* Header */}
          <View style={st.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.sheetTitle}>{title}</Text>
              {subtitle ? (
                <Text style={st.sheetSub}>{subtitle}</Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <MaterialIcons name="close" size={16} color={T.soft} />
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Picker Modal ────────────────────────────────────────────────────────
function Picker({ visible, title, options, onClose, onSelect }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={st.pickerOverlay}>
        <View style={st.pickerBox}>
          <View style={st.sheetHeader}>
            <Text style={st.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <MaterialIcons name="close" size={16} color={T.soft} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((item, i) => (
              <Pressable
                key={`${item.id}-${i}`}
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  st.pickRow,
                  pressed && { backgroundColor: T.blueGhost },
                ]}
              >
                {item.isOther ? (
                  <View style={st.otherBadge}>
                    <Text style={st.otherBadgeText}>Other</Text>
                  </View>
                ) : (
                  <Text style={st.pickText}>{item.name}</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────
function StatChip({ icon, label, color = T.bluePale, iconColor = T.blueMid }) {
  return (
    <View style={[st.statChip, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={14} color={iconColor} />
      <Text style={[st.statChipText, { color: iconColor }]}>{label}</Text>
    </View>
  );
}

// ─── Action Row ───────────────────────────────────────────────────────────
function ActionRow({ icon, label, sublabel, onPress, danger, last }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        st.actionRow,
        !last && st.actionRowBorder,
        pressed && { backgroundColor: danger ? T.coralPale : T.blueGhost },
      ]}
    >
      <View style={[st.actionIcon, danger && st.actionIconDanger]}>
        <MaterialIcons
          name={icon}
          size={17}
          color={danger ? T.coral : T.blueMid}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.actionLabel, danger && { color: T.coral }]}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={st.actionSublabel}>{sublabel}</Text>
        ) : null}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={18}
        color={danger ? T.coral : T.mute}
      />
    </Pressable>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────
function SectionCard({ title, badge, children, style }) {
  return (
    <View style={[st.sectionCard, style]}>
      <View style={st.sectionHead}>
        <Text style={st.sectionTitle}>{title}</Text>
        {badge ? <View style={st.sectionBadge}><Text style={st.sectionBadgeText}>{badge}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AccountTab({ navigation }) {
  const { user, logout, updateProfile, updateProfileImage, deleteAccount } =
    useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState("edit"); // "edit" or "complete"
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState("country");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryId, setCountryId] = useState(null);
  const [stateId, setStateId] = useState(null);
  const [countryOther, setCountryOther] = useState(false);
  const [stateOther, setStateOther] = useState(false);
  const [cityOther, setCityOther] = useState(false);

  const [hStates, setHStates] = useState([]);
  const [hCities, setHCities] = useState([]);
  const [hCountryId, setHCountryId] = useState(null);
  const [hStateId, setHStateId] = useState(null);
  const [hCountryOther, setHCountryOther] = useState(false);
  const [hStateOther, setHStateOther] = useState(false);
  const [hCityOther, setHCityOther] = useState(false);

  const [busy, setBusy] = useState("");
  const [edit, setEdit] = useState({
    fullName: "",
    email: "",
    occupationType: "student",
    gender: "Other",
    hometownCountry: "",
    hometownState: "",
    hometownCity: "",
    organization: "",
    studyOrPost: "",
    country: "",
    state: "",
    city: "",
  });
  const [deletePwd, setDeletePwd] = useState("");
  const [deletePasswordVisible, setDeletePasswordVisible] = useState(false);

  useEffect(() => {
    GetCountries()
      .then((d) => setCountries(Array.isArray(d) ? d : []))
      .catch(() => setCountries([]));
  }, []);

  const initials = useMemo(
    () =>
      (user?.fullName || user?.username || "CY")
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [user]
  );

  const pickerOptions =
    pickerType === "country" || pickerType === "hcountry"
      ? [...countries, OTHER]
      : pickerType === "state"
      ? countryOther || !countryId
        ? [OTHER]
        : [...states, OTHER]
      : pickerType === "city"
      ? stateOther || countryOther || !stateId
        ? [OTHER]
        : [...cities, OTHER]
      : pickerType === "hstate"
      ? hCountryOther || !hCountryId
        ? [OTHER]
        : [...hStates, OTHER]
      : hStateOther || hCountryOther || !hStateId
      ? [OTHER]
      : [...hCities, OTHER];

  const openEdit = async (mode = "edit") => {
    setSheetMode(mode);
    setEdit({
      fullName: user?.fullName || "",
      email: user?.email || "",
      occupationType: user?.occupationType || "student",
      gender: user?.gender || "Other",
      hometownCountry: user?.hometownCountry || "",
      hometownState: user?.hometownState || "",
      hometownCity: user?.hometownCity || "",
      organization: user?.organization || "",
      studyOrPost: user?.studyOrPost || "",
      country: user?.country || "",
      state: user?.state || "",
      city: user?.city || "",
    });
    setCountryId(null);
    setStateId(null);
    setCountryOther(false);
    setStateOther(false);
    setCityOther(false);
    
    setHCountryId(null);
    setHStateId(null);
    setHCountryOther(false);
    setHStateOther(false);
    setHCityOther(false);

    const matchedCountry = countries.find((c) => c.name === user?.country);
    if (matchedCountry?.id) {
      setCountryId(matchedCountry.id);
      try {
        const ns = await GetState(matchedCountry.id);
        setStates(Array.isArray(ns) ? ns : []);
        const matchedState = ns?.find((s) => s.name === user?.state);
        if (matchedState?.id) {
          setStateId(matchedState.id);
          const nc = await GetCity(matchedCountry.id, matchedState.id);
          setCities(Array.isArray(nc) ? nc : []);
        }
      } catch {
        setStates([]);
        setCities([]);
      }
    } else if (user?.country) {
      setCountryOther(true);
      if (user?.state) setStateOther(true);
      if (user?.city) setCityOther(true);
    }

    const matchedHCountry = countries.find((c) => c.name === user?.hometownCountry);
    if (matchedHCountry?.id) {
      setHCountryId(matchedHCountry.id);
      try {
        const hns = await GetState(matchedHCountry.id);
        setHStates(Array.isArray(hns) ? hns : []);
        const matchedHState = hns?.find((s) => s.name === user?.hometownState);
        if (matchedHState?.id) {
          setHStateId(matchedHState.id);
          const hnc = await GetCity(matchedHCountry.id, matchedHState.id);
          setHCities(Array.isArray(hnc) ? hnc : []);
        }
      } catch {
        setHStates([]);
        setHCities([]);
      }
    } else if (user?.hometownCountry) {
      setHCountryOther(true);
      if (user?.hometownState) setHStateOther(true);
      if (user?.hometownCity) setHCityOther(true);
    }

    setEditOpen(true);
  };

  const pickPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert(
        "Permission required",
        "Allow photo access to update your profile picture."
      );
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const res = await updateProfileImage(result.assets[0]);
    if (!res.success) Alert.alert("Update failed", res.message);
  };

  const openPicker = async (type) => {
    setPickerType(type);
    setPickerOpen(true);
    if (type === "state" && countryId && !countryOther)
      setStates(await GetState(countryId));
    if (type === "city" && countryId && stateId && !countryOther && !stateOther)
      setCities(await GetCity(countryId, stateId));
    if (type === "hstate" && hCountryId && !hCountryOther)
      setHStates(await GetState(hCountryId));
    if (type === "hcity" && hCountryId && hStateId && !hCountryOther && !hStateOther)
      setHCities(await GetCity(hCountryId, hStateId));
  };

  const onPick = (item) => {
    setPickerOpen(false);
    if (pickerType === "country") {
      setCountryId(item.isOther ? null : item.id);
      setStateId(null);
      setCountryOther(!!item.isOther);
      setStateOther(false);
      setCityOther(false);
      setStates([]);
      setCities([]);
      setEdit((p) => ({ ...p, country: item.isOther ? "" : item.name, state: "", city: "" }));
      return;
    }
    if (pickerType === "state") {
      setStateId(item.isOther ? null : item.id);
      setStateOther(!!item.isOther);
      setCityOther(false);
      setCities([]);
      setEdit((p) => ({ ...p, state: item.isOther ? "" : item.name, city: "" }));
      return;
    }
    if (pickerType === "city") {
      setCityOther(!!item.isOther);
      setEdit((p) => ({ ...p, city: item.isOther ? "" : item.name }));
      return;
    }
    if (pickerType === "hcountry") {
      setHCountryId(item.isOther ? null : item.id);
      setHStateId(null);
      setHCountryOther(!!item.isOther);
      setHStateOther(false);
      setHCityOther(false);
      setHStates([]);
      setHCities([]);
      setEdit((p) => ({ ...p, hometownCountry: item.isOther ? "" : item.name, hometownState: "", hometownCity: "" }));
      return;
    }
    if (pickerType === "hstate") {
      setHStateId(item.isOther ? null : item.id);
      setHStateOther(!!item.isOther);
      setHCityOther(false);
      setHCities([]);
      setEdit((p) => ({ ...p, hometownState: item.isOther ? "" : item.name, hometownCity: "" }));
      return;
    }
    if (pickerType === "hcity") {
      setHCityOther(!!item.isOther);
      setEdit((p) => ({ ...p, hometownCity: item.isOther ? "" : item.name }));
      return;
    }
  };

  const saveProfile = async () => {
    if (
      !edit.fullName.trim() ||
      !edit.email.trim() ||
      !edit.gender
    )
      return Alert.alert("Missing fields", "Please complete Full Name, Email, and Gender.");
      
    setBusy("profile");
    const res = await updateProfile({
      fullName: edit.fullName.trim(),
      email: edit.email.trim(),
      occupationType: edit.occupationType,
      gender: edit.gender,
      hometownCountry: edit.hometownCountry.trim(),
      hometownState: edit.hometownState.trim(),
      hometownCity: edit.hometownCity.trim(),
      organization: edit.organization.trim(),
      studyOrPost: edit.studyOrPost.trim(),
      country: edit.country.trim(),
      state: edit.state.trim(),
      city: edit.city.trim(),
    });
    setBusy("");
    if (!res.success) return Alert.alert("Update failed", res.message);
    setEditOpen(false);
  };

  const removeAccount = async () => {
    if (!deletePwd)
      return Alert.alert("Password required", "Enter your password to continue.");
    setBusy("delete");
    const res = await deleteAccount(deletePwd);
    setBusy("");
    if (!res.success) return Alert.alert("Delete failed", res.message);
    setDeleteOpen(false);
    setDeletePwd("");
    setDeletePasswordVisible(false);
    Alert.alert(
      "Account scheduled for deletion",
      res.permanentDeletionAt
        ? `Permanent deletion on ${new Date(res.permanentDeletionAt).toLocaleString()}.`
        : "Your account is scheduled for deletion."
    );
  };

  const occupationLabel =
    user?.occupationType === "working_professional"
      ? "Working Professional"
      : "Student";

  const isProfileComplete = user?.hometownCountry && user?.country && user?.organization;
  const hometownStr = [user?.hometownCity, user?.hometownState, user?.hometownCountry].filter(Boolean).join(", ") || "Not set";
  const locationStr = [user?.city, user?.state, user?.country].filter(Boolean).join(", ") || "Not set";

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Account"
      title="Profile"
      subtitle="Manage your CityYaari identity"
    >
      {/* ── Hero Card ──────────────────────────────────────────────────── */}
      <View style={st.heroCard}>
        <LinearGradient
          colors={T.heroGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.heroGrad}
        >
          {/* Decorative circles */}
          <View style={[st.decoCircle, st.decoCircle1]} />
          <View style={[st.decoCircle, st.decoCircle2]} />

          {/* Top row: edit button */}
          <View style={st.heroTopRow}>
            <View style={st.verifiedBadge}>
              <MaterialIcons name="verified" size={13} color={T.amber} />
              <Text style={st.verifiedText}>Member</Text>
            </View>
            <Pressable onPress={() => openEdit(isProfileComplete ? "edit" : "complete")} style={st.heroEditBtn}>
              <MaterialIcons name={isProfileComplete ? "edit" : "check-circle"} size={14} color={T.white} />
              <Text style={st.heroEditText}>{isProfileComplete ? "Edit" : "Complete Profile"}</Text>
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={st.avatarContainer}>
            <Pressable onPress={pickPhoto} style={st.avatarOuter}>
              <View style={st.avatarRing}>
                {user?.profileImageUri ? (
                  <Image
                    source={{ uri: user.profileImageUri }}
                    style={st.avatarImg}
                  />
                ) : (
                  <LinearGradient
                    colors={["#2563EB", "#1D4ED8"]}
                    style={st.avatarFallback}
                  >
                    <Text style={st.avatarInitials}>{initials}</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={st.cameraBtn}>
                <MaterialIcons name="photo-camera" size={12} color={T.white} />
              </View>
            </Pressable>
          </View>

          {/* Name + handle */}
          <Text style={st.heroName}>
            {user?.fullName || "CityYaari Member"}
          </Text>
          <Text style={st.heroHandle}>
            @{user?.username || "cityyaari"}
          </Text>

          {/* Chips */}
          <View style={st.chipRow}>
            <StatChip
              icon={
                user?.occupationType === "working_professional"
                  ? "work"
                  : "school"
              }
              label={occupationLabel}
              color="rgba(255,255,255,0.13)"
              iconColor={T.amberPale}
            />
            <StatChip
              icon="location-on"
              label={[user?.city, user?.state].filter(Boolean).join(", ") || "Location"}
              color="rgba(255,255,255,0.10)"
              iconColor="#A5C8FF"
            />
          </View>
        </LinearGradient>
      </View>

      {/* ── Account Details ───────────────────────────────────────────────── */}
      <SectionCard title="Account Details" badge="Personal">
        <InfoRow icon="person" label="Full Name" value={user?.fullName} />
        <InfoRow icon="alternate-email" label="Username" value={user?.username ? `@${user.username}` : null} />
        <InfoRow icon="mail-outline" label="Email" value={user?.email} />
        <InfoRow icon="people-outline" label="Gender" value={user?.gender} />
        <InfoRow icon="business" label={occupationLabel} value={user?.organization ? `${user?.studyOrPost} at ${user?.organization}` : "Not set"} />
        <InfoRow icon="home" label="Hometown" value={hometownStr} />
        <InfoRow icon="location-on" label="Current Location" value={locationStr} last />
      </SectionCard>

      {/* ── Security ─────────────────────────────────────────────────────── */}
      <SectionCard title="Security" badge="Protected">
        <InfoRow
          icon="help-outline"
          label="Security Question"
          value={user?.securityQuestion || "Not configured"}
        />
        <InfoRow
          icon="lock-outline"
          label="Security Answer"
          value={
            user?.hasSecurityAnswer
              ? "••••••••  (hidden for your safety)"
              : "Not configured"
          }
          last
        />
      </SectionCard>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <SectionCard title="Account Actions">
        <ActionRow
          icon="photo-camera"
          label="Update Profile Photo"
          sublabel="JPG or PNG recommended"
          onPress={pickPhoto}
        />
        <ActionRow
          icon="edit"
          label="Edit Profile Details"
          sublabel="Update your existing information"
          onPress={() => openEdit("edit")}
        />
        {!isProfileComplete && (
          <ActionRow
            icon="playlist-add-check"
            label="Complete Profile"
            sublabel="Fill missing fields like Hometown"
            onPress={() => openEdit("complete")}
          />
        )}
        <ActionRow
          icon="logout"
          label="Sign Out"
          sublabel="You can always log back in"
          onPress={() =>
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: logout },
            ])
          }
        />
        <ActionRow
          icon="delete-forever"
          label="Delete Account"
          sublabel="Permanently remove your data"
          onPress={() => setDeleteOpen(true)}
          danger
          last
        />
      </SectionCard>

      {/* ── App Info ──────────────────────────────────────────────────────── */}
      <View style={st.appInfo}>
        <Text style={st.appInfoText}>CityYaari · v1.0.0</Text>
        <Text style={st.appInfoDot}>·</Text>
        <Text style={st.appInfoText}>Privacy Policy</Text>
        <Text style={st.appInfoDot}>·</Text>
        <Text style={st.appInfoText}>Terms</Text>
      </View>

      {/* ── Pickers & Modals ──────────────────────────────────────────────── */}
      <Picker
        visible={pickerOpen}
        title={
          pickerType === "country"
            ? "Select Country"
            : pickerType === "state"
            ? "Select State / Province"
            : "Select City"
        }
        options={pickerOptions}
        onClose={() => setPickerOpen(false)}
        onSelect={onPick}
      />

      {/* Edit Sheet */}
      <Sheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title={sheetMode === "edit" ? "Edit Profile" : "Complete Profile"}
        subtitle={sheetMode === "edit" ? "Updates are visible to your connections." : "Fill in your missing details."}
      >
        {sheetMode === "edit" && (
          <>
            <Field
              label="Full Name"
              value={edit.fullName}
              onChangeText={(v) => setEdit((p) => ({ ...p, fullName: v }))}
              placeholder="Your full name"
            />
            <Field
              label="Email Address"
              value={edit.email}
              onChangeText={(v) => setEdit((p) => ({ ...p, email: v }))}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        {((sheetMode === "complete" && !user?.gender) || (sheetMode === "edit" && user?.gender)) && (
          <View style={st.fieldWrap}>
            <Text style={st.fieldLabel}>Gender</Text>
            <View style={st.toggleRow}>
              {["Male", "Female", "Other"].map((opt) => {
                const active = edit.gender === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setEdit((p) => ({ ...p, gender: opt }))}
                    style={[st.toggleBtn, active && st.toggleBtnActive]}
                  >
                    <Text style={[st.toggleText, active && st.toggleTextActive]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={st.fieldWrap}>
          <Text style={st.fieldLabel}>Occupation Type</Text>
          <View style={st.toggleRow}>
            {["student", "working_professional"].map((opt) => {
              const active = edit.occupationType === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setEdit((p) => ({ ...p, occupationType: opt }))}
                  style={[st.toggleBtn, active && st.toggleBtnActive]}
                >
                  <MaterialIcons name={opt === "student" ? "school" : "work"} size={14} color={active ? T.white : T.soft} />
                  <Text style={[st.toggleText, active && st.toggleTextActive]}>
                    {opt === "student" ? "Student" : "Professional"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {((sheetMode === "complete" && !user?.organization) || (sheetMode === "edit" && user?.organization)) && (
          <Field
            label={edit.occupationType === "student" ? "School / College Name" : "Company / Organization"}
            value={edit.organization}
            onChangeText={(v) => setEdit((p) => ({ ...p, organization: v }))}
            placeholder="Organization"
          />
        )}

        {((sheetMode === "complete" && !user?.studyOrPost) || (sheetMode === "edit" && user?.studyOrPost)) && (
          <Field
            label={edit.occupationType === "student" ? "Course / Studying For" : "Post / Role Name"}
            value={edit.studyOrPost}
            onChangeText={(v) => setEdit((p) => ({ ...p, studyOrPost: v }))}
            placeholder={edit.occupationType === "student" ? "e.g. B.Tech Computer Science" : "e.g. Software Engineer"}
          />
        )}

        {/* Hometown section */}
        {((sheetMode === "complete" && !user?.hometownCountry) || (sheetMode === "edit" && user?.hometownCountry)) && (
          <>
            <Text style={[st.sectionTitle, { marginBottom: 16, marginTop: 8 }]}>Hometown</Text>

            <SelectField
              label="Country"
              value={hCountryOther ? "Other" : edit.hometownCountry}
              placeholder="Select country"
              onPress={() => openPicker("hcountry")}
            />
            {hCountryOther && (
              <Field
                label="Enter Country"
                value={edit.hometownCountry}
                onChangeText={(v) => setEdit((p) => ({ ...p, hometownCountry: v }))}
                placeholder="Country name"
              />
            )}
            <SelectField
              label="State / Province"
              value={hStateOther ? "Other" : edit.hometownState}
              placeholder="Select state"
              onPress={() => openPicker("hstate")}
              disabled={!edit.hometownCountry}
            />
            {hStateOther && (
              <Field
                label="Enter State"
                value={edit.hometownState}
                onChangeText={(v) => setEdit((p) => ({ ...p, hometownState: v }))}
                placeholder="State name"
              />
            )}
            <SelectField
              label="City"
              value={hCityOther ? "Other" : edit.hometownCity}
              placeholder="Select city"
              onPress={() => openPicker("hcity")}
              disabled={!edit.hometownState}
            />
            {hCityOther && (
              <Field
                label="Enter City"
                value={edit.hometownCity}
                onChangeText={(v) => setEdit((p) => ({ ...p, hometownCity: v }))}
                placeholder="City name"
              />
            )}
          </>
        )}

        {/* Current Location section */}
        {((sheetMode === "complete" && !user?.country) || (sheetMode === "edit" && user?.country)) && (
          <>
            <Text style={[st.sectionTitle, { marginBottom: 16, marginTop: 8 }]}>Current Location</Text>

            <SelectField
              label="Country"
              value={countryOther ? "Other" : edit.country}
              placeholder="Select country"
              onPress={() => openPicker("country")}
            />
            {countryOther && (
              <Field
                label="Enter Country"
                value={edit.country}
                onChangeText={(v) => setEdit((p) => ({ ...p, country: v }))}
                placeholder="Country name"
              />
            )}
            <SelectField
              label="State / Province"
              value={stateOther ? "Other" : edit.state}
              placeholder="Select state"
              onPress={() => openPicker("state")}
              disabled={!edit.country}
            />
            {stateOther && (
              <Field
                label="Enter State"
                value={edit.state}
                onChangeText={(v) => setEdit((p) => ({ ...p, state: v }))}
                placeholder="State name"
              />
            )}
            <SelectField
              label="City"
              value={cityOther ? "Other" : edit.city}
              placeholder="Select city"
              onPress={() => openPicker("city")}
              disabled={!edit.state}
            />
            {cityOther && (
              <Field
                label="Enter City"
                value={edit.city}
                onChangeText={(v) => setEdit((p) => ({ ...p, city: v }))}
                placeholder="City name"
              />
            )}
          </>
        )}

        <Pressable
          onPress={saveProfile}
          style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.88 }]}
        >
          <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.primaryBtnGrad}
          >
            <Text style={st.primaryBtnText}>
              {busy === "profile" ? "Saving…" : "Save Changes"}
            </Text>
            <MaterialIcons name="arrow-forward" size={17} color={T.white} />
          </LinearGradient>
        </Pressable>
      </Sheet>

      {/* Delete Sheet */}
      <Sheet
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account"
        subtitle="This is irreversible after the 15-day grace period."
      >
        <View style={st.dangerBox}>
          <MaterialIcons name="warning-amber" size={22} color={T.coral} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={st.dangerBoxTitle}>Proceed with caution</Text>
            <Text style={st.dangerBoxText}>
              You'll lose all your connections, posts, and data permanently
              after the hold period.
            </Text>
          </View>
        </View>

        <View style={st.fieldWrap}>
          <Text style={st.fieldLabel}>Confirm Password</Text>
          <View style={st.pwdRow}>
            <TextInput
              value={deletePwd}
              onChangeText={setDeletePwd}
              placeholder="Enter your password"
              placeholderTextColor={T.mute}
              secureTextEntry={!deletePasswordVisible}
              style={st.pwdInput}
            />
            <Pressable
              onPress={() => setDeletePasswordVisible((v) => !v)}
              style={st.eyeBtn}
            >
              <MaterialIcons
                name={deletePasswordVisible ? "visibility-off" : "visibility"}
                size={18}
                color={T.mute}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={removeAccount}
          style={({ pressed }) => [
            st.dangerBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <MaterialIcons name="delete-forever" size={18} color={T.white} />
          <Text style={st.dangerBtnText}>
            {busy === "delete" ? "Processing…" : "Delete My Account"}
          </Text>
        </Pressable>
      </Sheet>
    </ScreenShell>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // ── Hero Card
  heroCard: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#0F1E3D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  heroGrad: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  decoCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  decoCircle1: { width: 200, height: 200, top: -80, right: -60 },
  decoCircle2: { width: 140, height: 140, bottom: -50, left: -40 },

  heroTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: T.amberPale,
    letterSpacing: 0.5,
  },
  heroEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroEditText: { fontSize: 12, fontWeight: "700", color: T.white },

  // Avatar
  avatarContainer: { marginBottom: 14 },
  avatarOuter: { position: "relative" },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 99 },
  avatarFallback: {
    flex: 1,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "900",
    color: T.white,
    letterSpacing: -1,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.blueMid,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: T.inkMid,
  },

  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: T.white,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  heroHandle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 3,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statChipText: { fontSize: 11, fontWeight: "700" },

  // ── Section Card
  sectionCard: {
    backgroundColor: T.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.lineLight,
    overflow: "hidden",
    shadowColor: "#1E3A5F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: T.ink,
    letterSpacing: -0.2,
  },
  sectionBadge: {
    backgroundColor: T.blueGhost,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: T.blueMid,
    letterSpacing: 0.5,
  },

  // ── Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.lineLight,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.blueGhost,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoBody: { flex: 1 },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: T.mute,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  infoValue: { fontSize: 14, fontWeight: "600", color: T.ink, lineHeight: 20 },

  // ── Action Row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 13,
  },
  actionRowBorder: { borderBottomWidth: 1, borderBottomColor: T.lineLight },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: T.blueGhost,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconDanger: { backgroundColor: T.coralPale },
  actionLabel: { fontSize: 14, fontWeight: "700", color: T.ink },
  actionSublabel: { fontSize: 12, color: T.mute, marginTop: 1 },

  // ── App Info
  appInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  appInfoText: { fontSize: 11, color: T.mute },
  appInfoDot: { fontSize: 11, color: T.line },

  // ── Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,12,20,0.55)",
  },

  // ── Sheet
  sheetOuter: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetInner: {
    maxHeight: "90%",
    backgroundColor: T.sheetBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.line,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: T.ink, letterSpacing: -0.4 },
  sheetSub: { fontSize: 13, color: T.soft, marginTop: 4, lineHeight: 19, maxWidth: 270 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.line,
  },

  // ── Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(8,12,20,0.55)",
    justifyContent: "center",
    padding: 20,
  },
  pickerBox: {
    maxHeight: "70%",
    backgroundColor: T.surface,
    borderRadius: 24,
    padding: 18,
  },
  pickRow: {
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: T.lineLight,
    borderRadius: 8,
  },
  pickText: { fontSize: 15, color: T.ink, fontWeight: "500" },
  otherBadge: {
    alignSelf: "flex-start",
    backgroundColor: T.bluePale,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  otherBadgeText: { fontSize: 13, fontWeight: "800", color: T.blueMid },

  // ── Field
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: T.soft,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  fieldInput: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: T.bg,
    borderWidth: 1.5,
    borderColor: T.line,
    paddingHorizontal: 14,
    fontSize: 15,
    color: T.ink,
    fontWeight: "500",
  },
  fieldInputFocused: {
    borderColor: T.blueMid,
    backgroundColor: T.blueGhost,
  },
  fieldSelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
  },
  fieldSelectText: { fontSize: 15, color: T.ink, fontWeight: "500", flex: 1 },
  fieldDisabled: { opacity: 0.45 },

  // ── Toggle
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: T.line,
    backgroundColor: T.bg,
  },
  toggleBtnActive: {
    backgroundColor: T.blue,
    borderColor: T.blue,
  },
  toggleText: { fontSize: 13, fontWeight: "700", color: T.soft },
  toggleTextActive: { color: T.white },

  // ── Primary Button
  primaryBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryBtnGrad: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "800", color: T.white, letterSpacing: 0.2 },

  // ── Danger Box
  dangerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF1F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECDD3",
    padding: 14,
    marginBottom: 20,
    gap: 4,
  },
  dangerBoxTitle: { fontSize: 14, fontWeight: "800", color: T.coral, marginBottom: 4 },
  dangerBoxText: { fontSize: 13, lineHeight: 19, color: "#9F1239" },

  // ── Password Row
  pwdRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: T.bg,
    borderWidth: 1.5,
    borderColor: T.line,
    paddingLeft: 14,
    paddingRight: 8,
  },
  pwdInput: { flex: 1, fontSize: 15, color: T.ink, fontWeight: "500", paddingVertical: 14 },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Danger Button
  dangerBtn: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: T.coral,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: T.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  dangerBtnText: { fontSize: 15, fontWeight: "800", color: T.white, letterSpacing: 0.2 },
});