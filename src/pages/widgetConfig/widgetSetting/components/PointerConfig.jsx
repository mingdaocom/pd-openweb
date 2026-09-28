import React, { useEffect } from 'react';
import _ from 'lodash';
import { Checkbox, InputNumber, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../styled';

const ROUND_TYPE = [
  {
    label: _l('向上舍入'),
    value: '1',
  },
  {
    label: _l('向下舍入'),
    value: '0',
  },
  {
    label: _l('四舍五入'),
    value: '2',
  },
];

export default function PointConfig({ data = {}, onChange }) {
  const { dot = 2 } = data;
  const {
    numshow,
    dotformat = '0',
    roundtype = _.includes([6, 8, 31, 37], data.type) ? '2' : '0',
  } = getAdvanceSetting(data);
  const maxDot = _.includes([6, 31, 37], data.type) && numshow === '1' ? 12 : 14;

  // 百分比配置小数点最大12
  useEffect(() => {
    if (dot > maxDot) {
      onChange({ dot: 12 });
    }
  }, [dot, maxDot, onChange]);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('小数位数')}</div>
      <div className="flexCenter">
        <InputNumber
          value={dot}
          min={0}
          max={maxDot}
          precision={0}
          onChange={value => onChange({ dot: value ?? '' })}
        />
        {_.includes([6, 8], data.type) ? null : (
          <Select
            className="mLeft12 flex"
            value={roundtype}
            options={ROUND_TYPE}
            onChange={value => onChange(handleAdvancedSettingChange(data, { roundtype: value }))}
          />
        )}
      </div>
      {dot ? (
        <Checkbox
          className="mTop8"
          checked={dotformat === '1'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                dotformat: !event.target.checked ? '0' : '1',
              }),
            )
          }
          size="small"
        >
          <span style={{ marginRight: '4px' }}>{_l('省略末尾的 0')}</span>
          <Tooltip
            title={_l('勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8')}
          >
            <i className="icon-help textDisabled Font15"></i>
          </Tooltip>
        </Checkbox>
      ) : null}
    </SettingItem>
  );
}
