import React, { useState, useEffect, Fragment } from 'react';
import { Dropdown, Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import { FORMULA_DATE_DISPLAY_TYPE } from '../../../config/setting';
import { getAdvanceSetting, handleAdvancedSettingChange, parseDataSource } from '../../../util/setting';
import DynamicSelectDateControl from '../DynamicSelectDateControl';
import InputSuffix from './InputSuffix';

const COMPUTE_MODE = [
  {
    value: '1',
    text: _l('目标日期 减去 今天日期 '),
  },
  { value: '2', text: _l('今天日期 减去 目标日期') },
];

export default function ToTodaySetting({ data, onChange, ...rest }) {
  const { sourceControlId, unit = '3' } = data;
  const { dateformulatype = '1', hideneg = '0' } = getAdvanceSetting(data);
  return (
    <Fragment>
      <div className="Font12 Gray_9e mTop5">
        {_l('距离今天的运算方式为实时运算。不支持作为他表字段或继续用于公式计算')}
      </div>
      <SettingItem>
        <div className="settingItemTitle">{_l('计算')}</div>
        <Dropdown
          border
          data={COMPUTE_MODE}
          value={dateformulatype}
          onChange={value => onChange(handleAdvancedSettingChange(data, { dateformulatype: value }))}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择日期')}</div>
        <DynamicSelectDateControl
          {...rest}
          disableTimeControl={true}
          value={parseDataSource(sourceControlId)}
          onChange={value => onChange({ sourceControlId: value })}
        />
      </SettingItem>
      <InputSuffix data={data} onChange={onChange} />
      <SettingItem>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={hideneg === '1'}
            onClick={checked => {
              onChange(handleAdvancedSettingChange(data, { hideneg: checked ? '0' : '1' }));
            }}
          >
            <span style={{ marginRight: '6px' }}>{_l('不显示负值')}</span>
            <Tooltip popupPlacement="bottom" title={<span>{_l('勾选后，当计算结果为负数时，则显示为空')}</span>}>
              <i className="icon-help Gray_bd Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      </SettingItem>
    </Fragment>
  );
}
