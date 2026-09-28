import React, { Fragment } from 'react';
import { Select } from 'ming-ui/antd-components';
import { RELATION_OPTIONS } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../styled';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function Relation({ data, onChange }) {
  const isLocalOrOverseas = window.platformENV.isOverseas || window.platformENV.isLocal;
  const relationOptions = isLocalOrOverseas
    ? RELATION_OPTIONS.filter(item => (item.isHide ? item.isHide(md.global.SysSettings.forbidSuites) : true))
    : RELATION_OPTIONS;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Select
          className="w100"
          value={data.enumDefault}
          options={relationOptions}
          fieldNames={SELECT_FIELD_NAMES}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
