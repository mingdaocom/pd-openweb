import styled from 'styled-components';
import { Circle } from 'worksheet/styled';

export const AddRecord = styled(Circle)`
  background-color: var(--color-background-primary);
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
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
