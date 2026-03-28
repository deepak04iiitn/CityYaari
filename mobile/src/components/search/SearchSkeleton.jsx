import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { TAB_COLORS } from '../tabs/TabShared';

function SkeletonBox({ style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]} />;
}

export default function SearchSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.row}>
          <SkeletonBox style={styles.avatar} />
          <View style={styles.info}>
            <View style={styles.topRow}>
              <SkeletonBox style={styles.nameLine} />
              <SkeletonBox style={styles.badge} />
            </View>
            <SkeletonBox style={styles.usernameLine} />
            <SkeletonBox style={styles.roleLine} />
            <SkeletonBox style={styles.locationLine} />
            <SkeletonBox style={styles.hometownLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

const SKEL = '#E2E8F0';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SKEL,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameLine: {
    height: 14,
    width: '45%',
    borderRadius: 7,
    backgroundColor: SKEL,
  },
  badge: {
    height: 18,
    width: 64,
    borderRadius: 6,
    backgroundColor: SKEL,
  },
  usernameLine: {
    height: 12,
    width: '30%',
    borderRadius: 6,
    backgroundColor: SKEL,
  },
  roleLine: {
    height: 11,
    width: '55%',
    borderRadius: 6,
    backgroundColor: SKEL,
  },
  locationLine: {
    height: 11,
    width: '40%',
    borderRadius: 6,
    backgroundColor: SKEL,
  },
  hometownLine: {
    height: 11,
    width: '48%',
    borderRadius: 6,
    backgroundColor: SKEL,
  },
});
