
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useUserProfile } from '../context/UserProfileContext';
import { submitUserProfile } from '../lib/profileAPI';
import { useLocalSearchParams } from 'expo-router';

type ColorOption = {
  key: string;
  label: string;
  hex?: string;
  gradient?: readonly [string, string, ...string[]];
};

// Visual labels + swatches to match the provided UI design.
const COLOR_OPTIONS: ColorOption[] = [
  { key: 'Black', label: 'Black', hex: '#111111' },
  { key: 'White', label: 'White', hex: '#FFFFFF' },
  { key: 'Grey', label: 'Grey', hex: '#9CA3AF' },
  { key: 'Blue', label: 'Blue', hex: '#2463EB' },
  { key: 'Brown', label: 'Brown', hex: '#8B4513' },
  { key: 'Green', label: 'Green', hex: '#0F6B4B' },
  { key: 'Beige', label: 'Beige', hex: '#CFC7AF' },
  { key: 'Pastels', label: 'Pastels', gradient: ['#D7E8FF', '#E5D6FF', '#F8D7D7'] as const },
  { key: 'Earth Tones', label: 'Earth Tones', gradient: ['#8B4513', '#B07D4F', '#A67C52'] as const },
];

export default function FavoriteColorsScreen() {
  const router = useRouter();
  const { isEditing } = useLocalSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const { setFavoriteColors, getProfileData } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const toggleColor = (colorName: string) => {
    if (selected.includes(colorName)) {
      setSelected((s) => s.filter((c) => c !== colorName));
    } else {
      if (selected.length >= 3) {
        alert('You can select up to 3 colors');
        return;
      }
      setSelected((s) => [...s, colorName]);
    }
  };

  const handleSurpriseMe = () => {
    // Pick 3 unique random colors to match the "Surprise me" UI.
    const pool = COLOR_OPTIONS.map((c) => c.key);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setSelected(shuffled.slice(0, 3));
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      alert('Please select at least one color');
      return;
    }

    setFavoriteColors(selected);

    if (isEditing) {
      setLoading(true);
      try {
        const profileData = { ...getProfileData(), favoriteColors: selected };
        const response = await submitUserProfile(profileData);
        if (response.success) {
          router.push('/(tabs)/account');
        } else {
          alert(`Error: ${response.message}`);
        }
      } catch (e) {
        console.error('Submit error:', e);
        alert('Failed to update profile');
      } finally {
        setLoading(false);
      }
    } else {
      router.push('/profileSetup-3priceBucket' as any);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header (taken from `profileSetup-1styleVibe.tsx` layout) */}
      <View>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.back}>‹</ThemedText>
          </TouchableOpacity>

          <Image source={require('../assets/circle_icon.png')} style={styles.logo} />

          <TouchableOpacity>
            <ThemedText style={styles.skip}>Skip</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
            <ThemedText style={styles.stepText}>STEP 2 OF 5</ThemedText>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

       
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">
        <View>
          <ThemedText style={styles.title}>Which colors do you love wearing?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select at least three to help your AI stylist curate your perfect palette.
          </ThemedText>
        </View>
        <FlatList
          data={COLOR_OPTIONS}
          keyExtractor={(item) => item.key}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.colorRow}
          contentContainerStyle={styles.colorGrid}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.key);

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => toggleColor(item.key)}
                style={styles.colorTile}
              >
                <View style={[styles.colorCircle, isSelected && styles.colorCircleSelected]}>
                  {item.gradient ? (
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.colorFill}
                    />
                  ) : (
                    <View style={[styles.colorFill, { backgroundColor: item.hex }]} />
                  )}

                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <ThemedText style={styles.check}>✓</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.colorLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.surprise} onPress={handleSurpriseMe}>
          <View style={styles.surpriseCircle}>
            <MaterialCommunityIcons name="star" size={22} color="#111" />
          </View>
          <ThemedText style={styles.surpriseText}>Surprise me</ThemedText>
        </TouchableOpacity>

        <View style={styles.dynamicCard}>
          <View style={styles.dynamicIconCircle}>
            <MaterialCommunityIcons name="autorenew" size={18} color="#111" />
          </View>

          <View style={styles.dynamicText}>
            <ThemedText style={styles.dynamicTitle}>Dynamic Styling</ThemedText>
            <ThemedText style={styles.dynamicBody}>
              Your color profile adapts as you shop. Choosing different hues now won't limit future
              options.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
          <View style={styles.continueContent}>
            <ThemedText style={styles.continueText}>{isEditing ? 'Update' : 'Continue'}</ThemedText>
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

  /* ---------------- TOP BAR ---------------- */
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
    height: 3,
    backgroundColor: '#eee',
    marginTop: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    width: '40%', // step 1 of 5
    height: '100%',
    backgroundColor: '#111',
  },


  /* ---------------- TITLE ---------------- */
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
    marginTop: 10,
    paddingHorizontal: 20,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  scrollContent: {
    
    paddingTop: 6,
    paddingBottom: 120,
  },

  /* Grid */
  colorGrid: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },

  colorRow: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  colorTile: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 8,
  },

  colorCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  colorCircleSelected: {
    borderColor: '#111',
    borderWidth: 3,
  },

  colorFill: {
    ...StyleSheet.absoluteFillObject,
  },

  checkBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  check: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  colorLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },

  /* Surprise + Info Card */
  surprise: {
    paddingHorizontal: 20,
    marginTop: 14,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },

  surpriseCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: '#777',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  surpriseText: {
    marginTop: 8,
    color: '#777',
    fontSize: 14,
    fontWeight: '600',
  },

  dynamicCard: {
    marginTop: 22,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  dynamicIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f2f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dynamicText: {
    flex: 1,
    marginLeft: 12,
  },

  dynamicTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  dynamicBody: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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
