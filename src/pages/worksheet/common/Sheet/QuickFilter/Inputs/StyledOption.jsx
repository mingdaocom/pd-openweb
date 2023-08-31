import styled from 'styled-components';

const Option = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 2px 6px 2px 0;
  color: #515151;
  padding: 0 12px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 26px;
  max-width: 200px;
  user-select: none;
  &.checked {
    color: #fff;
    border-color: #2196f3 !important;
    background-color: #2196f3;
    &.multiple {
      .selectedIcon {
        font-size: 16px;
        margin: 0 5px 0 -6px;
      }
      color: #1565c0;
      background-color: #e3f2fd;
      border: 1px solid rgba(21, 101, 192, 0.17) !important;
    }
  }
  &:hover {
    border-color: #ccc;
  }
`;

export default Option;
