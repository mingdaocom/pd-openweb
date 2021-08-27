import React, { Fragment } from 'react';
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
    value: '1',
    text: _l('下拉菜单'),
  },
  {
    value: '0',
    text: _l('平铺'),
  },
];
export default function MultiSelect({ data, onChange, globalSheetInfo }) {
  const { direction, checktype = '0' } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={checktype}
          data={OPTIONS_DISPLAY}
          onChange={type => {
            if (type !== checktype) {
              onChange(handleAdvancedSettingChange(data, { checktype: type, allowadd: '0' }));
            }
          }}
        />
      </SettingItem>
      {checktype !== '1' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('排列方式')}</div>
          <Dropdown
            border
            value={direction}
            data={MULTI_SELECT_DISPLAY}
            onChange={value => onChange(handleAdvancedSettingChange(data, { direction: value }))}
          />
        </SettingItem>
      )}
      <OptionList.SelectOptions data={data} globalSheetInfo={globalSheetInfo} onChange={onChange} />
    </Fragment>
  );
}
