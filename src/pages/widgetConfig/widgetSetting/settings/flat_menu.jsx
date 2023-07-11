import React, { useState, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { Dropdown, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import OptionList from '../components/OptionList';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import _ from 'lodash';

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
    value: '0',
    text: _l('下拉菜单'),
    type: 11,
  },
  {
    value: '1',
    text: _l('平铺'),
    type: 9,
  },
  {
    value: '2',
    text: _l('进度'),
    type: 11,
  },
];

export default function FlatMenu({ data, onChange, globalSheetInfo, fromPortal, fromExcel }) {
  const { direction = '0', showtype = '0' } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Dropdown
            border
            data={OPTIONS_DISPLAY}
            value={showtype}
            onChange={value => {
              onChange({
                ...handleAdvancedSettingChange(data, { showtype: value, allowadd: '0' }),
                type: _.get(
                  _.find(OPTIONS_DISPLAY, i => i.value === value),
                  'type',
                ),
                // 进度清除其他选项
                options: value === '2' ? (data.options || []).filter(i => i.key !== 'other') : data.options,
              });
            }}
          />
        </div>
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
      {!fromExcel && (
        <OptionList.SelectOptions
          data={data}
          globalSheetInfo={globalSheetInfo}
          onChange={onChange}
          fromPortal={fromPortal}
        />
      )}
    </Fragment>
  );
}
