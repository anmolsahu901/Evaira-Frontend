import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, FlatList, LayoutChangeEvent, Alert, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard, { Product } from '../../components/ui/product-card';
import SwipeableCard from '../../components/ui/swipeable-card';
import { sendLikeNotification, getProducts } from '../../lib/api';

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
  },
  {
    id: 'another-product3',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'silk-evening-gown1',
    name: 'Silk Evening Gown',
    price: '$499.00',
    description: 'Elegant floor-length gown, perfect for parties. Available in multiple colors.',
    imageUrl: 'https://images.unsplash.com/photo-1533659828870-95ee305cee3e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 1200000,
    shares: '10K',
    bookmarks: '5K',
  },
  {
    id: 'another-product4',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product5',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product6',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product7',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product8',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product9',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product10',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product11',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product12',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
   {
    id: 'another-product13',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product14',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product15',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product16',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product17',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product18',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product19',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product20',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  {
    id: 'another-product21',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    shares: '5K',
    bookmarks: '1.2K',
  },
  // Add more products as needed
];

export default function Home() {
  const [containerHeight, setContainerHeight] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedStack, setSwipedStack] = useState<Array<{ product: Product; direction: 'left' | 'right' }>>([]);
  const undoTimerRef = useRef<number | null>(null);

  // Fetch products from API on component mount
  useEffect(() => {
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

    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  const scheduleClearUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = setTimeout(() => {
      setSwipedStack([]);
      undoTimerRef.current = null;
    }, 5000) as unknown as number;
  };

  const handleSwipe = async (product: Product, direction: 'left' | 'right') => {
    // push to undo stack
    setSwipedStack(prev => [{ product, direction }, ...prev]);

    // remove swiped product from the deck
    setProducts(prev => prev.filter(p => p.id !== product.id));

    if (direction === 'right') {
      // mark liked remotely (best effort)
      try {
        const res = await sendLikeNotification({ productId: Number(product.id), actionType: 'LIKE' });
        if (!res.ok) throw new Error('network');
      } catch (e) {
        Alert.alert('Error', 'Failed to send like to server.');
        console.warn('Like API failed', e);
      }

      // 🔗 Open deeplink if available
      if (product.deeplinkUrl) {
        try {
          const canOpen = await Linking.canOpenURL(product.deeplinkUrl);
          if (canOpen) {
            await Linking.openURL(product.deeplinkUrl);
            console.log('Deeplink opened:', product.deeplinkUrl);
          } else {
            console.warn('Cannot open deeplink:', product.deeplinkUrl);
          }
        } catch (error) {
          console.error('Error opening deeplink:', error);
        }
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
      // revert the like on the server (best-effort)
      try {
        const res = await sendLikeNotification({ productId: Number(product.id), actionType: 'UNLIKE' });
        if (!res.ok) throw new Error('network');
      } catch (e) {
        Alert.alert('Error', 'Failed to revert like on server.');
        console.warn('Revert like failed', e);
      }
    }

    if (rest.length === 0 && undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ height: containerHeight }}>
      <SwipeableCard onSwipe={(dir) => handleSwipe(item, dir)}>
        <ProductCard product={item} />
      </SwipeableCard>
    </View>
  );

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
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 18 }}>No more products</Text>
            </View>
          )}
          getItemLayout={(_data, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  undoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
    alignItems: 'center',
    zIndex: 10,
    paddingTop: 6,
  },
  undoButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 28,
    alignItems: 'center',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
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
    fontSize: 12,
    marginTop: 2,
    marginLeft: 6,
  },
});
