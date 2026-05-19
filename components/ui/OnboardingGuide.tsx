import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  step: 1 | 2 | 3;
  onSkip: () => void;
}

export default function OnboardingGuide({ step, onSkip }: Props) {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Scroll animation (looping sliding dot)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scrollAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Step 2: Swipe animation (left right bounce)
    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(swipeAnim, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(swipeAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Step 3: Pulse animation (luxury float and breathe)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const dotTranslateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0] // <-- Increased distance here (from 24 to 40)
  });

  const dotOpacity = scrollAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 0]
  });

  const swipeTranslateX = swipeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-85, 85]
  });

  const thumbRotate = swipeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg']
  });

  const leftIconOpacity = swipeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [1, 0.3, 0.3]
  });
  const leftIconScale = swipeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [1.2, 0.8, 0.8]
  });

  const rightIconOpacity = swipeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.3, 0.3, 1]
  });
  const rightIconScale = swipeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.8, 0.8, 1.2]
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08]
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.9]
  });

  const pulseTranslateY = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6] // Floating pointer up and down gently
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Sleek Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>

      {/* STEP 1: Elegant Scroll */}
      {step === 1 && (
        <Animated.View style={styles.stepContainer} pointerEvents="none">
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0)']} style={StyleSheet.absoluteFillObject} />

          <View style={styles.mouseOutline}>
            <Animated.View style={[styles.mouseWheel, { transform: [{ translateY: dotTranslateY }], opacity: dotOpacity }]} />
          </View>

          <Text style={styles.elegantHint}>SCROLL TO EXPLORE</Text>
          <Text style={styles.subHint}>Discover the finest collection</Text>
        </Animated.View>
      )}

      {/* STEP 2: Elegant Swipe */}
      {step === 2 && (
        <Animated.View style={styles.stepContainer} pointerEvents="none">
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0)']} style={StyleSheet.absoluteFillObject} />

          <View style={styles.swipeTrack}>
            <Animated.View style={[styles.swipeCircle, { opacity: leftIconOpacity, transform: [{ scale: leftIconScale }] }]}>
              <Ionicons name="close" size={24} color="#fff" />
            </Animated.View>
            <Animated.View style={[styles.swipeCircle, { opacity: rightIconOpacity, transform: [{ scale: rightIconScale }] }]}>
              <Ionicons name="heart" size={20} color="#fff" />
            </Animated.View>
            <Animated.View style={[styles.swipeThumb, { transform: [{ translateX: swipeTranslateX }, { rotate: thumbRotate }] }]}>
              <Ionicons name="swap-horizontal" size={24} color="#000" />
            </Animated.View>
          </View>

          <Text style={styles.elegantHint}>SWIPE TO CURATE</Text>
          <Text style={styles.subHint}>Left to pass, right to love</Text>
        </Animated.View>
      )}

      {/* STEP 3: Elegant Pulse */}
      {step === 3 && (
        <Animated.View style={styles.stepContainer} pointerEvents="none">
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFillObject} />

          <View style={styles.pulseTextContainer}>
            <Text style={[styles.elegantHint, { marginBottom: 10 }]}>DIVE DEEPER</Text>
            <Text style={styles.subHint}>Tap below to explore</Text>
          </View>

          {/* Subtle floating down arrow pointing at the button */}
          <Animated.View style={[styles.pointerContainer, { transform: [{ translateY: pulseTranslateY }] }]}>
            <Ionicons name="chevron-down-outline" size={24} color="rgba(255,255,255,0.8)" />
          </Animated.View>

          {/* Glowing duplicate of the actual button that breathes to highlight it */}
          <Animated.View
            style={[
              styles.luxuryButton,
              {
                transform: [{ scale: pulseScale }],
                shadowOpacity: pulseOpacity
              }
            ]}
          >
            <Text style={styles.luxuryButtonText}>View Details</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  stepContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomAligned: {
    justifyContent: 'flex-end',
    paddingBottom: 25,
  },
  pulseTextContainer: {
    position: 'absolute',
    bottom: 110,
    alignItems: 'center',
    width: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 55,
    right: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(20,20,20,0.4)',
    zIndex: 1001,
  },
  skipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  elegantHint: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 4,
    marginTop: 40,
    textShadowColor: 'rgba(0,0,0,1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 8,
  },

  // Mouse Scroll Styles
  mouseOutline: {
    width: 36,
    height: 80, // <-- Increased height here (from 60 to 80)
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    paddingTop: 8,
  },
  mouseWheel: {
    width: 4,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  // Swipe Styles
  swipeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 260,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
  },
  swipeCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeThumb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    marginLeft: -27,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },

  // Luxury Pulse Styles
  pointerContainer: {
    position: 'absolute',
    bottom: 85,
    alignSelf: 'center',
  },
  luxuryButton: {
    position: 'absolute',
    bottom: 26,
    left: 36,
    right: 36,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 15,
  },
  luxuryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
