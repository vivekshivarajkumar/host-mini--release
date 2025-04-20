/**
 * @format
 */

import React, { Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

const MiniApp = React.lazy(() => import('mini/App'));

const Fallback = () => {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>host app 🥹</Text>
      <Text style={styles.fallbackTextMini}>loading mini app ⏳</Text>
    </View>
  );
};

const App = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <MiniApp />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'yellow',
  },
  fallbackTextMini: {
    fontSize: 16,
    color: 'white',
  },
});

AppRegistry.registerComponent(appName, () => App);
