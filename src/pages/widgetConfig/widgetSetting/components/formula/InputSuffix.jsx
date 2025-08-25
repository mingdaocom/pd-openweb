import React from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import { Checkbox, Dropdown } from 'ming-ui';
import { UNIT_TYPE } from '../../../config/setting';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';

export default function InputSuffix({ data, onChange }) {
  const { unit, dot } = data;
  const setting = getAdvanceSetting(data) || {};

  return (
    <SettingItem>
      <div className="settingItemTitle" style={{ justifyContent: 'space-between' }}>
        {_l('单位')}
        {!_.includes(['5'], unit) && (
          <Checkbox
            size="small"
            checked={setting.autocarry === '1'}
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
              autoCloseDelay={0}
              title={
                <span>
                  {_l(
                    '输出结果超过12月/30天/24时/60分钟/60秒的部分，将分别进位为年/月/天/时/分钟。如50时呈现为2天2时。',
                  )}
                </span>
              }
            >
              <i className="icon-help Gray_bd Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        )}
      </div>
      <Dropdown
        border
        value={unit}
        data={UNIT_TYPE}
        onChange={value => {
          onChange(
            handleAdvancedSettingChange(
              { ...data, unit: value, dot: _.includes(['1', '6'], value) ? 0 : dot },
              _.includes(['5'], value) && setting.autocarry === '1' ? { autocarry: '' } : {},
            ),
          );
        }}
      />
    </SettingItem>
  );
}
