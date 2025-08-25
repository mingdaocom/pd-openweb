import styled from 'styled-components';
import { Circle } from 'worksheet/styled';

export const AddRecord = styled(Circle)`
  background-color: #fff;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  .icon {
    font-size: 18px;
    color: #9e9e9e;
    transition: transform 0.25s;
    &:hover {
      color: #1677ff;
      transform: rotate(90deg);
    }
  }
`;
