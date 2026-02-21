/**
 * Main Navigator - Home and Tensor screens
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {TensorScreen} from '../screens/TensorScreen';
import type {MainStackParamList} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tensor"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tensor" component={TensorScreen} />
    </Stack.Navigator>
  );
};
