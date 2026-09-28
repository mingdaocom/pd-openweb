import React, { Fragment } from 'react';
import { Radio, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import { SettingItem } from '../../styled';

const LOCATION_RANGE = [
  { value: 0, label: _l('不限制') },
  { value: 1, label: _l('当前位置周围') },
  // { value: 2, text: '指定定位地点' },
];

const LOCATION_RANGE_TYPE = [
  { value: '0', text: _l('定位地图上的位置') },
  {
    value: '1',
    text: _l('获取当前位置经纬度'),
    children: (
      <Tooltip
        placement="bottom"
        title={_l('通过手机 GPS 获取当前位置，并自动将WGS84转换为GCJ-02 坐标系，用于在地图上精准定位。')}
      >
        <i className="icon-help textTertiary Font16 pointer mLeft8"></i>
      </Tooltip>
    ),
  },
];

const DISTANCE_CONFIG = [
  {
    value: 100,
    label: _l('100米'),
  },
  {
    value: 300,
    label: _l('300米'),
  },
  {
    value: 500,
    label: _l('500米'),
  },
  {
    value: 1000,
    label: _l('1000米'),
  },
  {
    value: 2000,
    label: _l('2000米'),
  },
];

export default function Location({ data, onChange }) {
  const { enumDefault2 } = data;
  const strDefault = data.strDefault || '00';
  const { distance, showxy = '0', allowcustom } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('输入方式')}
          {(window.platformENV.isOverseas || window.platformENV.isLocal) && (
            <Tooltip placement="bottom" title={_l('由于高德定位组件限制，必须使用https协议以获得准确的定位信息')}>
              <i className="icon-help textTertiary Font16 pointer mLeft6"></i>
            </Tooltip>
          )}
        </div>
        <Radio.Group
          size="middle"
          vertical={true}
          value={strDefault[0]}
          options={(LOCATION_RANGE_TYPE || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const value = event.target.value;

            return onChange({
              ...handleAdvancedSettingChange(data, {
                showxy: value === '0' ? showxy : '1',
                allowcustom: value === '0' ? allowcustom : '0',
              }),
              strDefault: updateConfig({
                config: strDefault,
                value,
                index: 0,
              }),
            });
          }}
        />
      </SettingItem>
      {strDefault[0] !== '1' && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('限制选择范围')}</div>
            <Select
              className="w100"
              value={enumDefault2}
              options={LOCATION_RANGE}
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
            <Select
              className="w100 mTop10"
              value={+distance || undefined}
              options={DISTANCE_CONFIG}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { distance: value }));
              }}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
