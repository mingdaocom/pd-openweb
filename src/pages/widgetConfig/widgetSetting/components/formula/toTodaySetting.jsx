import React, { useState, useEffect, Fragment } from 'react';
import { Dropdown, Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../styled';
import { FORMULA_DATE_DISPLAY_TYPE } from '../../../config/setting';
import { getAdvanceSetting, handleAdvancedSettingChange, parseDataSource } from '../../../util/setting';
import DynamicSelectDateControl from '../DynamicSelectDateControl';
import InputSuffix from './InputSuffix';
import PreSuffix from '../PreSuffix';
import PointConfig from '../PointerConfig';
import _ from 'lodash';

const COMPUTE_MODE = [
  {
    value: '1',
    text: _l('目标日期 减去 此刻 '),
  },
  { value: '2', text: _l('此刻 减去 目标日期') },
];

export default function ToTodaySetting({ data, onChange, ...rest }) {
  const { sourceControlId, unit = '3' } = data;
  const { dateformulatype = '1', hideneg = '0', autocarry = '0' } = getAdvanceSetting(data);
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
        <div className="settingItemTitle">{_l('设置')}</div>
        {!_.includes(['5'], unit) && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={autocarry === '1'}
              onClick={checked => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    autocarry: checked ? '0' : '1',
                    ...(!checked ? { prefix: '', suffix: '' } : {}),
                  }),
                );
              }}
            >
              <span style={{ marginRight: '6px' }}>{_l('自动进位')}</span>
              <Tooltip
                popupPlacement="bottom"
                title={
                  <span>
                    {_l('超过12个月/24小时/60分钟的部分，分别进位为年/天/小时。如 90分钟 呈现为 1小时30分钟')}
                  </span>
                }
              >
                <i className="icon-help Gray_bd Font16 pointer"></i>
              </Tooltip>
            </Checkbox>
          </div>
        )}
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
      <PointConfig
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
      {_.includes(['3', '4', '5'], unit) && autocarry !== '1' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('单位')}</div>
          <PreSuffix data={data} onChange={onChange} />
        </SettingItem>
      )}
    </Fragment>
  );
}
