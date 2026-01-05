import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, FlatList, LayoutChangeEvent } from 'react-native';
import ProductCard, { Product } from '../../components/ui/product-card';

const mockProducts: Product[] = [
  {
    id: 'silk-evening-gown',
    name: 'Silk Evening Gown',
    price: '$499.00',
    description: 'Elegant floor-length gown, perfect for parties. Available in multiple colors.',
    imageUrl: 'https://images.unsplash.com/photo-1533659828870-95ee305cee3e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 1200000,
    comments: '4.5K',
    shares: '10K',
    bookmarks: '5K',
  },
  {
    id: 'another-product',
    name: 'Another Gown',
    price: '$299.00',
    description: 'Another beautiful gown.',
    imageUrl: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 800000,
    comments: '2.1K',
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
    comments: '2.1K',
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
    comments: '2.1K',
    shares: '5K',
    bookmarks: '1.2K',
  },
  // Add more products as needed
];

export default function Home() {
  const [containerHeight, setContainerHeight] = useState(0);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={{ height: containerHeight }}>
      <ProductCard product={item} />
    </View>
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {containerHeight > 0 && (
        <FlatList
          data={mockProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          initialNumToRender={1}
          windowSize={3}
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
});
