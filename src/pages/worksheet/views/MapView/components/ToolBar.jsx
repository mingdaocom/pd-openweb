import React, { memo } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const ToolBarWrap = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  .boxShadow {
    box-shadow: 0 3px 6px 0px rgba(0, 0, 0, 0.16);
  }
  .zoomBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 16px;
  }
  .separator {
    width: 70%;
    height: 1px;
    background-color: var(--color-border-tertiary);
  }
`;

const ToolbarIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 6px;
  background: var(--color-background-primary);
  cursor: pointer;
  color: var(--color-text-secondary);
`;

const ToolBar = props => {
  const { setMapCenter, handleZoom } = props;

  return (
    <ToolBarWrap>
      <ToolbarIconWrap className="boxShadow" onClick={setMapCenter}>
        <Icon icon="gps_fixed" className="Font18" />
      </ToolbarIconWrap>
      <div className="boxShadow zoomBox">
        <ToolbarIconWrap onClick={() => handleZoom(1)}>
          <Icon icon="plus" className="Font14" />
        </ToolbarIconWrap>
        <div className="separator"></div>
        <ToolbarIconWrap onClick={() => handleZoom(-1)}>
          <Icon icon="minus" className="Font14" />
        </ToolbarIconWrap>
      </div>
    </ToolBarWrap>
  );
};

export default memo(ToolBar);
