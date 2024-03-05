import React from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { FlexCenter } from 'worksheet/styled';
import { browserIsMobile } from 'src/util'

const CountTip = styled(FlexCenter)`
  box-sizing: border-box;
  min-width: 24px;
  height: 24px;
  margin-right: 4px;
  line-height: 24px;
  border-radius: 12px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  padding: ${props => (props.visible ? '0 8px' : '0 4px 0 8px')};
  background: ${props => (props.visible ? '#9e9e9e' : '#2196f3')};
  box-shadow: ${props => (props.visible ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.24)')};
`;
export default ({ count, rowId, visible, onClick }) => (
  <CountTip
    className="countTip"
    visible={visible && count}
    onClick={e => {
      e.stopPropagation();
      if (count) {
        onClick({ rowId, visible: !visible });
      }
    }}
  >
    <span>{count}</span>
    {count > 0 && !visible && !browserIsMobile() && <i className="icon icon-navigate_next" />}
  </CountTip>
);
