import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DiscoverCard from '../../components/ui/discover-card';

const { width } = Dimensions.get('window');
const RECOMMENDED_CARD_WIDTH = Math.round(width * 0.65);
const RECOMMENDED_CARD_HEIGHT = 290;
const HORIZONTAL_CARD_WIDTH = Math.round(width * 0.50);
const GRID_CARD_WIDTH = Math.round((width - 52) / 2);
const CARD_HEIGHT = 250;

const recommendedProducts = [
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/kurta/z/b/m/m-kfn386-303-diwas-by-manyavar-original-imahh4j22dztjgfy.jpeg?q=90',
    brand: 'Manyavar',
    title: 'Straight Kurta',
    price: 'Rs.2999',
    badgeText: 'AI Pick',
    badgeColor: '#1f7a9b',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/kurta/c/o/6/m-men-printed-kurta-cellux-original-imagtfsmfketf6me.jpeg?q=90',
    brand: 'Cellux',
    title: 'Printed Straight Kurta',
    price: 'Rs.1580',
    badgeText: 'New',
    badgeColor: '#ac41d0',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/ethnic-set/6/j/q/xxl-ss-p-001-j-tb-mania-original-imahg6nsfusmq72n.jpeg?q=90',
    brand: 'Koshin',
    title: 'Block Print Straight Kurta',
    price: 'Rs.1320',
  },
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/kurta/n/d/5/xl-bnrsi-kurta-tsarina-original-imahh3m5yw4g5zyt.jpeg?q=90',
    brand: 'Tsarina',
    title: 'Design Straight Kurta',
    price: 'Rs.1780',
    badgeText: 'AI Pick',
    badgeColor: '#1f7a9b',
  },
];

const trendingProducts = [
  {
    imageUri: 'https://rukminim2.flixcart.com/image/1280/1280/xif0q/t-shirt/l/q/l/l-trendy-ovr-one-piece-sky-l-hustle-tees-original-imahhy3bgr9qsh2h.jpeg?q=90',
    brand: 'Hustle',
    title: 'Round Neck Blue T-Shirt',
    price: 'Rs.299',
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

const seasonalSaleProducts = [
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

const newArrivalProducts = [
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

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    <TouchableOpacity>
      <Text style={styles.viewAll}>VIEW ALL →</Text>
    </TouchableOpacity>
  </View>
);

const renderHorizontalSection = (
  title: string,
  subtitle: string,
  items: Array<any>,
  cardWidth = HORIZONTAL_CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
) => (
  <View style={styles.section}>
    <SectionHeader title={title} subtitle={subtitle} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item, index) => (
        <DiscoverCard
          key={`${title}-${index}`}
          imageUri={item.imageUri}
          brand={item.brand}
          title={item.title}
          price={item.price}
          oldPrice={item.oldPrice}
          badgeText={item.badgeText}
          badgeColor={item.badgeColor}
          style={[styles.card, { width: cardWidth, height: cardHeight }]}
        />
      ))}
    </ScrollView>
  </View>
);

const renderGridSection = (title: string, subtitle: string, items: Array<any>) => (
  <View style={[styles.section, styles.gridSection]}>
    <SectionHeader title={title} subtitle={subtitle} />
    <View style={styles.grid}>
      {items.map((item, index) => (
        <DiscoverCard
          key={`${title}-${index}`}
          imageUri={item.imageUri}
          brand={item.brand}
          title={item.title}
          price={item.price}
          badgeText={item.badgeText}
          badgeColor={item.badgeColor}
          style={[styles.gridCard, { width: GRID_CARD_WIDTH, height: CARD_HEIGHT }]}
        />
      ))}
    </View>
  </View>
);

export default function Discover() {
  const insets = useSafeAreaInsets();

  return (
   
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
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
          recommendedProducts,
          RECOMMENDED_CARD_WIDTH,
          RECOMMENDED_CARD_HEIGHT,
        )}
        {renderGridSection('TRENDING NOW', 'Street style favourites', trendingProducts)}
        {renderHorizontalSection('SEASONAL SALE', 'Limited time offers', seasonalSaleProducts)}
        {renderHorizontalSection('NEW ARRIVAL', 'Latest from our ateliers', newArrivalProducts)}
      </ScrollView>
   
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#d4d4d41a',
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
});
