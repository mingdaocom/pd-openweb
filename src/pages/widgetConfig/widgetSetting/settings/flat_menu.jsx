import React, { useState, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { Dropdown, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import OptionList from '../components/OptionList';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const MULTI_SELECT_DISPLAY = [
  {
    value: '0',
    text: _l('横向排列'),
  },
  {
    value: '1',
    text: _l('纵向排列'),
  },
];
const OPTIONS_DISPLAY = [
  {
    value: 11,
    text: _l('下拉菜单'),
  },
  {
    value: 9,
    text: _l('平铺'),
  },
];

export default function FlatMenu({ data, onChange, globalSheetInfo }) {
  const { direction = '0' } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={data.type}
          data={OPTIONS_DISPLAY}
          onChange={type => {
            onChange({ type, advancedSetting: handleAdvancedSettingChange(data, { allowadd: '0' }).advancedSetting });
          }}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('排列方式')}</div>
        <Dropdown
          border
          value={direction}
          data={MULTI_SELECT_DISPLAY}
          onChange={value => onChange(handleAdvancedSettingChange(data, { direction: value }))}
        />
      </SettingItem>
      <OptionList.SelectOptions data={data} globalSheetInfo={globalSheetInfo} onChange={onChange} />
    </Fragment>
  );
}
