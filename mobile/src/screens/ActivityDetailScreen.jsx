import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenShell } from "../components/tabs/TabShared";
import {
  getMyConnections,
  getMyPosts,
  getMySavedPosts,
  removeConnection,
} from "../services/users/userService";
import { deletePost, toggleSave, updatePost } from "../services/posts/postService";
import { deleteMeetup, updateMeetup } from "../services/meetups/meetupService";
import { useSnackbar } from "../store/SnackbarContext";

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
  goldGhost: "#fff8e6",
  goldBorder: "#f0da9e",
  goldDeep: "#8f6207",
  coral: "#C05A5A",
  coralPale: "#FAEAEA",
  white: "#ffffff",
};

const POST_CATEGORIES = [
  "General",
  "Flatmate / Housing",
  "Travelmate",
  "Trip",
  "Hangouts",
  "Help / Questions",
];

function ListAvatar({ uri, name }) {
  const initials = (name || "CY")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

  if (uri) {
    return <Image source={{ uri }} style={st.avatar} />;
  }

  return (
    <View style={st.avatarFallback}>
      <Text style={st.avatarFallbackText}>{initials || "CY"}</Text>
    </View>
  );
}

function useFade(trigger) {
  const anim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: trigger ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [trigger]);
  return anim;
}

function EditSheet({ visible, onClose, children }) {
  const fade = useFade(visible);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Animated.View style={[st.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={st.sheetOuter}>
        <View style={st.sheetInner}>
          <View style={st.sheetHandle} />
          <View style={st.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.sheetTitle}>Edit Post</Text>
              <Text style={st.sheetSub}>Update details and save your changes.</Text>
            </View>
            <Pressable onPress={onClose} style={st.closeBtn}>
              <MaterialIcons name="close" size={16} color={T.soft} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function ActivityDetailScreen({ navigation, route }) {
  const { showSnackbar } = useSnackbar();
  const type = route?.params?.type || "connections";
  const title = route?.params?.title || "Activity";
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    details: "",
    category: "General",
  });

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
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const result =
        type === "connections"
          ? await getMyConnections()
          : type === "posts"
          ? await getMyPosts()
          : await getMySavedPosts();
      if (!mounted) return;
      if (result.success) {
        setItems(result.connections || result.posts || []);
      } else {
        setItems([]);
      }
      setIsLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [type]);
  const count = useMemo(() => items.length, [items]);

  const onRemoveConnection = async (id) => {
    const res = await removeConnection(id);
    if (!res.success) {
      showSnackbar(res.message || "Unable to remove connection", "error");
      return;
    }
    setItems((prev) => prev.filter((x) => x._id !== id));
    showSnackbar("Connection removed successfully.", "success");
  };

  const onDeletePost = async (id) => {
    const item = items.find((x) => x._id === id);
    const res =
      item?.kind === "Meetup" ? await deleteMeetup(id) : await deletePost(id);
    if (!res.success) {
      showSnackbar(res.message || "Unable to delete post", "error");
      return;
    }
    setItems((prev) => prev.filter((x) => x._id !== id));
    showSnackbar("Deleted successfully.", "success");
  };

  const onUnsave = async (id) => {
    const res = await toggleSave(id);
    if (!res.success) {
      showSnackbar(res.message || "Unable to unsave post", "error");
      return;
    }
    setItems((prev) => prev.filter((x) => x._id !== id));
    showSnackbar("Removed from saved posts.", "success");
  };

  const openEditSheet = (item) => {
    setEditingItemId(item._id);
    setEditForm({
      title: item.title || "",
      details: item.details || "",
      category: item.category || "General",
    });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editingItemId) return;
    if (!editForm.title.trim() || !editForm.details.trim()) {
      showSnackbar("Title and details are required.", "info");
      return;
    }
    const currentItem = items.find((x) => x._id === editingItemId);
    if (!currentItem) return;

    setEditBusy(true);
    const payload = {
      title: editForm.title.trim(),
      details: editForm.details.trim(),
      category: editForm.category.trim(),
    };
    const res =
      currentItem.kind === "Meetup"
        ? await updateMeetup(editingItemId, payload)
        : await updatePost(editingItemId, payload);
    setEditBusy(false);

    if (!res.success) {
      showSnackbar(res.message || "Unable to update post", "error");
      return;
    }
    setItems((prev) =>
      prev.map((x) =>
        x._id === editingItemId
          ? {
              ...x,
              title: payload.title,
              details: payload.details,
              category: payload.category,
            }
          : x
      )
    );
    setEditOpen(false);
    setEditingItemId(null);
    showSnackbar("Updated successfully.", "success");
  };

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Account"
      noPadding
      background={T.bg}
      contentContainerStyle={st.screenContent}
    >
      <View style={st.masthead}>
        <View style={st.topChip}>
          <Text style={st.topChipText}>MY ACTIVITY</Text>
        </View>
        <Text style={st.heroTitle}>
          {title}
          <Text style={{ color: T.blue }}>.</Text>
        </Text>
        <Text style={st.heroSub}>
          {count} {count === 1 ? "item" : "items"} in this section
        </Text>
      </View>

      <View
        style={
          type === "connections"
            ? st.connectionsFeed
            : type === "saved"
            ? st.savedFeed
            : st.listCard
        }
      >
        {isLoading ? (
          <Text style={st.emptyText}>Loading...</Text>
        ) : items.length === 0 ? (
          <Text style={st.emptyText}>No items available right now.</Text>
        ) : (
          items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            if (type === "connections") {
              return (
                <View key={item._id} style={[st.connectionRow, !isLast && st.connectionRowBorder]}>
                  <ListAvatar uri={item.profileImageUri} name={item.fullName} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.rowTitle}>{item.fullName}</Text>
                    <Text style={st.rowMeta}>@{item.username}</Text>
                    <Text style={st.rowSub}>
                      {[item.hometownCity, item.city].filter(Boolean).join(" -> ") || "CityYaari connection"}
                    </Text>
                  </View>
                  <Pressable onPress={() => onRemoveConnection(item._id)} style={st.dangerBtn}>
                    <Text style={st.dangerBtnText}>Remove</Text>
                  </Pressable>
                </View>
              );
            }
            if (type === "posts") {
              return (
                <View key={item._id} style={[st.row, !isLast && st.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <View style={st.postTop}>
                      <Text style={st.rowTitle}>{item.title}</Text>
                      <View style={[st.kindBadge, item.kind === "Meetup" && st.kindBadgeMeetup]}>
                        <Text style={[st.kindBadgeText, item.kind === "Meetup" && st.kindBadgeTextMeetup]}>
                          {(item.kind || "Post").toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={st.rowMeta}>{item.category || "General"}</Text>
                    <Text style={st.rowSub}>{new Date(item.createdAt).toLocaleString()}</Text>
                    <View style={st.actionRow}>
                      <Pressable
                        style={st.ghostBtn}
                        onPress={() => openEditSheet(item)}
                      >
                        <Text style={st.ghostBtnText}>Edit</Text>
                      </Pressable>
                      <Pressable style={st.dangerBtn} onPress={() => onDeletePost(item._id)}>
                        <Text style={st.dangerBtnText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }
            return (
              <View key={item._id} style={[st.savedPostCard, !isLast && st.savedPostCardBorder]}>
                <View style={st.savedPostHeader}>
                  <View style={st.savedAuthorRow}>
                    <ListAvatar uri={item.user?.profileImageUri} name={item.user?.fullName || item.user?.username} />
                    <View>
                      <Text style={st.rowTitle}>{item.user?.fullName || "Unknown User"}</Text>
                      <Text style={st.rowMeta}>{getRelativeTime(item.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={st.savedCatTag}>
                    <Text style={st.savedCatText}>{(item.category || "General").toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={st.savedPostTitle}>{item.title}</Text>
                <Text style={st.savedPostBody}>{item.details}</Text>

                {item.imageUri ? (
                  <View style={st.savedPostImgWrap}>
                    <Image source={{ uri: item.imageUri }} style={st.savedPostImg} />
                  </View>
                ) : null}

                <View style={st.savedActions}>
                  <View style={st.savedActionsLeft}>
                    <Text style={st.savedByText}>@{item.user?.username || "unknown"}</Text>
                  </View>
                  <Pressable style={st.ghostBtn} onPress={() => onUnsave(item._id)}>
                    <Text style={st.ghostBtnText}>Unsave</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>
      <EditSheet
        visible={editOpen}
        onClose={() => {
          if (editBusy) return;
          setEditOpen(false);
          setEditingItemId(null);
        }}
      >
        <View style={st.fieldWrap}>
          <Text style={st.fieldLabel}>TITLE</Text>
          <TextInput
            value={editForm.title}
            onChangeText={(v) => setEditForm((p) => ({ ...p, title: v }))}
            placeholder="Post title"
            placeholderTextColor={T.mute}
            style={st.fieldInput}
          />
        </View>

        <View style={st.fieldWrap}>
          <Text style={st.fieldLabel}>DETAILS</Text>
          <TextInput
            value={editForm.details}
            onChangeText={(v) => setEditForm((p) => ({ ...p, details: v }))}
            placeholder="Write more details..."
            placeholderTextColor={T.mute}
            multiline
            textAlignVertical="top"
            style={[st.fieldInput, st.fieldTextArea]}
          />
        </View>

        <View style={st.fieldWrap}>
          <Text style={st.fieldLabel}>CATEGORY</Text>
          <View style={st.categoryWrap}>
            {POST_CATEGORIES.map((cat) => {
              const active = editForm.category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setEditForm((p) => ({ ...p, category: cat }))}
                  style={[st.categoryChip, active && st.categoryChipActive]}
                >
                  <Text style={[st.categoryChipText, active && st.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={onSaveEdit}
          disabled={editBusy}
          style={({ pressed }) => [st.primaryBtn, (pressed || editBusy) && { opacity: 0.82 }]}
        >
          <Text style={st.primaryBtnText}>{editBusy ? "Saving..." : "Save Changes"}</Text>
          <MaterialIcons name="arrow-forward" size={16} color={T.white} />
        </Pressable>
      </EditSheet>
    </ScreenShell>
  );
}

const st = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 0,
    paddingBottom: 120,
    gap: 14,
    backgroundColor: T.bg,
  },
  masthead: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: T.ink,
  },
  topChip: {
    alignSelf: "flex-start",
    backgroundColor: T.goldGhost,
    borderWidth: 1,
    borderColor: T.goldBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },
  topChipText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: T.goldDeep,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: T.ink,
    lineHeight: 46,
    letterSpacing: -1.2,
  },
  heroSub: {
    marginTop: 5,
    fontSize: 12,
    color: T.soft,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  listCard: {
    marginHorizontal: 20,
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: T.line,
    overflow: "hidden",
    shadowColor: T.ink,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  connectionsFeed: {
    width: "100%",
    backgroundColor: T.bg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: T.line,
  },
  savedFeed: {
    width: "100%",
    backgroundColor: T.bg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: T.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.lineLight,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  connectionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.lineLight,
  },
  savedPostCard: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  savedPostCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.lineLight,
  },
  savedPostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  savedAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  savedCatTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: T.bluePale,
    borderWidth: 1,
    borderColor: T.blueLight,
  },
  savedCatText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: T.blue,
  },
  savedPostTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: T.ink,
    lineHeight: 26,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  savedPostBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#3d3d3d",
    marginBottom: 10,
    fontWeight: "400",
  },
  savedPostImgWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.surfaceAlt,
  },
  savedPostImg: {
    width: "100%",
    height: "100%",
  },
  savedActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.lineLight,
  },
  savedActionsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedByText: {
    fontSize: 12,
    fontWeight: "700",
    color: T.soft,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.line,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.line,
    backgroundColor: T.bluePale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 12,
    fontWeight: "900",
    color: T.blue,
    letterSpacing: 0.3,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: T.ink,
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: T.soft,
    marginTop: 1,
  },
  rowSub: {
    fontSize: 11,
    color: T.mute,
    marginTop: 2,
  },
  postTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  kindBadge: {
    backgroundColor: T.bluePale,
    borderWidth: 1,
    borderColor: T.blueLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  kindBadgeMeetup: {
    backgroundColor: T.goldGhost,
    borderColor: T.goldBorder,
  },
  kindBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: T.blue,
    letterSpacing: 0.8,
  },
  kindBadgeTextMeetup: {
    color: T.goldDeep,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  ghostBtn: {
    borderWidth: 1.2,
    borderColor: T.line,
    backgroundColor: T.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ghostBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: T.ink,
  },
  dangerBtn: {
    borderWidth: 1.2,
    borderColor: "#f1c0c0",
    backgroundColor: T.coralPale,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dangerBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: T.coral,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 22,
    color: T.soft,
    fontSize: 13,
    fontWeight: "600",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30,20,10,0.45)",
  },
  sheetOuter: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetInner: {
    maxHeight: "88%",
    backgroundColor: T.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#3A8FB5",
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
    fontSize: 20,
    fontWeight: "800",
    color: T.ink,
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontSize: 13,
    color: T.soft,
    marginTop: 4,
    lineHeight: 19,
    maxWidth: 270,
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
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: T.soft,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  fieldInput: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: T.surfaceAlt,
    borderWidth: 1.5,
    borderColor: T.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: T.ink,
    fontWeight: "500",
  },
  fieldTextArea: {
    minHeight: 120,
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.surfaceAlt,
  },
  categoryChipActive: {
    borderColor: T.blueLight,
    backgroundColor: T.bluePale,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: T.soft,
  },
  categoryChipTextActive: {
    color: T.blue,
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: T.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: T.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: T.white,
    letterSpacing: 0.2,
  },
});
