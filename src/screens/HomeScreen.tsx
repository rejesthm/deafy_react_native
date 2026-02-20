/**
 * HomeScreen - Main navigation screen
 * Matches Flutter home screen functionality
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ScreenContainer,
  ScrollContainer,
  GradientContainer,
  CardContainer,
  IconContainer,
  HeadingXL,
  HeadingLG,
  BodyText,
  Spacer,
  Row,
  Column,
} from '@components/ui';
import {theme} from '@theme';
import type {MainStackParamList} from '@routes/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const features = [
    {
      title: 'Sign Detection',
      description: 'Real-time ASL sign language recognition',
      icon: '👋',
      onPress: () => navigation.navigate('Tensor'),
    },
    {
      title: 'Practice',
      description: 'Learn and practice ASL signs',
      icon: '📚',
      onPress: () => console.log('Practice pressed'),
    },
    {
      title: 'History',
      description: 'View your learning progress',
      icon: '📊',
      onPress: () => console.log('History pressed'),
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: '⚙️',
      onPress: () => console.log('Settings pressed'),
    },
  ];

  return (
    <ScreenContainer>
      <ScrollContainer>
        <Spacer size="xl" />

        {/* Header */}
        <GradientContainer style={styles.header}>
          <HeadingXL style={styles.title}>Deafy</HeadingXL>
          <BodyText style={styles.subtitle}>
            Learn ASL with AI-powered recognition
          </BodyText>
        </GradientContainer>

        <Spacer size="xl" />

        {/* Feature Grid */}
        <Column style={styles.gridContainer}>
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <CardContainer
                style={styles.featureCard}
                onTouchEnd={feature.onPress}>
                <Row>
                  <IconContainer
                    backgroundColor={theme.colors.gradientStart}
                    style={styles.iconContainer}>
                    <BodyText style={styles.icon}>{feature.icon}</BodyText>
                  </IconContainer>
                  <Spacer size="md" />
                  <Column style={styles.featureContent}>
                    <HeadingLG>{feature.title}</HeadingLG>
                    <Spacer size="xs" />
                    <BodyText>{feature.description}</BodyText>
                  </Column>
                </Row>
              </CardContainer>
              {index < features.length - 1 && <Spacer size="md" />}
            </React.Fragment>
          ))}
        </Column>

        <Spacer size="6xl" />
      </ScrollContainer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.white,
  },
  subtitle: {
    color: theme.colors.white,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  gridContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
  featureCard: {
    width: '100%',
  },
  iconContainer: {
    flexShrink: 0,
  },
  icon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
});
