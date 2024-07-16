import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import SelectOptions from '../components/OptionList/SelectOptions';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import _ from 'lodash';

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

const MULTI_SELECT_DISPLAY = [
  {
    value: '0',
    text: _l('横向'),
  },
  {
    value: '1',
    text: _l('纵向'),
  },
];

export default function DropdownCom({ data, onChange, globalSheetInfo, fromPortal, fromExcel }) {
  const { showtype = '0', direction, otherrequired = '0' } = getAdvanceSetting(data);
  const FILTER_OPTIONS_DISPLAY = fromPortal ? OPTIONS_DISPLAY.filter(i => i.value !== '2') : OPTIONS_DISPLAY;
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <div className="labelWrap">
          <Dropdown
            border
            data={FILTER_OPTIONS_DISPLAY}
            value={showtype}
            onChange={value => {
              onChange({
                ...handleAdvancedSettingChange(data, {
                  showtype: value,
                  otherrequired: value === '2' ? '0' : otherrequired,
                }),
                type: _.get(
                  _.find(OPTIONS_DISPLAY, i => i.value === value),
                  'type',
                ),
                ...(value === '1' && _.isUndefined(direction) ? { size: 12 } : {}),
                // 进度清除其他选项
                ...(value === '2' ? { options: (data.options || []).filter(i => i.key !== 'other') } : {}),
              });
            }}
          />
        </div>
      </SettingItem>
      {showtype === '2' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('移动端显示')}</div>
          <Dropdown
            border
            value={direction || '0'}
            data={MULTI_SELECT_DISPLAY}
            onChange={value => onChange(handleAdvancedSettingChange(data, { direction: value }))}
          />
        </SettingItem>
      )}
      {!fromExcel && (
        <SelectOptions data={data} globalSheetInfo={globalSheetInfo} onChange={onChange} fromPortal={fromPortal} />
      )}
    </Fragment>
  );
}
