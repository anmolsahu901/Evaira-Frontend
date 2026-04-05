import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { useUserProfile } from "../context/UserProfileContext";

const OCCASIONS = [
  {
    id: "OFFICE",
    label: "Office",
    subtitle: "Professional & Polished",
    icon: "👔",
  },
  {
    id: "COLLEGE",
    label: "College",
    subtitle: "Smart & Trendy",
    icon: "🎓",
  },
  {
    id: "CASUAL_EVERYDAY",
    label: "Casual Everyday",
    subtitle: "Easy & Comfortable",
    icon: "☕",
  },
  {
    id: "GYM_ACTIVE",
    label: "Gym / Active",
    subtitle: "High Performance",
    icon: "💪",
  },
  {
    id: "HOME_LOUNGE",
    label: "Home",
    subtitle: "Cozy & Relaxed",
    icon: "🏠",
  },
  {
    id: "PARTY",
    label: "Party",
    subtitle: "Elegant & Bold",
    icon: "🍷",
  },
  {
    id: "VACATION",
    label: "Vacation",
    subtitle: "Versatile & Chic",
    icon: "✈️",
  },

  {
    id: "FESTIVE",
    label: "Festive",
    subtitle: "Traditional & Vibrant",
    icon: "🏠",
  },
];

export default function OccasionsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const { setPreferredOccasions } = useUserProfile();

  const toggleOption = (occasionId: string) => {
    setSelected((current) =>
      current.includes(occasionId)
        ? current.filter((id) => id !== occasionId)
        : [...current, occasionId]
    );
  };

  const handleContinue = () => {
    if (!selected.length) {
      alert("Select at least one occasion to continue.");
      return;
    }
    // Save occasions to context and navigate to favorite colors
    setPreferredOccasions(selected);
    router.push("/profileSetup-5fitType");
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
      <ScrollView showsVerticalScrollIndicator={false}>
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
              >
                <ThemedText style={styles.iconText}>{occasion.icon}</ThemedText>

                <ThemedText style={styles.cardLabel}>
                  {occasion.label}
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  {occasion.subtitle}
                </ThemedText>

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

        <ThemedText style={styles.multiSelectText}>
          MULTI: SELECT AS MANY AS YOU LIKE
        </ThemedText>
      </ScrollView>

      {/* Bottom Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <View style={styles.continueContent}>
          <ThemedText style={styles.continueText}>Continue</ThemedText>
          {/* <ThemedText style={styles.nextText}>Next: Fit Preference</ThemedText>
          <ThemedText style={styles.arrow}>→</ThemedText> */}
        </View>
      </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  logo: {
    width: 40,
    height: 40,
    alignSelf: "center",
    marginLeft: 19,
  },

  back: {
    fontSize: 26,
    color: "#111",
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
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#dbd5d5",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  cardSelected: {
    backgroundColor: "#f0f0f0",
    borderColor: "#111",
  },

  iconText: {
    fontSize: 40,
    marginBottom: 8,
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
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  check: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
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
  continueButton: {
    height: 64,
    backgroundColor: "#2b3133",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },

  continueContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },

  nextText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },

  arrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
