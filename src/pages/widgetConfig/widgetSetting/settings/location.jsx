import React, { Fragment } from 'react';
import { Dropdown, Checkbox } from 'ming-ui';
import { get, head } from 'lodash';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const LOCATION_RANGE = [
  { value: 0, text: '不限制' },
  { value: 1, text: '定位当前位置' },
  // { value: 2, text: '指定定位地点' },
];

const DISTANCE_CONFIG = [
  {
    value: 100,
    text: _l('100米'),
  },
  {
    value: 300,
    text: _l('300米'),
  },
  {
    value: 500,
    text: _l('500米'),
  },
  {
    value: 1000,
    text: _l('1000米'),
  },
  {
    value: 2000,
    text: _l('2000米'),
  },
];
export default function Location({ data, onChange }) {
  const { enumDefault2, default: currentArea } = data;
  const { distance } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('定位范围')}</div>
        <Dropdown
          border
          style={{ width: '100%', backgroundColor: '#fff' }}
          menuStyle={{ width: '100%' }}
          value={enumDefault2}
          data={LOCATION_RANGE}
          onChange={value => {
            if (value === 1) {
              onChange({ ...handleAdvancedSettingChange(data, { distance: 100 }), enumDefault2: 1 });
              return;
            }
            onChange({ enumDefault2: value });
          }}
        />
      </SettingItem>
      {enumDefault2 === 1 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('周边')}</div>
          <Dropdown
            border
            style={{ width: '100%', backgroundColor: '#fff' }}
            menuStyle={{ width: '100%' }}
            value={+distance || undefined}
            data={DISTANCE_CONFIG}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { distance: value }));
            }}
          />
        </SettingItem>
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('默认值')}</div>
        <Checkbox
          size="small"
          checked={currentArea === '1'}
          onClick={checked => onChange({ default: checked ? '0' : '1' })}
          text={_l('当前位置')}
        />
      </SettingItem>
    </Fragment>
  );
}
