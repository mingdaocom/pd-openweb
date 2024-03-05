import React from 'react';
import styled from 'styled-components';
import { Switch, Tooltip } from 'ming-ui';

const CommonSwitchContainer = styled.div`
  height: 18px;
  .smallSwitch {
    transform: scale(0.67) translate(-6px, -3px);
    margin-left: -4px;
  }
`;

export default function CommonSwitch(props) {
  const { checked, onClick, name, tip, disabled } = props;
  return (
    <CommonSwitchContainer>
      <Switch className="smallSwitch" checked={checked} onClick={onClick} disabled={disabled} />
      <span>{name}</span>
      {!!tip && (
        <Tooltip popupPlacement="bottom" text={<span>{tip}</span>}>
          <i className="icon icon-help Font16 Gray_9e mLeft10"></i>
        </Tooltip>
      )}
    </CommonSwitchContainer>
  );
}
