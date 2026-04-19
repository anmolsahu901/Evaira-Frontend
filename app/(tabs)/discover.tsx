import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  LayoutChangeEvent,
  Alert,
  Animated,
  Linking,
  StatusBar,
  BackHandler,
  RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DiscoverCard from '../../components/ui/discover-card';
import { getDiscoverData, sendLikeNotification, dislikeProduct, trackProductSeen } from '../../lib/api';
import ProductCard, { Product as HomeProduct } from '../../components/ui/product-card';
import SwipeableCard from '../../components/ui/swipeable-card';
import { useWishlist } from '../../context/WishlistContext';

const { width } = Dimensions.get('window');

const toHomeProduct = (item: any): HomeProduct => ({
  id: String(item.id || item.externalId || Math.random()),
  name: item.title || 'Product',
  price: item.price || '',
  description: item.description || item.brand || '',
  imageUrl: item.imageUri || item.imageUrl || '',
  likes: item.likesCount || item.likes || 0,
  shares: '0',
  bookmarks: '0',
  deeplinkUrl: item.deeplinkUrl,
  brand: item.brand,
});

export const FeedView = ({ initialItems, initialIndex, onClose, disableSeenTracking = false }: { initialItems: any[], initialIndex: number, onClose: () => void, disableSeenTracking?: boolean }) => {
  const wishlist = useWishlist();
  const [containerHeight, setContainerHeight] = useState(0);

  const [products, setProducts] = useState<HomeProduct[]>(() => {
    const list = initialItems.map(toHomeProduct);
    return [...list.slice(initialIndex), ...list.slice(0, initialIndex)];
  });

  const [swipedStack, setSwipedStack] = useState<Array<{ product: HomeProduct; direction: 'left' | 'right' }>>([]);
  const undoTimerRef = useRef<number | null>(null);
  const [headerOpacity] = useState(() => new Animated.Value(1));
  const [headerVisible, setHeaderVisible] = useState(true);
  const seenProductIds = useRef<Set<string | number>>(new Set());
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: HomeProduct }> }) => {
    if (disableSeenTracking) return;
    viewableItems.forEach(({ item }) => {
      if (!seenProductIds.current.has(item.id)) {
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

  useEffect(() => {
    const onBackPress = () => {
      onClose();
      return true; // prevent default behavior
    };
    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      backHandlerSubscription.remove();
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, [onClose]);

  const scheduleClearUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setSwipedStack([]);
      undoTimerRef.current = null;
    }, 5000) as unknown as number;
  };

  const handleSwipe = async (product: HomeProduct, direction: 'left' | 'right') => {
    setSwipedStack(prev => [{ product, direction }, ...prev]);
    setProducts(prev => prev.filter(p => p.id !== product.id));

    if (direction === 'right') {
      try {
        await sendLikeNotification({ productId: Number(product.id) || product.id, actionType: 'OPEN' });
      } catch (e) { }
      if (product.deeplinkUrl) {
        try {
          const canOpen = await Linking.canOpenURL(product.deeplinkUrl);
          if (canOpen) await Linking.openURL(product.deeplinkUrl);
        } catch (error) { }
      }
    } else {
      try { await dislikeProduct(Number(product.id) || product.id); } catch (e) { }
    }
    scheduleClearUndo();
  };

  const handleUndo = async () => {
    if (swipedStack.length === 0) return;
    const [last, ...rest] = swipedStack;
    const { product, direction } = last;

    setProducts(prev => [product, ...prev]);
    setSwipedStack(rest);

    if (direction === 'right') {
      // Reverted locally, but no 'UNOPEN' server action
    }

    if (rest.length === 0 && undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const renderItem = ({ item }: { item: HomeProduct }) => (
    <View style={{ height: containerHeight }}>
      <SwipeableCard onSwipe={(dir) => handleSwipe(item, dir)}>
        <ProductCard product={item} onVisibilityChange={handleVisibilityChange} />
      </SwipeableCard>
    </View>
  );

  const undoSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='46' height='46'>
      <path d='M21 12H8' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/>
      <path d='M10 19L3 12L10 5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/>
    </svg>
  `);
  const undoDataUri = `data:image/svg+xml;utf8,${undoSvg}`;
  const [imageLoadError, setImageLoadError] = useState(false);

  return (
    <View style={styles.feedContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.flatListContainer} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
        {containerHeight > 0 && (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialNumToRender={1}
            windowSize={3}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18 }}>No more products</Text>
              </View>
            )}
            viewabilityConfig={viewabilityConfig.current}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_data, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
          />
        )}
      </View>

      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]} pointerEvents={headerVisible ? 'auto' : 'none'}>
        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {swipedStack.length > 0 && (
        <View style={styles.undoContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
            {!imageLoadError ? (
              <Image source={{ uri: undoDataUri }} style={styles.undoImage} onError={() => setImageLoadError(true)} />
            ) : (
              <Ionicons name="arrow-undo" size={28} color="white" />
            )}
            <Text style={styles.undoSubText}>{swipedStack[0].product.name}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const RECOMMENDED_CARD_WIDTH = Math.round(width * 0.65);
const RECOMMENDED_CARD_HEIGHT = 290;
const HORIZONTAL_CARD_WIDTH = Math.round(width * 0.50);
const GRID_CARD_WIDTH = Math.round((width - 52) / 2);
const CARD_HEIGHT = 250;

const mockRecommendedProducts = [
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/kurta/z/b/m/m-kfn386-303-diwas-by-manyavar-original-imahh4j22dztjgfy.jpeg?q=90',
    brand: 'Manyavar',
    title: 'Straight Kurta',
    price: 'Rs.2999',
    description: 'Elegant straight kurta crafted with fine fabric. Perfect for formal and semi-formal traditional settings.',
    badgeText: 'AI Pick',
    badgeColor: '#1f7a9b',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/kurta/c/o/6/m-men-printed-kurta-cellux-original-imagtfsmfketf6me.jpeg?q=90',
    brand: 'Cellux',
    title: 'Printed Straight Kurta',
    price: 'Rs.1580',
    description: 'Step out in style with this vibrantly printed straight kurta, blending contemporary motifs with classic tailoring.',
    badgeText: 'New',
    badgeColor: '#ac41d0',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/ethnic-set/6/j/q/xxl-ss-p-001-j-tb-mania-original-imahg6nsfusmq72n.jpeg?q=90',
    brand: 'Koshin',
    title: 'Block Print Straight Kurta',
    price: 'Rs.1320',
    description: 'Traditional block printed patterns on a breathable kurta. Ideal for everyday cultural elegance.',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/kurta/n/d/5/xl-bnrsi-kurta-tsarina-original-imahh3m5yw4g5zyt.jpeg?q=90',
    brand: 'Tsarina',
    title: 'Design Straight Kurta',
    price: 'Rs.1780',
    description: 'A sophisticated design straight kurta featuring intricate hem patterns and a comfortable fit for day-to-day wear.',
    badgeText: 'AI Pick',
    badgeColor: '#1f7a9b',
  },
];

const mockTrendingProducts = [
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/t-shirt/l/q/l/l-trendy-ovr-one-piece-sky-l-hustle-tees-original-imahhy3bgr9qsh2h.jpeg?q=90',
    brand: 'Hustle',
    title: 'Round Neck Blue T-Shirt',
    price: 'Rs.299',
    description: 'A vibrant blue round neck t-shirt with premium stitching for an ultra-casual look.',
    badgeText: 'Bestseller',
    badgeColor: '#2b68f5',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/t-shirt/d/l/f/s-black-solo-1-wayup-original-imahezmqfzageu55.jpeg?q=90',
    brand: 'Wayup ',
    title: ' Round Neck Black T-Shirt',
    price: 'Rs.695',
    badgeText: 'Bestseller',
    badgeColor: '#2b68f5',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/t-shirt/n/b/u/xxl-tanktop-4104-kajaru-original-imahfhncdzqsq2ja.jpeg?q=90',
    brand: 'Kajaru ',
    title: 'Neck Brown T-Shirt',
    price: 'Rs.820',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/t-shirt/e/f/r/m-wrts0338f-wrogn-original-imagszka3xhhhqzx.jpeg?q=90',
    brand: 'Wrogn ',
    title: 'Neck Blue T-Shirt',
    price: 'Rs.1210',
  },
];

const mockSeasonalSaleProducts = [
  {
    imageUri: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/f/7/f747997232889_1.jpg?rnd=20200526195200&tr=w-256',
    brand: 'Souled Store',
    title: 'Souled Store',
    price: 'Rs.525',
    oldPrice: 'Rs.1150',
    badgeText: '50% OFF',
    badgeColor: '#1db954',
  },
  {
    imageUri: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/b/6/b631efbS26HMKT376_1.jpg?rnd=20200526195200&tr=w-256',
    brand: 'Tommy Hilfiger',
    title: 'Regular Fit Cotton T-Shirt',
    price: 'Rs.985',
    oldPrice: 'Rs.1240',
    badgeText: '40% OFF',
    badgeColor: '#1db954',
  },
];

const mockNewArrivalProducts = [
  {
    imageUri: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/8/a8bffd6MD263632_1.jpg?rnd=20200526195200&tr=w-2566',
    brand: 'Souled Store',
    title: 'Dark Paisley Holiday Shirt',
    price: 'Rs.1180',
    badgeText: 'New',
    badgeColor: '#ac41d0',
  },
  {
    imageUri: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/4/e/4e79964SS25CSMSSRT8301_1.jpg?rnd=20200526195200&tr=w-256',
    brand: 'Campus Sutra',
    title: 'Cotton Poplin Shirt',
    price: 'Rs.1295',
    badgeText: 'New',
    badgeColor: '#ac41d0',
  },
  {
    imageUri: 'https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/3/a3df7aa906958_1.jpg?rnd=20200526195200&tr=w-256',
    brand: 'Rare Rabbit',
    title: 'Brown Solid Shirt',
    price: 'Rs.1295',
    badgeText: 'New',
    badgeColor: '#ac41d0',
  },
];

const SectionHeader = ({ title, subtitle, onViewAll }: { title: string; subtitle?: string; onViewAll?: () => void }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
      <Text style={styles.viewAll}>VIEW ALL →</Text>
    </TouchableOpacity>
  </View>
);

const renderHorizontalSection = (
  title: string,
  subtitle: string,
  items: Array<any>,
  onItemPress: (index: number) => void,
  onViewAll: () => void,
  cardWidth = HORIZONTAL_CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
) => (
  <View style={styles.section}>
    <SectionHeader title={title} subtitle={subtitle} onViewAll={onViewAll} />
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      data={items}
      keyExtractor={(item, index) => `${title}-${index}`}
      renderItem={({ item, index }) => (
        <DiscoverCard
          imageUri={item.imageUri}
          brand={item.brand}
          title={item.title}
          price={item.price}
          oldPrice={item.oldPrice}
          badgeText={item.badgeText}
          badgeColor={item.badgeColor}
          onCardPress={() => onItemPress(index)}
          style={[styles.card, { width: cardWidth, height: cardHeight }]}
        />
      )}
      initialNumToRender={3}
      windowSize={5}
    />
  </View>
);

const renderGridSection = (title: string, subtitle: string, items: Array<any>, onItemPress: (index: number) => void, onViewAll: () => void) => {
  const displayItems = items.slice(0, 4);
  return (
    <View style={[styles.section, styles.gridSection]}>
      <SectionHeader title={title} subtitle={subtitle} onViewAll={onViewAll} />
      <View style={styles.grid}>
        {displayItems.map((item, index) => (
          <DiscoverCard
            key={`${title}-${index}`}
            imageUri={item.imageUri}
            brand={item.brand}
            title={item.title}
            price={item.price}
            badgeText={item.badgeText}
            badgeColor={item.badgeColor}
            onCardPress={() => onItemPress(index)}
            style={[styles.gridCard, { width: GRID_CARD_WIDTH, height: CARD_HEIGHT }]}
          />
        ))}
      </View>
    </View>
  );
};

export default function Discover() {
  const insets = useSafeAreaInsets();

  const [selectedFeed, setSelectedFeed] = useState<{ items: any[], initialIndex: number } | null>(null);

  // Automatically close fullscreen feed when navigating away from the discover tab
  useFocusEffect(
    useCallback(() => {
      return () => setSelectedFeed(null);
    }, [])
  );

  const [recommendedData, setRecommendedData] = useState(mockRecommendedProducts);
  const [trendingData, setTrendingData] = useState(mockTrendingProducts);
  const [seasonalSaleData, setSeasonalSaleData] = useState(mockSeasonalSaleProducts);
  const [newArrivalData, setNewArrivalData] = useState(mockNewArrivalProducts);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiscoverData = async (isMounted = true, forceRefresh = false) => {
    try {
      const res = await getDiscoverData(forceRefresh);
      if (res.ok && res.data && isMounted) {
        const data = res.data;
        if (data.recommended?.length) {
          setRecommendedData(data.recommended.map((item: any) => ({
            ...item,
            imageUri: item.imageUrl,
            brand: item.brand || item.category || 'Product',
            title: item.title,
            price: `Rs.${item.price}`,
            badgeText: 'AI Pick',
            badgeColor: '#1f7a9b',
            deeplinkUrl: item.deeplinkUrl
          })));
        }
        if (data.newArrivals?.length) {
          setNewArrivalData(data.newArrivals.map((item: any) => ({
            ...item,
            imageUri: item.imageUrl,
            brand: item.brand || item.category || 'Product',
            title: item.title,
            price: `Rs.${item.price}`,
            badgeText: 'NEW',
            badgeColor: '#ac41d0',
            deeplinkUrl: item.deeplinkUrl
          })));
        }
        if (data.trending?.length) {
          setTrendingData(data.trending.map((item: any) => {
            const isBestseller = Math.random() > 0.5;
            return {
              ...item,
              imageUri: item.imageUrl,
              brand: item.brand || item.category || 'Product',
              title: item.title,
              price: `Rs.${item.price}`,
              badgeText: isBestseller ? 'Bestseller' : undefined,
              badgeColor: isBestseller ? '#2b68f5' : undefined,
              deeplinkUrl: item.deeplinkUrl
            };
          }));
        }
        if (data.seasonalSale?.length) {
          setSeasonalSaleData(data.seasonalSale.map((item: any) => {
            const x = Math.floor(Math.random() * 5) + 1; // 1 to 5
            return {
              ...item,
              imageUri: item.imageUrl,
              brand: item.brand || item.category || 'Product',
              title: item.title,
              price: `Rs.${item.price}`,
              oldPrice: `Rs.${Math.round(item.price / (1 - (x * 10) / 100))}`,
              badgeText: `${x * 10}% OFF`,
              badgeColor: '#1db954',
              deeplinkUrl: item.deeplinkUrl
            };
          }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch discover data', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDiscoverData(true, true);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initialFetch = async () => {
      setLoading(true);
      await fetchDiscoverData(isMounted);
      if (isMounted) setLoading(false);
    };
    initialFetch();
    return () => { isMounted = false; };
  }, []);

  if (selectedFeed) {
    return <FeedView initialItems={selectedFeed.items} initialIndex={selectedFeed.initialIndex} onClose={() => setSelectedFeed(null)} />;
  }

  return (

    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#243f70" colors={["#243f70"]} />
      }
    >
      <View style={styles.pageHeader}>
        <View style={styles.headerSide}>
          <Image
            source={require('../../assets/circle_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.pageTitle}>DISCOVER</Text>

        <View style={styles.headerSide}>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={20} color="#243f70" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#7a8fab" style={{ marginHorizontal: 10 }} />
        <TextInput
          placeholder="Find your next signature look..."
          placeholderTextColor="#7a8fab"
          style={styles.searchInput}
        />
      </View>

      {renderHorizontalSection(
        'RECOMMENDED',
        'Curated by Evaira AI',
        recommendedData,
        (index) => setSelectedFeed({ items: recommendedData, initialIndex: index }),
        () => setSelectedFeed({ items: recommendedData, initialIndex: 0 }),
        RECOMMENDED_CARD_WIDTH,
        RECOMMENDED_CARD_HEIGHT,
      )}
      {renderGridSection(
        'TRENDING NOW',
        'Street style favourites',
        trendingData,
        (index) => setSelectedFeed({ items: trendingData, initialIndex: index }),
        () => setSelectedFeed({ items: trendingData, initialIndex: 0 })
      )}
      {renderHorizontalSection(
        'SEASONAL SALE',
        'Limited time offers',
        seasonalSaleData,
        (index) => setSelectedFeed({ items: seasonalSaleData, initialIndex: index }),
        () => setSelectedFeed({ items: seasonalSaleData, initialIndex: 0 })
      )}
      {renderHorizontalSection(
        'NEW ARRIVAL',
        'Latest from our ateliers',
        newArrivalData,
        (index) => setSelectedFeed({ items: newArrivalData, initialIndex: index }),
        () => setSelectedFeed({ items: newArrivalData, initialIndex: 0 })
      )}
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1d2c4f',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e9f8',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    height: 44,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f3057',
    height: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e2f4f',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#5f6f8d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAll: {
    color: '#2755b3',
    fontWeight: '700',
    fontSize: 13,
  },
  row: {
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  card: {
    marginRight: 14,
  },
  gridSection: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    marginBottom: 14,
  },
  feedContainer: { flex: 1, backgroundColor: '#000' },
  flatListContainer: { flex: 1 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  undoContainer: { position: 'absolute', left: 0, right: 0, top: 100, alignItems: 'center', zIndex: 10, paddingTop: 6 },
  undoButton: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 28, alignItems: 'center', minWidth: 140, flexDirection: 'row' },
  undoImage: { width: 38, height: 38, tintColor: 'white', marginRight: 8 },
  undoSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2, marginLeft: 6 },
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12, backgroundColor: 'transparent', zIndex: 5 },
});
