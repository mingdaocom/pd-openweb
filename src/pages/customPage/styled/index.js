import styled from 'styled-components';
import { FlexCenter } from '../util';

export const Header = styled(FlexCenter)`
  position: absolute;
  left: 0;
  right: 0;
  padding: 0 24px;
  height: 54px;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);
  border-radius: 5px 5px 0 0;
  font-size: 17px;
  z-index: 1;
  .typeName {
    font-weight: bold;
  }
  .saveBtn {
    padding: 0 24px;
    margin-right: 50px;
    border-radius: 16px;
    line-height: 32px;
    min-height: 32px;
    padding: 0 16px;
    min-width: 64px;
    font-size: 13px;
  }
`;

export const EditWidgetContent = styled.div`
  box-sizing: border-box;
  padding-top: 54px;
  height: 100%;
`;
