import styled from 'styled-components';

export const OptionWrap = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  margin: 0 12px 12px 0;
  color: #151515;
  padding: 4px 12px;
  border-radius: 28px;
  max-width: 200px;
  user-select: none;
  background-color: #f5f5f5;
  &.checked {
    color: #fff;
    border-color: #1677ff;
    background-color: #1677ff;
  }
`;

export const SidebarWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  width: 100%;
  height: calc(100% - 45px);
  padding: 20px 20px 0;
  .overflowY {
    overflow-y: auto;
    margin-right: -10px;
  }
`;
