import React, { useEffect } from 'react';
import { get, head } from 'lodash';
import styled from 'styled-components';
import { Checkbox, RadioGroup, Switch as SwitchComponent } from 'ming-ui';
import { getSwitchItemNames } from 'src/utils/control';
import { getAdvanceSetting } from '../../util';

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
      ${props => (props.displayRow ? 'margin-top: 6px;' : '')};
    }
  }
`;

export default function Switch({ data, displayRow }) {
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
    <Con displayRow={displayRow}>
      <Checkbox checked={isChecked}>{data.hint || ''}</Checkbox>
    </Con>
  );
}
