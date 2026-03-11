import React from 'react';
import styled from 'styled-components';

const EmptyTag = styled.div`
  border-radius: 6px;
  width: 22px;
  height: 6px;
  background-color: var(--color-border-secondary);
  margin: 15px 0;
`;

export default function BarCode() {
  return <EmptyTag />;
}
