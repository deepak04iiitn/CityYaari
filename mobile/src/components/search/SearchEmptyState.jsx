import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  ink: "#0a0a0a",
  muted: "#888888",
  blue: "#004ac6",
  border: "#e0dbd4",
  goldGhost: "#fff8e6",
};

export default function SearchEmptyState({ query }) {
  if (!query) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="person-search" size={32} color={C.blue} />
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
        <MaterialIcons name="search-off" size={32} color={C.muted} />
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
    backgroundColor: C.goldGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  iconWrapMuted: {
    backgroundColor: '#f8f6f2',
    borderWidth: 1.2,
    borderColor: C.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 220,
  },
  queryHighlight: {
    color: C.ink,
    fontWeight: '800',
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
    backgroundColor: '#f8f6f2',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.blue,
    flexShrink: 0,
  },
  hintText: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '600',
  },
});