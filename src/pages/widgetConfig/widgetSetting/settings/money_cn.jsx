import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getMoneyCnControls } from '../../util/data';
import { formatControlsToDropdown, parseDataSource } from '../../util';

export default function MoneyCn({ data, onChange, allControls }) {
  const moneyControls = formatControlsToDropdown(getMoneyCnControls(allControls, data));
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('关联金额')}</div>
        <Dropdown
          border
          placeholder={_l('请选择配置的”金额“字段')}
          value={parseDataSource(data.dataSource) || undefined}
          data={moneyControls}
          onChange={value => onChange({ dataSource: `$${value}$` })}
        />
      </SettingItem>
    </Fragment>
  );
}
