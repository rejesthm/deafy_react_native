/**
 * Main Navigator - Home and Tensor screens
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen, TensorScreen} from '@screens';
import type {MainStackParamList} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tensor" component={TensorScreen} />
    </Stack.Navigator>
  );
};
