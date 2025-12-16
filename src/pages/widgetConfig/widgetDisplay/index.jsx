import React from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import DisplayRow from './displayRow';

const DisplayWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #f5f5f9;
  overflow: auto;
  header {
    display: flex;
    padding: 0 32px;
    padding-top: 20px;
    align-items: center;
    justify-content: space-between;
    p {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
  }
`;
export default function WidgetPreview(props) {
  const { getLoading } = props;
  return (
    <DisplayWrap id="widgetConfigDisplayArea">
      {getLoading ? <LoadDiv /> : <DisplayRow {...props} showCreateByMingo />}
    </DisplayWrap>
  );
}
