import React, { Fragment } from 'react';
import { Radio } from 'ming-ui/antd-components';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../styled';
import DepartmentConfig from '../components/WidgetHighSetting/ControlSetting/DepartmentConfig';
import WidgetUserPermission from '../components/WidgetUserPermission';

const DEPARTMENT_TYPES = [
  {
    value: 0,
    text: _l('单选'),
  },
  {
    value: 1,
    text: _l('多选'),
  },
];

export default function Department(props) {
  const { data, from, onChange, fromExcel } = props;
  const { enumDefault } = data;
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择方式')}</div>
        <Radio.Group
          size="middle"
          value={enumDefault}
          options={(DEPARTMENT_TYPES || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const type = event.target.value;

            if (type !== enumDefault) {
              onChange(
                handleAdvancedSettingChange(
                  {
                    ...data,
                    enumDefault: type,
                    unique: false,
                  },
                  {
                    defsource: '',
                  },
                ),
              );
            }
          }}
        />
      </SettingItem>
      <DepartmentConfig {...props} />
      {from !== 'subList' && !fromExcel && <WidgetUserPermission {...props} />}
    </Fragment>
  );
}
