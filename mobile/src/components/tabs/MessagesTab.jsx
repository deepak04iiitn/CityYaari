import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../store/AuthContext";
import { useSnackbar } from "../../store/SnackbarContext";
import { getMyConnections } from "../../services/users/userService";
import { getUnreadNotificationsCount } from "../../services/notifications/notificationService";
import AppTopHeader from "../AppTopHeader";
import {
  ensureChatSocket,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendEncryptedMessageHttp,
  setChatHandlers,
} from "../../services/chat/chatService";
import { decryptMessageText, encryptMessageText } from "../../services/chat/chatCrypto";
import { BAR_HEIGHT, FAB_LIFT } from "../../screens/MainTabs";
import { useUnreadMsg } from "../../store/UnreadMsgContext";

const COLORS = {
  ink: "#0a0a0a",
  inkLight: "#3d3d3d",
  inkMuted: "#888888",
  paper: "#f5f2ed",
  paperDark: "#ede9e2",
  accent: "#e8380d",
  accentBlue: "#004ac6",
  accentMint: "#007a5e",
  white: "#ffffff",
  cardBg: "#ffffff",
  border: "#e0dbd4",
  tagBlue: "#eef2ff",
};

const TAB_BAR_TOTAL = BAR_HEIGHT + FAB_LIFT;

