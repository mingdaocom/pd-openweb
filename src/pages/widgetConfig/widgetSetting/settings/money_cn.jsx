import React, { Fragment, useEffect } from 'react';
import _ from 'lodash';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import { formatControlsToDropdown, parseDataSource } from '../../util';
import { getMoneyCnControls } from '../../util/data';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const DISPLAY_OPTIONS = [
  { text: _l('中文大写'), value: '0' },
  { text: _l('英文大写'), value: '1' },
  { text: _l('繁体大写'), value: '3' },
];

const relateMoneyControl = (value, controls = []) => {
  return _.find(controls, a => a.controlId === value) || {};
};

export default function MoneyCn({ data, onChange, allControls }) {
  const { currencytype = '0' } = getAdvanceSetting(data);
  const moneyControls = getMoneyCnControls(allControls, data);
  const relateId = parseDataSource(data.dataSource);
  const relCon = relateMoneyControl(relateId, moneyControls);
  const { currencycode } = getAdvanceSetting(relCon, 'currency');
  const isEn = currencycode && !_.includes(['CNY', 'HKD', 'TWD', 'MOP'], currencycode);
  const needSet = isEn && currencytype !== '1';

  useEffect(() => {
    // 为保存时矫正数据
    if (needSet && data.controlId.includes('-')) {
      onChange(handleAdvancedSettingChange(data, { currencytype: '1' }));
    }
  }, [currencycode]);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('关联金额')}</div>
        <Dropdown
          border
          className="DropdownBottom"
          placeholder={
            relateId && _.isEmpty(relCon) ? <span className="Red">{_l('已删除')}</span> : _l('请选择配置的”金额“字段')
          }
          value={relateId && _.isEmpty(relCon) ? undefined : relateId || undefined}
          data={formatControlsToDropdown(moneyControls)}
          onChange={value => {
            const relateControl = relateMoneyControl(value, allControls);
            const { currency } = getAdvanceSetting(relateControl);
            const { currencycode } = safeParse(currency || '{}');
            const currentCurrencyType =
              relateControl.type !== 8
                ? '0'
                : _.includes(['HKD', 'TWD', 'MOP'], currencycode)
                  ? '3'
                  : !currencycode || currencycode === 'CNY'
                    ? '0'
                    : '1';
            onChange({
              ...handleAdvancedSettingChange(data, { currencytype: currentCurrencyType }),
              dataSource: `$${value}$`,
            });
          }}
        />
      </SettingItem>
      {relCon.type === 8 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('转换类型')}</div>
          <Dropdown
            border
            disabled={!currencycode || (isEn && !needSet)}
            value={needSet ? undefined : currencytype || '0'}
            placeholder={_l('未配置')}
            data={isEn ? DISPLAY_OPTIONS.filter(i => i.value === '1') : DISPLAY_OPTIONS}
            onChange={value => onChange(handleAdvancedSettingChange(data, { currencytype: value }))}
          />
        </SettingItem>
      )}
      {currencytype === '1' && <div className="mTop10 Gray_9e">{_l('仅支持2位小数，超过则四舍五入')}</div>}
    </Fragment>
  );
}
