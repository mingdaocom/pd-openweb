import React, { useEffect } from 'react';
import { Checkbox, Switch as SwitchComponent, RadioGroup, Tooltip } from 'ming-ui';
import { getAdvanceSetting, getSwitchItemNames } from '../../util';
import { get, head } from 'lodash';
import styled from 'styled-components';

const Con = styled.div`
  display: flex;
  align-items: center;
  .RadioGroup {
    width: 100%;
    flex-wrap: nowrap;
    label {
      display: inline-block;
      max-width: 50%;
      margin-right: 0;
      padding-right: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .Checkbox {
    display: flex;
    white-space: normal !important;
    .Checkbox-box {
      flex-shrink: 0;
    }
  }
`;

export default function Switch({ data }) {
  const defaultValue = getAdvanceSetting(data, 'defsource');
  const isChecked = get(head(defaultValue), 'staticValue') === '1';
  const { showtype } = getAdvanceSetting(data);
  const itemnames = getSwitchItemNames(data);

  useEffect(() => {
    if (showtype === '2') {
      $('.mobileFormSwitchDisabled label') && $('.mobileFormSwitchDisabled label').removeClass('Radio--disabled');
    }
  }, [showtype]);

  if (showtype === '1') {
    const text = isChecked ? get(itemnames[0], 'value') : get(itemnames[1], 'value');
    return (
      <Con>
        <SwitchComponent checked={isChecked} />
        {text && <span className="mLeft6 overflow_ellipsis">{text}</span>}
      </Con>
    );
  }

  if (showtype === '2') {
    return (
      <Con>
        <RadioGroup
          className="mobileFormSwitchDisabled"
          size="middle"
          disabled={true}
          checkedValue={get(head(defaultValue), 'staticValue')}
          data={itemnames.map(item => ({ text: item.value, value: item.key }))}
        />
      </Con>
    );
  }

  return (
    <Con>
      <Checkbox checked={isChecked}>{data.hint || ''}</Checkbox>
    </Con>
  );
}
