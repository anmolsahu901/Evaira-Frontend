import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';
import { useUserProfile } from '../context/UserProfileContext';

const OPTIONS = [
  'Party & Clubwear',
  'Traditional & Ethnic',
  'Everyday Casuals',
  'Gen Z Trends',
  'Work Formal',
  'Activewear & Sporty',
];

export default function OccasionsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const { setPreferredOccasions } = useUserProfile();

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected((s) => s.filter((x) => x !== item));
    } else {
      if (selected.length >= 3) {
        alert('You can select up to 3 options');
        return;
      }
      setSelected((s) => [...s, item]);
    }
  };

  const handleContinue = () => {
    // Save occasions to context and navigate to favorite colors
    setPreferredOccasions(selected);
    router.push('/favoriteColors');
  };

  return (
    <ThemedView style={styles.container} >
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarText}>Evaira</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title}>And for which occasion are you shopping?</ThemedText>
        <ThemedText style={styles.subtitle}>Select up to 3 options that describe your style.</ThemedText>

        <FlatList
          data={OPTIONS}
          keyExtractor={(i) => i}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item);
            return (
              <TouchableOpacity onPress={() => toggle(item)} style={[styles.option, isSelected && styles.optionSelected]}>
                <ThemedText style={styles.optionText}>{item}</ThemedText>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <ThemedText style={styles.counter}>{selected.length}/3 selected</ThemedText>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <View style={styles.continueContent}>
            <ThemedText style={styles.continueText}>Continue</ThemedText>
            <ThemedText style={styles.arrow}>→</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 130,
    paddingBottom: 70,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: -24,
    right: -24,
    height: 84,
    backgroundColor: '#1a2a32ff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingTop: 18,
  },
  topBarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 18,
    textAlign: 'center',
  },
  list: {
    width: '100%',
    alignItems: 'center',
  },
  option: {
    width: '92%',
    height: 72,
    borderWidth: 3,
    borderColor: '#111',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: '#2b3133',
  },
  optionText: {
    fontSize: 18,
    color: '#111',
  },
  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2b3133',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2b3133',
  },
  counter: {
    marginTop: 6,
    color: '#111',
    fontSize: 14,
    marginBottom: 12,
  },
  continueButton: {
    width: '80%',
    height: 64,
    backgroundColor: '#2b3133',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 20,
    marginRight: 10,
  },
  arrow: {
    color: '#fff',
    fontSize: 20,
  },
});