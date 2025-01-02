import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange, parseDataSource } from '../../../util/setting';
import DynamicSelectDateControl from '../DynamicSelectDateControl';
import InputSuffix from './InputSuffix';
import PreSuffix from '../PreSuffix';
import PointerConfig from '../PointerConfig';
import _ from 'lodash';

const COMPUTE_MODE = [
  {
    value: '1',
    text: _l('目标日期 减去 此刻'),
  },
  { value: '2', text: _l('此刻 减去 目标日期') },
];

export default function ToTodaySetting({ data, onChange, ...rest }) {
  const { sourceControlId, unit = '3' } = data;
  const { dateformulatype = '1', autocarry = '0' } = getAdvanceSetting(data);
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
        <div className="settingItemTitle">{_l('目标日期')}</div>
        <DynamicSelectDateControl
          {...rest}
          disableTimeControl={true}
          value={parseDataSource(sourceControlId)}
          onChange={value => onChange({ sourceControlId: value })}
        />
      </SettingItem>
      <PointerConfig
        data={data}
        onChange={value => {
          if (value.advancedSetting) {
            onChange(value);
          } else {
            let newVal = value || {};
            if (!Number(value.dot)) {
              newVal.dotformat = '0';
            }
            onChange({ ...handleAdvancedSettingChange(data, newVal), ...value });
          }
        }}
      />
      <InputSuffix data={data} onChange={onChange} />
      {autocarry !== '1' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('显示单位')}</div>
          <PreSuffix data={data} onChange={onChange} />
        </SettingItem>
      )}
    </Fragment>
  );
}
