import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  ink: "#0a0a0a",
  muted: "#888888",
  border: "#e0dbd4",
  divider: "#ece7e0",
  card: "#ffffff",
  paper: "#f5f2ed",
  blue: "#004ac6",
  bluePale: "#eef2ff",
  goldPale: "#fff8e6",
};

const AVATAR_PALETTE = [
  { bg: '#eef2ff', text: '#004ac6' },
  { bg: '#fff8e6', text: '#8f6207' },
  { bg: '#fef0ed', text: '#a13211' },
  { bg: '#eef2ff', text: '#003996' },
  { bg: '#fff4cf', text: '#8f6207' },
  { bg: '#f3f6ff', text: '#004ac6' },
];

function getAvatarStyle(name) {
  const index = (name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

export default function SearchResultItem({ user, onPress, isLast }) {
  const avatarStyle = getAvatarStyle(user.fullName);

  return (
    <TouchableOpacity
      style={[styles.card, isLast && styles.noBorder]}
      onPress={() => onPress(user)}
      activeOpacity={0.6}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarStyle.bg }]}>
        {user.profileImageUri ? (
          <Image source={{ uri: user.profileImageUri }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarText, { color: avatarStyle.text }]}>
            {user.fullName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.fullName} numberOfLines={1}>{user.fullName}</Text>
        <Text style={styles.username} numberOfLines={1}>@{user.username}</Text>
      </View>

      {/* Chevron */}
      <MaterialIcons
        name="chevron-right"
        size={22}
        color={C.muted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    gap: 14,
    backgroundColor: C.card,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.4,
  },
  username: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});