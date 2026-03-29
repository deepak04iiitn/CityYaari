import React, { useState } from "react";
import {
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenShell } from "./TabShared";

const { width } = Dimensions.get("window");

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

const MEETUPS = [
  {
    id: "1",
    title: "Weekend Filter Coffee Walk",
    date: "SAT, 14 OCT",
    time: "9:00 AM",
    location: "Mylapore, Chennai",
    spots: 5,
    accent: COLORS.accentGold,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8_g2w-QEsXHs-cOmHw-WV4op3I-ee2h9pSf4CxeuIvT6zO4S4ZTK2vaphasM0HmbINRcrzFu3AfGttGW_y_son3RGCF7E6zn7-qwgvdcp9efBCiw2X46SUnmU08ySElPRLCaWRn7vE6TWZ7OWqICCrA08fCegXb_OY3JYR855W4keHw9wy07UX0NxBPPYhDaAZGmHo7_9SPatOaZ5sAAiThhAXNWem3oALlNPg-DunmjJ9KTdcb7K2bNBBfxysDGD5v4w2uaqpZE",
  },
  {
    id: "2",
    title: "Sunset Rooftop Networking",
    date: "SUN, 15 OCT",
    time: "5:30 PM",
    location: "Indiranagar, Bangalore",
    spots: 2,
    accent: COLORS.accent,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuByRSVIfiUueLEPaDTI27TqYfuXB20gHq2hBlUTNyEap0KiR1wVCG8pbXgLkfeByZSW7qHWCwEdoq3dYmpQY00aju-kWzDJJbUun5aqGiDuvbFTrJdpWny09SZC57wcPD9F2aNIMaq5MSyEZkx5fan3RsHcJmqGLPqdKj5BLYa0l3UxseWYYPENiczUzAA5q3U0pDUkX4Q46DnqUJsTqItX2qjylQaxVBCahqgNFlmlPJoLhgEN4e5U1mHaxHUs7yzU226iiXGcE1Y",
  },
];

