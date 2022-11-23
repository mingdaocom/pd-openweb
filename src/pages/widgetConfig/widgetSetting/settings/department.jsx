import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';

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
        <RadioGroup
          size="middle"
          checkedValue={enumDefault}
          data={DEPARTMENT_TYPES}
          onChange={type => {
            if (type !== enumDefault) {
              onChange(handleAdvancedSettingChange({ ...data, enumDefault: type }, { defsource: '' }));
            }
          }}
        />
      </SettingItem>
      {from !== 'subList' && !fromExcel && <Components.WidgetUserPermission {...props} />}
    </Fragment>
  );
}
