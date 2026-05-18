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

    // Step 3: Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const dotTranslateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24]
  });
  
  const dotOpacity = scrollAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 0]
  });

  const swipeTranslateX = swipeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-40, 40]
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });
  
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8]
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
            <View style={[styles.swipeCircle, styles.leftCircle]}>
              <Ionicons name="close" size={24} color="#fff" />
            </View>
            <View style={[styles.swipeCircle, styles.rightCircle]}>
              <Ionicons name="heart" size={20} color="#fff" />
            </View>
            <Animated.View style={[styles.swipeThumb, { transform: [{ translateX: swipeTranslateX }] }]}>
              <Ionicons name="hand-right-outline" size={28} color="#fff" />
            </Animated.View>
          </View>
          
          <Text style={styles.elegantHint}>SWIPE TO CURATE</Text>
          <Text style={styles.subHint}>Left to pass, right to love</Text>
        </Animated.View>
      )}

      {/* STEP 3: Elegant Pulse */}
      {step === 3 && (
        <Animated.View style={[styles.stepContainer, styles.bottomAligned]} pointerEvents="none">
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFillObject} />
          
          <Text style={[styles.elegantHint, { marginBottom: 10 }]}>DIVE DEEPER</Text>
          <Text style={[styles.subHint, { marginBottom: 30 }]}>Tap below to see the details</Text>
          
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
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
    fontWeight: '300',
    letterSpacing: 4,
    marginTop: 40,
    textShadowColor: 'rgba(0,0,0,1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 1,
    marginTop: 8,
  },
  
  // Mouse Scroll Styles
  mouseOutline: {
    width: 36,
    height: 60,
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
    justifyContent: 'center',
    width: 200,
    height: 60,
  },
  swipeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  leftCircle: {
    left: -20,
  },
  rightCircle: {
    right: -20,
  },
  swipeThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  // Pulse Styles
  pulseRing: {
    width: '85%',
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  }
});
