import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { RELATION_OPTIONS } from '../../config/setting';
import { SettingItem } from '../../styled';

export default function Relation({ data, onChange }) {
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Dropdown
          border
          value={data.enumDefault}
          data={RELATION_OPTIONS.filter(item => (item.isHide ? item.isHide() : true))}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
