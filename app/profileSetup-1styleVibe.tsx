import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useUserProfile } from '../context/UserProfileContext';
import { submitUserProfile } from '../lib/profileAPI';
import { useLocalSearchParams } from 'expo-router';

const STYLE_VIBES = [
  'MINIMAL',
  'STREETWEAR',
  'CASUAL',
  'CLASSIC',
  'OLD_MONEY',
  'SPORTY',
  'TRENDY',
  'FORMAL',

];

const COLORS = [
  '#ecf0f1',
  '#f6e6c3',
  '#d7e8ff',
  '#e5d6ff',
  '#f8d7d7',
  '#d7f0dd',
];

const STYLE_IMAGES: Record<string, any> = {
  MINIMAL: require('../assets/styles/minimal.jpg'),
  STREETWEAR: require('../assets/styles/streetwear.jpg'),
  CASUAL: require('../assets/styles/casual.jpg'),
  CLASSIC: require('../assets/styles/classic.jpg'),
  OLD_MONEY: require('../assets/styles/oldmoney.jpg'),
  SPORTY: require('../assets/styles/sporty.jpg'),
  FORMAL: require('../assets/styles/formal.jpg'),
  TRENDY: require('../assets/styles/trendy.jpg'),
};

//   MINIMAL,    // clean, plain, neutral
// CASUAL,
// CLASSIC,
// OLD_MONEY,// timeless, polos, chinos, oxfords
// FORMAL,     // sharp, tailored, dressy
// STREETWEAR,     // streetwear: graphics, bold, urban
// SPORTY,     // athleisure / performance look
// TRENDY, 

export default function StyleVibe1Screen() {
  const router = useRouter();
  const { isEditing } = useLocalSearchParams();
  const { setStyleVibes, getProfileData } = useUserProfile();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleOption = (item: string) => {
    setSelected((current) =>
      current.includes(item) ? current.filter((i) => i !== item) : [...current, item]
    );
  };

  const handleContinue = async () => {
    if (!selected.length) {
      alert('Select at least one style vibe to continue.');
      return;
    }

    setStyleVibes(selected);

    if (isEditing) {
      setLoading(true);
      try {
        const profileData = { ...getProfileData(), styleVibes: selected };
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
      router.push('/profileSetup-2colorSelection' as any);
    }
  };

  const handleSurpriseMe = () => {
    // placeholder – you can implement later
    console.log("Surprise me clicked");
  };

  return (
    <ThemedView style={styles.container}>

      {/* Top Bar */}
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
        <ThemedText style={styles.stepText}>STEP 1 OF 5</ThemedText>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>



      {/* Grid */}
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">
        {/* Title */}
        <ThemedText style={styles.title}>What styles feel like you?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose a few. Your AI stylist will learn more about your unique taste over time.
        </ThemedText>

        <View style={styles.grid}>

          {STYLE_VIBES.map((style) => {
            const isSelected = selected.includes(style);

            return (
              <TouchableOpacity
                key={style}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleOption(style)}
                activeOpacity={0.8}
              >
                <Image source={STYLE_IMAGES[style]} style={styles.image} />

                {/* Overlay */}
                <View style={styles.overlay} />

                {/* Name */}
                <ThemedText style={styles.cardText}>
                  {style.replace('_', ' ')}
                </ThemedText>

                {/* Tick */}
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <ThemedText style={styles.check}>✓</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

        </View>

        {/* Surprise Me */}
        <TouchableOpacity style={styles.surprise} onPress={handleSurpriseMe}>
          <ThemedText style={styles.surpriseText}>Not sure? Surprise me</ThemedText>
        </TouchableOpacity>

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
    width: '20%', // step 1 of 5
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

  /* ---------------- GRID ---------------- */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },

  card: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',

    // premium shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  cardSelected: {
    borderColor: '#111',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  cardText: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ---------------- SELECTION ---------------- */
  checkCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
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

  /* ---------------- SURPRISE ---------------- */
  surprise: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  surpriseText: {
    fontSize: 13,
    color: '#777',
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
