import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View, Pressable, Platform, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../../hooks/use-theme-color';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Images } from '../../constants/images';

type SectionLink = {
  key: string;
  label: string;
  subLabel?: string;
  icon: string;
  route?: string;
  action?: () => void;
};

function SectionItem({ item, onPress, colors }: { item: SectionLink; onPress: (item: SectionLink) => void; colors: any }) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      android_ripple={{ color: colors.ripple }}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      hitSlop={8}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <View style={[styles.iconWrap, { borderColor: colors.border, backgroundColor: colors.iconBg, ...(Platform.OS === 'ios' ? styles.iconShadow : {}) }]}>
        <Ionicons name={item.icon as any} size={20} color={colors.icon} />
      </View>

      <View style={styles.menuText}>
        <ThemedText style={[styles.menuLabel, { color: colors.text }]}>{item.label}</ThemedText>
        {item.subLabel ? <ThemedText style={styles.menuSubLabel}>{item.subLabel}</ThemedText> : null}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.chev} style={styles.chev} />
    </Pressable>
  );
}

import { useUserProfile } from '../../context/UserProfileContext';
import * as SecureStore from 'expo-secure-store';
import { fetchUserProfile } from '../../lib/profileAPI';

const personalActivity: SectionLink[] = [
  { key: 'wishlist', label: 'Wishlist & Curated', subLabel: 'products you saved', icon: 'heart-outline', route: '/wishlist' },
  { key: 'recentlyViewed', label: 'Recently Viewed', subLabel: 'products you viewed', icon: 'time-outline', route: '/recentlyViewed' },
  { key: 'recentlyOpened', label: 'Recently Opened', subLabel: 'products you opened', icon: 'eye-outline', route: '/recentlyOpened' },
];

const supportLinks: SectionLink[] = [
  { key: 'help', label: 'Help Center', icon: 'help-circle-outline' },
  { key: 'feedback', label: 'Send Feedback', icon: 'chatbubble-ellipses-outline' },
  { key: 'report', label: 'Report an Issue', icon: 'alert-circle-outline' },
];

const systemLinks: SectionLink[] = [
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { key: 'privacy', label: 'Privacy & Security', icon: 'shield-checkmark-outline' },
];

