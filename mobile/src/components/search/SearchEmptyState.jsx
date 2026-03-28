import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_COLORS } from '../tabs/TabShared';

export default function SearchEmptyState({ query }) {
  if (!query) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="person-search" size={36} color={TAB_COLORS.blue} />
        </View>
        <Text style={styles.title}>Find People Near You</Text>
        <Text style={styles.subtitle}>
          Search by name or @handle to connect{'\n'}with people in your city
        </Text>
        <View style={styles.hints}>
          {['Search by full name', 'Search by @username'].map((hint) => (
            <View key={hint} style={styles.hintRow}>
              <MaterialIcons name="check-circle" size={14} color={TAB_COLORS.blue} />
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
        <MaterialIcons name="search-off" size={36} color={TAB_COLORS.inkFaint} />
      </View>
      <Text style={styles.title}>No results found</Text>
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
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: TAB_COLORS.blueXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapMuted: {
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TAB_COLORS.ink,
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TAB_COLORS.inkFaint,
    textAlign: 'center',
    lineHeight: 21,
  },
  queryHighlight: {
    color: TAB_COLORS.ink,
    fontWeight: '600',
  },
  hints: {
    marginTop: 24,
    gap: 10,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintText: {
    fontSize: 13,
    color: TAB_COLORS.inkFaint,
    fontWeight: '500',
  },
});
