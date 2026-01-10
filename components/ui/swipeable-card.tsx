import React, { useRef } from 'react';
import { Animated, PanResponder, Dimensions, StyleSheet, View, Text } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_SWIPE_MIN_DISTANCE = 15; // px - minimum horizontal movement before it's considered a swipe
const HORIZONTAL_SWIPE_RATIO = 2.5; // horizontal movement must be at least 3x vertical movement
const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.30; // fraction of screen width required to trigger swipe
const SWIPE_VELOCITY_THRESHOLD = 0.6; // velocity threshold to trigger swipe

interface Props {
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableCard({ children, onSwipe }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = translateX.interpolate({
    inputRange: [0, SCREEN_WIDTH / 3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH / 3, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      // Don't claim the responder immediately on touch start; wait until movement clearly indicates a horizontal swipe.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // Prefer clear horizontal drags and require a minimum horizontal distance to avoid accidental swipes.
        return (
          Math.abs(gestureState.dx) > HORIZONTAL_SWIPE_RATIO * Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > HORIZONTAL_SWIPE_MIN_DISTANCE
        );
      },
      onPanResponderGrant: () => {
        // Stop any running animations when gesture begins
        translateX.stopAnimation();
        translateY.stopAnimation();
      },
      onPanResponderMove: (_evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      // Allow parent to take over if it requests termination (e.g., vertical ScrollView)
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        // If the responder is taken by a parent, reset position
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState;
        const threshold = SWIPE_DISTANCE_THRESHOLD;

        if (dx > threshold || vx > SWIPE_VELOCITY_THRESHOLD) {
          // swiped right
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => onSwipe('right'));
        } else if (dx < -threshold || vx < -SWIPE_VELOCITY_THRESHOLD) {
          // swiped left
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => onSwipe('left'));
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: translateX },
              { translateY: translateY },
              { rotate },
            ],
          },
        ]}
      >
        {children}

        <Animated.View pointerEvents="none" style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}> 
          <Text style={[styles.badgeText, { color: '#00e676' }]}>LIKE</Text>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.badge, styles.nopeBadge, { opacity: nopeOpacity }]}> 
          <Text style={[styles.badgeText, { color: '#ff1744' }]}>NOPE</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 80,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  likeBadge: {
    left: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  nopeBadge: {
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  badgeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
