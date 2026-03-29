import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenShell } from "./TabShared";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#004ac6",
  secondary: "#9d4300",
  onSurface: "#191c1e",
  onSurfaceVariant: "#434655",
  surface: "#f7f9fb",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainerLowest: "#ffffff",
  secondaryContainer: "#fd761a",
  outlineVariant: "#c3c6d7",
  secondaryFixed: "#ffdbca",
  onSecondaryFixed: "#341100",
  primaryContainer: "#2563eb",
  onPrimary: "#ffffff",
};

const MEETUPS = [
  {
    id: "1",
    title: "Weekend Filter Coffee Walk",
    date: "Sat, 14 Oct • 9:00 AM",
    location: "Mylapore, Chennai",
    spots: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8_g2w-QEsXHs-cOmHw-WV4op3I-ee2h9pSf4CxeuIvT6zO4S4ZTK2vaphasM0HmbINRcrzFu3AfGttGW_y_son3RGCF7E6zn7-qwgvdcp9efBCiw2X46SUnmU08ySElPRLCaWRn7vE6TWZ7OWqICCrA08fCegXb_OY3JYR855W4keHw9wy07UX0NxBPPYhDaAZGmHo7_9SPatOaZ5sAAiThhAXNWem3oALlNPg-DunmjJ9KTdcb7K2bNBBfxysDGD5v4w2uaqpZE",
  },
  {
    id: "2",
    title: "Sunset Rooftop Networking",
    date: "Sun, 15 Oct • 5:30 PM",
    location: "Indiranagar, Bangalore",
    spots: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuByRSVIfiUueLEPaDTI27TqYfuXB20gHq2hBlUTNyEap0KiR1wVCG8pbXgLkfeByZSW7qHWCwEdoq3dYmpQY00aju-kWzDJJbUun5aqGiDuvbFTrJdpWny09SZC57wcPD9F2aNIMaq5MSyEZkx5fan3RsHcJmqGLPqdKj5BLYa0l3UxseWYYPENiczUzAA5q3U0pDUkX4Q46DnqUJsTqItX2qjylQaxVBCahqgNFlmlPJoLhgEN4e5U1mHaxHUs7yzU226iiXGcE1Y",
  },
];

const POSTS = [
  {
    id: "1",
    author: "Ananya Sharma",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_U-NZY0RFeUY9P5Fkhb-5wNctxgfrFhUfprbfq6A71lrAejL8nlJs1vDGOJA6mvl3fA96_4UDjcP7ZQ6X1nDRru4IiZZ5PNLmfpRf5iqtrTqqc_LIr3ulI0SRhnO_sihJKpxjko2U2oXUXH4SGqbfpS3OgqsNV79cGqAtw7Sgz3TGE18OqAM5uqeAq2CFKRbbqDrugXtJhB4ouViWGHXZyBciRycVDtQpq9QJ9W-C7rLKsjUriNjNzOW03i0sm31m_mFSIQhoUlg",
    time: "2 hours ago",
    category: "Moving Advice",
    title: "Best Packers and Movers from Jaipur?",
    content: "Hey everyone! I'm moving to Bangalore next month and looking for reliable service providers who handle delicate items well. Any personal recommendations?",
    likes: 12,
    comments: 4,
  },
  {
    id: "2",
    author: "Rahul Varma",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsnHzsLHOCDmvGGiH_ZIlfoYgh6lGVxDwlqT6ffRgoGgIzVYrsgo9agiE3z3vkoGM1hTJ3YhJ_q49EJPKC9pGVoC9IqfCgm9mHZYVt3muymbaVPiJaxReXHAobAloWQidQfsPip2A2rapun_25Sbhsizi1Bw5O5Qdrokuz0kn-mgplOuU1y9-cgEipYrMJ_qewEMf6IvX3Rd_efGJblAEKXRoX3HCUaXwVTmSPKftS5uuZPhhqXyY_mqg6cTSZY7zySsLPC4zesL8",
    time: "5 hours ago",
    category: "Foodie Meetup",
    title: "Hidden Gem: Old Delhi Street Food",
    content: "Just discovered this tiny paratha shop in the lanes of Chandni Chowk. The flavors are nostalgic! Thinking of organizing a group visit this Friday night.",
    likes: 45,
    comments: 18,
    isBookmarked: true,
  },
];

