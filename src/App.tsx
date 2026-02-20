/**
 * App entry point
 */

import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store, persistor} from '@store';
import {RootNavigator} from '@routes';
import {ActivityIndicator} from 'react-native';
import {theme} from '@theme';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <PersistGate
          loading={<ActivityIndicator size="large" color={theme.colors.primary} />}
          persistor={persistor}>
          <RootNavigator />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
