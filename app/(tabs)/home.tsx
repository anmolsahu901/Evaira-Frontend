import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, StatusBar, FlatList, LayoutChangeEvent, Alert, Text, TouchableOpacity, Image, Linking, Animated, BackHandler, ToastAndroid, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ProductCard, { Product } from '../../components/ui/product-card';
import SwipeableCard from '../../components/ui/swipeable-card';
import OnboardingGuide from '../../components/ui/OnboardingGuide';
import { sendLikeNotification, getProducts, dislikeProduct, prefetchDiscoverData, trackProductSeen } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';

const mockProducts: Product[] = [
  {
    id: 'silk-evening-gown',
    name: 'Silk Evening Gown',
    price: '$499.00',
    description: 'Elegant floor-length gown, perfect for parties. Available in multiple colors.',
    imageUrl: 'https://images.unsplash.com/photo-1533659828870-95ee305cee3e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 1200000,
    shares: '10K',
    bookmarks: '5K',
    brand: 'Elegance Paris'
  },
  {
    id: 'another-product1',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
    brand: 'Evaira Collection'
  },
  {
    id: 'another-product2',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
    brand: 'Studio Chic'
  }
  // Add more products as needed
];

export default function Home() {
  const wishlist = useWishlist();
  const [containerHeight, setContainerHeight] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [swipedStack, setSwipedStack] = useState<Array<{ product: Product; direction: 'left' | 'right' }>>([]);
  const undoTimerRef = useRef<number | null>(null);
  const [headerOpacity] = useState(() => new Animated.Value(1));
  const [headerVisible, setHeaderVisible] = useState(true);
  const seenProductIds = useRef<Set<string | number>>(new Set());
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: Product, isViewable: boolean }> }) => {
    viewableItems.forEach(({ item, isViewable }) => {
      if (isViewable && !seenProductIds.current.has(item.id)) {
        seenProductIds.current.add(item.id);
        trackProductSeen(item.id);
      }
    });
  }).current;

  const handleVisibilityChange = (visible: boolean) => {
    setHeaderVisible(visible);
    Animated.timing(headerOpacity, {
      toValue: visible ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  // Fetch products from API whenever the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      let backPressCount = 0;

      const onBackPress = () => {
        if (backPressCount === 0) {
          backPressCount++;
          if (Platform.OS === 'android') {
            ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          }
          setTimeout(() => {
            backPressCount = 0;
          }, 2000);
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      };

      const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      const fetchProducts = async () => {
        try {
          setLoading(true);
          const result = await getProducts();
          if (result.ok && result.data) {
            setProducts(result.data);
          } else {
            console.error('Failed to fetch products:', result.data);
            // Fallback to mock products on error
            setProducts(mockProducts);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          // Fallback to mock products on error
          setProducts(mockProducts);
        } finally {
          setLoading(false);
        }
      };

      // this will load feed on focus of home screen only when feed is empty
      if (products.length === 0) fetchProducts();


      return () => {
        backSubscription.remove();
      };
    }, [products.length])
  );

  useEffect(() => {
    // Prefetch discover data when home screen opens
    prefetchDiscoverData().catch(e => console.log('Prefetch explore failed', e));

    const checkOnboarding = async () => {
      try {
        const hasSeen = await SecureStore.getItemAsync('hasSeenOnboarding');
        if (hasSeen !== 'true') {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.log('Error reading onboarding status', e);
      }
    };
    checkOnboarding();

    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  const finishOnboarding = async () => {
    try {
      await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    } catch (e) {}
    setShowOnboarding(false);
  };

  const scheduleClearUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = setTimeout(() => {
      setSwipedStack([]);
      undoTimerRef.current = null;
    }, 2000) as unknown as number;
  };

  const handleSwipe = async (product: Product, direction: 'left' | 'right') => {
    if (showOnboarding && onboardingStep === 2) {
      setOnboardingStep(3);
    }

    // push to undo stack only for dislike (swipe left)
    // if (direction === 'left') {
    //   // setSwipedStack(prev => [{ product, direction }, ...prev]);
    // }

    // remove swiped product from the deck
    setProducts(prev => prev.filter(p => p.id !== product.id));

    if (direction === 'right') {
      try {
        const res = await sendLikeNotification({ productId: Number(product.id), actionType: 'LIKE' });
        if (!res.ok) throw new Error('network');
      } catch (e) {
        console.warn('LIKE API failed', e);
      }
    }
    else {
      // Handle swipe left (dislike)
      try {
        const res = await dislikeProduct(Number(product.id));
        if (!res.ok) throw new Error('network');
      } catch (e) {
        Alert.alert('Error', 'Failed to send dislike to server.');
        console.warn('Dislike API failed', e);
      }
    }

    scheduleClearUndo();
  };

  const handleUndo = async () => {
    if (swipedStack.length === 0) return;
    const [last, ...rest] = swipedStack;
    const { product, direction } = last;

    // restore product to the front of the deck
    setProducts(prev => [product, ...prev]);
    setSwipedStack(rest);

    if (direction === 'right') {
      // Revert the local visually (by pushing it back), but 'OPEN' actions typically aren't reverted on the server.
    }

    if (rest.length === 0 && undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const renderItem = ({ item, index }: { item: Product; index: number }) => {
    const nextItem = index < products.length - 1 ? products[index + 1] : null;
    const handleViewDetails = () => {
      if (showOnboarding && onboardingStep === 3) {
        finishOnboarding();
      }
    };
    return (
      <View style={{ height: containerHeight }}>
        <SwipeableCard
          onSwipe={(dir) => handleSwipe(item, dir)}
          nextItem={nextItem ? <ProductCard product={nextItem} onVisibilityChange={handleVisibilityChange} onViewDetails={handleViewDetails} /> : undefined}
        >
          <ProductCard product={item} onVisibilityChange={handleVisibilityChange} onViewDetails={handleViewDetails} />
        </SwipeableCard>
      </View>
    );
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  // Inline SVG data URI for a curved-left arrow (encoded). This will render without requiring an external file.
  const undoSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='46' height='46'>
      <path d='M21 12H8' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/>
      <path d='M10 19L3 12L10 5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/>
    </svg>
  `);

  const undoDataUri = `data:image/svg+xml;utf8,${undoSvg}`;
  const [imageLoadError, setImageLoadError] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* FlatList Container - Full Screen */}
      <View style={styles.flatListContainer} onLayout={onLayout}>
        {containerHeight > 0 && (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialNumToRender={1}
            windowSize={3}
            extraData={products}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, height: containerHeight, justifyContent: 'center', alignItems: 'center' }}>
                {loading ? (
                  <>
                    <ActivityIndicator size="large" color="#ffffff" style={{ marginBottom: 20 }} />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '500', letterSpacing: 1.5 }}>CURATING YOUR STYLE...</Text>
                    <Text style={{ color: '#888', fontSize: 13, marginTop: 8 }}>Evaira is getting everything ready for you</Text>
                  </>
                ) : (
                  <Text style={{ color: 'white', fontSize: 18 }}>No more products</Text>
                )}
              </View>
            )}
            onScrollBeginDrag={() => {
              if (showOnboarding && onboardingStep === 1) {
                setOnboardingStep(2);
              }
            }}
            viewabilityConfig={viewabilityConfig.current}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_data, index) => ({
              length: containerHeight,
              offset: containerHeight * index,
              index,
            })}
          />
        )}
      </View>

      {/* Header with Logo and Search/Cart Icons - Overlay on Top */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/circle_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.View
          style={[styles.headerIcons, { opacity: headerOpacity }]}
          pointerEvents={headerVisible ? 'auto' : 'none'}
        >
          {/* <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="cart" size={24} color="white" />
          </TouchableOpacity> */}
        </Animated.View>
      </View>

      {showOnboarding && (
        <OnboardingGuide 
          step={onboardingStep} 
          onSkip={finishOnboarding} 
        />
      )}

      {swipedStack.length > 0 && (
        <View style={styles.undoContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo} accessibilityLabel="Undo last swipe">
            {/* try the inline SVG data URI first, fallback to Ionicons if it fails */}
            {!imageLoadError ? (
              <Image
                source={{ uri: undoDataUri }}
                style={styles.undoImage}
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <Ionicons name="arrow-undo" size={28} color="white" />
            )}
            <Text style={styles.undoSubText}>{swipedStack[0].product.name}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flatListContainer: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 250, // Increased top to bring it down
    alignItems: 'center',
    zIndex: 10,
    paddingTop: 6,
  },
  undoButton: {
    backgroundColor: 'rgba(20, 30, 50, 0.51)', // Darker, sleeker background
    paddingHorizontal: 20,
    paddingVertical: 10, // Modify this to change height
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 160,
    borderWidth: 1,
    borderColor: 'rgba(116, 104, 104, 0.15)', // Subtle glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    gap: 10,
  },
  undoImage: {
    width: 38,
    height: 38,
    tintColor: 'white',
    marginRight: 8,
  },
  undoText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  undoSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginTop: 2,
    marginLeft: 6,
  },
});
