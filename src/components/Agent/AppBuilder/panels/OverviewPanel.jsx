import React from 'react';
import styled from 'styled-components';
import { MarkdownText } from '../../ui/MarkdownText';

const Wrap = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: var(--shadow-sm);
`;

export default function OverviewPanel({ plan }) {
  return (
    <Wrap>
      <MarkdownText>{plan || ''}</MarkdownText>
    </Wrap>
  );
}
