import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { useUserProfile } from "../context/UserProfileContext";
import { useLocalSearchParams } from "expo-router";
import { submitUserProfile } from "../lib/profileAPI";

const OCCASIONS = [
  {
    id: "OFFICE",
    label: "Office",
    subtitle: "Professional & Polished",
    iconName: "briefcase-outline",
    iconNameSolid: "briefcase",
  },
  {
    id: "COLLEGE",
    label: "College",
    subtitle: "Smart & Trendy",
    iconName: "school-outline",
    iconNameSolid: "school",
  },
  {
    id: "CASUAL_EVERYDAY",
    label: "Casual Everyday",
    subtitle: "Easy & Comfortable",
    iconName: "coffee-outline",
    iconNameSolid: "coffee",
  },
  {
    id: "GYM_ACTIVE",
    label: "Gym / Active",
    subtitle: "High Performance",
    iconName: "dumbbell",
    iconNameSolid: "dumbbell",
  },
  {
    id: "HOME_LOUNGE",
    label: "Home",
    subtitle: "Cozy & Relaxed",
    iconName: "home-outline",
    iconNameSolid: "home",
  },
  {
    id: "PARTY",
    label: "Party",
    subtitle: "Elegant & Bold",
    iconName: "drink",
    iconNameSolid: "drink",
    family: "Entypo",
  },
  {
    id: "VACATION",
    label: "Vacation",
    subtitle: "Versatile & Chic",
    iconName: "airplane",
    iconNameSolid: "airplane",
  },
  {
    id: "FESTIVE",
    label: "Festive",
    subtitle: "Traditional & Vibrant",
    iconName: "party-popper",
    iconNameSolid: "party-popper",
  },
];

export default function OccasionsScreen() {
  const router = useRouter();
  const { isEditing } = useLocalSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const { setPreferredOccasions, getProfileData } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const toggleOption = (occasionId: string) => {
    setSelected((current) =>
      current.includes(occasionId)
        ? current.filter((id) => id !== occasionId)
        : [...current, occasionId]
    );
  };

  const handleContinue = async () => {
    if (!selected.length) {
      alert("Select at least one occasion to continue.");
      return;
    }
    // Save occasions to context
    setPreferredOccasions(selected);

    if (isEditing) {
      setLoading(true);
      try {
        const profileData = { ...getProfileData(), preferredOccasions: selected };
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
      router.push("/profileSetup-5fitType");
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
          source={require("../assets/circle_icon.png")}
          style={styles.logo}
        />

        <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
          <ThemedText style={styles.skip}>Skip</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ThemedText style={styles.stepText}>STEP 4 OF 5</ThemedText>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">
        {/* Title */}
        <ThemedText style={styles.title}>When do you usually dress up?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Select the moments that define your lifestyle so we can curate your
          wardrobe.
        </ThemedText>

        {/* Grid */}
        <View style={styles.grid}>
          {OCCASIONS.map((occasion) => {
            const isSelected = selected.includes(occasion.id);

            return (
              <TouchableOpacity
                key={occasion.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => toggleOption(occasion.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  {occasion.family === "Entypo" ? (
                    <Entypo 
                      name={(isSelected ? occasion.iconNameSolid : occasion.iconName) as any} 
                      size={38} 
                      color={isSelected ? "#fff" : "#111"} 
                    />
                  ) : (
                    <MaterialCommunityIcons 
                      name={(isSelected ? occasion.iconNameSolid : occasion.iconName) as any} 
                      size={38} 
                      color={isSelected ? "#fff" : "#111"} 
                    />
                  )}
                </View>

                <ThemedText style={styles.cardLabel}>
                  {occasion.label}
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  {occasion.subtitle}
                </ThemedText>

                {/* Checkmark */}
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedText style={styles.multiSelectText}>
          MULTI: SELECT AS MANY AS YOU LIKE
        </ThemedText>
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
    backgroundColor: "#fff",
  },

  /* ----------- TOP BAR ----------- */
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
    color: "#777",
  },

  /* ----------- PROGRESS ----------- */
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  stepText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    fontWeight: "600",
  },

  progressBar: {
    height: 3,
    backgroundColor: "#eee",
    marginTop: 6,
    borderRadius: 2,
    overflow: "hidden",
  },

  progressFill: {
    width: "80%", // step 4 of 5
    height: "100%",
    backgroundColor: "#111",
  },

  /* ----------- TITLE ----------- */
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 40,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  /* ----------- GRID ----------- */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  card: {
    width: "48%",
    aspectRatio: 0.95,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#eaeaec",
    alignItems: "center",
    justifyContent: "center",
  },

  cardSelected: {
    backgroundColor: "#e8e9eb",
    borderColor: "#111",
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f6f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  iconContainerSelected: {
    backgroundColor: '#111',
  },

  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
    fontWeight: "400",
  },

  /* ----------- CHECKMARK ----------- */
  checkCircle: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ----------- MULTI SELECT TEXT ----------- */
  multiSelectText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    fontWeight: "600",
    letterSpacing: 1,
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
