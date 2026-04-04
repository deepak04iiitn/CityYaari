import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  fetchComments,
  addComment,
  replyToComment,
  toggleLikeComment,
  toggleDislikeComment,
  deleteComment,
  editComment,
} from "../../services/posts/commentService";
import { useAuth } from "../../store/AuthContext";
import { useSnackbar } from "../../store/SnackbarContext";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  bg0: "#080a0d",       // deepest backdrop overlay base
  bg1: "#0f1117",       // sheet floor
  bg2: "#161b24",       // card / input surface
  bg3: "#1e2535",       // elevated element
  bg4: "#252d3d",       // hover state
  // Borders
  b1:  "#1d2535",       // hairline
  b2:  "#263047",       // light border
  b3:  "#2e3a52",       // emphasis border
  // Text
  t1:  "#eef0f4",       // primary
  t2:  "#8b95a8",       // secondary
  t3:  "#4d5769",       // muted/placeholder
  // Accents — no gradients, pure flat
  red:   "#f03e1b",
  redBg: "#1a0b07",
  redBd: "#3d1208",
  blu:   "#3b82f6",
  bluBg: "#07111f",
  bluBd: "#0e2447",
  tel:   "#14b8a6",
  telBg: "#051210",
  telBd: "#0d3530",
  gld:   "#f59e0b",
  gldBg: "#160d01",
  gldBd: "#3d2802",
  // Handle
  hdl: "#1f2736",
};

// Avatar hues keyed by first char code
const AVATAR_COLORS = [
  [T.red, T.redBg],
  [T.blu, T.bluBg],
  [T.tel, T.telBg],
  [T.gld, T.gldBg],
  ["#a855f7", "#1a0a2e"],
  ["#ec4899", "#1f0714"],
];

