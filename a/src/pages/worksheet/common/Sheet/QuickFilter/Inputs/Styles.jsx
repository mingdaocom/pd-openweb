import styled from 'styled-components';

export const BaseSelectedItem = styled.div`
  display: inline-block;
  margin-right: 10px;
  padding: 0 10px;
  height: 24px;
  line-height: 24px;
  border-radius: 24px;
  background: #e5e5e5;
  max-width: 100%;
  .name {
    display: inline-block;
    width: calc(100% - 17px);
  }
  .icon {
    margin-left: 4px;
  }
`;
