import styled from 'styled-components';

export const Icon = styled.i`
  font-size: ${props => props.size || '18'}px;
  color: ${props => props.color || '#000'};
`;

export const IconButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  .icon {
    margin-right: 4px;
  }
  .text {
    font-size: 13px;
    color: ${props => props.textColor || '#000'};
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
