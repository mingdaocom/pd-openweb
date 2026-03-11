import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const Con = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  background: var(--color-background-primary);
  z-index: 1;
  // transform: ${props => `translateX(${-props.width}px)`};
  .rightSidebar-content {
    overflow-y: auto;
    z-index: 1;
    background: var(--color-background-primary);
    padding-bottom: 30px;
  }
`;

export default function RightSidebar(props) {
  const { onHideSidebar, children } = props;
  const width = document.documentElement.clientWidth - 60;
  return (
    <Con className="flexColumn" width={width}>
      <div className="pLeft15 pRight15 flexRow valignWrapper mBottom10">
        <Icon className="textTertiary Font22" icon="backspace" onClick={onHideSidebar} />
        <div className="flex textTertiary Font13 mLeft20 ellipsis">{props.name}</div>
        <Icon className="textTertiary close" icon="close" onClick={onHideSidebar} />
      </div>
      <div className="rightSidebar-content flex">{children}</div>
    </Con>
  );
}
