import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Pressable,
  Animated,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sendLikeNotification, saveProduct, shareProduct, openProduct, likeProduct, unlikeProduct, dislikeProduct, trackProductSeen } from '../../lib/api';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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
  brand?: string; // Product brand name
}

interface ProductCardProps {
  product: Product;
  onSave?: (productId: string | number, isSaved: boolean) => void;
  onLike?: (productId: string | number, isLiked: boolean) => void;
  onVisibilityChange?: (visible: boolean) => void;
}



export default function ProductCard({ product, onSave, onLike, onVisibilityChange }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likes);
  const [saved, setSaved] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(parseInt(product.bookmarks) || 0);
  const [shareCount, setShareCount] = useState(parseInt(product.shares) || 0);
  const [contentVisible, setContentVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  // Track product as seen when it mounts/is viewed
  useEffect(() => {
    trackProductSeen(product.id);
  }, [product.id]);

  // Generate a consistent random color based on the brand name
  const brandBgColor = React.useMemo(() => {
    if (!product.brand) return 'rgba(35, 68, 255, 0.6)';
    const colors = [
      'rgba(233, 30, 99, 0.6)',     // Pink
      'rgba(156, 39, 176, 0.6)',    // Purple
      'rgba(63, 81, 181, 0.6)',     // Indigo
      'rgba(0, 150, 136, 0.6)',     // Teal
      'rgba(255, 152, 0, 0.6)',     // Orange
      'rgba(244, 67, 54, 0.6)',     // Red
      'rgba(121, 85, 72, 0.6)',     // Brown
      'rgba(96, 125, 139, 0.6)',    // Blue Grey
      'rgba(46, 204, 113, 0.6)',    // Emerald
      'rgba(211, 84, 0, 0.6)',      // Pumpkin
      'rgba(22, 160, 133, 0.6)',    // Green Sea
      'rgba(41, 128, 185, 0.6)',    // Belize Blue
      'rgba(142, 68, 173, 0.6)',    // Wisteria
      'rgba(44, 62, 80, 0.6)',      // Midnight Blue
      'rgba(230, 126, 34, 0.6)',    // Carrot Orange
      'rgba(0, 188, 212, 0.6)',     // Cyan
      'rgba(76, 175, 80, 0.6)',     // Light Green
      'rgba(104, 159, 56, 0.6)',    // Grass Green
      'rgba(69, 179, 157, 0.6)',    // Aqua
      'rgba(175, 122, 197, 0.6)',   // Amethyst
      'rgba(205, 92, 92, 0.6)',     // Indian Red
      'rgba(46, 134, 193, 0.6)',    // Cobalt
      'rgba(139, 13, 212, 0.6)',    // Gold
      'rgba(39, 174, 96, 0.6)',     // Nephritis
      'rgba(200, 50, 100, 0.6)'     // Berry
    ];
    let hash = 0;
    for (let i = 0; i < product.brand.length; i++) {
      hash = product.brand.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [product.brand]);

  const toggleOverlay = () => {
    const nextValue = contentVisible ? 0 : 1;
    Animated.timing(overlayOpacity, {
      toValue: nextValue,
      duration: 260,
      useNativeDriver: false,
    }).start();
    setContentVisible(!contentVisible);
    onVisibilityChange?.(!contentVisible);
  };

  const buttonBgColor = overlayOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00000028', '#ffffff']
  });
  const buttonTextColor = overlayOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#000000ff']
  });

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
    try {
      const res = await openProduct(Number(product.id));
      if (!res.ok) console.warn('Failed to track OPEN action on backend');
    } catch (e) {
      console.error('OPEN tracking failed', e);
    }

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

      <Pressable style={styles.container} onPress={toggleOverlay}>
        {/* Top Gradient - Simple vertical fade */}
        <AnimatedLinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.topGradientOverlay, { opacity: overlayOpacity }]}
        />

        {/* Gradient overlay at the bottom for better text visibility */}
        <AnimatedLinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.gradientOverlay, { opacity: overlayOpacity }]}
        />

        <Animated.View pointerEvents={contentVisible ? 'auto' : 'none'} style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={styles.productInfo} onPress={(e) => e.stopPropagation()}>
            {product.brand ? (
              <View style={[styles.brandButton, { backgroundColor: brandBgColor }]}>
                <Ionicons name="pricetag" size={14} color="#fff" style={styles.brandIcon} />
                <Text style={styles.productBrand}>{product.brand}</Text>
              </View>
            ) : null}
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.productDescription} numberOfLines={3}>
              {product.description}
            </Text>
          </Pressable>

          <Pressable style={styles.socialIcons} onPress={(e) => e.stopPropagation()}>

            <TouchableOpacity style={styles.iconWrapper} onPress={handleLike}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={30}
                color={liked ? '#ff3040' : '#fff'}
              />
              <Text style={styles.iconText}>{formatCount(likeCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconWrapper} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={28} color="#fff" />
              <Text style={styles.iconText}>{formatCount(shareCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconWrapper} onPress={handleSave}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color="#fff"
              />
              <Text style={styles.iconText}>{formatCount(bookmarkCount)}</Text>
            </TouchableOpacity>

          </Pressable>
        </Animated.View>

        {/* View Details Button - Centered at Bottom */}
        <TouchableOpacity
          style={styles.viewDetailsWrapper}
          onPress={handleViewDetails}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.viewDetailsButton, { backgroundColor: buttonBgColor }]}>
            <Animated.Text style={[styles.viewDetailsText, { color: buttonTextColor }]}>View Details</Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </Pressable>
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
    paddingBottom: 80,
    paddingTop: 40,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  productInfo: {
    flex: 1,
    paddingRight: 20,
  },
  brandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  brandIcon: {
    color: '#ffffffff',
    marginRight: 6,
    opacity: 0.85,
  },
  productBrand: {
    color: '#ffffffff',
    fontSize: 13,
    fontWeight: '800',
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  productName: {
    color: '#fff',
    fontSize: 25,
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
  viewDetailsWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    zIndex: 3,
  },
  viewDetailsButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewDetailsText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  socialIcons: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
    gap: 22,
  },

  iconWrapper: {
    alignItems: 'center',
  },

  iconText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
