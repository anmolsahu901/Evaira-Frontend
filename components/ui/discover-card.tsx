import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  imageUri: string;
  likeCount?: number;
  onLike?: (liked: boolean) => void;
  onBuy?: () => void;
  onSave?: () => void;
  style?: ViewStyle;
};

export default function DiscoverCard({ imageUri, likeCount = 0, onLike, onBuy, onSave, style }: Props) {
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
    <View style={[styles.card, style]}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <TouchableOpacity activeOpacity={0.8} style={styles.heart} onPress={toggleLike}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#ff6b78' : '#fff'} />
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onSave} activeOpacity={0.8}>
          <Ionicons name="bookmark-outline" size={18} color="#111" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyButton} onPress={onBuy} activeOpacity={0.9}>
          <Text style={styles.buyText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    color: '#111',
    fontWeight: '700',
  },
});