const toRelative = (dateString) => {
  if (!dateString) return "";
  const diff = Math.max(1, Date.now() - new Date(dateString).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

function Avatar({ uri, name, size = 48 }) {
  const initials = (name || "U")
    .split(" ")
    .map((p) => p?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[st.avatarImg, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[st.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[st.avatarInitials, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export default function MessagesTab({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { refreshUnreadMsgCount } = useUnreadMsg();

  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const connectionsRef = useRef([]);
  const conversationsRef = useRef([]);
  const activePeerRef = useRef(null);
  const flatListRef = useRef(null);
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = (e) => setKbHeight(e.endCoordinates.height);
    const onHide = () => setKbHeight(0);
    const s1 = Keyboard.addListener(showEvent, onShow);
    const s2 = Keyboard.addListener(hideEvent, onHide);
    return () => { s1.remove(); s2.remove(); };
  }, []);

  useEffect(() => { connectionsRef.current = connections; }, [connections]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
  useEffect(() => { activePeerRef.current = activePeer; }, [activePeer]);

  const decrypt = useCallback(
    (ct, iv, peerId) => decryptMessageText(ct, iv, user?._id, peerId),
    [user?._id]
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoadingList(true);
      const [convRows, connRows] = await Promise.all([
        fetchConversations(),
        getMyConnections(),
      ]);
      setConversations(
        (convRows || []).map((item) => ({
          ...item,
          preview:
            decrypt(
              item?.lastMessage?.ciphertext || "",
              item?.lastMessage?.iv || "",
              item?.peer?._id
            ) || "Encrypted message",
        }))
      );
      setConnections(connRows?.connections || []);
    } catch (_e) {
      showSnackbar("Could not load chats", "error");
    } finally {
      setLoadingList(false);
    }
  }, [decrypt, showSnackbar]);

  const PAGE_SIZE = 50;

  const loadMessages = useCallback(
    async (peer) => {
      if (!peer?._id || !user?._id) return;
      try {
        setLoadingMessages(true);
        setHasMore(true);
        const rows = await fetchMessages(peer._id, { limit: PAGE_SIZE });
        setMessages(
          (rows || []).map((msg) => ({
            ...msg,
            text: decrypt(msg.ciphertext, msg.iv, peer._id),
          }))
        );
        if ((rows || []).length < PAGE_SIZE) setHasMore(false);
        markConversationRead(peer._id).catch(() => {});
      } catch (_e) {
        showSnackbar("Could not load chat", "error");
      } finally {
        setLoadingMessages(false);
      }
    },
    [decrypt, showSnackbar, user?._id]
  );

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMore || !activePeerRef.current?._id) return;
    const oldest = messages[0];
    if (!oldest?.createdAt) return;

    setLoadingOlder(true);
    try {
      const peerId = activePeerRef.current._id;
      const rows = await fetchMessages(peerId, { before: oldest.createdAt, limit: PAGE_SIZE });
      if ((rows || []).length < PAGE_SIZE) setHasMore(false);
      if (rows?.length) {
        const decrypted = rows.map((msg) => ({
          ...msg,
          text: decrypt(msg.ciphertext, msg.iv, peerId),
        }));
        setMessages((prev) => [...decrypted, ...prev]);
      }
    } catch (_e) {
      /* silently fail for pagination */
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMore, messages, decrypt]);

  const upsertConversation = useCallback(
    (msg, peer) => {
      setConversations((prev) => {
        const existing = prev.find((c) => c.conversationKey === msg.conversationKey);
        const isForMe = String(msg.receiver) === String(user?._id);
        const isOpen = String(activePeerRef.current?._id || "") === String(peer?._id || "");

        const next = {
          conversationKey: msg.conversationKey,
          peer,
          lastMessage: msg,
          unreadCount: isForMe && !isOpen ? (existing?.unreadCount || 0) + 1 : existing?.unreadCount || 0,
          preview: decrypt(msg.ciphertext || "", msg.iv || "", peer?._id) || "Encrypted message",
        };
        return [next, ...prev.filter((c) => c.conversationKey !== msg.conversationKey)];
      });
    },
    [decrypt, user?._id]
  );

  useEffect(() => {
    if (!token || !user?._id) return;

    ensureChatSocket(token);

    setChatHandlers(
      (payload) => {
        const msg = payload?.message;
        if (!msg?._id) return;

        const senderId = String(msg.sender);
        const receiverId = String(msg.receiver);
        const me = String(user._id);
        const peerId = senderId === me ? receiverId : senderId;

        const peer =
          connectionsRef.current.find((c) => String(c._id) === peerId) ||
          conversationsRef.current.find((c) => String(c.peer?._id) === peerId)?.peer;

        if (peer?._id) upsertConversation(msg, peer);

        if (activePeerRef.current?._id && String(activePeerRef.current._id) === peerId) {
          setMessages((prev) => {
            if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
            return [
              ...prev,
              { ...msg, text: decrypt(msg.ciphertext, msg.iv, peerId) },
            ];
          });

          if (receiverId === me) {
            markConversationRead(peerId).then(() => refreshUnreadMsgCount()).catch(() => {});
          }
        } else if (receiverId === me) {
          refreshUnreadMsgCount();
        }
      },
      ({ conversationKey }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.conversationKey === conversationKey && String(m.sender) === String(user?._id)
              ? { ...m, readAt: new Date().toISOString() }
              : m
          )
        );
      }
    );
  }, [token, user?._id, decrypt, upsertConversation, refreshUnreadMsgCount]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
      refreshUnreadMsgCount();
      let alive = true;
      (async () => {
        const r = await getUnreadNotificationsCount();
        if (alive && r.success) setUnreadNotifications(r.count || 0);
      })();
      return () => { alive = false; };
    }, [loadConversations, refreshUnreadMsgCount])
  );

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: activePeer ? { display: "none" } : undefined,
    });
  }, [activePeer, navigation]);

  const openChat = async (peer) => {
    setActivePeer(peer);
    setConversations((prev) =>
      prev.map((c) =>
        String(c.peer?._id) === String(peer?._id) ? { ...c, unreadCount: 0 } : c
      )
    );
    await loadMessages(peer);
    refreshUnreadMsgCount();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
  };

  const sendNow = async () => {
    const text = input.trim();
    if (!text) return;
    if (!activePeer?._id) return;
    if (!user?._id) return;

    const peerId = activePeer._id;
    setInput("");

    let encrypted;
    try {
      encrypted = encryptMessageText(text, user._id, peerId);
    } catch (encErr) {
      showSnackbar("Encryption error", "error");
      return;
    }

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: user._id,
      receiver: peerId,
      conversationKey: [String(user._id), String(peerId)].sort().join(":"),
      text,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);

    try {
      const saved = await sendEncryptedMessageHttp(peerId, encrypted);
      if (saved?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...saved, text } : m))
        );
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      showSnackbar("Message failed to send", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const n = c.peer?.fullName?.toLowerCase() || "";
      const u = c.peer?.username?.toLowerCase() || "";
      return n.includes(q) || u.includes(q);
    });
  }, [conversations, search]);

  const headerBlock = (
    <AppTopHeader
      onBackPress={() => {
        if (activePeer) { setActivePeer(null); return; }
        if (navigation.canGoBack()) { navigation.goBack(); return; }
        navigation.navigate("Home");
      }}
      onNotificationPress={() => navigation.navigate("Notifications")}
      backDisabled={!activePeer && !navigation.canGoBack()}
      notificationCount={unreadNotifications}
    />
  );

  /* ─── CHAT VIEW ─── */
  if (activePeer?._id) {
    return (
      <View style={st.root}>
        <StatusBar style="dark" />
        <View style={[st.chatHeader, { paddingTop: insets.top + 14 }]}>
          <Pressable onPress={() => setActivePeer(null)} style={st.chatBackArrow}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.ink} />
          </Pressable>
          <Avatar uri={activePeer.profileImageUri} name={activePeer.fullName} size={42} />
          <View style={st.chatHeaderInfo}>
            <Text style={st.chatHeaderName} numberOfLines={1}>
              {activePeer.fullName || activePeer.username}
            </Text>
            <View style={st.chatEncRow}>
              <MaterialIcons name="lock" size={11} color={COLORS.accentMint} />
              <Text style={st.chatEncText}>End-to-end encrypted</Text>
            </View>
          </View>
        </View>

        <View style={[st.chatBody, kbHeight > 0 && { paddingBottom: kbHeight + 16 }]}>
          <View style={st.watermarkWrap} pointerEvents="none">
            <View style={st.wmBadge}>
              <Text style={st.wmMain}>
                <Text style={st.wmCity}>ban</Text>
                <Text style={st.wmYaari}>dhuu</Text>
              </Text>
              <View style={st.wmLineRow}>
                <View style={st.wmLineLeft} />
                <View style={st.wmLineDot} />
                <View style={st.wmLineRight} />
              </View>
            </View>
          </View>

          {loadingMessages ? (
            <View style={st.chatLoading}>
              <ActivityIndicator color={COLORS.accentBlue} size="large" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => String(item._id)}
              style={st.chatBody}
              contentContainerStyle={st.bubbleList}
              keyboardShouldPersistTaps="handled"
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              onScroll={({ nativeEvent }) => {
                if (nativeEvent.contentOffset.y < 80 && hasMore && !loadingOlder) {
                  loadOlderMessages();
                }
              }}
              scrollEventThrottle={200}
              ListHeaderComponent={
                loadingOlder ? (
                  <ActivityIndicator style={st.olderLoader} color={COLORS.accentBlue} size="small" />
                ) : null
              }
              ListEmptyComponent={
                <View style={st.chatEmptyWrap}>
                  <MaterialIcons name="chat-bubble-outline" size={32} color={COLORS.border} />
                  <Text style={st.chatEmptyText}>Say hello to start the conversation</Text>
                </View>
              }
              renderItem={({ item }) => {
                const mine = String(item.sender) === String(user?._id);
                return (
                  <View style={[st.bubbleRow, mine ? st.bubbleRowMine : st.bubbleRowPeer]}>
                    <View style={[st.bubble, mine ? st.bubbleMine : st.bubblePeer]}>
                      <Text style={[st.bubbleText, mine && st.bubbleTextMine]}>
                        {item.text || "Encrypted message"}
                      </Text>
                      <Text style={[st.bubbleMeta, mine && st.bubbleMetaMine]}>
                        {toRelative(item.createdAt)}
                        {mine && (item.readAt ? "  ✓✓" : "  ✓")}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          <View style={[st.composerWrap, { paddingBottom: kbHeight > 0 ? 4 : Math.max(insets.bottom, 8) }]}>
            <View style={st.composer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.inkMuted}
                style={st.composerInput}
                multiline
              />
              <Pressable
                style={[st.sendBtn, !input.trim() && st.sendBtnDisabled]}
                onPress={sendNow}
                disabled={!input.trim()}
              >
                <MaterialIcons name="send" size={19} color={COLORS.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  /* ─── CONVERSATION LIST VIEW ─── */
  return (
    <View style={st.root}>
      <StatusBar style="dark" />
      {headerBlock}

      <ScrollView
        style={st.scrollBody}
        contentContainerStyle={{ paddingBottom: TAB_BAR_TOTAL + insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── MASTHEAD ── */}
        <View style={st.masthead}>
          <View style={st.mastheadTop}>
            <View style={st.liveChip}>
              <View style={st.liveDot} />
              <Text style={st.liveLabel}>ENCRYPTED CHATS</Text>
            </View>
          </View>
          <Text style={st.heroTitle}>
            <Text style={st.heroTitleLight}>Your </Text>
            Messages<Text style={{ color: COLORS.accent }}>.</Text>
          </Text>
        </View>

        {/* ── SEARCH ── */}
        <View style={st.searchRow}>
          <View style={st.searchBox}>
            <MaterialIcons name="search" size={20} color={COLORS.inkMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search conversations..."
              placeholderTextColor={COLORS.inkMuted}
              style={st.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <MaterialIcons name="close" size={18} color={COLORS.inkMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── QUICK CONNECT ── */}
        {connections.length > 0 && (
          <View style={st.connectionsSection}>
            <Text style={st.sectionLabel}>QUICK START</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={st.connectionsScroll}
            >
              {connections.map((c) => (
                <Pressable key={c._id} style={st.connChip} onPress={() => openChat(c)}>
                  <Avatar uri={c.profileImageUri} name={c.fullName} size={42} />
                  <Text style={st.connChipName} numberOfLines={1}>
                    {c.fullName?.split(" ")?.[0] || c.username}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── DIVIDER ── */}
        <View style={st.hrule} />

        {/* ── CONVERSATION LIST ── */}
        <View style={st.convSection}>
          <Text style={st.sectionLabel}>RECENT CHATS</Text>
        </View>

        {loadingList ? (
          <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.accentBlue} size="large" />
        ) : filtered.length === 0 ? (
          <View style={st.emptyCard}>
            <View style={st.emptyIconWrap}>
              <MaterialIcons name="chat-bubble-outline" size={28} color={COLORS.accentBlue} />
            </View>
            <Text style={st.emptyTitle}>No messages yet</Text>
            <Text style={st.emptyBody}>
              Connect with people in your city,{"\n"}then start your first encrypted chat.
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <React.Fragment key={item.conversationKey}>
              <Pressable
                style={st.convRow}
                onPress={() => openChat(item.peer)}
              >
                <View style={st.convAvatarWrap}>
                  <Avatar uri={item.peer?.profileImageUri} name={item.peer?.fullName} size={50} />
                  {!!item.unreadCount && <View style={st.convOnline} />}
                </View>
                <View style={st.convMid}>
                  <View style={st.convNameRow}>
                    <Text style={[st.convName, !!item.unreadCount && st.convNameUnread]} numberOfLines={1}>
                      {item.peer?.fullName || item.peer?.username}
                    </Text>
                    <Text style={[st.convTime, !!item.unreadCount && st.convTimeUnread]}>
                      {toRelative(item.lastMessage?.createdAt)}
                    </Text>
                  </View>
                  <View style={st.convPreviewRow}>
                    <Text style={[st.convPreview, !!item.unreadCount && st.convPreviewUnread]} numberOfLines={1}>
                      {item.preview || "Tap to chat"}
                    </Text>
                    {!!item.unreadCount && (
                      <View style={st.badge}>
                        <Text style={st.badgeText}>
                          {item.unreadCount > 9 ? "9+" : item.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
              {idx < filtered.length - 1 && <View style={st.convDivider} />}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  scrollBody: {
    flex: 1,
  },

  /* ── MASTHEAD (mirrors HomeTab) ── */
  masthead: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  mastheadTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentMint,
  },
  liveLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.ink,
    lineHeight: 38,
    letterSpacing: -1,
  },
  heroTitleLight: {
    fontWeight: "400",
    color: COLORS.inkMuted,
  },

  /* ── SEARCH (mirrors HomeTab) ── */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ink,
    padding: 0,
    fontWeight: "500",
  },

  /* ── QUICK START CONNECTIONS ── */
  connectionsSection: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    color: COLORS.inkMuted,
    marginBottom: 12,
  },
  connectionsScroll: {
    paddingRight: 20,
    gap: 12,
  },
  connChip: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: 82,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  connChipName: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.ink,
    textAlign: "center",
    letterSpacing: -0.2,
  },

  /* ── DIVIDER (mirrors HomeTab hrule) ── */
  hrule: {
    height: 1.5,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginVertical: 6,
  },

  /* ── CONV SECTION ── */
  convSection: {
    paddingTop: 14,
    paddingHorizontal: 20,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  convAvatarWrap: {
    position: "relative",
  },
  convOnline: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accentMint,
    borderWidth: 2.5,
    borderColor: COLORS.paper,
  },
  convMid: {
    flex: 1,
    marginLeft: 14,
  },
  convNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  convName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  convNameUnread: {
    fontWeight: "900",
  },
  convPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  convPreview: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.inkMuted,
    lineHeight: 18,
  },
  convPreviewUnread: {
    fontWeight: "700",
    color: COLORS.inkLight,
  },
  convTime: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.inkMuted,
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  convTimeUnread: {
    fontWeight: "800",
    color: COLORS.accentBlue,
  },
  convDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.5,
    marginLeft: 84,
    marginRight: 20,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  /* ── EMPTY STATE ── */
  emptyCard: {
    marginTop: 50,
    marginHorizontal: 30,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.tagBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.inkMuted,
    textAlign: "center",
    lineHeight: 20,
  },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.paperDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatBackArrow: {
    padding: 4,
    marginRight: 10,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.ink,
  },
  chatEncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  chatEncText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accentMint,
  },
  chatBody: {
    flex: 1,
  },
  watermarkWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  wmBadge: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  wmMain: {
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: 3,
    opacity: 0.08,
  },
  wmCity: {
    color: COLORS.ink,
    fontStyle: "normal",
  },
  wmYaari: {
    color: COLORS.accentBlue,
    fontStyle: "italic",
  },
  wmLineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  wmLineLeft: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.ink,
    opacity: 0.06,
  },
  wmLineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    opacity: 0.16,
  },
  wmLineRight: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.accentBlue,
    opacity: 0.08,
  },
  chatLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleList: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  olderLoader: {
    paddingVertical: 14,
    alignSelf: "center",
  },
  chatEmptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatEmptyText: {
    color: COLORS.inkMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  bubbleRow: {
    marginBottom: 6,
    maxWidth: "82%",
  },
  bubbleRowMine: {
    alignSelf: "flex-end",
  },
  bubbleRowPeer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: COLORS.accentBlue,
    borderBottomRightRadius: 6,
  },
  bubblePeer: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    color: COLORS.ink,
  },
  bubbleTextMine: {
    color: COLORS.white,
  },
  bubbleMeta: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.inkMuted,
    textAlign: "right",
  },
  bubbleMetaMine: {
    color: "rgba(255,255,255,0.7)",
  },
  composerWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    backgroundColor: COLORS.paper,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 36,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.ink,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  avatarImg: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.tagBlue,
    borderWidth: 1.5,
    borderColor: "#cfe0ff",
  },
  avatarInitials: {
    fontWeight: "900",
    color: COLORS.accentBlue,
  },
});