export default function HomeTab({ navigation }) {
  const [mode, setMode] = useState("Posts");

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Home"
      title={null}
    >
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Discover your city</Text>
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setMode("Posts")}
              style={[
                styles.segmentButton,
                mode === "Posts" && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "Posts" && styles.segmentTextActive,
                ]}
              >
                Posts
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("Meetups")}
              style={[
                styles.segmentButton,
                mode === "Meetups" && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "Meetups" && styles.segmentTextActive,
                ]}
              >
                Meetups
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Upcoming Meetups Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
          <Pressable>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.meetupScroll}
          snapToInterval={288 + 20}
          decelerationRate="fast"
        >
          {MEETUPS.map((meetup) => (
            <Pressable key={meetup.id} style={styles.meetupCard}>
              <View style={styles.meetupImageContainer}>
                <Image
                  source={{ uri: meetup.image }}
                  style={styles.meetupImage}
                />
                <View style={styles.spotsBadge}>
                  <Text style={styles.spotsText}>
                    {meetup.spots} spots left
                  </Text>
                </View>
              </View>
              <View style={styles.meetupInfo}>
                <Text style={styles.meetupDate}>{meetup.date}</Text>
                <Text style={styles.meetupTitle} numberOfLines={2}>
                  {meetup.title}
                </Text>
                <View style={styles.locationContainer}>
                  <MaterialIcons
                    name="location-on"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text style={styles.locationText}>{meetup.location}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Feed Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest in your city</Text>
        </View>

        <View style={styles.feedContainer}>
          {POSTS.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.authorContainer}>
                  <Image
                    source={{ uri: post.avatar }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.postTime}>Posted {post.time}</Text>
                  </View>
                </View>
                <View style={[
                  styles.categoryTag,
                  post.category === "Foodie Meetup" ? styles.categoryBlue : styles.categoryOrange
                ]}>
                  <Text style={[
                    styles.categoryText,
                    post.category === "Foodie Meetup" ? styles.categoryTextBlue : styles.categoryTextOrange
                  ]}>
                    {post.category}
                  </Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>
                {post.content}
              </Text>

              <View style={styles.postDivider} />

              <View style={styles.postActions}>
                <View style={styles.leftActions}>
                  <Pressable style={styles.actionButton}>
                    <MaterialIcons name="favorite-outline" size={20} color="#64748b" />
                    <Text style={styles.actionText}>{post.likes}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <MaterialIcons name="chat-bubble-outline" size={20} color="#64748b" />
                    <Text style={styles.actionText}>{post.comments}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <MaterialIcons name="arrow-downward" size={20} color="#64748b" />
                  </Pressable>
                </View>
                <Pressable>
                  <MaterialIcons 
                    name={post.isBookmarked ? "bookmark" : "bookmark-border"} 
                    size={20} 
                    color={post.isBookmarked ? COLORS.primary : "#64748b"} 
                  />
                </Pressable>
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
    paddingTop: 12,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    padding: 6,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surfaceContainerLowest,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  meetupScroll: {
    paddingLeft: 4,
    paddingRight: 24,
    paddingBottom: 24,
  },
  meetupCard: {
    width: 288,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 32,
    marginRight: 20,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  meetupImageContainer: {
    height: 160,
    position: "relative",
  },
  meetupImage: {
    width: "100%",
    height: "100%",
  },
  spotsBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(253, 118, 26, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  spotsText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  meetupInfo: {
    padding: 20,
  },
  meetupDate: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 6,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    lineHeight: 24,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  feedContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 32,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 4,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  postTime: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  categoryOrange: {
    backgroundColor: COLORS.secondaryFixed,
  },
  categoryBlue: {
    backgroundColor: "rgba(0, 74, 198, 0.1)",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
  },
  categoryTextOrange: {
    color: COLORS.onSecondaryFixed,
  },
  categoryTextBlue: {
    color: COLORS.primary,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.onSurfaceVariant,
    marginBottom: 20,
  },
  postDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftActions: {
    flexDirection: "row",
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
});
