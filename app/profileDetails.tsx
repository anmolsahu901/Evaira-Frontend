import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Images } from '../constants/images';

const BODY_TYPES = ['Slim', 'Average', 'Athletic', 'Curvy', 'Other'];
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerSetter, setPickerSetter] = useState<(v: string) => void>(() => () => {});

  const openPicker = (options: string[], setter: (v: string) => void) => {
    setPickerOptions(options);
    setPickerSetter(() => setter);
    setPickerVisible(true);
  };

  const handleContinue = async () => {
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!bodyType || !gender) {
      alert('Please select body type and gender');
      return;
    }

    setLoading(true);
    try {
      // TODO: Save profile details to API
      await new Promise((r) => setTimeout(r, 900));
      // Navigate to the occasion selection screen
      router.push('/occasions');
    } catch (e) {
      console.error(e);
      alert('Failed to save profile details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container} backgroundImage={Images.background}>
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarText}>Evaira</ThemedText>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          placeholderTextColor="#444"
          value={fullName}
          onChangeText={setFullName}
        />

        <TouchableOpacity style={styles.input} onPress={() => openPicker(BODY_TYPES, (v) => setBodyType(v))}>
          <ThemedText style={styles.selectText}>{bodyType ?? 'Select your body type'}</ThemedText>
          <ThemedText style={styles.chev}>▼</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.input} onPress={() => openPicker(GENDERS, (v) => setGender(v))}>
          <ThemedText style={styles.selectText}>{gender ?? 'Select your gender'}</ThemedText>
          <ThemedText style={styles.chev}>▼</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.continueText}>Continue →</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <Modal transparent visible={pickerVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <FlatList
              data={pickerOptions}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    pickerSetter(item);
                    setPickerVisible(false);
                  }}
                >
                  <ThemedText style={styles.modalItemText}>{item}</ThemedText>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.modalCancel} onPress={() => setPickerVisible(false)}>
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 150,
    paddingBottom: 90,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: -24,
    right: -24,
    height: 84,
    backgroundColor: '#263238',
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
  form: {
    flex: 1,
    marginTop: 90,
    marginBottom: 70,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  input: {
    width: '92%',
    height: 64,
    borderWidth: 4,
    borderColor: '#111',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 18,
    color: '#111',
  },
  chev: {
    color: '#111',
    fontSize: 18,
  },
  continueButton: {
    width: '80%',
    height: 64,
    backgroundColor: '#2b3133',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111',
  },
  modalCancel: {
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#007aff',
    fontSize: 16,
  },
});