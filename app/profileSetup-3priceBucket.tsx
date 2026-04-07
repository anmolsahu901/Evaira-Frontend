import { useRouter } from 'expo-router';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View, Animated, PanResponder } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useUserProfile } from '../context/UserProfileContext';
import { submitUserProfile } from '../lib/profileAPI';

const PRICE_BUCKETS: Array<{
  key: string;
  pillLabel: string;
  sliderLabel: string;
  infoTitle: string;
  infoBody: string;
}> = [
    {
      key: 'BUDGET',
      pillLabel: 'Budget',
      sliderLabel: 'BUDGET',
      infoTitle: 'Budget Shopping',
      infoBody: 'Everyday essentials at great prices. Expected range: Rs.500 - Rs.1000.',
    },
    {
      key: 'VALUE',
      pillLabel: 'Value',
      sliderLabel: 'VALUE',
      infoTitle: 'Value Shopping',
      infoBody: 'Quality basics with smart value. Expected range: Rs.900 - Rs.1600.',
    },
    {
      key: 'MIDRANGE',
      pillLabel: 'Mid-Range',
      sliderLabel: 'MID-RANGE',
      infoTitle: 'Mid-range Shopping',
      infoBody: 'Contemporary brands and premium materials. Expected range: Rs.1000 - Rs.2500.',
    },
    {
      key: 'PREMIUM',
      pillLabel: 'Premium',
      sliderLabel: 'PREMIUM',
      infoTitle: 'Premium Shopping',
      infoBody: 'Designer pieces and top-tier fabrics. Expected range: Rs.2500+',
    },
  ];

