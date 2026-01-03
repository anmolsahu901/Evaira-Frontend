import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sendLikeNotification } from '../../lib/api';

export default function Home() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1200000);

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
      const res = await sendLikeNotification({ productId: 'silk-evening-gown', liked: !liked });
      if (!res.ok) throw new Error('network');
    } catch (e) {
      // revert on error
      setLiked(prev => !prev);
      setLikeCount(c => c - delta);
      Alert.alert('Error', 'Failed to send like to server.');
      console.error('Like API failed', e);
    }
  };

  const handleIconPress = (action: string) => {
    Alert.alert(action, `You tapped ${action}.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* <View style={styles.header}>
        <Text style={styles.headerText}>
          Evaira <Text style={styles.citeText}></Text>
        </Text>
      </View> */}

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop' }}
        style={styles.image}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Silk Evening Gown</Text>
            <Text style={styles.productPrice}>$499.00</Text>
            <Text style={styles.productDescription} numberOfLines={3}>
              Elegant floor-length gown, perfect for parties. Available in multiple
              colors.
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
              <Text style={styles.iconText}>4.5K</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="paper-plane-outline" size={26} color="white" />
              </View>
              <Text style={styles.iconText}>10K</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="bookmark-outline" size={26} color="white" />
              </View>
              <Text style={styles.iconText}>5K</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.progress} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#22262A',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  citeText: {
    fontWeight: '400',
    fontSize: 16,
    color: '#cfcfcf',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 28,
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
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 110,
    alignItems: 'center',
  },
  progress: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 4,
  },
});
