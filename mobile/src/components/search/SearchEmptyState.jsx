import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_COLORS } from '../tabs/TabShared';

export default function SearchEmptyState({ query }) {
  if (!query) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="person-search" size={32} color={TAB_COLORS.blue} />
        </View>
        <Text style={styles.title}>Find People Near You</Text>
        <Text style={styles.subtitle}>
          Search by name or @handle to connect{'\n'}with people in your city
        </Text>
        <View style={styles.hints}>
          {['Search by full name', 'Search by @username'].map((hint) => (
            <View key={hint} style={styles.hintRow}>
              <View style={styles.hintDot} />
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, styles.iconWrapMuted]}>
        <MaterialIcons name="search-off" size={32} color={TAB_COLORS.inkFaint} />
      </View>
      <Text style={styles.title}>No Results Found</Text>
      <Text style={styles.subtitle}>
        No one matched{' '}
        <Text style={styles.queryHighlight}>"{query}"</Text>
        {'\n'}Try a different name or @handle
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: TAB_COLORS.blueXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  iconWrapMuted: {
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: TAB_COLORS.ink,
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: TAB_COLORS.inkFaint,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 220,
  },
  queryHighlight: {
    color: TAB_COLORS.ink,
    fontWeight: '600',
  },
  hints: {
    marginTop: 28,
    gap: 8,
    alignSelf: 'stretch',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TAB_COLORS.blue,
    flexShrink: 0,
  },
  hintText: {
    fontSize: 13,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
  },
});