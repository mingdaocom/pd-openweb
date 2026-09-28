import React, { useEffect } from 'react';
import { get, head } from 'lodash';
import styled from 'styled-components';
import { Checkbox, Radio, Switch as SwitchComponent } from 'ming-ui/antd-components';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { getSwitchItemNames } from 'src/utils/domain/control/options';

const DISPLAY_ROW_CHECKBOX_STYLES = { icon: { marginTop: 6 } };

const Con = styled.div`
  display: flex;
  align-items: center;
  .ant-radio-group {
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
`;

export default function Switch({ data, displayRow }) {
  const defaultValue = getAdvanceSetting(data, 'defsource');
  const isChecked = get(head(defaultValue), 'staticValue') === '1';
  const { showtype } = getAdvanceSetting(data);
  const itemnames = getSwitchItemNames(data);

  useEffect(() => {
    if (showtype === '2') {
      $('.mobileFormSwitchDisabled label') &&
        $('.mobileFormSwitchDisabled label').removeClass('ant-radio-wrapper-disabled');
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
        <Radio.Group
          className="mobileFormSwitchDisabled"
          size="middle"
          disabled={true}
          value={get(head(defaultValue), 'staticValue')}
          options={(itemnames.map(item => ({ text: item.value, value: item.key })) || []).map(
            ({ text, ...option }) => ({ ...option, label: text }),
          )}
        />
      </Con>
    );
  }

  return (
    <Con $displayRow={displayRow}>
      <Checkbox checked={isChecked} styles={displayRow ? DISPLAY_ROW_CHECKBOX_STYLES : undefined}>
        {data.hint || ''}
      </Checkbox>
    </Con>
  );
}