const POSTS = [
  {
    id: "1",
    author: "Ananya Sharma",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_U-NZY0RFeUY9P5Fkhb-5wNctxgfrFhUfprbfq6A71lrAejL8nlJs1vDGOJA6mvl3fA96_4UDjcP7ZQ6X1nDRru4IiZZ5PNLmfpRf5iqtrTqqc_LIr3ulI0SRhnO_sihJKpxjko2U2oXUXH4SGqbfpS3OgqsNV79cGqAtw7Sgz3TGE18OqAM5uqeAq2CFKRbbqDrugXtJhB4ouViWGHXZyBciRycVDtQpq9QJ9W-C7rLKsjUriNjNzOW03i0sm31m_mFSIQhoUlg",
    time: "2 hours ago",
    category: "Moving Advice",
    categoryColor: COLORS.accentGold,
    categoryBg: COLORS.tagGold,
    title: "Best Packers and Movers from Jaipur?",
    content:
      "Hey everyone! I'm moving to Bangalore next month and looking for reliable service providers who handle delicate items well. Any personal recommendations?",
    likes: 12,
    dislikes: 2,
    comments: 4,
  },
  {
    id: "2",
    author: "Rahul Varma",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsnHzsLHOCDmvGGiH_ZIlfoYgh6lGVxDwlqT6ffRgoGgIzVYrsgo9agiE3z3vkoGM1hTJ3YhJ_q49EJPKC9pGVoC9IqfCgm9mHZYVt3muymbaVPiJaxReXHAobAloWQidQfsPip2A2rapun_25Sbhsizi1Bw5O5Qdrokuz0kn-mgplOuU1y9-cgEipYrMJ_qewEMf6IvX3Rd_efGJblAEKXRoX3HCUaXwVTmSPKftS5uuZPhhqXyY_mqg6cTSZY7zySsLPC4zesL8",
    time: "5 hours ago",
    category: "Foodie Meetup",
    categoryColor: COLORS.accent,
    categoryBg: COLORS.tagRed,
    title: "Hidden Gem: Old Delhi Street Food",
    content:
      "Just discovered this tiny paratha shop in the lanes of Chandni Chowk. The flavors are nostalgic! Thinking of organizing a group visit this Friday night.",
    likes: 45,
    dislikes: 5,
    comments: 18,
    isBookmarked: true,
    image:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2532&auto=format&fit=crop",
  },
];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeTab({ navigation }) {
  const [mode, setMode] = useState("Posts");
  const [likedPosts, setLikedPosts] = useState({});
  const [dislikedPosts, setDislikedPosts] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [bookmarks, setBookmarks] = useState({ 2: true });

  const toggleLike = (id) =>
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleDislike = (id) =>
    setDislikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleBookmark = (id) =>
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Home"
      title={null}
      noPadding
      background={COLORS.paper}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.container}>
        {/* ── MASTHEAD ── */}
        <View style={styles.masthead}>
          <View style={styles.mastheadTop}>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE CITY FEED</Text>
            </View>
            {/* <Pressable style={styles.notifBtn}>
              <MaterialIcons
                name="notifications-none"
                size={22}
                color={COLORS.ink}
              />
            </Pressable> */}
          </View>

          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleLight}>Discover</Text>
            {"\n"}
            Your City<Text style={{ color: COLORS.accent }}>.</Text>
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

        {/* ── MEETUPS ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>UPCOMING MEETUPS</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all →</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardScroll}
          snapToInterval={270 + 16}
          decelerationRate="fast"
        >
          {MEETUPS.map((m) => (
            <Pressable key={m.id} style={styles.meetCard}>
              {/* Image */}
              <View style={styles.meetImgWrap}>
                <Image source={{ uri: m.image }} style={styles.meetImg} />
                {/* Date overlay */}
                <View style={[styles.datePill, { backgroundColor: m.accent }]}>
                  <Text style={styles.datePillText}>{m.date}</Text>
                </View>
                {/* Spots badge */}
                <View style={styles.spotsBadge}>
                  <MaterialIcons name="people" size={10} color={COLORS.ink} />
                  <Text style={styles.spotsText}>{m.spots} left</Text>
                </View>
              </View>

              <View style={styles.meetBody}>
                <Text style={styles.meetTime}>{m.time}</Text>
                <Text style={styles.meetTitle} numberOfLines={2}>
                  {m.title}
                </Text>
                <View style={styles.meetLoc}>
                  <MaterialIcons
                    name="location-on"
                    size={12}
                    color={COLORS.inkMuted}
                  />
                  <Text style={styles.meetLocText}>{m.location}</Text>
                </View>
                <Pressable
                  style={[styles.rsvpBtn, { backgroundColor: m.accent }]}
                >
                  <Text style={styles.rsvpText}>RSVP NOW</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── FEED ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>LATEST IN YOUR CITY</Text>
        </View>

        <View style={styles.feed}>
          {POSTS.map((post, idx) => (
            <View key={post.id}>
              {/* Horizontal rule between posts */}
              {idx > 0 && <View style={styles.hrule} />}

              <View style={styles.postCard}>
                {/* Header */}
                <View style={styles.postHeader}>
                  <View style={styles.authorRow}>
                    <View style={styles.avatarWrap}>
                      <Image
                        source={{ uri: post.avatar }}
                        style={styles.avatar}
                      />
                    </View>
                    <View>
                      <Text style={styles.authorName}>{post.author}</Text>
                      <Text style={styles.postTime}>{post.time}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.catTag,
                      { backgroundColor: post.categoryBg },
                    ]}
                  >
                    <Text
                      style={[styles.catText, { color: post.categoryColor }]}
                    >
                      {post.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text
                  style={styles.postBody}
                  numberOfLines={expandedPosts[post.id] ? undefined : 3}
                >
                  {post.content}
                </Text>
                {post.content.length > 100 && (
                  <Pressable onPress={() => toggleExpand(post.id)} hitSlop={10}>
                    <Text style={styles.readMore}>
                      {expandedPosts[post.id] ? "Show less" : "Read more"}
                    </Text>
                  </Pressable>
                )}

                {post.image && (
                  <View style={styles.postImgWrap}>
                    <Image source={{ uri: post.image }} style={styles.postImg} />
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  <View style={styles.actionsLeft}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => toggleLike(post.id)}
                    >
                      <MaterialIcons
                        name={likedPosts[post.id] ? "thumb-up" : "thumb-up-off-alt"}
                        size={18}
                        color={
                          likedPosts[post.id] ? COLORS.accent : COLORS.inkMuted
                        }
                      />
                      <Text
                        style={[
                          styles.actionCount,
                          likedPosts[post.id] && { color: COLORS.accent },
                        ]}
                      >
                        {post.likes + (likedPosts[post.id] ? 1 : 0)}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => toggleDislike(post.id)}
                    >
                      <MaterialIcons
                        name={
                          dislikedPosts[post.id]
                            ? "thumb-down"
                            : "thumb-down-off-alt"
                        }
                        size={18}
                        color={
                          dislikedPosts[post.id]
                            ? COLORS.accentBlue
                            : COLORS.inkMuted
                        }
                      />
                      <Text
                        style={[
                          styles.actionCount,
                          dislikedPosts[post.id] && { color: COLORS.accentBlue },
                        ]}
                      >
                        {post.dislikes + (dislikedPosts[post.id] ? 1 : 0)}
                      </Text>
                    </Pressable>

                    <Pressable style={styles.actionBtn}>
                      <MaterialIcons
                        name="chat-bubble-outline"
                        size={18}
                        color={COLORS.inkMuted}
                      />
                      <Text style={styles.actionCount}>{post.comments}</Text>
                    </Pressable>

                  </View>

                  <Pressable onPress={() => toggleBookmark(post.id)}>
                    <MaterialIcons
                      name={
                        bookmarks[post.id] ? "bookmark" : "bookmark-border"
                      }
                      size={20}
                      color={
                        bookmarks[post.id]
                          ? COLORS.accentBlue
                          : COLORS.inkMuted
                      }
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
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
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.inkMuted,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accentBlue,
    letterSpacing: 0.3,
  },

  /* ── MEETUP CARDS ── */
  cardScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 28,
    gap: 16,
  },
  meetCard: {
    width: 270,
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
  meetTime: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.inkMuted,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  meetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.ink,
    lineHeight: 23,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  meetLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 14,
  },
  meetLocText: {
    fontSize: 11,
    color: COLORS.inkMuted,
    fontWeight: "600",
  },
  rsvpBtn: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  rsvpText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 1.5,
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
});