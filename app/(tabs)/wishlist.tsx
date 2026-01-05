import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import WishlistCard, { WishlistItem } from '../../components/ui/wishlist-card';

const SAMPLE: WishlistItem[] = [
  {
    id: '1',
    brand: 'Roadster',
    name: 'Black Leather Jacket',
    price: '₹1,499',
    oldPrice: '₹4,999',
    imageUrl: 'https://images.unsplash.com/photo-1606715791286-6e43e9838f44?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.2,
    reviews: 326,
  },
  {
    id: '2',
    brand: 'H&M',
    name: 'Zip Hoodie',
    price: '₹1,499',
    imageUrl: 'https://media.istockphoto.com/id/136798742/photo/brown-hooded-sweatshirt-on-white-background.jpg?s=2048x2048&w=is&k=20&c=sHq9o1F4xtsfFFtIR7ZzI2T4Cj6brI0HiiVxppQ45NY=',
    rating: 4.3,
    reviews: 9800,
  },
  {
    id: '3',
    brand: 'DressBerry',
    name: 'Trench Coat',
    price: '₹2,999',
    oldPrice: '₹5,999',
    imageUrl: 'https://images.unsplash.com/photo-1676716105765-e19fe6a01851?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.4,
    reviews: 55,
  },
  {
    id: '4',
    brand: 'Puma',
    name: 'Running Shoe',
    price: '₹3,429',
    oldPrice: '₹6,999',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.3,
    reviews: 334,
  },
];

export default function Wishlist() {
  const [filter, setFilter] = useState<string>('Saved');
  const [items, setItems] = useState<WishlistItem[]>(SAMPLE);

  const chips = useMemo(() => ['Saved', 'Liked by me'], []);

  const onRemove = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const onMoveToBag = (id: string) => {
    // placeholder: in real app, call move-to-bag API and remove from wishlist
    // setItems((prev) => prev.filter((p) => p.id !== id));
    // show feedback, navigate etc.
  };

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>
        <FlatList
          data={chips}
          horizontal
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
        renderItem={({ item }) => (
          <WishlistCard item={item} onRemove={onRemove} onMoveToBag={onMoveToBag} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text style={{ color: '#666' }}>No items saved yet.</Text></View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9fb' },
  chipsRow: { height: 45, justifyContent: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  chipActive: {
    borderColor: '#ff2b54',
    backgroundColor: '#fff0f4',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ff2b54',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  empty: { padding: 24, alignItems: 'center' },
});