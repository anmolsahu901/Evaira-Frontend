
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, TextInput, Modal, ActivityIndicator } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useUserProfile } from '../context/UserProfileContext';
import { submitUserProfile } from '../lib/profileAPI';

const PREDEFINED_COLORS = [
  'Navy',
  'Royal Blue',
  'Black',
  'Pink',
  'Red',
  'Emerald Green',
  'White',
  'Gray',
  'Purple',
  'Orange',
  'Yellow',
  'Brown',
];

const COLOR_SAMPLES: { [key: string]: string } = {
  'Navy': '#001F3F',
  'Royal Blue': '#4169E1',
  'Black': '#111111',
  'Pink': '#FF69B4',
  'Red': '#FF4136',
  'Emerald Green': '#50C878',
  'White': '#FFFFFF',
  'Gray': '#AAAAAA',
  'Purple': '#B10DC9',
  'Orange': '#FF851B',
  'Yellow': '#FFDC00',
  'Brown': '#8B4513',
};

export default function FavoriteColorsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [customColorModal, setCustomColorModal] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setFavoriteColors, setAuthToken, getProfileData } = useUserProfile();

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

  const addCustomColor = () => {
    if (!customColorName.trim()) {
      alert('Please enter a color name');
      return;
    }
    
    if (selected.length >= 3) {
      alert('You can select up to 3 colors');
      return;
    }
    
    const colorName = customColorName.trim();
    setSelected((s) => [...s, colorName]);
    setCustomColorName('');
    setCustomColorModal(false);
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      alert('Please select at least one color');
      return;
    }
    
    setLoading(true);
    
    // Get complete profile data and merge with selected colors
    // (Using local 'selected' state instead of relying on async context update)
    const profileData = { ...getProfileData(), favoriteColors: selected };
    
    submitUserProfile(profileData)
      .then((response) => {
        if (response.success) {
          alert('Profile created successfully!');
          // Navigate to home screen
          router.replace('/(tabs)/home');
        } else {
          alert(`Error: ${response.message}`);
        }
      })
      .catch((error) => {
        console.error('Submit error:', error);
        alert('Failed to submit profile');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarText}>Evaira</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title}>What are your favorite colors?</ThemedText>
        <ThemedText style={styles.subtitle}>Select up to 3 colors you love or add your own.</ThemedText>

        <View style={styles.selectedContainer}>
          {selected.length > 0 && (
            <FlatList
              data={selected}
              keyExtractor={(item) => item}
              horizontal
              contentContainerStyle={styles.selectedList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleColor(item)}
                  style={[styles.selectedColor, { backgroundColor: COLOR_SAMPLES[item] || '#CCCCCC' }]}
                >
                  <View style={styles.selectedColorOverlay}>
                    <ThemedText style={styles.selectedColorName}>{item}</ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <FlatList
          data={PREDEFINED_COLORS}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item);
            const hexColor = COLOR_SAMPLES[item] || '#CCCCCC';
            return (
              <TouchableOpacity
                onPress={() => toggleColor(item)}
                style={[styles.colorOption, isSelected && styles.colorOptionSelected]}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: hexColor },
                    isSelected && styles.colorCircleSelected,
                  ]}
                >
                  {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.colorName}>{item}</ThemedText>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setCustomColorModal(true)}
        >
          <ThemedText style={styles.addCustomButtonText}>+ Add Custom Color</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.counter}>{selected.length}/3 selected</ThemedText>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
          <View style={styles.continueContent}>
            <ThemedText style={styles.continueText}>Continue</ThemedText>
            {loading ? (
              <ActivityIndicator color="#fff" style={styles.spinner} />
            ) : (
              <ThemedText style={styles.arrow}>→</ThemedText>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={customColorModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Add Custom Color</ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Color Name</ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Maroon, Turquoise"
                placeholderTextColor="#999"
                value={customColorName}
                onChangeText={setCustomColorName}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setCustomColorModal(false);
                  setCustomColorName('');
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={addCustomColor}>
                <ThemedText style={styles.addButtonText}>Add Color</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 20,
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
  selectedContainer: {
    width: '100%',
    marginBottom: 20,
    minHeight: 80,
  },
  selectedList: {
    justifyContent: 'center',
  },
  selectedColor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2b3133',
  },
  selectedColorOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  list: {
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  colorOption: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  colorOptionSelected: {
    backgroundColor: '#e8e8e8',
  },
  colorCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorCircleSelected: {
    borderColor: '#2b3133',
    borderWidth: 3,
  },
  checkmark: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  colorName: {
    fontSize: 14,
    color: '#111',
    textAlign: 'center',
    fontWeight: '500',
  },
  addCustomButton: {
    width: '90%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#2b3133',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  addCustomButtonText: {
    fontSize: 16,
    color: '#2b3133',
    fontWeight: '600',
  },
  counter: {
    marginBottom: 12,
    color: '#111',
    fontSize: 14,
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
  spinner: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#f9f9f9',
  },
  colorPreview: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#2b3133',
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
