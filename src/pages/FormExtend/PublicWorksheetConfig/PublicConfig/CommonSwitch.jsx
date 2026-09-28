import React from 'react';
import styled from 'styled-components';
import { Switch, Tooltip } from 'ming-ui/antd-components';

const CommonSwitchContainer = styled.div`
  display: flex;
  align-items: center;
  height: 18px;
  .smallSwitch {
    flex: none;
    margin-right: 8px;
  }
`;

export default function CommonSwitch(props) {
  const { checked, onClick, name, tip, disabled } = props;
  return (
    <CommonSwitchContainer>
      <Switch
        size="small"
        className="smallSwitch"
        checked={checked}
        onClick={(checked, event) => {
          event.stopPropagation();
          return onClick(!checked, event);
        }}
        disabled={disabled}
      />
      <span>{name}</span>
      {!!tip && (
        <Tooltip placement="bottom" title={typeof tip === 'string' ? tip : <span>{tip}</span>}>
          <i className="icon icon-help Font16 textTertiary mLeft10"></i>
        </Tooltip>
      )}
    </CommonSwitchContainer>
  );
}
