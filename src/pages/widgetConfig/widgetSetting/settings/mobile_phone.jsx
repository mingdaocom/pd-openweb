import React, { Fragment } from 'react';
import { Radio } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../styled';
import TelConfig from '../components/WidgetHighSetting/ControlSetting/TelConfig';

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
  const { type, controlId } = data;
  const { datamask } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Radio.Group
          size="middle"
          value={type}
          options={(DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const value = event.target.value;

            let newData = {
              ...data,
              type: value,
            };

            if (controlId && controlId.includes('-')) {
              newData = Object.assign(newData, {
                controlName: DISPLAY_OPTIONS.find(item => item.value === value).text,
                hint: value === 3 ? _l('请填写手机号码') : _l('请填写座机号码'),
              });
            }

            if (value === 4 && datamask === '1') {
              newData = handleAdvancedSettingChange(newData, {
                datamask: '0',
              });
            }

            newData = handleAdvancedSettingChange(newData, {
              dynamicsrc: '',
              defsource: '',
              defaultfunc: '',
              defaulttype: '',
            });

            onChange(newData);
          }}
        />
      </SettingItem>
      {type === 3 && <TelConfig {...props} />}
    </Fragment>
  );
}
