import React, { Fragment } from 'react';
import { Dropdown, Checkbox, RadioGroup, Tooltip } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../util/setting';

const LOCATION_RANGE = [
  { value: 0, text: _l('不限制') },
  { value: 1, text: _l('当前位置周围') },
  // { value: 2, text: '指定定位地点' },
];

const LOCATION_RANGE_TYPE = [
  { value: '0', text: _l('定位地图上的位置') },
  {
    value: '1',
    text: _l('获取当前位置经纬度（仅app）'),
    children: (
      <Tooltip popupPlacement={'bottom'} text={<span>{_l('通过手机gps获取经纬度获取定位，使用WGS84坐标系')}</span>}>
        <i className="icon-help Gray_9e Font16 pointer"></i>
      </Tooltip>
    ),
  },
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
  const strDefault = data.strDefault || '00';
  const { distance, showxy = '0' } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('输入方式')}</div>
        <RadioGroup
          size="middle"
          vertical={true}
          checkedValue={strDefault[0]}
          data={LOCATION_RANGE_TYPE}
          onChange={value =>
            onChange({
              ...handleAdvancedSettingChange(data, { showxy: value === '0' ? showxy : '1' }),
              strDefault: updateConfig({ config: strDefault, value, index: 0 }),
            })
          }
        />
      </SettingItem>
      {strDefault[0] !== '1' && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('限制选择范围')}</div>
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
            <Dropdown
              border
              style={{ width: '100%', backgroundColor: '#fff', marginTop: '10px' }}
              menuStyle={{ width: '100%' }}
              value={+distance || undefined}
              data={DISTANCE_CONFIG}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { distance: value }));
              }}
            />
          )}
        </Fragment>
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
