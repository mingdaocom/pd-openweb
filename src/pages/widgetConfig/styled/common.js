import styled from 'styled-components';

export const Button = styled.div`
  line-height: 36px;
  text-align: center;
  background-color: var(--color-background-primary);
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
  transition: all 0.25s;
  i {
    margin-right: 4px;
    &.active {
      color: var(--color-success);
    }
  }
  &:hover {
    background-color: var(--color-background-hover);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.01);
  }
`;
