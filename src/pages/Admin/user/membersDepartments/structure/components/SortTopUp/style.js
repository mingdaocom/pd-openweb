import styled from 'styled-components';

export const List = styled.div`
  padding: 8px 0;
  overflow-y: auto;
  border-radius: 4px;
  border: 1px solid var(--color-border-secondary);
  .sortItem {
    display: flex;
    align-items: center;
    padding: 0 8px;
    height: 40px;
    background: var(--color-background-primary);
    &:hover {
      background: var(--color-background-hover);
    }
  }
`;

export const Wrap = styled.div`
  overflow: hidden;
  height: 100%;
`;
