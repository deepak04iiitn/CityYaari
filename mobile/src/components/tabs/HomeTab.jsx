import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenShell } from "./TabShared";
import { fetchPosts, toggleLike, toggleDislike, toggleSave } from "../../services/posts/postService";
import {
  getMyConnections,
  removeConnection,
  sendConnectionRequest,
} from "../../services/users/userService";
import { useAuth } from "../../store/AuthContext";
import { useSnackbar } from "../../store/SnackbarContext";
import CommentsSheet from "./CommentsSheet";
import FilterModal from "./FilterModal";
import ProfileCompletionGateModal, {
  isProfileCompleteForConnections,
} from "../common/ProfileCompletionGateModal";
import { fetchMeetups, rsvpMeetup, leaveMeetup } from "../../services/meetups/meetupService";
import { getServerBaseUrl } from "../../services/chat/chatService";

const { width } = Dimensions.get("window");

const DEFAULT_MEETUP_IMG = { uri: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80" };

const COLORS = {
  ink: "#0a0a0a",
  inkLight: "#3d3d3d",
  inkMuted: "#888888",
  paper: "#f5f2ed",
  paperDark: "#ede9e2",
  accent: "#e8380d",
  accentBlue: "#004ac6",
  accentGold: "#c9890a",
  accentMint: "#007a5e",
  white: "#ffffff",
  cardBg: "#ffffff",
  tagRed: "#fff0ed",
  tagBlue: "#eef2ff",
  tagGold: "#fff8e6",
  border: "#e0dbd4",
};


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeTab({ navigation }) {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [mode, setMode] = useState("Posts");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState({});
  const [requestingUsers, setRequestingUsers] = useState({});
  const [requestedUsers, setRequestedUsers] = useState({});
  const [showProfileGateModal, setShowProfileGateModal] = useState(false);

  const [meetups, setMeetups] = useState([]);
  const [meetupsLoading, setMeetupsLoading] = useState(false);
  const [meetupSubTab, setMeetupSubTab] = useState("upcoming");

  const [meetupSearch, setMeetupSearch] = useState("");
  const [meetupSearchFocused, setMeetupSearchFocused] = useState(false);
  const [meetupDateFilter, setMeetupDateFilter] = useState(null);
  const [showMeetupDatePicker, setShowMeetupDatePicker] = useState(false);
  const meetupSearchRef = useRef(null);

  const [expandedPosts, setExpandedPosts] = useState({});
  const [expandedMeetupDescs, setExpandedMeetupDescs] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);

  // ── SEARCH & FILTER STATE ──────────────────────────────────────
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hasImageFilter, setHasImageFilter] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [activeGender, setActiveGender] = useState(null);
  const [activeHometown, setActiveHometown] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);
  const activeFilters = useRef({});

  // Sync activeFilters ref and trigger fetch whenever any filter changes
  useEffect(() => {
    activeFilters.current = {
      ...(searchText.trim() ? { q: searchText.trim() } : {}),
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(hasImageFilter !== null ? { hasImage: String(hasImageFilter) } : {}),
      ...(sortBy !== "newest" ? { sortBy } : {}),
      ...(activeGender ? { gender: activeGender } : {}),
      ...(activeHometown.trim() ? { hometown: activeHometown.trim() } : {}),
      ...(activeLocation.trim() ? { location: activeLocation.trim() } : {}),
    };
  }, [searchText, activeCategory, hasImageFilter, sortBy, activeGender, activeHometown, activeLocation]);

  useEffect(() => { loadPosts({}); }, []);
  useEffect(() => { loadConnections(); }, [user?._id]);
  useEffect(() => { loadMeetups(); }, []);
  useEffect(() => { if (mode === "Meetups") loadMeetups(); }, [mode]);

  const loadMeetups = async () => {
    setMeetupsLoading(true);
    const result = await fetchMeetups();
    if (result.success) {
      setMeetups(result.meetups);
    }
    setMeetupsLoading(false);
  };

  const handleRsvp = async (meetupId) => {
    const res = await rsvpMeetup(meetupId);
    if (res.success) {
      showSnackbar("Joined meetup!", "success");
      loadMeetups();
      navigation.navigate("Messages", { openGroupMeetup: res.data?.meetup });
    } else {
      showSnackbar(res.message || "Could not join meetup", "error");
    }
  };

  const handleLeaveMeetup = async (meetupId) => {
    const res = await leaveMeetup(meetupId);
    if (res.success) {
      showSnackbar("Left meetup", "success");
      loadMeetups();
    } else {
      showSnackbar(res.message || "Could not leave meetup", "error");
    }
  };

  const filteredMeetups = meetups.filter((m) => {
    if (meetupSubTab === "upcoming" && m.status !== "upcoming") return false;
    if (meetupSubTab === "completed" && m.status !== "completed") return false;

    if (meetupDateFilter) {
      const mDate = new Date(m.date);
      if (
        mDate.getFullYear() !== meetupDateFilter.getFullYear() ||
        mDate.getMonth() !== meetupDateFilter.getMonth() ||
        mDate.getDate() !== meetupDateFilter.getDate()
      ) return false;
    }

    if (meetupSearch.trim()) {
      const q = meetupSearch.trim().toLowerCase();
      const haystack = [
        m.title, m.details, m.hometown,
        m.venue, m.meetupLocation, m.location,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const upcomingMeetups = meetups.filter((m) => m.status === "upcoming").slice(0, 3);

  const formatMeetupDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  };

  const formatMeetupTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const loadConnections = async () => {
    const result = await getMyConnections();
    if (!result.success) return;
    const map = {};
    (result.connections || []).forEach((u) => {
      if (u?._id) map[u._id] = true;
    });
    setConnectedUsers(map);
  };

  const loadPosts = async (filters) => {
    setIsLoading(true);
    setError(null);
    const result = await fetchPosts(filters ?? activeFilters.current);
    if (result.success) {
      setPosts(result.posts);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // Debounced search — fires 500ms after user stops typing
  const onSearchChange = (text) => {
    setSearchText(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const f = {
        ...(text.trim() ? { q: text.trim() } : {}),
        ...(activeCategory ? { category: activeCategory } : {}),
        ...(hasImageFilter !== null ? { hasImage: String(hasImageFilter) } : {}),
        ...(sortBy !== "newest" ? { sortBy } : {}),
        ...(activeGender ? { gender: activeGender } : {}),
        ...(activeHometown.trim() ? { hometown: activeHometown.trim() } : {}),
        ...(activeLocation.trim() ? { location: activeLocation.trim() } : {}),
      };
      loadPosts(f);
    }, 500);
  };

  const applyFilters = (updatedFilters) => {
    if (updatedFilters) {
      setSortBy(updatedFilters.sortBy);
      setActiveCategory(updatedFilters.category);
      setHasImageFilter(updatedFilters.hasImage);
      setActiveGender(updatedFilters.gender);
      setActiveHometown(updatedFilters.hometown);
      setActiveLocation(updatedFilters.location);
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setTimeout(() => loadPosts(), 0);
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${diffDays} days ago`;
  };

  const getCategoryTheme = (category) => {
    const defaultTheme = { color: COLORS.accent, bg: COLORS.tagRed };
    if (!category) return defaultTheme;
    const lower = category.toLowerCase();
    
    if (lower.includes('housing') || lower.includes('flatmate')) 
      return { color: COLORS.accentBlue, bg: COLORS.tagBlue };
    if (lower.includes('travel') || lower.includes('trip')) 
      return { color: COLORS.accentGreen || "#10b981", bg: COLORS.tagGreen || "#ecfdf5" };
    if (lower.includes('hangouts') || lower.includes('events')) 
      return { color: COLORS.accentGold, bg: COLORS.tagGold };
    if (lower.includes('help') || lower.includes('questions')) 
      return { color: COLORS.accentRed || "#ef4444", bg: COLORS.tagRed || "#fef2f2" };
      
    return defaultTheme;
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleLike = async (postId) => {
    const currentUserId = user?._id;
    if (!currentUserId) return;
    setPosts((prev) => 
      prev.map(p => {
        if (p._id !== postId) return p;
        const hasLiked = p.likes?.includes(currentUserId);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== currentUserId) : [...(p.likes||[]), currentUserId],
          dislikes: p.dislikes?.filter(id => id !== currentUserId) || [],
        };
      })
    );
    await toggleLike(postId);
  };

  const handleToggleDislike = async (postId) => {
    const currentUserId = user?._id;
    if (!currentUserId) return;
    setPosts((prev) => 
      prev.map(p => {
        if (p._id !== postId) return p;
        const hasDisliked = p.dislikes?.includes(currentUserId);
        return {
          ...p,
          dislikes: hasDisliked ? p.dislikes.filter(id => id !== currentUserId) : [...(p.dislikes||[]), currentUserId],
          likes: p.likes?.filter(id => id !== currentUserId) || [],
        };
      })
    );
    await toggleDislike(postId);
  };

  const handleToggleBookmark = async (postId) => {
    const currentUserId = user?._id;
    if (!currentUserId) return;
    const previousPosts = posts;
    setPosts((prev) =>
      prev.map(p => {
        if (p._id !== postId) return p;
        const hasSaved = p.savedBy?.includes(currentUserId);
        return {
          ...p,
          savedBy: hasSaved ? p.savedBy.filter(id => id !== currentUserId) : [...(p.savedBy||[]), currentUserId],
        };
      })
    );
    const result = await toggleSave(postId);
    if (!result.success) {
      setPosts(previousPosts);
      showSnackbar(result.message || "Unable to update saved post", "error");
    }
  };

  const handleSendConnectionRequest = async (targetUser) => {
    const currentUserId = user?._id;
    const targetUserId = targetUser?._id;
    if (!targetUserId) return;

    if (targetUserId === currentUserId) {
      showSnackbar("This is your own post.", "info");
      return;
    }

    if (!isProfileCompleteForConnections(user)) {
      setShowProfileGateModal(true);
      return;
    }

    if (requestedUsers[targetUserId]) {
      showSnackbar("Connection request already sent.", "info");
      return;
    }

    setRequestingUsers((prev) => ({ ...prev, [targetUserId]: true }));
    const result = connectedUsers[targetUserId]
      ? await removeConnection(targetUserId)
      : await sendConnectionRequest(targetUserId);
    setRequestingUsers((prev) => ({ ...prev, [targetUserId]: false }));

    if (!result.success) {
      showSnackbar(result.message || "Unable to send request", "error");
      return;
    }

    if (connectedUsers[targetUserId]) {
      setConnectedUsers((prev) => ({ ...prev, [targetUserId]: false }));
      setRequestedUsers((prev) => ({ ...prev, [targetUserId]: false }));
      showSnackbar("Connection removed.", "success");
    } else {
      setRequestedUsers((prev) => ({ ...prev, [targetUserId]: true }));
      showSnackbar("Connection request sent.", "success");
    }
  };

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Home"
      title={null}
      noPadding
      background={COLORS.paper}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={styles.container}>
        {/* ── MASTHEAD ── */}
        <View style={styles.masthead}>
          {/* <View style={styles.mastheadTop}>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE CITY FEED</Text>
            </View>
          </View> */}

          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleLight}>Discover</Text>
            {"\n"}
            Your Yaari<Text style={{ color: COLORS.accent }}>.</Text>
          </Text>

          {/* Pill toggle */}
          <View style={styles.toggle}>
            {["Posts", "Meetups"].map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setMode(tab)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                pressRetentionOffset={{
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20,
                }}
                style={({ pressed }) => [
                  styles.togglePill,
                  mode === tab && styles.togglePillActive,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    mode === tab && styles.toggleTextActive,
                  ]}
                >
                  {tab.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {mode === "Meetups" ? (
          <>
            {/* ── MEETUP SEARCH & DATE FILTER ── */}
            <View style={styles.meetupSearchRow}>
              <Pressable
                style={[styles.meetupSearchBox, meetupSearchFocused && styles.meetupSearchBoxFocused]}
                onPress={() => meetupSearchRef.current?.focus()}
              >
                <MaterialIcons name="search" size={18} color={meetupSearchFocused ? COLORS.accentBlue : COLORS.inkMuted} />
                <TextInput
                  ref={meetupSearchRef}
                  style={styles.meetupSearchInput}
                  placeholder="Search meetups..."
                  placeholderTextColor={COLORS.inkMuted}
                  value={meetupSearch}
                  onChangeText={setMeetupSearch}
                  onFocus={() => setMeetupSearchFocused(true)}
                  onBlur={() => setMeetupSearchFocused(false)}
                  returnKeyType="search"
                />
                {meetupSearch.length > 0 && (
                  <Pressable onPress={() => setMeetupSearch("")} hitSlop={8}>
                    <MaterialIcons name="close" size={16} color={COLORS.inkMuted} />
                  </Pressable>
                )}
              </Pressable>

              <Pressable
                style={[styles.meetupDateBtn, meetupDateFilter && styles.meetupDateBtnActive]}
                onPress={() => setShowMeetupDatePicker(true)}
              >
                <MaterialIcons
                  name="event"
                  size={17}
                  color={meetupDateFilter ? COLORS.white : COLORS.ink}
                />
              </Pressable>
            </View>

            {meetupDateFilter && (
              <View style={styles.meetupActiveFilters}>
                <View style={styles.meetupFilterChip}>
                  <MaterialIcons name="calendar-today" size={12} color={COLORS.accentBlue} />
                  <Text style={styles.meetupFilterChipText}>
                    {meetupDateFilter.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Pressable onPress={() => setMeetupDateFilter(null)} hitSlop={8}>
                    <MaterialIcons name="close" size={14} color={COLORS.inkMuted} />
                  </Pressable>
                </View>
              </View>
            )}

            {showMeetupDatePicker && (
              Platform.OS === "ios" ? (
                <Modal transparent animationType="fade" visible>
                  <Pressable style={styles.datePickerOverlay} onPress={() => setShowMeetupDatePicker(false)}>
                    <Pressable style={styles.datePickerSheet}>
                      <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerTitle}>Pick a date</Text>
                        <Pressable onPress={() => setShowMeetupDatePicker(false)}>
                          <Text style={styles.datePickerDone}>Done</Text>
                        </Pressable>
                      </View>
                      <DateTimePicker
                        value={meetupDateFilter || new Date()}
                        mode="date"
                        display="inline"
                        onChange={(_, d) => { if (d) setMeetupDateFilter(d); }}
                        themeVariant="light"
                      />
                    </Pressable>
                  </Pressable>
                </Modal>
              ) : (
                <DateTimePicker
                  value={meetupDateFilter || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowMeetupDatePicker(false);
                    if (e.type === "set" && d) setMeetupDateFilter(d);
                  }}
                />
              )
            )}

            {/* Sub-tabs */}
            <View style={styles.meetupSubTabs}>
              {["upcoming", "completed", "all"].map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setMeetupSubTab(tab)}
                  style={[styles.meetupSubTab, meetupSubTab === tab && styles.meetupSubTabActive]}
                >
                  <Text style={[styles.meetupSubTabText, meetupSubTab === tab && styles.meetupSubTabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {meetupsLoading ? (
              <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.accentBlue} size="large" />
            ) : filteredMeetups.length === 0 ? (
              <View style={styles.comingSoonWrap}>
                <View style={styles.comingSoonIcon}>
                  <MaterialIcons name={meetupSearch || meetupDateFilter ? "search-off" : "event-busy"} size={32} color={COLORS.accentBlue} />
                </View>
                <Text style={styles.comingSoonTitle}>
                  {meetupSearch || meetupDateFilter ? "No matches" : "No meetups yet"}
                </Text>
                <Text style={styles.comingSoonSubtitle}>
                  {meetupSearch || meetupDateFilter
                    ? "Try a different search term or clear the date filter."
                    : "Be the first to create a meetup! Head over to the Post tab to get started."}
                </Text>
                {(meetupSearch || meetupDateFilter) && (
                  <Pressable
                    style={styles.meetupClearAllBtn}
                    onPress={() => { setMeetupSearch(""); setMeetupDateFilter(null); }}
                  >
                    <Text style={styles.meetupClearAllText}>Clear filters</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredMeetups.map((m) => {
                const isMember = m.members?.some((mb) => (mb._id || mb) === user?._id);
                const isCreator = (m.user?._id || m.user) === user?._id;
                const isFull = m.members?.length >= m.maxMembers;
                const spotsLeft = m.maxMembers - (m.members?.length || 0);
                const serverBase = getServerBaseUrl();
                const imgSrc = m.imageUri
                  ? { uri: m.imageUri.startsWith("http") ? m.imageUri : `${serverBase}${m.imageUri}` }
                  : DEFAULT_MEETUP_IMG;

                return (
                  <View key={m._id} style={styles.meetCardFull}>
                    <View style={styles.meetImgWrap}>
                      <Image source={imgSrc} style={styles.meetImg} />
                        <View style={[styles.datePill, { backgroundColor: COLORS.accent }]}>
                          <Text style={styles.datePillText}>{formatMeetupDate(m.date)}</Text>
                        </View>
                        <View style={styles.spotsBadge}>
                          <MaterialIcons name="people" size={10} color={COLORS.ink} />
                          <Text style={styles.spotsText}>{spotsLeft > 0 ? `${spotsLeft} left` : "Full"}</Text>
                        </View>
                      </View>

                    <View style={styles.meetBody}>
                      <View style={styles.meetTimeRow}>
                        <Text style={styles.meetTime}>{formatMeetupTime(m.time)}</Text>
                        {m.hometown ? (
                          <View style={styles.hometownInline}>
                            <MaterialIcons name="home" size={11} color={COLORS.accent} />
                            <Text style={styles.hometownInlineText}>For {m.hometown} folks</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.meetTitle} numberOfLines={2}>{m.title}</Text>
                      {m.details ? (
                        <View>
                          <Text
                            style={styles.meetDesc}
                            numberOfLines={expandedMeetupDescs[m._id] ? undefined : 2}
                          >
                            {m.details}
                          </Text>
                          {m.details.length > 80 && (
                            <Pressable
                              onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setExpandedMeetupDescs((prev) => ({ ...prev, [m._id]: !prev[m._id] }));
                              }}
                              hitSlop={8}
                            >
                              <Text style={styles.meetReadMore}>
                                {expandedMeetupDescs[m._id] ? "Show less" : "Read more"}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      ) : null}
                      {(m.venue || m.meetupLocation || m.location) ? (
                        <View style={styles.meetLoc}>
                          <MaterialIcons name="location-on" size={13} color={COLORS.accentBlue} />
                          <Text style={styles.meetLocText} numberOfLines={1}>
                            {[m.venue, m.meetupLocation || m.location].filter(Boolean).join(", ")}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.meetFooter}>
                        <View style={styles.meetMembers}>
                          <MaterialIcons name="group" size={14} color={COLORS.inkMuted} />
                          <Text style={styles.meetMembersText}>{m.members?.length || 0}/{m.maxMembers}</Text>
                        </View>

                        {isCreator ? (
                          <View style={[styles.rsvpBtn, { backgroundColor: COLORS.paperDark }]}>
                            <Text style={[styles.rsvpText, { color: COLORS.ink }]}>YOUR MEETUP</Text>
                          </View>
                        ) : isMember ? (
                          <Pressable
                            style={[styles.rsvpBtn, { backgroundColor: COLORS.accentMint }]}
                            onPress={() => handleLeaveMeetup(m._id)}
                          >
                            <Text style={styles.rsvpText}>JOINED ✓</Text>
                          </Pressable>
                        ) : isFull ? (
                          <View style={[styles.rsvpBtn, { backgroundColor: COLORS.border }]}>
                            <Text style={[styles.rsvpText, { color: COLORS.inkMuted }]}>FULL</Text>
                          </View>
                        ) : (
                          <Pressable
                            style={[styles.rsvpBtn, { backgroundColor: COLORS.accent }]}
                            onPress={() => handleRsvp(m._id)}
                          >
                            <Text style={styles.rsvpText}>RSVP NOW</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* ── UPCOMING MEETUPS CAROUSEL ── */}
            {upcomingMeetups.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <View>
                    <Text style={styles.feedSectionTitle}>
                      <Text style={styles.feedSectionTitleLight}>Upcoming </Text>
                      Meetups
                    </Text>
                    <View style={styles.feedSectionAccent} />
                  </View>
                  <Pressable onPress={() => setMode("Meetups")} hitSlop={12}>
                    <Text style={styles.seeAllBtn}>See all</Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={styles.upcomingScroll}
                >
                  {upcomingMeetups.map((m) => {
                    const serverBase = getServerBaseUrl();
                    const imgSrc = m.imageUri
                      ? { uri: m.imageUri.startsWith("http") ? m.imageUri : `${serverBase}${m.imageUri}` }
                      : DEFAULT_MEETUP_IMG;
                    const isMember = m.members?.some((mb) => (mb._id || mb) === user?._id);
                    const isCreator = (m.user?._id || m.user) === user?._id;
                    const spotsLeft = m.maxMembers - (m.members?.length || 0);

                    return (
                      <View key={m._id} style={styles.upcomingCard}>
                        <Image source={imgSrc} style={styles.upcomingImg} />
                        <View style={styles.upcomingBody}>
                          <Text style={styles.upcomingDate}>{formatMeetupDate(m.date)} · {formatMeetupTime(m.time)}</Text>
                          <Text style={styles.upcomingTitle} numberOfLines={2}>{m.title}</Text>
                          {m.hometown ? (
                            <View style={styles.upcomingHometownChip}>
                              <MaterialIcons name="home" size={10} color={COLORS.accent} />
                              <Text style={styles.upcomingHometownText}>For {m.hometown}</Text>
                            </View>
                          ) : null}
                          <View style={styles.upcomingFooter}>
                            <View style={styles.upcomingSpots}>
                              <MaterialIcons name="people" size={11} color={COLORS.inkMuted} />
                              <Text style={styles.upcomingSpotsText}>{spotsLeft > 0 ? `${spotsLeft} left` : "Full"}</Text>
                            </View>
                            {isCreator ? (
                              <View style={[styles.upcomingRsvp, { backgroundColor: COLORS.paperDark }]}>
                                <Text style={[styles.upcomingRsvpText, { color: COLORS.ink }]}>YOURS</Text>
                              </View>
                            ) : isMember ? (
                              <View style={[styles.upcomingRsvp, { backgroundColor: COLORS.accentMint }]}>
                                <Text style={styles.upcomingRsvpText}>JOINED</Text>
                              </View>
                            ) : (
                              <Pressable style={[styles.upcomingRsvp, { backgroundColor: COLORS.accent }]} onPress={() => handleRsvp(m._id)}>
                                <Text style={styles.upcomingRsvpText}>RSVP</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                <View style={[styles.feedDivider, { marginTop: 20 }]} />
              </>
            )}

            {upcomingMeetups.length === 0 && <View style={styles.feedDivider} />}
            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.feedSectionTitle}>
                  <Text style={styles.feedSectionTitleLight}>Your </Text>
                  Yaari Feed
                </Text>
                <View style={styles.feedSectionAccent} />
              </View>
            </View>

            {/* ── SEARCH BAR ── */}
            <View style={styles.searchRow}>
              <Pressable
                style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}
                onPress={() => searchInputRef.current?.focus()}
              >
                <MaterialIcons name="search" size={18} color={searchFocused ? COLORS.accentBlue : COLORS.inkMuted} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search posts..."
                  placeholderTextColor={COLORS.inkMuted}
                  value={searchText}
                  onChangeText={onSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  returnKeyType="search"
                  onSubmitEditing={() => applyFilters()}
                />
                {searchText.length > 0 && (
                  <Pressable onPress={() => { setSearchText(""); onSearchChange(""); }}>
                    <MaterialIcons name="close" size={16} color={COLORS.inkMuted} />
                  </Pressable>
                )}
              </Pressable>
              <Pressable
                style={[styles.filterToggleBtn, (activeCategory || hasImageFilter || activeGender || activeHometown || activeLocation || sortBy !== "newest") && styles.filterToggleBtnActive]}
                onPress={() => setIsFilterModalVisible(true)}
              >
                <MaterialIcons
                  name="tune"
                  size={18}
                  color={(activeCategory || hasImageFilter || activeGender || activeHometown || activeLocation || sortBy !== "newest") ? COLORS.white : COLORS.ink}
                />
              </Pressable>
            </View>

            <View style={styles.feed}>
              {isLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={COLORS.accent} />
              ) : error ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.inkMuted }}>{error}</Text>
              ) : posts.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.inkMuted }}>No posts found.</Text>
              ) : (
                posts.map((post, idx) => {
              const theme = getCategoryTheme(post.category);
              return (
                <View key={post._id || idx}>
                  {/* Horizontal rule between posts */}
                  {idx > 0 && <View style={styles.hrule} />}

                  <View style={styles.postCard}>
                    {/* Header */}
                    <View style={styles.postHeader}>
                      <View style={styles.authorRow}>
                        <View style={styles.avatarWrap}>
                          <Image
                            source={{ uri: post.user?.profileImageUri || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                          />
                        </View>
                        <View>
                          <Text style={styles.authorName}>{post.user?.fullName || 'Unknown User'}</Text>
                          <Text style={styles.postTime}>{getRelativeTime(post.createdAt)}</Text>
                        </View>
                      </View>

                      <View style={styles.postHeaderRight}>
                        <View
                          style={[
                            styles.catTag,
                            { backgroundColor: theme.bg },
                          ]}
                        >
                          <Text
                            style={[styles.catText, { color: theme.color }]}
                          >
                            {(post.category || 'General').toUpperCase()}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleSendConnectionRequest(post.user)}
                          disabled={
                            post.user?._id === user?._id ||
                            !!requestingUsers[post.user?._id]
                          }
                          style={[
                            styles.connectBtn,
                            connectedUsers[post.user?._id] && styles.connectBtnConnected,
                            requestedUsers[post.user?._id] && styles.connectBtnSent,
                            post.user?._id === user?._id && styles.connectBtnDisabled,
                          ]}
                        >
                          <MaterialIcons
                            name={
                              requestingUsers[post.user?._id]
                                ? "hourglass-top"
                                : connectedUsers[post.user?._id]
                                ? "person-remove-alt-1"
                                : requestedUsers[post.user?._id]
                                ? "check"
                                : "person-add-alt-1"
                            }
                            size={15}
                            color={
                              connectedUsers[post.user?._id]
                                ? COLORS.accent
                                : requestedUsers[post.user?._id]
                                ? COLORS.accentMint
                                : COLORS.accentBlue
                            }
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* Content */}
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text
                      style={styles.postBody}
                      numberOfLines={expandedPosts[post._id] ? undefined : 3}
                    >
                      {post.details}
                    </Text>
                    {post.details && post.details.length > 100 && (
                      <Pressable onPress={() => toggleExpand(post._id)} hitSlop={10}>
                        <Text style={styles.readMore}>
                          {expandedPosts[post._id] ? "Show less" : "Read more"}
                        </Text>
                      </Pressable>
                    )}

                    {post.imageUri && (
                      <View style={styles.postImgWrap}>
                        <Image source={{ uri: post.imageUri }} style={styles.postImg} />
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                      <View style={styles.actionsLeft}>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => handleToggleLike(post._id)}
                        >
                          <MaterialIcons
                            name={post.likes?.includes(user?._id) ? "thumb-up" : "thumb-up-off-alt"}
                            size={18}
                            color={
                              post.likes?.includes(user?._id) ? COLORS.accent : COLORS.inkMuted
                            }
                          />
                          <Text
                            style={[
                              styles.actionCount,
                              post.likes?.includes(user?._id) && { color: COLORS.accent },
                            ]}
                          >
                            {post.likes?.length || 0}
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => handleToggleDislike(post._id)}
                        >
                          <MaterialIcons
                            name={
                              post.dislikes?.includes(user?._id)
                                ? "thumb-down"
                                : "thumb-down-off-alt"
                            }
                            size={18}
                            color={
                              post.dislikes?.includes(user?._id)
                                ? COLORS.accentBlue
                                : COLORS.inkMuted
                            }
                          />
                          <Text
                            style={[
                              styles.actionCount,
                              post.dislikes?.includes(user?._id) && { color: COLORS.accentBlue },
                            ]}
                          >
                            {post.dislikes?.length || 0}
                          </Text>
                        </Pressable>

                        <Pressable style={styles.actionBtn} onPress={() => setActiveCommentPostId(post._id)}>
                          <MaterialIcons
                            name="chat-bubble-outline"
                            size={18}
                            color={COLORS.inkMuted}
                          />
                          <Text style={styles.actionCount}>{post.comments || 0}</Text>
                        </Pressable>
                      </View>

                      <Pressable onPress={() => handleToggleBookmark(post._id)}>
                        <MaterialIcons
                          name={
                            post.savedBy?.includes(user?._id) ? "bookmark" : "bookmark-border"
                          }
                          size={20}
                          color={
                            post.savedBy?.includes(user?._id)
                              ? COLORS.accentBlue
                              : COLORS.inkMuted
                          }
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
                })
              )}
            </View>
          </>
        )}

        <CommentsSheet
          visible={!!activeCommentPostId}
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={applyFilters}
          initialFilters={{
            sortBy,
            category: activeCategory,
            hasImage: hasImageFilter,
            gender: activeGender,
            hometown: activeHometown,
            location: activeLocation,
          }}
        />

        <ProfileCompletionGateModal
          visible={showProfileGateModal}
          onClose={() => setShowProfileGateModal(false)}
          onCompleteProfile={() => {
            setShowProfileGateModal(false);
            navigation.navigate("Account");
          }}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
    paddingTop: 8,
  },

  /* ── MASTHEAD ── */
  masthead: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    marginBottom: 24,
  },
  mastheadTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: COLORS.ink,
    lineHeight: 58,
    letterSpacing: -2,
    marginBottom: 24,
  },
  heroTitleLight: {
    fontWeight: "300",
    fontStyle: "italic",
    fontSize: 44,
    letterSpacing: -1,
  },

  /* Toggle */
  toggle: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  togglePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  togglePillActive: {
    backgroundColor: COLORS.ink,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: COLORS.inkMuted,
  },
  toggleTextActive: {
    color: COLORS.white,
  },

  /* ── SECTIONS ── */
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: -10
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.inkMuted,
  },
  feedSectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: COLORS.ink,
    lineHeight: 28,
    marginTop: 18
  },
  feedSectionTitleLight: {
    fontSize: 22,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: -0.2,
    color: COLORS.inkLight,
  },
  feedSectionAccent: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accentBlue,
    marginTop: 6,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accentBlue,
    letterSpacing: 0.3,
  },
  comingSoonWrap: {
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    gap: 10,
  },
  comingSoonIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.tagBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.ink,
    letterSpacing: -0.4,
  },
  comingSoonSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.inkMuted,
    fontWeight: "600",
    textAlign: "center",
  },

  /* ── MEETUP SUB-TABS ── */
  meetupSubTabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.paperDark,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  meetupSubTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  meetupSubTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  meetupSubTabText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.inkMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  meetupSubTabTextActive: {
    color: COLORS.ink,
  },

  /* ── MEETUP SEARCH & FILTER ── */
  meetupSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  meetupSearchBox: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  meetupSearchBoxFocused: {
    borderColor: COLORS.accentBlue,
    backgroundColor: COLORS.paper,
  },
  meetupSearchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
    padding: 0,
    fontWeight: "500",
  },
  meetupDateBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  meetupDateBtnActive: {
    backgroundColor: COLORS.accentBlue,
    borderColor: COLORS.accentBlue,
  },
  meetupActiveFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  meetupFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.tagBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  meetupFilterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accentBlue,
  },
  meetupClearAllBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.accentBlue,
  },
  meetupClearAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  datePickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.ink,
  },
  datePickerDone: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.accentBlue,
  },

  /* ── MEETUP CARDS ── */
  feedDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.65,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  meetCardFull: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  meetImgWrap: {
    height: 150,
    position: "relative",
  },
  meetImg: {
    width: "100%",
    height: "100%",
  },
  datePill: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  datePillText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 1,
  },
  spotsBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  spotsText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  meetBody: {
    padding: 16,
  },
  meetTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 8,
  },
  meetTime: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.inkMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  hometownInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.accent + "12",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hometownInlineText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 0.2,
  },
  meetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.ink,
    lineHeight: 23,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  meetDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.inkMuted,
    lineHeight: 18,
    marginBottom: 2,
  },
  meetReadMore: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.accentBlue,
    letterSpacing: 0.3,
    marginBottom: 8,
    marginTop: 2,
  },
  seeAllBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accentBlue,
    letterSpacing: 0.2,
    marginTop: 24,
  },
  upcomingScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 12,
  },
  upcomingCard: {
    width: 180,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  upcomingImg: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  upcomingBody: {
    padding: 10,
  },
  upcomingDate: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: 3,
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.ink,
    lineHeight: 17,
    marginBottom: 4,
  },
  upcomingHometownChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 3,
    backgroundColor: COLORS.accent + "12",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  upcomingHometownText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.accent,
  },
  upcomingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  upcomingSpots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  upcomingSpotsText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.inkMuted,
  },
  upcomingRsvp: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upcomingRsvpText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  meetLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    backgroundColor: COLORS.tagBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
    alignSelf: "flex-start",
  },
  meetLocText: {
    fontSize: 12,
    color: COLORS.accentBlue,
    fontWeight: "700",
    flex: 1,
  },
  rsvpBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  rsvpText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  meetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meetMembers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meetMembersText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.inkMuted,
  },

  /* ── FEED ── */
  feed: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  hrule: {
    height: 1.5,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  postCard: {
    paddingVertical: 20,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  postHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  authorName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  postTime: {
    fontSize: 10,
    color: COLORS.inkMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  catTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  catText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  connectBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.tagBlue,
    borderWidth: 1,
    borderColor: "#c9d8ff",
  },
  connectBtnSent: {
    backgroundColor: "#e6f7ef",
    borderColor: "#c4ead7",
  },
  connectBtnConnected: {
    backgroundColor: "#fff0ed",
    borderColor: "#f4c4b8",
  },
  connectBtnDisabled: {
    opacity: 0.45,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.ink,
    lineHeight: 26,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  postBody: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.inkLight,
    marginBottom: 8,
    fontWeight: "400",
  },
  readMore: {
    color: COLORS.accentBlue,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.paperDark,
  },
  actionsLeft: {
    flexDirection: "row",
    gap: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.inkMuted,
  },
  postImgWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  postImg: {
    width: "100%",
    height: "100%",
  },

  // ── Search & Filter ──────────────────────────────────────────
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 20,
  },
  searchBox: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchBoxFocused: {
    borderColor: COLORS.accentBlue,
    backgroundColor: COLORS.paper,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
    padding: 0,
    fontWeight: "500",
  },
  filterToggleBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggleBtnActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  white: {
    color: COLORS.white,
  },
});