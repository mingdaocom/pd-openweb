import styled from 'styled-components';
import { Circle } from 'worksheet/styled';

export const AddRecord = styled(Circle)`
  background-color: var(--color-background-primary);
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  .icon {
    font-size: 18px;
    color: var(--color-text-tertiary);
    transition: transform 0.25s;
    &:hover {
      color: var(--color-primary);
      transform: rotate(90deg);
    }
  }
`;
