import styled from 'styled-components';

export const List = styled.div`
  padding: 8px 0;
  overflow-y: auto;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  .sortItem {
    display: flex;
    align-items: center;
    padding: 0 8px;
    height: 40px;
    background: #fff;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

export const Wrap = styled.div`
  overflow: hidden;
  height: 100%;
`;
