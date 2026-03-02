import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import WishlistCard, { WishlistItem } from '../../components/ui/wishlist-card';
import { getWishlistData, unlikeProduct, unsaveProduct } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';

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
  const wishlist = useWishlist();
  const [filter, setFilter] = useState<string>('Saved');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading = true to show loader on mount
  const [error, setError] = useState<string | null>(null);

  const chips = useMemo(() => ['Saved', 'Liked by me'], []);

  // Convert API Product to WishlistItem
  const convertProductToWishlistItem = (product: any): WishlistItem => ({
    id: product.id, // Store database ID for API calls (productId)
    brand: product.category || 'Product', // Use category as brand
    name: product.title || 'Unknown Product',
    price: `₹${product.price || 0}`,
    imageUrl: product.imageUrl,
    rating: product.rating || 0,
    reviews: product.likesCount || 0, // Use likes count as reviews count
    deeplinkUrl: product.deeplinkUrl, // Include deeplink from API
  });

  // Function to fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine action type based on filter
      const actionType = filter === 'Saved' ? 'SAVE' : 'LIKE';
      console.log('[Wishlist] Fetching products for filter:', filter);
      const result = await getWishlistData(actionType);

      if (result.ok && result.data && Array.isArray(result.data)) {
        // Convert products to wishlist items
        const wishlistItems = result.data.map(convertProductToWishlistItem);
        setItems(wishlistItems);
      } else {
        setError('Failed to load products');
        setItems([]); // Clear items on error
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to fetch products');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch products when filter changes
  useEffect(() => {
    fetchProducts();
  }, [filter, fetchProducts]);

  // Refetch products whenever tab becomes visible
  useFocusEffect(
    useCallback(() => {
      console.log('[Wishlist] Tab focused, refreshing products');
      fetchProducts();
    }, [fetchProducts])
  );

  const onRemove = async (productId: string | number) => {
    try {
      console.log('[Wishlist] Removing item:', { productId, filter });
      
      if (!productId) {
        console.warn('[Wishlist] productId is missing, cannot remove from backend');
        // Still remove from UI
        setItems((prev) => prev.filter((p) => p.id !== productId));
        return;
      }

      // Call the appropriate API method based on filter
      const result = filter === 'Saved' 
        ? await unsaveProduct(productId)
        : await unlikeProduct(productId);

      if (result.ok) {
        console.log('[Wishlist] Successfully removed from backend:', { productId, filter });
        // Remove from UI after successful API call
        setItems((prev) => prev.filter((p) => p.id !== productId));
      } else {
        console.error('[Wishlist] Failed to remove from backend:', result);
        // Optionally show an alert or toast
      }
    } catch (error) {
      console.error('[Wishlist] Error removing item:', error);
    }
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
          keyExtractor={(it) => String(it.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
          renderItem={({ item }) => (
            <WishlistCard item={item} onRemove={onRemove} onMoveToBag={onMoveToBag} />
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={{ color: '#666' }}>
                No items {filter === 'Saved' ? 'saved' : 'liked'} yet.
              </Text>
            </View>
          )}
        />
      )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});