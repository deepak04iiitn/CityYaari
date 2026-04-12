import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenShell } from "./TabShared";
import {
  respondToConnectionRequest,
} from "../../services/users/userService";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
} from "../../services/notifications/notificationService";
import { useSnackbar } from "../../store/SnackbarContext";

const C = {
  bg: "#f5f2ed",
  surface: "#ffffff",
  surfaceAlt: "#f8f6f2",
  ink: "#0a0a0a",
  soft: "#888888",
  line: "#e0dbd4",
  lineLight: "#ece7e0",
  blue: "#004ac6",
  bluePale: "#eef2ff",
  blueLight: "#c7d8ff",
  coral: "#C05A5A",
  coralPale: "#FAEAEA",
  white: "#ffffff",
};

const FILTERS = [
  { key: "all", label: "All", types: null },
  { key: "connection_request", label: "Requests", types: ["connection_request"] },
  { key: "post_liked", label: "Post Likes", types: ["post_liked"] },
  { key: "post_commented", label: "Post Comments", types: ["post_commented"] },
  { key: "comment_liked", label: "Comment Likes", types: ["comment_liked"] },
  { key: "comment_replied", label: "Comment Replies", types: ["comment_replied"] },
];

function NotificationAvatar({ uri, name }) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(
    () =>
      (name || "CY")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join("")
        .toUpperCase(),
    [name]
  );

  if (uri && !hasError) {
    return (
      <Image
        source={{ uri }}
        style={s.avatar}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <View style={s.avatarFallback}>
      <Text style={s.avatarFallbackText}>{initials}</Text>
    </View>
  );
}

