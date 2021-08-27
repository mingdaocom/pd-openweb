import styled from 'styled-components';

const Option = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  margin: 2px 6px 2px 0;
  color: #515151;
  padding: 0 12px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 26px;
  line-height: 26px;
  max-width: 200px;
  user-select: none;
  &.checked {
    color: #fff;
    border-color: #2196f3 !important;
    background-color: #2196f3;
  }
  &:hover {
    border-color: #ccc;
  }
`;

export default Option;
