import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_COLORS } from '../tabs/TabShared';

const AVATAR_PALETTE = [
  { bg: '#EEF2FF', text: '#4338CA' }, // Indigo
  { bg: '#ECFDF5', text: '#047857' }, // Emerald
  { bg: '#FEF2F2', text: '#B91C1C' }, // Red
  { bg: '#FFFBEB', text: '#B45309' }, // Amber
  { bg: '#F5F3FF', text: '#6D28D9' }, // Violet
  { bg: '#EFF6FF', text: '#1D4ED8' }, // Blue
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
        color="#CBD5E1"
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
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  fullName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.4,
  },
  username: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});