export default function PriceBucketScreen() {
  const router = useRouter();
  const { setPriceBucket } = useUserProfile();

  const [selectedBucket, setSelectedBucket] = useState<string>();
  // const [loading, setLoading] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  const selectedIndex = useMemo(() => {
    if (!selectedBucket) return -1;
    const idx = PRICE_BUCKETS.findIndex((b) => b.key === selectedBucket);
    return idx >= 0 ? idx : -1;
  }, [selectedBucket]);

  const selectedMeta = selectedIndex >= 0 ? PRICE_BUCKETS[selectedIndex] : PRICE_BUCKETS[0];

  const sliderPositionAnim = useRef(new Animated.Value(0)).current;
  const dragStartPercent = useRef(0);

  useEffect(() => {
    if (selectedIndex === -1) return; // Don't animate if nothing is selected
    const newPercent = (selectedIndex / (PRICE_BUCKETS.length - 1)) * 100;
    Animated.spring(sliderPositionAnim, {
      toValue: newPercent,
      useNativeDriver: false,
    }).start();
  }, [selectedIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        sliderPositionAnim.stopAnimation();
        dragStartPercent.current = selectedIndex >= 0 ? (selectedIndex / (PRICE_BUCKETS.length - 1)) * 100 : 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (sliderWidth === 0) return;
        const movePercent = (gestureState.dx / sliderWidth) * 100;
        const newPercent = dragStartPercent.current + movePercent;
        const clampedPercent = Math.max(0, Math.min(100, newPercent));
        sliderPositionAnim.setValue(clampedPercent);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (sliderWidth === 0) return;
        const movePercent = (gestureState.dx / sliderWidth) * 100;
        const finalPercent = dragStartPercent.current + movePercent;
        const clampedPercent = Math.max(0, Math.min(100, finalPercent));

        const stepPercent = 100 / (PRICE_BUCKETS.length - 1);
        const closestIndex = Math.round(clampedPercent / stepPercent);
        const clampedIndex = Math.max(0, Math.min(PRICE_BUCKETS.length - 1, closestIndex));

        setSelectedBucket(PRICE_BUCKETS[clampedIndex].key);
        console.log('Selected bucket:', PRICE_BUCKETS[clampedIndex].key);
      },
    })
  ).current;

  const sliderFillWidth = sliderPositionAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const handleContinue = async () => {
    if (!selectedBucket) {
      alert('Please select a shopping range');
      return;
    }
    console.log('Submitting price bucket:', selectedBucket);
    setPriceBucket(selectedBucket);
    router.push('/profileSetup-4occasion');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.back}>‹</ThemedText>
          </TouchableOpacity>
          <Image source={require('../assets/circle_icon.png')} style={styles.logo} />
          <TouchableOpacity>
            <ThemedText style={styles.skip}>Skip</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <ThemedText style={styles.stepText}>STEP 3 OF 5</ThemedText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          {/* Title */}
          <ThemedText style={styles.title}>What's your typical shopping range?</ThemedText>
        <ThemedText style={styles.subtitle}>We'll match great styles within your comfort zone.</ThemedText>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <ThemedText style={styles.pillText}>{selectedMeta.pillLabel}</ThemedText>
          </View>
        </View>

        {/* Slider */}
        <View style={styles.sliderWrap} onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}>
          <View style={styles.sliderTrack}>
            <Animated.View style={[styles.sliderFill, { width: sliderFillWidth }]} />
          </View>

          <View style={styles.dotsRow} pointerEvents="box-none">
            {PRICE_BUCKETS.map((b, idx) => {
              const isActive = b.key === selectedBucket;
              const leftPercent = (idx / (PRICE_BUCKETS.length - 1)) * 100;

              if (isActive) {
                const handleLeft = sliderPositionAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={b.key}
                    style={[styles.dotButton, { left: handleLeft }]}
                    {...panResponder.panHandlers}
                  >
                    <View style={[styles.dotOuter, styles.dotOuterActive]}>
                      <View style={[styles.dotInner, styles.dotInnerActive]} />
                    </View>
                  </Animated.View>
                );
              }

              return (
                <TouchableOpacity
                  key={b.key}
                  style={[styles.dotButton, { left: `${leftPercent}%` }]}
                  onPress={() => setSelectedBucket(b.key)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.dotOuter]}>
                    <View style={[styles.dotInner]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.labelsRow}>
            {PRICE_BUCKETS.map((b) => (
              <ThemedText
                key={b.key}
                style={[styles.sliderLabel, b.key === selectedBucket && styles.sliderLabelActive]}
              >
                {b.sliderLabel}
              </ThemedText>
            ))}
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <ThemedText style={styles.infoIconText}>i</ThemedText>
          </View>
          <View style={styles.infoText}>
            <ThemedText style={styles.infoTitle}>{selectedMeta.infoTitle}</ThemedText>
            <ThemedText style={styles.infoBody}>{selectedMeta.infoBody}</ThemedText>
          </View>
        </View>

        {/* Small adjust box */}
        <View style={styles.adjustBox}>
          <View style={styles.adjustDot} />
          <ThemedText style={styles.adjustText}>You can adjust this anytime in your profile settings.</ThemedText>
        </View>
        </View>
      </View>

      {/* Bottom Continue Button */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <View style={styles.continueContent}>
            <ThemedText style={styles.continueText}>Continue</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
  },

  logo: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginLeft: 20, // adjust for centering with back button
  },

  back: {
    fontSize: 36,
    color: '#111',
  },

  skip: {
    fontSize: 14,
    color: '#777',
  },


  progressContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },

  stepText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    fontWeight: '600',
  },

  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    marginTop: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#111',
  },

  title: {
    color: '#111',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 30,
    textAlign: 'left',
  },

  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 20,
  },

  pillRow: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  pill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },

  sliderWrap: {
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 16,
  },

  sliderTrack: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
  },

  sliderFill: {
    height: '100%',
    backgroundColor: '#111',
  },

  dotsRow: {
    position: 'relative',
    height: 50,
    marginTop: 0,
  },

  dotButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -25,
  },

  dotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dotOuterActive: {
    borderColor: '#111',
  },

  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },

  dotInnerActive: {
    backgroundColor: '#111',
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },

  sliderLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },

  sliderLabelActive: {
    color: '#111',
    fontWeight: '700',
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    marginBottom: 12,
  },

  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },

  infoBody: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  adjustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  adjustDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    marginRight: 8,
  },

  adjustText: {
    fontSize: 13,
    color: '#999',
  },

   /* ----------- BUTTON ----------- */
     bottomWrap: {
    paddingBottom: 24,
  },

  continueButton: {
    height: 64,
    backgroundColor: '#000000',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },

  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  continueText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
    marginRight: 8,
  },
});


