/**
 * App entry point
 */

import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store, persistor} from '@store';
import {RootNavigator} from '@routes';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {theme} from '@theme';

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={[styles.root, {flex: 1}]}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <RootNavigator />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.primaryBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryBackground,
  },
});

export default App;
