import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendLikeNotification, saveProduct, shareProduct, openProduct, likeProduct, unlikeProduct, dislikeProduct } from '../../lib/api';

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  likes: number;
  shares: string;
  bookmarks: string;
  deeplinkUrl?: string; // URL to open when user swipes right
  category?: string; // Product category (e.g., "men's clothing")
  externalId?: string; // External ID (e.g., Amazon ASIN)
  rating?: number; // Product rating (e.g., 4.6)
}

interface ProductCardProps {
  product: Product;
  onSave?: (productId: string | number, isSaved: boolean) => void;
  onLike?: (productId: string | number, isLiked: boolean) => void;
}



export default function ProductCard({ product, onSave, onLike }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likes);
  const [saved, setSaved] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(parseInt(product.bookmarks) || 0);
  const [shareCount, setShareCount] = useState(parseInt(product.shares) || 0);

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  };

  const handleLike = async () => {
    const action = liked ? 'Unlike' : 'Like';
    // quick popup feedback
    // Alert.alert(action, `You tapped ${action}.`);

    // optimistic update
    const delta = liked ? -1 : 1;
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(c => c + delta);

    try {
      const actionType = liked ? 'UNLIKE' : 'LIKE';
      const res = await sendLikeNotification({ productId: Number(product.id), actionType });
      if (!res.ok) throw new Error('network');

      // Notify parent component of like status change
      onLike?.(product.id, newLikedState);
    } catch (e) {
      // revert on error
      setLiked(prev => !prev);
      setLikeCount(c => c - delta);
      Alert.alert('Error', 'Failed to send like to server.');
      console.error('Like API failed', e);
    }
  };


  const handleSave = async () => {
    const action = saved ? 'Unsave' : 'Save';
    // quick popup feedback
    // Alert.alert(action, `Product ${action.toLowerCase()}d to your collection.`);

    // optimistic update
    const delta = saved ? -1 : 1;
    const newSavedState = !saved;
    setSaved(newSavedState);
    setBookmarkCount(c => c + delta);

    try {
      const actionType = saved ? 'UNSAVE' : 'SAVE';
      const res = await sendLikeNotification({ productId: Number(product.id), actionType });
      if (!res.ok) throw new Error('network');

      // Notify parent component of save status change
      onSave?.(product.id, newSavedState);
    } catch (e) {
      // revert on error
      setSaved(prev => !prev);
      setBookmarkCount(c => c - delta);
      Alert.alert('Error', 'Failed to save product.');
      console.error('Save failed', e);
    }
  };

  const handleShare = async () => {
    try {
      // Use deeplink if available, otherwise create a fallback message
      const shareUrl = product.deeplinkUrl || `Check out: ${product.name}`;
      const shareMessage = `Check out this amazing product! 🛍️\n\n${product.name}\n${product.price}\n\n${shareUrl}`;

      const result = await Share.share({
        message: shareMessage,
        title: product.name,
        url: product.deeplinkUrl, // iOS specific
      });

      // Track the share if user actually shared (not cancelled)
      if (result.action === Share.dismissedAction) {
        console.log('Share was dismissed');
      } else {
        // Update share count on successful share
        setShareCount(c => c + 1);

        // Send share event to backend
        try {
          const res = await shareProduct(Number(product.id));
          if (!res.ok) console.warn('Failed to track share on backend');
        } catch (e) {
          console.error('Share tracking failed', e);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time. Please try again.');
      console.error('Share error:', error);
    }
  };

  const handleViewDetails = async () => {
    if (product.deeplinkUrl) {
      try {
        const canOpen = await Linking.canOpenURL(product.deeplinkUrl);
        if (canOpen) {
          await Linking.openURL(product.deeplinkUrl);
          console.log('Deeplink opened from View Details:', product.deeplinkUrl);
        } else {
          Alert.alert('Unable to Open', 'Cannot open the product details at this time.');
          console.warn('Cannot open deeplink:', product.deeplinkUrl);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open product details.');
        console.error('Error opening deeplink:', error);
      }
    } else {
      Alert.alert('Info', 'Product details are not available.');
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
        {/* Top Gradient - Simple vertical fade */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.43)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topGradientOverlay}
        />

        {/* Gradient overlay at the bottom for better text visibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientOverlay}
        />

        <View style={styles.overlay}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.productDescription} numberOfLines={3}>
              {product.description}
            </Text>
          </View>

          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#ff6b78' : 'white'} />
              <Text style={styles.iconText}>{formatCount(likeCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={26} color="white" />
              <Text style={styles.iconText}>{formatCount(shareCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={26} color={saved ? '#ffd700' : 'white'} />
              <Text style={styles.iconText}>{formatCount(bookmarkCount)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Details Button - Centered at Bottom */}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={handleViewDetails}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
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
  topGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '10%',
    zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    zIndex: 1,
  },
  overlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 40,
    backgroundColor: 'transparent',
    zIndex: 2,
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
    marginBottom: 12,
  },
  viewDetailsButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewDetailsText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  socialIcons: {
    alignItems: 'center',
    marginLeft: 8,
    gap: 20,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
  },
});
