import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  imageUri: string;
  brand?: string;
  title?: string;
  price?: string;
  oldPrice?: string;
  badgeText?: string;
  badgeColor?: string;
  likeCount?: number;
  onLike?: (liked: boolean) => void;
  onSave?: () => void;
  onCardPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function DiscoverCard({
  imageUri,
  brand,
  title,
  price,
  oldPrice,
  badgeText,
  badgeColor = '#4c6ef5',
  likeCount = 0,
  onLike,
  onSave,
  onCardPress,
  style,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCount);

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setCount((c) => (next ? c + 1 : c - 1));
      onLike?.(next);
      return next;
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.92} style={[styles.card, style]} onPress={onCardPress}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      {badgeText ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}

      <TouchableOpacity activeOpacity={0.8} style={styles.heart} onPress={toggleLike}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#ff6b78' : '#fff'} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.8} style={styles.bookmark} onPress={onSave}>
        <Ionicons name="bookmark-outline" size={18} color="#fff" />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        {brand ? <Text style={styles.brand}>{brand}</Text> : null}
        {title ? <Text style={styles.title} numberOfLines={2}>{title}</Text> : null}
        <View style={styles.priceRow}>
          {price ? <Text style={styles.price}>{price}</Text> : null}
          {oldPrice ? <Text style={styles.oldPrice}>{oldPrice}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bookmark: {
    position: 'absolute',
    top: 10,
    right: 52,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  infoBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
  },
  brand: {
    fontSize: 12,
    color: '#55607a',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 12,
    color: '#8d99ae',
    textDecorationLine: 'line-through',
  },
});