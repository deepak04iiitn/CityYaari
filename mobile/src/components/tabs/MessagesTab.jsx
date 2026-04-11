import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
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
  setChatHandlers,
  clearConversationMessages,
  getChatSocket,
  sendMessageViaSocket,
  emitReadReceipt,
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

const formatLastSeen = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return `last seen today at ${timeStr}`;
  if (target.getTime() === yesterday.getTime()) return `last seen yesterday at ${timeStr}`;

  const daysDiff = Math.floor((today - target) / 86400000);
  if (daysDiff < 7) {
    const dayName = date.toLocaleDateString([], { weekday: "long" });
    return `last seen ${dayName} at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  return `last seen ${dateStr} at ${timeStr}`;
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

const SwipeReplyIcon = React.memo(({ progress }) => {
  const scale = progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.2, 0.9, 1], extrapolate: "clamp" });
  const opacity = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.7, 1], extrapolate: "clamp" });
  return (
    <View style={st.swipeAction}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <MaterialIcons name="reply" size={22} color={COLORS.accentBlue} />
      </Animated.View>
    </View>
  );
});

const MessageBubble = React.memo(({ item, mine, user, activePeer, onReply, onJump, isHighlighted, decrypt }) => {
  const swiperRef = useRef(null);
  const isTemp = String(item._id).startsWith("tmp-");
  const isRead = !!item.readAt;

  const renderLeftActions = useCallback((progress) => (
    <SwipeReplyIcon progress={progress} />
  ), []);

  const handleSwipeOpen = useCallback((direction) => {
    if (direction === "left") {
      onReply(item);
      swiperRef.current?.close();
    }
  }, [onReply, item]);

  return (
    <Swipeable
      ref={swiperRef}
      renderLeftActions={renderLeftActions}
      onSwipeableWillOpen={handleSwipeOpen}
      friction={1.5}
      leftThreshold={35}
      overshootLeft={false}
      overshootFriction={8}
      enableTrackpadTwoFingerGesture
    >
      <View style={[st.bubbleRow, mine ? st.bubbleRowMine : st.bubbleRowPeer]}>
        <View 
          style={[
            st.bubble, 
            mine ? st.bubbleMine : st.bubblePeer,
            item.replyTo && st.bubbleWithReply,
            isHighlighted && { backgroundColor: COLORS.accentBlue + '22', borderWidth: 1, borderColor: COLORS.accentBlue }
          ]}
        >
          {item.replyTo && (
            <Pressable 
              style={[st.replyInBubble, mine ? st.replyInBubbleMine : st.replyInBubblePeer]}
              onPress={() => onJump(item.replyTo)}
            >
              <View style={st.replyIndicator} />
              <View style={st.replyContent}>
                <Text style={st.replyUser} numberOfLines={1}>
                  {String(item.sender) === String(user?._id) ? "You" : (activePeer?.fullName || "They")}
                </Text>
                <Text style={st.replyText} numberOfLines={2}>
                  {item.replySnippet ? decrypt(item.replySnippet, null, activePeer._id) : "Original message"}
                </Text>
              </View>
            </Pressable>
          )}
          <Text style={[st.bubbleText, mine && st.bubbleTextMine]}>
            {item.text || "Encrypted message"}
          </Text>
          <View style={st.bubbleMetaRow}>
            <Text style={[st.bubbleTime, mine && st.bubbleTimeMine]}>
              {toRelative(item.createdAt)}
            </Text>
            {mine && (
              <View style={st.statusIconWrap}>
                {isTemp ? (
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={12} 
                    color={COLORS.inkMuted} 
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={isRead ? "check-all" : "check"}
                    size={15}
                    color={isRead ? COLORS.accentBlue : COLORS.inkMuted}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Swipeable>
  );
});

const TypingDot = ({ delay }) => {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  return <Animated.View style={[st.typingDot, { opacity: anim }]} />;
};

const TypingBubble = React.memo(() => (
  <View style={[st.bubbleRow, st.bubbleRowPeer]}>
    <View style={[st.bubble, st.bubblePeer, st.typingBubble]}>
      <View style={st.typingDotsRow}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </View>
  </View>
));

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
  const [replyingTo, setReplyingTo] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const connectionsRef = useRef([]);
  const conversationsRef = useRef([]);
  const activePeerRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isLocalTypingRef = useRef(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (isPeerTyping) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [isPeerTyping]);

  useEffect(() => { connectionsRef.current = connections; }, [connections]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
  useEffect(() => { activePeerRef.current = activePeer; }, [activePeer]);

  const decrypt = useCallback(
    (ct, iv, peerId) => {
      if (!ct) return "";
      // Handle snippet format `iv:ciphertext`
      if (!iv && ct.includes(":")) {
        const [ivPart, ctPart] = ct.split(":");
        return decryptMessageText(ctPart, ivPart, user?._id, peerId);
      }
      return decryptMessageText(ct, iv, user?._id, peerId);
    },
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
        emitReadReceipt(peer._id);
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
        const clientTempId = payload?.clientTempId;
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
          const decryptedText = decrypt(msg.ciphertext, msg.iv, peerId);

          setMessages((prev) => {
            if (clientTempId && senderId === me) {
              const tempIdx = prev.findIndex((m) => String(m._id) === clientTempId);
              if (tempIdx !== -1) {
                const updated = [...prev];
                updated[tempIdx] = { ...msg, text: decryptedText };
                return updated;
              }
            }
            if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
            return [...prev, { ...msg, text: decryptedText }];
          });

          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);

          if (receiverId === me) {
            emitReadReceipt(peerId);
            refreshUnreadMsgCount();
          }
        } else if (receiverId === me) {
          refreshUnreadMsgCount();
        }
      },
      ({ conversationKey, byUserId }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.conversationKey === conversationKey && String(m.sender) === String(user?._id)
              ? { ...m, readAt: new Date().toISOString() }
              : m
          )
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationKey === conversationKey
              ? { ...c, lastMessage: { ...c.lastMessage, readAt: new Date().toISOString() } }
              : c
          )
        );
      },
      ({ userId, isOnline, lastSeenAt }) => {
        setConnections((prev) =>
          prev.map((c) => (String(c._id) === String(userId) ? { ...c, isOnline, lastSeenAt } : c))
        );
        setConversations((prev) =>
          prev.map((c) =>
            String(c.peer?._id) === String(userId)
              ? { ...c, peer: { ...c.peer, isOnline, lastSeenAt } }
              : c
          )
        );
        if (activePeerRef.current?._id && String(activePeerRef.current._id) === String(userId)) {
          setActivePeer((prev) => (prev ? { ...prev, isOnline, lastSeenAt } : prev));
        }
      },
      ({ userId, isTyping }) => {
        if (activePeerRef.current?._id && String(activePeerRef.current._id) === String(userId)) {
          setIsPeerTyping(isTyping);
        }
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
    setIsPeerTyping(false);
    setConversations((prev) =>
      prev.map((c) =>
        String(c.peer?._id) === String(peer?._id) ? { ...c, unreadCount: 0 } : c
      )
    );
    await loadMessages(peer);
    emitReadReceipt(peer._id);
    refreshUnreadMsgCount();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
  };

  const scrollToMessage = useCallback((msgId) => {
    const index = messages.findIndex((m) => String(m._id) === String(msgId));
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      setHighlightedMessageId(String(msgId));
      setTimeout(() => setHighlightedMessageId(null), 1500);
    } else {
      showSnackbar("Original message not found in recent history", "info");
    }
  }, [messages, showSnackbar]);

  const sendNow = async () => {
    const text = input.trim();
    if (!text) return;
    if (!activePeer?._id) return;
    if (!user?._id) return;

    const peerId = activePeer._id;
    setInput("");
    
    if (isLocalTypingRef.current) {
      isLocalTypingRef.current = false;
      getChatSocket()?.emit("chat:typing", { to: peerId, isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    let encrypted;
    try {
      encrypted = encryptMessageText(text, user._id, peerId);
    } catch (encErr) {
      showSnackbar("Encryption error", "error");
      return;
    }

    const replyData = replyingTo ? encryptMessageText(replyingTo.text.slice(0, 100), user._id, peerId) : null;
    const replySnippet = replyData ? `${replyData.iv}:${replyData.ciphertext}` : null;

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: user._id,
      receiver: peerId,
      conversationKey: [String(user._id), String(peerId)].sort().join(":"),
      text,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      replyTo: replyingTo?._id || null,
      replySnippet,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    setMessages((prev) => [...prev, optimistic]);
    setReplyingTo(null);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);

    try {
      await sendMessageViaSocket({
        to: peerId,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        clientTempId: tempId,
        replyTo: optimistic.replyTo,
        replySnippet: optimistic.replySnippet,
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      showSnackbar("Message failed to send", "error");
    }
  };

  const handleClearChat = async () => {
    if (!activePeer?._id) return;
    try {
      await clearConversationMessages(activePeer._id);
      setMessages([]);
      setShowClearModal(false);
      setShowChatMenu(false);
      showSnackbar("Chat cleared successfully", "success");
      loadConversations();
    } catch (err) {
      showSnackbar("Failed to clear chat", "error");
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
      <KeyboardAvoidingView
        style={st.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            {isPeerTyping ? (
              <Text style={[st.chatStatusText, { color: COLORS.accentMint, fontWeight: "900" }]}>typing...</Text>
            ) : activePeer.isOnline ? (
              <View style={st.chatEncRow}>
                <View style={st.onlineDotSmall} />
                <Text style={[st.chatStatusText, { color: COLORS.accentMint }]}>Online</Text>
              </View>
            ) : (
              <Text style={st.chatStatusText} numberOfLines={1}>
                {formatLastSeen(activePeer.lastSeenAt)}
              </Text>
            )}
          </View>
          <Pressable 
            onPress={() => setShowChatMenu(true)} 
            style={st.chatHeaderDots}
          >
            <MaterialIcons name="more-vert" size={24} color={COLORS.ink} />
          </Pressable>
        </View>

        {/* ── CHAT DROPDOWN MENU ── */}
        <Modal
          visible={showChatMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowChatMenu(false)}
        >
          <Pressable 
            style={st.menuOverlay} 
            onPress={() => setShowChatMenu(false)}
          >
            <View style={[st.menuContent, { top: insets.top + 60 }]}>
              <Pressable 
                style={st.menuItem} 
                onPress={() => {
                  setShowChatMenu(false);
                  setShowClearModal(true);
                }}
              >
                <MaterialIcons name="delete-outline" size={20} color={COLORS.accent} />
                <Text style={st.menuItemText}>Clear chat</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* ── CONFIRMATION MODAL ── */}
        <Modal
          visible={showClearModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowClearModal(false)}
        >
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <View style={st.modalHeader}>
                <View style={st.warningCircle}>
                  <MaterialIcons name="warning" size={32} color={COLORS.accent} />
                </View>
                <Text style={st.modalTitle}>Clear chat?</Text>
              </View>
              <Text style={st.modalText}>
                Are you sure you want to clear the chat? You will not be able to restore the messages once deleted.
              </Text>
              <View style={st.modalActions}>
                <Pressable 
                  style={[st.modalBtn, st.modalBtnCancel]} 
                  onPress={() => setShowClearModal(false)}
                >
                  <Text style={st.modalBtnTextCancel}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[st.modalBtn, st.modalBtnConfirm]} 
                  onPress={handleClearChat}
                >
                  <Text style={st.modalBtnTextConfirm}>Clear</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={st.chatBody}>
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
              ListFooterComponent={isPeerTyping ? <TypingBubble /> : null}
              ListEmptyComponent={
                <View style={st.chatEmptyWrap}>
                  <MaterialIcons name="chat-bubble-outline" size={32} color={COLORS.border} />
                  <Text style={st.chatEmptyText}>Say hello to start the conversation</Text>
                </View>
              }
              renderItem={({ item }) => (
                <MessageBubble
                  item={item}
                  mine={String(item.sender) === String(user?._id)}
                  user={user}
                  activePeer={activePeer}
                  onReply={(msg) => setReplyingTo(msg)}
                  onJump={(msgId) => scrollToMessage(msgId)}
                  isHighlighted={highlightedMessageId === String(item._id)}
                  decrypt={decrypt}
                />
              )}
            />
          )}

          {replyingTo && (
            <View style={st.replyPreviewWrap}>
              <View style={st.replyPreviewContent}>
                <View style={st.replyIndicator} />
                <View style={st.replyMain}>
                  <Text style={st.replyUserLabel}>Replying to {String(replyingTo.sender) === String(user?._id) ? "yourself" : (activePeer?.fullName || "Yaari")}</Text>
                  <Text style={st.replyTextLabel} numberOfLines={1}>{replyingTo.text}</Text>
                </View>
              </View>
              <Pressable onPress={() => setReplyingTo(null)} style={st.replyCloseBtn}>
                <MaterialIcons name="close" size={20} color={COLORS.inkMuted} />
              </Pressable>
            </View>
          )}
          <View style={[st.composerWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={st.composer}>
              <TextInput
                value={input}
                onChangeText={(val) => {
                  setInput(val);
                  if (!activePeer?._id) return;
                  
                  if (!isLocalTypingRef.current && val.trim().length > 0) {
                    isLocalTypingRef.current = true;
                    getChatSocket()?.emit("chat:typing", { to: activePeer._id, isTyping: true });
                  }
                  
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  
                  typingTimeoutRef.current = setTimeout(() => {
                    if (isLocalTypingRef.current) {
                      isLocalTypingRef.current = false;
                      getChatSocket()?.emit("chat:typing", { to: activePeer._id, isTyping: false });
                    }
                  }, 2000);
                }}
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
      </KeyboardAvoidingView>
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
                  {item.peer?.isOnline && <View style={st.convOnline} />}
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
    flexShrink: 0,
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
  onlineDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentMint,
  },
  chatStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.inkMuted,
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
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.inkMuted,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 16,
    width: "100%",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  bubbleRowPeer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMine: {
    backgroundColor: COLORS.tagBlue,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 74, 198, 0.15)", // Subtle brand blue border
  },
  bubblePeer: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleWithReply: {
    minWidth: "60%",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.ink,
    fontWeight: "500",
  },
  bubbleTextMine: {
    color: COLORS.ink,
  },
  bubbleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
    gap: 4,
  },
  bubbleTime: {
    fontSize: 10,
    color: COLORS.inkMuted,
    fontWeight: "600",
  },
  bubbleTimeMine: {
    color: COLORS.inkMuted,
  },
  statusIconWrap: {
    marginLeft: 4,
  },
  composerWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    backgroundColor: COLORS.paper,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexShrink: 0,
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

  /* ── REPLY UI ── */
  swipeAction: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  replyPreviewWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  replyPreviewContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tagBlue,
    borderRadius: 8,
    overflow: "hidden",
  },
  replyIndicator: {
    width: 4,
    height: "100%",
    backgroundColor: COLORS.accentBlue,
  },
  replyMain: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  replyUserLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.accentBlue,
  },
  replyTextLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  replyCloseBtn: {
    padding: 8,
    marginLeft: 8,
  },

  /* ── REPLY IN BUBBLE ── */
  replyInBubble: {
    flexDirection: "row",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 1,
  },
  replyInBubbleMine: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  replyInBubblePeer: {
    backgroundColor: COLORS.tagBlue,
    borderColor: "#dbeafe",
  },
  replyContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  replyUser: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.accentBlue,
  },
  replyText: {
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 1,
  },

  /* ── CLEAR CHAT UI ── */
  chatHeaderDots: {
    padding: 8,
    marginLeft: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  menuContent: {
    position: "absolute",
    right: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 6,
    minWidth: 160,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.accent,
  },

  /* ── CLEAR MODAL ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.ink,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.inkMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: COLORS.paperDark,
  },
  modalBtnConfirm: {
    backgroundColor: COLORS.accent,
  },
  modalBtnTextCancel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.inkLight,
  },
  modalBtnTextConfirm: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },
});
