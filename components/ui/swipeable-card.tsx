import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Dimensions, StyleSheet, View, Text } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_SWIPE_MIN_DISTANCE = 15; // px - minimum horizontal movement before it's considered a swipe
const HORIZONTAL_SWIPE_RATIO = 2.5; // horizontal movement must be at least 2.5x vertical movement
const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.30; // fraction of screen width required to trigger swipe
const SWIPE_VELOCITY_THRESHOLD = 0.6; // velocity threshold to trigger swipe

interface Props {
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right') => void;
  nextItem?: React.ReactNode; // The next card to show behind during swipe
}

export default function SwipeableCard({ children, onSwipe, nextItem }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isSwiping, setIsSwiping] = useState(false);

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_DISTANCE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = translateX.interpolate({
    inputRange: [-SWIPE_DISTANCE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Next card opacity: 0 when not swiping, fades in during swipe, full opacity when swipe completes
  const nextCardOpacity = isSwiping
    ? translateX.interpolate({
      inputRange: [-SCREEN_WIDTH, -SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5, SCREEN_WIDTH],
      outputRange: [1, 0.6, 0, 0.6, 1],
      extrapolate: 'clamp',
    })
    : new Animated.Value(0);

  // Card scale: becomes smaller during swipe (0.95 at edges, 1 at center)
  const cardScale = isSwiping
    ? translateX.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [0.50, 1, 0.50],
      extrapolate: 'clamp',
    })
    : new Animated.Value(1);

  // Card border radius: becomes more rounded during swipe
  const cardBorderRadius = isSwiping
    ? translateX.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [100, 45, 100],
      extrapolate: 'clamp',
    })
    : new Animated.Value(0);

  // Card border opacity: white border appears during swipe (using opacity instead of borderWidth)
  const cardBorderOpacity = isSwiping
    ? translateX.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    })
    : new Animated.Value(0);

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
        setIsSwiping(true);
      },
      onPanResponderMove: (_evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      // Allow parent to take over if it requests termination (e.g., vertical ScrollView)
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        // If the responder is taken by a parent, reset position
        setIsSwiping(false);
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState;
        const threshold = SWIPE_DISTANCE_THRESHOLD;

        if (dx > threshold || vx > SWIPE_VELOCITY_THRESHOLD) {
          // swiped right — spring offscreen for a smooth finish
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: SCREEN_WIDTH * 1.2,
              useNativeDriver: true,
              speed: 20,
              bounciness: 0,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
              bounciness: 0,
            }),
          ]).start(() => {
            setIsSwiping(false);
            onSwipe('right');
          });
        } else if (dx < -threshold || vx < -SWIPE_VELOCITY_THRESHOLD) {
          // swiped left
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: -SCREEN_WIDTH * 1.2,
              useNativeDriver: true,
              speed: 20,
              bounciness: 0,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
              bounciness: 0,
            }),
          ]).start(() => {
            setIsSwiping(false);
            onSwipe('left');
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
          setIsSwiping(false);
        }
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* Next card (behind) - fades in during swipe */}
      {nextItem && (
        <Animated.View style={[styles.nextCard, { opacity: nextCardOpacity }]}>
          {nextItem}
        </Animated.View>
      )}

      {/* Current card (front) */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: translateX },
              { translateY: translateY },
              { rotate },
              { scale: cardScale },
            ],
            borderRadius: cardBorderRadius,
          },
        ]}
      >
        {children}

        {/* White border overlay */}
        <Animated.View pointerEvents="none" style={[styles.borderOverlay, { opacity: cardBorderOpacity, borderRadius: cardBorderRadius }]} />

        <Animated.View pointerEvents="none" style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={[styles.badgeText, { color: '#00e676' }]}>OPEN</Text>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.badge, styles.nopeBadge, { opacity: nopeOpacity }]}>
          <Text style={[styles.badgeText, { color: '#ff1744' }]}>DISLIKE</Text>
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
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 6,
    borderColor: '#ffffff',
    pointerEvents: 'none',
  },
  nextCard: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
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
