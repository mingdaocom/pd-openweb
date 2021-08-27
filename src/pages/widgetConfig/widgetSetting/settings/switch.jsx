import React from 'react';
import { SettingItem } from '../../styled';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting } from '../../util';
import { get, head } from 'lodash';
import { handleAdvancedSettingChange } from '../../util/setting';

export default function Switch(props) {
  const { data, onChange } = props;
  const defaultValue = getAdvanceSetting(data, 'defsource');
  const isChecked = get(head(defaultValue), 'staticValue') === '1';
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('默认值')}</div>
      <Checkbox
        text={_l('选中')}
        size="small"
        checked={isChecked}
        onClick={v => {
          onChange(
            handleAdvancedSettingChange(data, {
              defsource: JSON.stringify([{ cid: '', rcid: '', staticValue: v ? '0' : '1' }]),
            }),
          );
        }}
      />
    </SettingItem>
  );
}
