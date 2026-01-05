import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendLikeNotification } from '../../lib/api';

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  likes: number;
  comments: string;
  shares: string;
  bookmarks: string;
}

interface ProductCardProps {
  product: Product;
}



export default function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likes);

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  };

  const handleLike = async () => {
    const action = liked ? 'Unlike' : 'Like';
    // quick popup feedback
    Alert.alert(action, `You tapped ${action}.`);

    // optimistic update
    const delta = liked ? -1 : 1;
    setLiked(!liked);
    setLikeCount(c => c + delta);

    try {
      const res = await sendLikeNotification({ productId: product.id, liked: !liked });
      if (!res.ok) throw new Error('network');
    } catch (e) {
      // revert on error
      setLiked(prev => !prev);
      setLikeCount(c => c - delta);
      Alert.alert('Error', 'Failed to send like to server.');
      console.error('Like API failed', e);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{ uri: product.imageUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <View style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.productDescription} numberOfLines={3}>
              {product.description}
            </Text>
          </View>

          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.iconContainer} onPress={handleLike}>
              <View style={styles.iconCircle}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#ff6b78' : 'white'} />
              </View>
              <Text style={styles.iconText}>{formatCount(likeCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubble-outline" size={26} color="white" />
              </View>
              <Text style={styles.iconText}>{product.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="paper-plane-outline" size={26} color="white" />
              </View>
              <Text style={styles.iconText}>{product.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="bookmark-outline" size={26} color="white" />
              </View>
              <Text style={styles.iconText}>{product.bookmarks}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%', 
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40, // Adjusted for bottom navigation
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  productInfo: {
    flex: 1,
    paddingRight: 20,
  },
  productName: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  productPrice: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    opacity: 0.95,
  },
  productDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.95,
  },
  socialIcons: {
    alignItems: 'center',
    marginLeft: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#fff',
    marginTop: 6,
    fontSize: 12,
    opacity: 0.95,
  },
});
