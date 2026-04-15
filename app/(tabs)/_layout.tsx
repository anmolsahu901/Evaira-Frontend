import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StatusBar, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {


  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />


        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: 'rgb(0, 0, 0)',
            tabBarInactiveTintColor: '#777777ff',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E5EA',
              paddingBottom: Platform.OS === 'ios' ? 20 : 0,
              paddingTop: Platform.OS === 'ios' ? 10 : 0,
              height: Platform.OS === 'ios' ? 80 : 50,
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Platform.OS === 'android' ? 5 : 0, // Optical nudge for Android
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons
                  name={focused ? 'home' : 'home-outline'}
                  size={30}
                  color={color}
                />
              ),
              // tabBarLabel: () => null,
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: 'Discover',
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons
                  name="magnify" // Magnify is naturally thick in MaterialCommunityIcons
                  size={29}
                  color={color}
                  style={focused ? { textShadowColor: color, textShadowRadius: 1 } : {}} // small hack to make even bolder on focus if desired
                />
              ),
              // tabBarLabel: () => null,
            }}
          />

          <Tabs.Screen
            name="stylist"
            options={{
              title: 'Stylist',
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons
                  name={focused ? 'star-four-points' : 'star-four-points-outline'}
                  size={28}
                  color={color}
                />
              ),
              // tabBarLabel: () => null,
            }}
          />
          <Tabs.Screen
            name="wishlist"
            options={{
              title: 'Wishlist',
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons
                  name={focused ? 'heart' : 'heart-outline'}
                  size={28}
                  color={color}
                />
              ),
              // tabBarLabel: () => null,
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: 'Account',
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons
                  name={focused ? 'account' : 'account-outline'}
                  size={30}
                  color={color}
                />
              ),
              // tabBarLabel: () => null,
            }}
          />
        </Tabs>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});