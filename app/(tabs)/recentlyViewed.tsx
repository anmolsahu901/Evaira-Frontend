import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WishlistCard, { WishlistItem } from '../../components/ui/wishlist-card';
import { getProductBasedOnAction } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';
import { FeedView } from './discover';

export default function RecentlyViewed() {
  const router = useRouter();
  const wishlist = useWishlist();
  const [filter, setFilter] = useState<string>('Recently Viewed');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<{ items: any[], initialIndex: number } | null>(null);

  const chips = useMemo(() => ['Recently Viewed', 'Recently Opened'], []);

  // Convert API Product to WishlistItem
  const convertProductToWishlistItem = (product: any): WishlistItem => ({
    ...product,
    id: product.id, 
    brand: product.brand || 'Product',
    name: product.title || 'Unknown Product',
    price: `₹${product.price || 0}`,
    imageUrl: product.imageUrl,
    rating: product.rating || 0,
    reviews: product.likesCount || 0,
    deeplinkUrl: product.deeplinkUrl,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const actionType = filter === 'Recently Viewed' ? 'SEEN' : 'OPEN';
      console.log('[RecentlyViewed] Fetching products for filter:', filter);
      const result = await getProductBasedOnAction(actionType);

      if (result.ok && result.data && Array.isArray(result.data)) {
        const wishlistItems = result.data.map(convertProductToWishlistItem);
        setItems(wishlistItems);
      } else {
        setError('Failed to load products');
        setItems([]); 
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to fetch products');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [filter, fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      console.log('[RecentlyViewed] Screen focused, refreshing products');
      fetchProducts();
      return () => setSelectedFeed(null);
    }, [fetchProducts])
  );

  const onRemove = async (productId: string | number) => {
    // Removal from recently viewed/opened is generally not supported or needed,
    // so we can just mock it or ignore it here.
    console.log('[RecentlyViewed] Remove action triggered for', productId, 'but not supported.');
  };

  const onMoveToBag = (id: string) => {};

  if (selectedFeed) {
    return (
      <FeedView
        initialItems={selectedFeed.items}
        initialIndex={selectedFeed.initialIndex}
        onClose={() => setSelectedFeed(null)}
        disableSeenTracking={true}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity style={styles.headerSide} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1d2c4f" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>RECENT PRODUCTS</Text>
        <View style={styles.headerSide}>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={20} color="#243f70" />
          </TouchableOpacity>
        </View>
      </View>

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

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff2b54" />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={{ color: '#ff2b54', fontWeight: '600' }}>Error</Text>
          <Text style={{ color: '#666', marginTop: 8 }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, index) => String(it.id) + index}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 8, paddingHorizontal: 8 }}
          renderItem={({ item, index }) => (
            <View style={styles.cardWrapper}>
              <WishlistCard
                item={item}
                onRemove={onRemove}
                onMoveToBag={onMoveToBag}
                onCardPress={() => setSelectedFeed({ items, initialIndex: index })}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={{ color: '#666' }}>
                No items {filter === 'Recently Viewed' ? 'viewed' : 'opened'} yet.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomColor: '#efeff4',
    borderBottomWidth: 1,
  },
  headerSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    color: '#1d2c4f',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e9f8',
  },
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
    borderColor: '#000000',
    backgroundColor: '#000000c7',
  },
  chipText: {
    color: '#000000',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 0,
  },
  cardWrapper: {
    width: '48%',
    marginVertical: 3,
  },
  empty: { padding: 24, alignItems: 'center' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
