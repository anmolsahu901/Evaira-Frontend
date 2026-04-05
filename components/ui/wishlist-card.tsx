import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type WishlistItem = {
  id: string | number;
  brand: string;
  name?: string;
  price: string;
  oldPrice?: string;
  imageUrl: string;
  rating?: number;
  reviews?: number;
  deeplinkUrl?: string;
};

type Props = {
  item: WishlistItem;
  onRemove?: (productId: string | number) => void | Promise<void>;
  onMoveToBag?: (id: string) => void;
};

export default function WishlistCard({ item, onRemove, onMoveToBag }: Props) {
  const handleOpenDeeplink = async () => {
    if (!item.deeplinkUrl) {
      Alert.alert('Error', 'Product URL is not available');
      console.warn('[WishlistCard] deeplinkUrl is missing for item:', item.id);
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(item.deeplinkUrl);
      if (canOpen) {
        console.log('[WishlistCard] Opening deeplink:', item.deeplinkUrl);
        await Linking.openURL(item.deeplinkUrl);
      } else {
        Alert.alert('Error', 'Unable to open product link');
        console.warn('[WishlistCard] Cannot open URL:', item.deeplinkUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open product link');
      console.error('[WishlistCard] Error opening deeplink:', error);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      {typeof item.rating === 'number' && (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating.toFixed(1)} ★</Text>
          <Text style={styles.reviewsText}> {item.reviews ?? 0}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.remove} onPress={() => onRemove?.(item.id)}>
        <Ionicons name="close" size={18} color="#333" />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand}</Text>
        {item.name ? <Text style={styles.name} numberOfLines={2}>{item.name}</Text> : null}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          {item.oldPrice ? <Text style={styles.oldPrice}>{item.oldPrice}</Text> : null}
        </View>

        <TouchableOpacity style={styles.moveBtn} onPress={handleOpenDeeplink}>
          <Text style={styles.moveText}>CLICK TO OPEN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 6,
    flex: 1,
    // shadow for android / ios
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    backgroundColor: '#f2f2f2',
  },
  remove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    marginTop: 2,
    marginLeft: 8,
    marginBottom: 2,
    backgroundColor: '#ffffffcc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    elevation: 1,
  },
  ratingText: {
    fontWeight: '700',
    color: '#1c7cbd',
  },
  reviewsText: {
    color: '#333',
    marginLeft: 6,
    opacity: 0.8,
  },
  info: {
    padding: 8,
    paddingTop: 2,
  },
  brand: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 0,
    marginBottom: 2,
    color: '#222',
  },
  name: {
    color: '#666',
    fontSize: 13,
    marginBottom: 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontWeight: '700',
    fontSize: 15,
    color: '#111',
  },
  oldPrice: {
    marginLeft: 8,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  moveBtn: {
    marginTop: 2,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#000000d5',
    borderWidth: 1,
    borderColor: '#5f5f5f',
  },
  moveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});