export default function Account() {
  const router = useRouter();
  const { name, age, resetProfile } = useUserProfile();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          const res = await fetchUserProfile(token);
          if (res.success) {
            setProfileData(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      }
    };
    loadProfile();
  }, []);

  const displayName = profileData?.name || profileData?.email || name || 'Sienna Westbrook';

  const stylePreferences: SectionLink[] = [
    { key: 'body-type', label: 'Style Vibe', subLabel: profileData?.styleVibes?.length ? profileData.styleVibes.join(', ') : 'Preference: Casual & minimal', icon: 'person-circle-outline', route: '/profileSetup-1styleVibe?isEditing=true' },
    { key: 'fit', label: 'Fit & Silhouette', subLabel: profileData?.fitTypes?.length ? profileData.fitTypes.join(', ') : 'Preference: Oversized & Relaxed', icon: 'resize-outline', route: '/profileSetup-5fitType?isEditing=true' },
    { key: 'color', label: 'Color Palette', subLabel: profileData?.favoriteColors?.length ? profileData.favoriteColors.join(', ') : 'Neutrals, Earth Tones, Deep Teal', icon: 'color-palette-outline', route: '/profileSetup-2colorSelection?isEditing=true' },
    { key: 'occasion', label: 'Preferred Occasions', subLabel: profileData?.preferredOccasions?.length ? profileData.preferredOccasions.join(', ') : 'Casual Everyday, Office', icon: 'calendar-outline', route: '/profileSetup-4occasion?isEditing=true' },
    { key: 'price', label: 'Price Bucket', subLabel: profileData?.priceBucket || 'Standard', icon: 'pricetag-outline', route: '/profileSetup-3priceBucket?isEditing=true' },
  ];

  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const chevColor = useThemeColor({}, 'icon');
  const rippleColor = useThemeColor({ light: 'rgba(0,0,0,0.06)', dark: 'rgba(255,255,255,0.06)' }, 'background');
  const iconBg = useThemeColor({ light: '#fff', dark: '#111' }, 'background');

  const computeAge = (iso?: string) => {
    if (!iso) return undefined;
    const b = new Date(iso);
    if (Number.isNaN(b.getTime())) return undefined;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age;
  };


  const handlePress = (item: SectionLink) => {
    if (item.route) {
      router.push(item.route as any);
      return;
    }

    if (item.key === 'logout') {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear token from secure storage
              await SecureStore.deleteItemAsync('authToken');
              // Reset user profile context
              resetProfile();
              console.log('✅ User logged out successfully');
              // Redirect to login screen
              router.replace('/splash');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]);
      return;
    }

    if (item.key === 'delete') {
      Alert.alert('Delete account', 'This will permanently delete your account. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted', 'Account deleted (demo)') },
      ]);
      return;
    }

    // default action for support/feedback
    Alert.alert(item.label, 'This feature is coming soon.');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <View style={styles.headerSide}>
            <Image source={Images.circleIcon} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.pageTitle}>ACCOUNT</Text>

          <View style={styles.headerSide}>
            <TouchableOpacity style={styles.filterButton} onPress={() => { }} activeOpacity={0.7}>
              <Ionicons name="options-outline" size={20} color="#243f70" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileWrap}>
          <View style={styles.avatarOuter}>
            <Image source={Images.logo2} style={styles.avatar} />
          </View>
          <ThemedText style={styles.name}>{displayName}</ThemedText>
          <ThemedText style={styles.subtitle}>Premium Member since Oct 2023</ThemedText>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGroup}>
          <Text style={styles.sectionLabel}>STYLE PREFERENCES</Text>
          {stylePreferences.map((item) => (
            <SectionItem key={item.key} item={item} onPress={handlePress} colors={{
              text: textColor,
              icon: iconColor,
              border: borderColor,
              chev: chevColor,
              ripple: rippleColor,
              iconBg,
            }} />
          ))}
        </View>

        <View style={styles.cardGroup}>
          <Text style={styles.sectionLabel}>PERSONAL ACTIVITY</Text>
          {personalActivity.map((item) => (
            <SectionItem key={item.key} item={item} onPress={handlePress} colors={{
              text: textColor,
              icon: iconColor,
              border: borderColor,
              chev: chevColor,
              ripple: rippleColor,
              iconBg,
            }} />
          ))}
        </View>

        <View style={styles.cardGroup}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          {supportLinks.map((item) => (
            <SectionItem key={item.key} item={item} onPress={handlePress} colors={{
              text: textColor,
              icon: iconColor,
              border: borderColor,
              chev: chevColor,
              ripple: rippleColor,
              iconBg,
            }} />
          ))}
        </View>

        <View style={styles.cardGroup}>
          <Text style={styles.sectionLabel}>SYSTEM</Text>
          {systemLinks.map((item) => (
            <SectionItem key={item.key} item={item} onPress={handlePress} colors={{
              text: textColor,
              icon: iconColor,
              border: borderColor,
              chev: chevColor,
              ripple: rippleColor,
              iconBg,
            }} />
          ))}
        </View>

        <TouchableOpacity style={styles.logout} onPress={() => handlePress({ key: 'logout', label: 'Log out', icon: 'power-outline' })}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
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
  profileWrap: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarOuter: {
    width: 110,
    height: 110,
    borderRadius: 110 / 2,
    borderWidth: 4,
    borderColor: '#ccc',
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7a99',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#ffffffff',
    borderWidth: 1,
    borderColor: '#c8d1e7',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#4d5f86',
    fontWeight: '700',
  },
  cardGroup: {
    width: '100%',
    paddingHorizontal: 2,
    paddingTop: 10,
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#576483',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeff4',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.998 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  menuText: {
    flex: 1,
    justifyContent: 'center',
  },
  menuSubLabel: {
    color: '#7e89a4',
    fontSize: 12,
    marginTop: 3,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  chev: {
    marginLeft: 6,
  },
  logout: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffe1e6',
  },
  logoutText: {
    color: '#e63950',
    fontWeight: '700',
    fontSize: 16,
  },
});