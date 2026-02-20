/**
 * LoginScreen - User authentication
 */

import React, {useState} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {loginUser} from '@store/authSlice';
import {
  ScreenContainer,
  ScrollContainer,
  GradientContainer,
  InputField,
  CustomButton,
  ButtonText,
  HeadingXL,
  BodyText,
  Spacer,
  Column,
} from '@components/ui';
import {theme} from '@theme';
import type {AuthStackParamList} from '@routes/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {isLoading} = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(loginUser({email, password})).unwrap();
      // Navigation handled by root navigator observing auth state
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <ScreenContainer>
      <ScrollContainer
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Spacer size="6xl" />

        {/* Header */}
        <GradientContainer style={styles.header}>
          <HeadingXL style={styles.title}>Welcome Back</HeadingXL>
          <BodyText style={styles.subtitle}>Sign in to continue</BodyText>
        </GradientContainer>

        <Spacer size="4xl" />

        {/* Form */}
        <Column style={styles.formContainer}>
          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Spacer size="lg" />

          <InputField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Spacer size="2xl" />

          <CustomButton onPress={handleLogin} disabled={isLoading}>
            <ButtonText>{isLoading ? 'Signing In...' : 'Sign In'}</ButtonText>
          </CustomButton>

          <Spacer size="lg" />

          <CustomButton
            variant="secondary"
            onPress={() => navigation.navigate('Registration')}
            disabled={isLoading}>
            <ButtonText variant="secondary">Create Account</ButtonText>
          </CustomButton>
        </Column>

        <Spacer size="6xl" />
      </ScrollContainer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.white,
  },
  subtitle: {
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
});
