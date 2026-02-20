/**
 * Reusable styled UI components matching Flutter design
 */

import styled from 'styled-components/native';
import {theme} from '@theme';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Gradient Container - Purple gradient matching Flutter
 */
export const GradientContainer = styled(LinearGradient).attrs({
  colors: [theme.colors.gradientStart, theme.colors.gradientEnd],
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
})`
  border-radius: ${theme.radius.lg}px;
  padding: ${theme.spacing.xl}px;
`;

/**
 * Icon Container - 48x48 with rounded corners
 */
export const IconContainer = styled.View<{backgroundColor?: string}>`
  width: ${theme.dimensions.iconContainerSize}px;
  height: ${theme.dimensions.iconContainerSize}px;
  border-radius: ${theme.radius.sm}px;
  background-color: ${props => props.backgroundColor || theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

/**
 * Custom Button - Matching Flutter design
 */
export const CustomButton = styled.TouchableOpacity<{variant?: 'primary' | 'secondary'}>`
  height: ${theme.dimensions.buttonHeight}px;
  border-radius: ${theme.radius.sm}px;
  background-color: ${props =>
    props.variant === 'secondary' ? theme.colors.white : theme.colors.primary};
  align-items: center;
  justify-content: center;
  padding-horizontal: ${theme.spacing.xl}px;
  ${props => theme.shadows.medium};
`;

export const ButtonText = styled.Text<{variant?: 'primary' | 'secondary'}>`
  ${theme.typography.button};
  color: ${props => (props.variant === 'secondary' ? theme.colors.primary : theme.colors.white)};
`;

/**
 * Card Container - White card with shadow
 */
export const CardContainer = styled.View`
  background-color: ${theme.colors.white};
  border-radius: ${theme.radius.lg}px;
  padding: ${theme.spacing.lg}px;
  ${theme.shadows.medium};
`;

/**
 * Input Field - Matching Flutter design
 */
export const InputField = styled.TextInput`
  height: ${theme.dimensions.inputFieldHeight}px;
  border-radius: ${theme.radius.sm}px;
  background-color: ${theme.colors.gray1};
  padding-horizontal: ${theme.spacing.lg}px;
  ${theme.typography.bodyMd};
  color: ${theme.colors.primaryText};
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

/**
 * Screen Container
 */
export const ScreenContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.primaryBackground};
`;

export const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${theme.colors.primaryBackground};
`;

/**
 * Text Components
 */
export const HeadingXL = styled.Text`
  ${theme.typography.headingXl};
  color: ${theme.colors.primaryText};
`;

export const HeadingLG = styled.Text`
  ${theme.typography.headingLg};
  color: ${theme.colors.primaryText};
`;

export const HeadingMD = styled.Text`
  ${theme.typography.headingMd};
  color: ${theme.colors.primaryText};
`;

export const BodyText = styled.Text`
  ${theme.typography.bodyMd};
  color: ${theme.colors.secondaryText};
`;

export const Caption = styled.Text`
  ${theme.typography.caption};
  color: ${theme.colors.tertiaryText};
`;

/**
 * Spacer Component
 */
export const Spacer = styled.View<{size?: keyof typeof theme.spacing}>`
  height: ${props => theme.spacing[props.size || 'md']}px;
`;

export const HorizontalSpacer = styled.View<{size?: keyof typeof theme.spacing}>`
  width: ${props => theme.spacing[props.size || 'md']}px;
`;

/**
 * Row/Column Layouts
 */
export const Row = styled.View<{justify?: string; align?: string}>`
  flex-direction: row;
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'center'};
`;

export const Column = styled.View<{justify?: string; align?: string}>`
  flex-direction: column;
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'flex-start'};
`;
