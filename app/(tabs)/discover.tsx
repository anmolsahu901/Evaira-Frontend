import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Discover() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Discover</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#111',
    fontWeight: '500',
  },
});
