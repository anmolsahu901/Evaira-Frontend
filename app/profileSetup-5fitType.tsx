import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator,Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useUserProfile } from '../context/UserProfileContext';
import { submitUserProfile } from '../lib/profileAPI';

const FIT_TYPES = [
    {
        id: 'SLIM',
        label: 'Slim Fit',
        subtitle: 'Contoured to your body for a sharp, tailored',
        image: require('../assets/fit/slim.webp'),
    },
    {
        id: 'REGULAR',
        label: 'Regular Fit',
        subtitle: 'The standard cut. Comfortable and',
        image: require('../assets/fit/regular.webp'),
    },
    {
        id: 'RELAXED',
        label: 'Relaxed Fit',
        subtitle: 'Roomier through the frame for a casual, laid-back feel.',
        image: require('../assets/fit/relaxed.webp'),
    },
    {
        id: 'OVERSIZED',
        label: 'Oversized',
        subtitle: 'A modern, boxy silhouette with deliberate volume.',
        image: require('../assets/fit/oversized.webp'),
    },
];

export default function FitTypeScreen() {
    const router = useRouter();
    const { setFitTypes ,getProfileData} = useUserProfile();
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const toggleOption = (fitId: string) => {
        setSelected((current) =>
            current.includes(fitId)
                ? current.filter((id) => id !== fitId)
                : [...current, fitId]
        );
    };

    const handleContinue = async () => {
        if (!selected.length) {
            alert('Select at least one fit preference to continue.');
            return;
        }

    
    setLoading(true);
    try {
      setFitTypes(selected);

      const profileData = { ...getProfileData(), fitTypes: selected };
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
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={styles.back}>‹</ThemedText>
                </TouchableOpacity>

                <Image
                    source={require('../assets/circle_icon.png')}
                    style={styles.logo}
                />

                <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
                    <ThemedText style={styles.skip}>Skip</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <ThemedText style={styles.stepText}>STEP 5 OF 5</ThemedText>
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
            </View>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Title */}
                <ThemedText style={styles.title}>
                    How do you like your clothes to fit?
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Your AI stylist will prioritize silhouettes that match your comfort
                    zone.
                </ThemedText>

                {/* Grid */}
                <View style={styles.grid}>
                    {FIT_TYPES.map((fit) => {
                        const isSelected = selected.includes(fit.id);

                        return (
                            <TouchableOpacity
                                key={fit.id}
                                style={[styles.card, isSelected && styles.cardSelected]}
                                onPress={() => toggleOption(fit.id)}
                            >
                                <Image source={fit.image} style={styles.image} />

                                {/* Overlay */}
                                <View style={styles.overlay} />

                                {/* Text Container */}
                                <View style={styles.textContainer}>
                                    <ThemedText style={styles.cardLabel}>{fit.label}</ThemedText>
                                    <ThemedText style={styles.cardSubtitle}>
                                        {fit.subtitle}
                                    </ThemedText>
                                </View>

                                {/* Checkmark */}
                                {isSelected && (
                                    <View style={styles.checkCircle}>
                                        <ThemedText style={styles.check}>✓</ThemedText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Personalization Tip */}
                <View style={styles.tipContainer}>
                    <View style={styles.aiIconContainer}>
                        <ThemedText style={styles.aiIcon}>✨</ThemedText>
                    </View>
                    <View style={styles.tipContent}>
                        <ThemedText style={styles.tipLabel}>
                            Personalization tip:{' '}
                            <ThemedText style={styles.tipBold}>
                                Most Evaira users prefer
                            </ThemedText>
                        </ThemedText>
                        <ThemedText style={styles.tipText}>
                            <ThemedText style={styles.tipBold}>Regular Fit</ThemedText> for
                            lounge and{' '}
                            <ThemedText style={styles.tipBold}>Relaxed Fit</ThemedText> for
                            formal occasions.
                        </ThemedText>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
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

    /* ----------- TOP BAR ----------- */
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
    },

    logo: {
        width: 40,
        height: 40,
        alignSelf: 'center',
        marginLeft: 19,
    },

    back: {
        fontSize: 26,
        color: '#111',
    },

    skip: {
        fontSize: 14,
        color: '#777',
    },

    /* ----------- PROGRESS ----------- */
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
        width: '100%', // step 5 of 5
        height: '100%',
        backgroundColor: '#111',
    },

    /* ----------- TITLE ----------- */
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111',
        marginTop: 10,
        paddingHorizontal: 20,
        lineHeight: 40,
    },

    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 6,
        marginBottom: 14,
        paddingHorizontal: 20,
        lineHeight: 20,
    },

    /* ----------- GRID ----------- */
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },

    card: {
        width: '48%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e0e0e0',

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
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
        backgroundColor: 'rgba(0,0,0,0.2)',
    },

    textContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
    },

    cardLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },

    cardSubtitle: {
        fontSize: 11,
        color: '#666',
        fontWeight: '400',
        lineHeight: 16,
    },

    /* ----------- CHECKMARK ----------- */
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

    /* ----------- PERSONALIZATION TIP ----------- */
    tipContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 24,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 14,
        alignItems: 'flex-start',
    },

    aiIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e8e8e8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },

    aiIcon: {
        fontSize: 16,
    },

    tipContent: {
        flex: 1,
    },

    tipLabel: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        lineHeight: 16,
        marginBottom: 4,
    },

    tipBold: {
        fontWeight: '700',
        color: '#111',
    },

    tipText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400',
        lineHeight: 16,
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
