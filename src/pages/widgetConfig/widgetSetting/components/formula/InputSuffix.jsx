import React from 'react';
import _ from 'lodash';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { UNIT_TYPE } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../../styled';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function InputSuffix({ data, onChange }) {
  const { unit, dot } = data;
  const setting = getAdvanceSetting(data) || {};

  return (
    <SettingItem>
      <div className="settingItemTitle" style={{ justifyContent: 'space-between' }}>
        {_l('单位')}
        {!_.includes(['5'], unit) && (
          <Checkbox
            checked={setting.autocarry === '1'}
            onChange={event => {
              const checked = !event.target.checked;
              onChange(
                handleAdvancedSettingChange(data, {
                  autocarry: checked ? '0' : '1',
                  ...(!checked
                    ? {
                        prefix: '',
                        suffix: '',
                      }
                    : {}),
                }),
              );
            }}
            size="small"
          >
            <span style={{ marginRight: '6px' }}>{_l('自动进位')}</span>
            <Tooltip
              placement="bottom"
              title={
                <span>
                  {_l(
                    '输出结果超过12月/30天/24时/60分钟/60秒的部分，将分别进位为年/月/天/时/分钟。如50时呈现为2天2时。',
                  )}
                </span>
              }
            >
              <i className="icon-help textDisabled Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        )}
      </div>
      <Select
        className="w100"
        value={unit}
        options={UNIT_TYPE}
        fieldNames={SELECT_FIELD_NAMES}
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
