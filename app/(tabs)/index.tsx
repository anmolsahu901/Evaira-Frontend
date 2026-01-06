import { View, StyleSheet } from 'react-native';

import LoginScreen from '../login';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
