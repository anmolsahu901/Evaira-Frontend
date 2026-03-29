import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useUserProfile, type PriceBucket } from '../context/UserProfileContext';
import { submitUserProfile } from '../lib/profileAPI';

const PRICE_BUCKETS: Array<{
  key: PriceBucket;
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
    infoBody: 'Everyday essentials at great prices. Expected range: Rs500 - Rs1000.',
  },
  {
    key: 'VALUE',
    pillLabel: 'Value',
    sliderLabel: 'VALUE',
    infoTitle: 'Value Shopping',
    infoBody: 'Quality basics with smart value. Expected range: Rs900 - Rs1600.',
  },
  {
    key: 'MEDIUM',
    pillLabel: 'Mid-range',
    sliderLabel: 'MID-RANGE',
    infoTitle: 'Mid-range Shopping',
    infoBody: 'Contemporary brands and premium materials. Expected range: Rs1000 - Rs2500.',
  },
  {
    key: 'PREMIUM',
    pillLabel: 'Premium',
    sliderLabel: 'PREMIUM',
    infoTitle: 'Premium Shopping',
    infoBody: 'Designer pieces and top-tier fabrics. Expected range: Rs2500+',
  },
];

export default function PriceBucketScreen() {
  const router = useRouter();
  const { setPriceBucket, getProfileData } = useUserProfile();

  const [selectedBucket, setSelectedBucket] = useState<PriceBucket>('MEDIUM');
  const [loading, setLoading] = useState(false);

  const selectedIndex = useMemo(() => {
    const idx = PRICE_BUCKETS.findIndex((b) => b.key === selectedBucket);
    return idx >= 0 ? idx : 0; 
  }, [selectedBucket]);

  const selectedMeta = PRICE_BUCKETS[selectedIndex];

  const sliderFillPercent = useMemo(() => {
    if (PRICE_BUCKETS.length <= 1) return 0;
    return (selectedIndex / (PRICE_BUCKETS.length - 1)) * 100;
  }, [selectedIndex]);

  const handleContinue = async () => {
    if (!selectedBucket) {
      alert('Please select a shopping range');
      return;
    }

    setLoading(true);
    try {
      setPriceBucket(selectedBucket);

      const profileData = { ...getProfileData(), priceBucket: selectedBucket };
      const response = await submitUserProfile(profileData);

      if (response.success) {
        router.replace('/(tabs)/home');
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (e) {
      console.error('Submit error:', e);
      alert('Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header (taken from `profileSetup-1styleVibe.tsx` layout) */}
      <View style={styles.topBar}>
        <TouchableOpacity>
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

      {/* Title */}
      <ThemedText style={styles.title}>What’s your typical shopping range?</ThemedText>
      <ThemedText style={styles.subtitle}>We’ll match great styles within your comfort zone.</ThemedText>

      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <ThemedText style={styles.pillText}>{selectedMeta.pillLabel}</ThemedText>
        </View>
      </View>

      {/* Slider */}
      <View style={styles.sliderWrap}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${sliderFillPercent}%` }]} />
        </View>

        {/* Dots are positioned along the track */}
        <View style={styles.dotsRow} pointerEvents="box-none">
          {PRICE_BUCKETS.map((b, idx) => {
            const isActive = b.key === selectedBucket;
            const leftPercent = (idx / (PRICE_BUCKETS.length - 1)) * 100;

            return (
              <TouchableOpacity
                key={b.key}
                style={[styles.dotButton, { left: `${leftPercent}%` }]}
                onPress={() => setSelectedBucket(b.key)}
                activeOpacity={0.9}
              >
                <View style={[styles.dotOuter, isActive && styles.dotOuterActive]}>
                  <View style={[styles.dotInner, isActive && styles.dotInnerActive]} />
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

      {/* Bottom Continue Button */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
          <View style={styles.continueContent}>
            <ThemedText style={styles.continueText}>Continue</ThemedText>
            {loading ? <ActivityIndicator color="#fff" /> : null}
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
    paddingTop: 50,
  },

  back: {
    fontSize: 26,
    color: '#111',
  },

  skip: {
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },

  logo: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginLeft: 19,
  },

  /* ---------------- PROGRESS ---------------- */
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
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
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: 'left',
  },

  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 20,
    textAlign: 'left',
    lineHeight: 20,
  },

  pillRow: {
    marginTop: 6,
    alignItems: 'center',
  },

  pill: {
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },

  pillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  /* ---------------- SLIDER ---------------- */
  sliderWrap: {
    marginTop: 22,
  },

  sliderTrack: {
    height: 8,
    backgroundColor: '#cfd8dc',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },

  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#111',
  },

  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -8,
    height: 28,
  },

  dotButton: {
    position: 'absolute',
    transform: [{ translateX: -10 }, { translateY: 0 }],
  },

  dotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d9dee4',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotOuterActive: {
    borderColor: '#111',
    backgroundColor: '#111',
  },

  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d9dee4',
  },

  dotInnerActive: {
    backgroundColor: '#fff',
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingHorizontal: 2,
  },

  sliderLabel: {
    color: '#c0c7d1',
    fontSize: 10,
    fontWeight: '700',
    width: '22%',
    textAlign: 'center',
  },

  sliderLabelActive: {
    color: '#111',
  },

  /* ---------------- INFO CARD ---------------- */
  infoCard: {
    marginTop: 22,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  infoIconText: {
    color: '#7b869b',
    fontWeight: '900',
  },

  infoText: {
    marginLeft: 12,
    flex: 1,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },

  infoBody: {
    marginTop: 4,
    fontSize: 12,
    color: '#7b869b',
    lineHeight: 16,
  },

  /* ---------------- Adjust box ---------------- */
  adjustBox: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eff2f6',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  adjustDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#111',
    marginRight: 10,
  },

  adjustText: {
    color: '#7b869b',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },

  /* ---------------- Continue ---------------- */
  bottomWrap: {
    marginTop: 18,
    paddingBottom: 24,
  },

  continueButton: {
    height: 64,
    backgroundColor: '#111',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});

