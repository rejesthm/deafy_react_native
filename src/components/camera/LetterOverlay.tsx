/**
 * Letter Overlay - Shows detected ASL letter or gesture label in real time
 */

import React from 'react';
import styled from 'styled-components/native';
import {theme} from '@theme';
import {ASL_LETTERS} from '@models';

type Label = string;

interface LetterOverlayProps {
  /** Labels from recognitions (can be ASL letters A–G or gesture names) */
  labels: Label[];
}

const Container = styled.View`
  position: absolute;
  bottom: ${theme.spacing.xl}px;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
`;

const LabelBubble = styled.View`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: ${theme.radius.lg}px;
  padding: ${theme.spacing.md}px ${theme.spacing.xl}px;
  margin: ${theme.spacing.xs}px;
`;

const LabelText = styled.Text`
  ${theme.typography.headingMd};
  color: ${theme.colors.white};
`;

const Subtitle = styled.Text`
  ${theme.typography.caption};
  color: ${theme.colors.secondaryText};
  margin-top: ${theme.spacing.xs}px;
`;

const isASLLetter = (label: string): boolean =>
  label.length === 1 && ASL_LETTERS.includes(label as (typeof ASL_LETTERS)[number]);

export const LetterOverlay: React.FC<LetterOverlayProps> = ({labels}) => {
  if (!labels || labels.length === 0) return null;

  return (
    <Container>
      {labels.map((label, i) => (
        <LabelBubble key={`${label}-${i}`}>
          <LabelText>{label}</LabelText>
          {isASLLetter(label) && (
            <Subtitle>ASL letter</Subtitle>
          )}
        </LabelBubble>
      ))}
    </Container>
  );
};
