/**
 * RegistrationScreen - New user signup
 */

import React, {useState} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '@store/hooks';
import {register} from '@store/slices/authSlice';
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

export const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {isLoading} = useAppSelector(state => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(register({name: username, email, password, passwordConfirmation: confirmPassword})).unwrap();
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  return (
    <ScreenContainer>
      <ScrollContainer
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Spacer size="4xl" />

        {/* Header */}
        <GradientContainer style={styles.header}>
          <HeadingXL style={styles.title}>Create Account</HeadingXL>
          <BodyText style={styles.subtitle}>Join the Deafy community</BodyText>
        </GradientContainer>

        <Spacer size="2xl" />

        {/* Form */}
        <Column style={styles.formContainer}>
          <InputField
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Spacer size="md" />

          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Spacer size="md" />

          <InputField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Spacer size="md" />

          <InputField
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Spacer size="2xl" />

          <CustomButton onPress={handleRegister} disabled={isLoading}>
            <ButtonText>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </ButtonText>
          </CustomButton>

          <Spacer size="lg" />

          <CustomButton
            variant="secondary"
            onPress={() => navigation.goBack()}
            disabled={isLoading}>
            <ButtonText variant="secondary">Back to Login</ButtonText>
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