export default function NotificationsTab({ navigation }) {
  const { showSnackbar } = useSnackbar();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const fabScale = useRef(new Animated.Value(1)).current;

  const toRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const loadNotifications = async () => {
    const result = await fetchNotifications();
    if (result.success) setNotifications(result.notifications || []);
    else showSnackbar(result.message || "Unable to load notifications", "error");
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const onMarkAllRead = async () => {
    if (!notifications.some((n) => !n.isRead)) return;
    setMarkingAllRead(true);
    const result = await markAllNotificationsAsRead();
    setMarkingAllRead(false);
    if (!result.success) {
      showSnackbar(result.message || "Unable to mark all as read", "error");
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showSnackbar("All notifications marked as read", "success");
  };

  const onRespond = async (actorId, action) => {
    setBusyId(`${actorId}:${action}`);
    const result = await respondToConnectionRequest(actorId, action);
    setBusyId("");
    if (result.success) {
      await loadNotifications();
      showSnackbar(
        action === "accept" ? "Connection request accepted." : "Connection request declined.",
        "success"
      );
      return;
    }
    showSnackbar(result.message || "Unable to update request", "error");
  };

  const filteredNotifications = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter);
    if (!filter || !filter.types) return notifications;
    return notifications.filter((n) => filter.types.includes(n.type));
  }, [activeFilter, notifications]);

  const hasUnread = notifications.some((n) => !n.isRead);

  const handleFabPress = () => {
    if (!hasUnread || markingAllRead) return;
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
    onMarkAllRead();
  };

  return (
    <View style={s.rootContainer}>
    <ScreenShell
      navigation={navigation}
      routeName="Notifications"
      noPadding
      background={C.bg}
      contentContainerStyle={s.screenContent}
      notificationCount={notifications.filter((n) => !n.isRead).length}
      stickyHeaderIndices={[1]}
    >
      <View style={s.masthead}>
        <Text style={s.heroTitle}>Notifications.</Text>
        <Text style={s.heroSub}>All your updates in one place.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {FILTERS.map((filter) => {
          const isActive = filter.key === activeFilter;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[s.filterChip, isActive && s.filterChipActive]}
            >
              <Text style={[s.filterChipText, isActive && s.filterChipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={s.feed}>
        {filteredNotifications.length === 0 ? (
          <View style={s.emptyWrap}>
            <MaterialIcons name="notifications-none" size={34} color={C.soft} />
            <Text style={s.emptyTitle}>No notifications found</Text>
            <Text style={s.emptySub}>Try a different filter or check back later.</Text>
          </View>
        ) : (
          filteredNotifications.map((notif, idx) => (
            <View key={notif._id} style={[s.row, idx !== filteredNotifications.length - 1 && s.rowBorder]}>
              <NotificationAvatar uri={notif.actor?.profileImageUri} name={notif.actor?.fullName} />

              <View style={s.rowContent}>
                <View style={s.rowTop}>
                  <Text style={s.title}>{notif.message || "You have a new notification"}</Text>
                  {!notif.isRead ? <View style={s.unreadDot} /> : null}
                </View>
                <Text style={s.meta}>
                  @{notif.actor?.username || "user"}
                  {notif.actor?.city ? ` · ${notif.actor.city}` : ""}
                </Text>
                <Text style={s.timeText}>{toRelativeTime(notif.createdAt)}</Text>

                {notif.type === "connection_request" && notif.actionable ? (
                  <View style={s.actionRow}>
                    <Pressable
                      style={s.acceptBtn}
                      disabled={!notif.actor?._id || busyId === `${notif.actor?._id}:accept`}
                      onPress={() => onRespond(notif.actor?._id, "accept")}
                    >
                      <MaterialIcons name="check" size={16} color={C.white} />
                      <Text style={s.acceptBtnText}>Accept</Text>
                    </Pressable>
                    <Pressable
                      style={s.declineBtn}
                      disabled={!notif.actor?._id || busyId === `${notif.actor?._id}:decline`}
                      onPress={() => onRespond(notif.actor?._id, "decline")}
                    >
                      <MaterialIcons name="close" size={16} color={C.coral} />
                      <Text style={s.declineBtnText}>Decline</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    </ScreenShell>

    {hasUnread && (
      <Animated.View
        style={[
          s.fab,
          { bottom: 100 + insets.bottom, transform: [{ scale: fabScale }] },
        ]}
      >
        <Pressable
          onPress={handleFabPress}
          disabled={markingAllRead}
          style={({ pressed }) => [
            s.fabInner,
            pressed && { opacity: 0.85 },
            markingAllRead && { opacity: 0.6 },
          ]}
        >
          <MaterialIcons name="done-all" size={22} color={C.white} />
        </Pressable>
      </Animated.View>
    )}
    </View>
  );
}

const s = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  screenContent: {
    paddingHorizontal: 0,
    paddingBottom: 120,
    backgroundColor: C.bg,
    gap: 14,
  },
  fab: {
    position: "absolute",
    right: 18,
    zIndex: 50,
    elevation: 12,
  },
  fabInner: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.blue,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  masthead: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: C.ink,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: C.ink,
  },
  heroSub: {
    marginTop: 4,
    fontSize: 13,
    color: C.soft,
    fontWeight: "600",
  },
  filterRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: C.bluePale,
    borderColor: C.blueLight,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: C.soft,
    textTransform: "uppercase",
  },
  filterChipTextActive: {
    color: C.blue,
  },
  feed: {
    width: "100%",
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.lineLight,
  },
  rowContent: {
    flex: 1,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: C.ink,
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.bluePale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.blue,
    letterSpacing: 0.4,
  },
  meta: {
    fontSize: 11,
    fontWeight: "600",
    color: C.soft,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: C.soft,
    marginTop: 3,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    minWidth: 92,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.blue,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.white,
    letterSpacing: 0.5,
  },
  declineBtn: {
    minWidth: 92,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.coralPale,
    borderWidth: 1,
    borderColor: "#f1c0c0",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },
  declineBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.coral,
    letterSpacing: 0.5,
  },
  emptyWrap: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
  },
  emptySub: {
    textAlign: "center",
    color: C.soft,
    fontSize: 12,
    fontWeight: "600",
  },
});
