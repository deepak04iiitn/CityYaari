import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_COLORS } from '../tabs/TabShared';

const AVATAR_PALETTE = [
  { bg: '#EDE9FE', text: '#6D28D9' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEE2E2', text: '#B91C1C' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#F0FDF4', text: '#166534' },
];

function getAvatarColor(name) {
  const index = (name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}


export default function SearchResultItem({ user, onPress }) {
  const avatarColor = getAvatarColor(user.fullName);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(user)}
      activeOpacity={0.72}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
        {user.profileImageUri ? (
          <Image source={{ uri: user.profileImageUri }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarInitial, { color: avatarColor.text }]}>
            {user.fullName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Info block */}
      <View style={styles.info}>
        <Text style={styles.fullName} numberOfLines={1}>{user.fullName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={TAB_COLORS.cardBorder} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  fullName: {
    fontSize: 15,
    fontWeight: '700',
    color: TAB_COLORS.ink,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  username: {
    fontSize: 13,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
  },
  chevron: {
    marginTop: 6,
    flexShrink: 0,
  },
});
