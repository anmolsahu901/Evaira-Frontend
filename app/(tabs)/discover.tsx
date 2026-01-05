import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DiscoverCard from '../../components/ui/discover-card';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.round(width * 0.64);
const CARD_HEIGHT = 220;

// Sample images per section — replace these arrays with API data when available
const newArrivals = [
  'https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520975667681-6d0e25f9c3c4?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
];

const similarInterests = [
  'https://images.unsplash.com/photo-1520962912646-7b5d8d9b0caa?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503342452485-86f7f3ff8964?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495121605193-b116b5b09d05?q=80&w=1200&auto=format&fit=crop',
];

const recommended = [
  'https://images.unsplash.com/photo-1503341455253-fed2f4a9f3b1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503342452485-86f7f3ff8964?q=80&w=1200&auto=format&fit=crop',
];

export default function Discover() {
  const insets = useSafeAreaInsets();

  const renderSection = (title: string, items: string[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((src, i) => (
          <DiscoverCard key={i} imageUri={src} style={styles.card} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    // <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        {renderSection('New arrivals', newArrivals)}
        {renderSection('Similar interests', similarInterests)}
        {renderSection('Recommended for you', recommended)}
      </ScrollView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#fefefeff',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  row: {
    paddingLeft: 2,
    paddingRight: 8,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
