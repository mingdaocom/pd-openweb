import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

const DISPLAY_OPTIONS = [
  {
    text: _l('手机'),
    value: 3,
  },
  {
    text: _l('座机'),
    value: 4,
  },
];

export default function Text(props) {
  const { data, onChange } = props;
  const { type, controlId, hint = '' } = data;
  const { datamask } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <RadioGroup
          size="middle"
          checkedValue={type}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            let newData = { ...data, type: value };
            if (controlId && controlId.includes('-')) {
              newData = Object.assign(newData, {
                controlName: DISPLAY_OPTIONS.find(item => item.value === value).text,
                hint: value === 3 ? _l('请填写手机号码') : _l('请填写座机号码'),
              });
            }
            if (value === 4 && datamask === '1') {
              newData = handleAdvancedSettingChange(newData, { datamask: '0' });
            }
            onChange(newData);
          }}
        />
      </SettingItem>
    </Fragment>
  );
}
