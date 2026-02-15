import React from 'react';
import { Alert, Image, StyleSheet, View, Pressable, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '../../hooks/use-theme-color';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Images } from '../../constants/images';

const MENU = [
  { key: 'edit-profile', label: 'Edit profile', icon: 'bookmark-outline', route: '/profileDetails' },
  { key: 'preferences', label: 'Edit preferences', icon: 'settings-outline', route: '/createProfile' },
  { key: 'support', label: 'Support', icon: 'help-circle-outline' },
  { key: 'feedback', label: 'Feedback', icon: 'chatbubble-outline' },
  { key: 'logout', label: 'Log out', icon: 'power-outline' },
  { key: 'delete', label: 'Delete account', icon: 'trash-outline' },
];

function MenuItem({ item, onPress, textColor, iconColor, borderColor, chevColor, rippleColor, iconBg }: any) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      android_ripple={{ color: rippleColor }}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      hitSlop={8}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <View style={[styles.iconWrap, { borderColor, backgroundColor: iconBg, ...(Platform.OS === 'ios' ? styles.iconShadow : {}) }]}>
        <Ionicons name={item.icon as any} size={22} color={iconColor} />
      </View>

      <ThemedText style={[styles.menuLabel, { color: textColor }]}>{item.label}</ThemedText>

      <Ionicons name="chevron-forward" size={20} color={chevColor} style={styles.chev} />
    </Pressable>
  );
}

import { useUserProfile } from '../../context/UserProfileContext';
import * as SecureStore from 'expo-secure-store';

export default function Account() {
  const router = useRouter();
  const { fullName, birthdate, resetProfile } = useUserProfile();

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


  const handlePress = (item: typeof MENU[number]) => {
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
              router.replace('/login');
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
        <ThemedText style={styles.title}>Settings</ThemedText>

        <View style={styles.profileWrap}>
          <View style={styles.avatarOuter}>
            <Image source={Images.logo2} style={styles.avatar} />
          </View>
          <ThemedText style={styles.name}>{fullName ? fullName : 'A'}{birthdate ? `, ${computeAge(birthdate)}` : ''}</ThemedText>
        </View>

        <View style={styles.menu}>
          {MENU.map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              onPress={handlePress}
              textColor={textColor}
              iconColor={iconColor}
              borderColor={borderColor}
              chevColor={chevColor}
              rippleColor={rippleColor}
              iconBg={iconBg}
            />
          ))}
        </View> 
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {

    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 18,
  },
  profileWrap: {
    alignItems: 'center',
    marginBottom: 28,
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
    fontSize: 22,
    fontWeight: '700',
  },
  menu: {
    width: '100%',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.998 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
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
});