const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 65) % AVATAR_COLORS.length];

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const relTime = (d) => {
  if (!d) return "now";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
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
  const v = useMemo(() => new Animated.Value(60), []);
  useEffect(() => {
    Animated.spring(v, {
      toValue: trigger ? 0 : 60,
      useNativeDriver: true,
      tension: 72,
      friction: 12,
    }).start();
  }, [trigger]);
  return v;
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ uri, name, size = 36 }) {
  const [err, setErr] = useState(false);
  const [accent, bg] = avatarColor(name);
  const r = size / 2;
  if (uri && !err) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: r, borderWidth: 1.5, borderColor: T.b2 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: r,
      backgroundColor: bg, borderWidth: 1.5, borderColor: accent + "55",
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: "800", color: accent, letterSpacing: 0.5 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

// ─── CHIP ─────────────────────────────────────────────────────────────────────
function Chip({ icon, label, count, active, accentColor, accentBg, accentBd, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: accentBg, borderColor: accentBd },
      ]}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={13}
          color={active ? accentColor : T.t3}
        />
      )}
      {count !== undefined && count > 0 && (
        <Text style={[styles.chipCount, active && { color: accentColor }]}>{count}</Text>
      )}
      {label && (
        <Text style={[styles.chipLabel, active && { color: accentColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

// ─── COMMENT ROW ─────────────────────────────────────────────────────────────
function CommentRow({ item, user, onLike, onDislike, onReply, onEdit, onDelete, onExpand, onCollapse }) {
  const [pressed, setPressed] = useState(false);

  if (item.isDivider) return <View style={styles.divider} />;

  if (item.isViewMore) {
    return (
      <Pressable
        style={styles.threadCtrl}
        onPress={() => onExpand(item.parentId, item.remainingCount)}
      >
        <View style={styles.threadCtrlDot} />
        <View style={styles.threadCtrlLine} />
        <Text style={styles.threadCtrlText}>
          {Math.min(item.remainingCount, 5)} more {item.remainingCount === 1 ? "reply" : "replies"}
        </Text>
      </Pressable>
    );
  }

  if (item.isHideReplies) {
    return (
      <Pressable
        style={styles.threadCtrl}
        onPress={() => onCollapse(item.parentId)}
      >
        <View style={styles.threadCtrlDot} />
        <View style={styles.threadCtrlLine} />
        <Text style={styles.threadCtrlText}>Hide replies</Text>
      </Pressable>
    );
  }

  const isReply = !!item.parentComment;
  const isOwner = user?._id && item.user?._id === user._id;
  const editable = isOwner && Date.now() - new Date(item.createdAt).getTime() <= 600_000;
  const hasLiked = item.likes?.includes(user?._id);
  const hasDisliked = item.dislikes?.includes(user?._id);
  const avatarSize = isReply ? 28 : 36;

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.commentRow,
        isReply && styles.commentRowReply,
        pressed && styles.commentRowPressed,
      ]}
    >
      {/* Left column: avatar + thread line */}
      <View style={styles.commentLeft}>
        <Avatar uri={item.user?.profileImageUri} name={item.user?.fullName} size={avatarSize} />
        {/* Vertical thread connector */}
        {!isReply && (item.replyCount > 0) && (
          <View style={styles.threadConnector} />
        )}
      </View>

      {/* Right column */}
      <View style={styles.commentRight}>
        {/* Header */}
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor} numberOfLines={1}>
            {item.user?.fullName || "User"}
          </Text>
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>you</Text>
            </View>
          )}
          <Text style={styles.commentTime}>{relTime(item.createdAt)}</Text>
        </View>

        {/* Body */}
        <Text style={styles.commentText}>{item.content}</Text>

        {/* Actions */}
        <View style={styles.chipRow}>
          <Chip
            icon={hasLiked ? "thumb-up" : "thumb-up-off-alt"}
            count={item.likes?.length || 0}
            active={hasLiked}
            accentColor={T.red}
            accentBg={T.redBg}
            accentBd={T.redBd}
            onPress={() => onLike(item._id)}
          />
          <Chip
            icon={hasDisliked ? "thumb-down" : "thumb-down-off-alt"}
            count={item.dislikes?.length || 0}
            active={hasDisliked}
            accentColor={T.blu}
            accentBg={T.bluBg}
            accentBd={T.bluBd}
            onPress={() => onDislike(item._id)}
          />
          <Chip
            label="Reply"
            active={false}
            accentColor={T.tel}
            accentBg={T.telBg}
            accentBd={T.telBd}
            onPress={() => onReply(item)}
          />
          {editable && (
            <Chip
              label="Edit"
              active={false}
              accentColor={T.gld}
              accentBg={T.gldBg}
              accentBd={T.gldBd}
              onPress={() => onEdit(item)}
            />
          )}
          {isOwner && (
            <Pressable style={styles.deleteBtn} onPress={() => onDelete(item._id)}>
              <MaterialIcons name="delete-outline" size={14} color={T.t3} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function CommentsSheet({ visible, postId, onClose }) {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const fade = useFadeIn(visible);
  const slide = useSlideUp(visible);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [expanded, setExpanded] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    } else {
      setComments([]); setText(""); setReplyingTo(null);
      setEditingComment(null); setExpanded({});
    }
  }, [visible, postId]);

  const loadComments = async () => {
    setLoading(true);
    const res = await fetchComments(postId);
    if (res.success) setComments(res.comments);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    if (editingComment) {
      const res = await editComment(editingComment.id, text.trim());
      if (res.success) {
        setComments((p) => p.map((c) => c._id === editingComment.id ? res.comment : c));
        setText(""); setEditingComment(null);
        showSnackbar("Comment updated.", "success");
      } else showSnackbar(res.message || "Unable to edit comment", "error");
    } else if (replyingTo) {
      const res = await replyToComment(replyingTo.id, text.trim());
      if (res.success) {
        loadComments(); setText(""); setReplyingTo(null);
        showSnackbar("Reply posted.", "success");
      } else showSnackbar(res.message || "Unable to reply", "error");
    } else {
      const res = await addComment(postId, text.trim());
      if (res.success) {
        setComments((p) => [...p, res.comment]); setText("");
        showSnackbar("Comment added.", "success");
      } else showSnackbar(res.message || "Unable to add comment", "error");
    }
    setSubmitting(false);
  };

  const optimisticToggle = (id, field, opposite) => {
    const uid = user?._id;
    setComments((p) => p.map((c) => {
      if (c._id !== id) return c;
      const has = c[field].includes(uid);
      return {
        ...c,
        [field]: has ? c[field].filter((x) => x !== uid) : [...c[field], uid],
        [opposite]: c[opposite].filter((x) => x !== uid),
      };
    }));
  };

  const handleLike = async (id) => { optimisticToggle(id, "likes", "dislikes"); await toggleLikeComment(id); };
  const handleDislike = async (id) => { optimisticToggle(id, "dislikes", "likes"); await toggleDislikeComment(id); };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          setComments((p) => p.filter((c) => c._id !== id && c.parentComment !== id));
          const result = await deleteComment(id);
          if (!result.success) {
            showSnackbar(result.message || "Unable to delete comment", "error");
            loadComments();
            return;
          }
          showSnackbar("Comment deleted.", "success");
        },
      },
    ]);
  };

  const handleEdit = (c) => {
    setEditingComment({ id: c._id }); setReplyingTo(null);
    setText(c.content); inputRef.current?.focus();
  };

  const handleReply = (c) => {
    setReplyingTo({ id: c._id, username: c.user?.username || "user" });
    setEditingComment(null); setText(""); inputRef.current?.focus();
  };

  const cancelAction = () => { setReplyingTo(null); setEditingComment(null); setText(""); };

  const handleExpand = (pid, rem) =>
    setExpanded((p) => ({ ...p, [pid]: (p[pid] || 0) + Math.min(rem, 5) }));
  const handleCollapse = (pid) =>
    setExpanded((p) => ({ ...p, [pid]: 0 }));

  const arranged = useMemo(() => {
    const parents = comments.filter((c) => !c.parentComment);
    const children = comments.filter((c) => !!c.parentComment);
    const out = [];
    parents.forEach((p, i) => {
      if (i > 0) out.push({ isDivider: true, _id: `div-${p._id}` });
      const pc = children.filter((c) => c.parentComment === p._id);
      out.push({ ...p, replyCount: pc.length });
      const shown = expanded[p._id] || 0;
      out.push(...pc.slice(0, shown));
      const rem = pc.length - shown;
      if (rem > 0) out.push({ isViewMore: true, _id: `vm-${p._id}`, parentId: p._id, remainingCount: rem });
      if (shown > 0) out.push({ isHideReplies: true, _id: `hr-${p._id}`, parentId: p._id });
    });
    return out;
  }, [comments, expanded]);

  const parentCount = comments.filter((c) => !c.parentComment).length;
  const replyCount = comments.filter((c) => !!c.parentComment).length;

  // Context banner config
  const banner = editingComment
    ? { color: T.gld, bg: T.gldBg, bd: T.gldBd, label: "EDITING", value: "your comment" }
    : replyingTo
    ? { color: T.tel, bg: T.telBg, bd: T.telBd, label: "REPLYING TO", value: `@${replyingTo.username}` }
    : null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Dim overlay */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Comments</Text>
              <View style={styles.statPill}>
                <Text style={styles.statPillText}>{parentCount}</Text>
              </View>
              {replyCount > 0 && (
                <View style={[styles.statPill, { borderColor: T.b3 }]}>
                  <Text style={[styles.statPillText, { color: T.t2 }]}>{replyCount} replies</Text>
                </View>
              )}
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={T.t2} />
            </Pressable>
          </View>

          {/* ── BODY ── */}
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={T.red} size="large" />
              <Text style={styles.loadingLabel}>Fetching comments…</Text>
            </View>
          ) : (
            <FlatList
              data={arranged}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <CommentRow
                  item={item}
                  user={user}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onExpand={handleExpand}
                  onCollapse={handleCollapse}
                />
              )}
              contentContainerStyle={styles.listPad}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <View style={styles.emptyIconWrap}>
                    <MaterialIcons name="chat-bubble-outline" size={28} color={T.t3} />
                  </View>
                  <Text style={styles.emptyTitle}>No comments yet</Text>
                  <Text style={styles.emptyBody}>Be the first to say something</Text>
                </View>
              }
            />
          )}

          {/* ── INPUT AREA ── */}
          <View style={styles.inputArea}>
            {/* Context banner */}
            {banner && (
              <View style={[styles.banner, { backgroundColor: banner.bg, borderColor: banner.bd }]}>
                <View style={[styles.bannerAccent, { backgroundColor: banner.color }]} />
                <View style={styles.bannerContent}>
                  <Text style={[styles.bannerLabel, { color: banner.color }]}>{banner.label}</Text>
                  <Text style={styles.bannerValue}>{banner.value}</Text>
                </View>
                <Pressable onPress={cancelAction} hitSlop={8}>
                  <MaterialIcons name="close" size={15} color={T.t2} />
                </Pressable>
              </View>
            )}

            {/* Row */}
            <View style={styles.inputRow}>
              <Avatar uri={user?.profileImageUri} name={user?.fullName} size={32} />

              <View style={styles.inputBox}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={replyingTo ? `Reply to @${replyingTo.username}…` : "Add a comment…"}
                  placeholderTextColor={T.t3}
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={500}
                />
              </View>

              <Pressable
                style={[styles.sendBtn, !text.trim() && styles.sendBtnOff]}
                onPress={handleSubmit}
                disabled={!text.trim() || submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <MaterialIcons name={editingComment ? "check" : "arrow-upward"} size={17} color="#fff" />
                }
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  outer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: "88%",
    borderWidth: 0.5,
    borderBottomWidth: 0,
    borderColor: T.b3,
    flexDirection: "column",
  },
  dragHandle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.hdl,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: T.b1,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: T.t1,
    letterSpacing: -0.3,
  },
  statPill: {
    borderWidth: 0.5,
    borderColor: T.b2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: T.t3,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.bg2,
    borderWidth: 0.5,
    borderColor: T.b2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingLabel: {
    fontSize: 13,
    color: T.t3,
    fontWeight: "500",
  },

  // List
  listPad: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },

  // Empty
  empty: {
    alignItems: "center",
    paddingTop: 64,
    gap: 8,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.bg2,
    borderWidth: 0.5,
    borderColor: T.b2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: T.t2,
  },
  emptyBody: {
    fontSize: 13,
    color: T.t3,
  },

  // Divider
  divider: {
    height: 0.5,
    backgroundColor: T.b1,
    marginVertical: 14,
  },

  // Thread controls
  threadCtrl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 50,
    marginTop: -6,
    marginBottom: 14,
    paddingVertical: 6,
  },
  threadCtrlDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.b3,
  },
  threadCtrlLine: {
    width: 14,
    height: 0.5,
    backgroundColor: T.b3,
  },
  threadCtrlText: {
    fontSize: 12,
    fontWeight: "600",
    color: T.blu,
    letterSpacing: 0.1,
  },

  // Comment row
  commentRow: {
    flexDirection: "row",
    marginBottom: 18,
    gap: 10,
    borderRadius: 14,
    padding: 2,
  },
  commentRowReply: {
    marginLeft: 22,
  },
  commentRowPressed: {
    backgroundColor: T.bg2,
  },
  commentLeft: {
    alignItems: "center",
    gap: 4,
  },
  threadConnector: {
    flex: 1,
    width: 1,
    backgroundColor: T.b2,
    marginTop: 4,
    minHeight: 10,
  },
  commentRight: {
    flex: 1,
    paddingTop: 1,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: T.t1,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  ownerBadge: {
    backgroundColor: T.redBg,
    borderWidth: 0.5,
    borderColor: T.redBd,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: T.red,
    letterSpacing: 0.8,
  },
  commentTime: {
    fontSize: 11,
    color: T.t3,
    fontWeight: "400",
    marginLeft: "auto",
  },
  commentText: {
    fontSize: 14,
    color: T.t2,
    lineHeight: 21,
    marginBottom: 9,
    fontWeight: "400",
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: T.bg2,
    borderWidth: 0.5,
    borderColor: T.b2,
  },
  chipCount: {
    fontSize: 11,
    fontWeight: "600",
    color: T.t3,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.t3,
    letterSpacing: 0.1,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: T.bg2,
    borderWidth: 0.5,
    borderColor: T.b2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Input area
  inputArea: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 36 : 14,
    borderTopWidth: 0.5,
    borderTopColor: T.b1,
    backgroundColor: T.bg1,
    gap: 8,
  },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 0.5,
    overflow: "hidden",
    gap: 0,
  },
  bannerAccent: {
    width: 2.5,
    alignSelf: "stretch",
  },
  bannerContent: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
    gap: 1,
  },
  bannerLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  bannerValue: {
    fontSize: 12,
    fontWeight: "600",
    color: T.t2,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputBox: {
    flex: 1,
    backgroundColor: T.bg2,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: T.b3,
    paddingHorizontal: 13,
    paddingVertical: 9,
    minHeight: 42,
    maxHeight: 108,
  },
  input: {
    fontSize: 14,
    color: T.t1,
    lineHeight: 20,
    padding: 0,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: T.red,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnOff: {
    backgroundColor: T.bg3,
  },
});