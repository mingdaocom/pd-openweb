import styled from 'styled-components';
import { FlexCenter } from '../util';

export const Header = styled(FlexCenter)`
  position: absolute;
  left: 0;
  right: 0;
  padding: 0 24px;
  height: 54px;
  justify-content: space-between;
  background-color: var(--color-background-card);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);
  border-radius: 5px 5px 0 0;
  font-size: 17px;
  z-index: 1;
  .typeName {
    font-weight: bold;
  }
  .save:hover {
    border-color: var(--color-primary-dark);
    background-color: var(--color-primary-dark);
  }
`;

export const EditWidgetContent = styled.div`
  box-sizing: border-box;
  padding-top: 54px;
  height: 100%;
`;
