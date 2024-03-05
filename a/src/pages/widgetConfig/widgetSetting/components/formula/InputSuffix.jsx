import React, { useState, useEffect } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../../styled';
import { UNIT_TYPE } from '../../../config/setting';
import styled from 'styled-components';
import { Input } from 'antd';
import { handleAdvancedSettingChange } from '../../../util/setting';
import { getAdvanceSetting } from '../../../util';
import _ from 'lodash';

const SuffixWrap = styled(SettingItem)`
  .unitDropdown {
    margin-bottom: 12px;
  }
`;

export default function InputSuffix({ data, onChange }) {
  const { unit, enumDefault, controlId, dot } = data;
  const setting = getAdvanceSetting(data) || {};
  const type = setting.prefix ? 'prefix' : 'suffix';
  const initSuffix = UNIT_TYPE.find(item => _.includes(['3', '4', '5'], unit) && item.value === unit) || {};
  useEffect(() => {
    onChange(
      handleAdvancedSettingChange(
        data,
        _.includes(['3', '4', '5'], unit)
          ? { [type]: setting[type] || initSuffix.text || '' }
          : { prefix: '', suffix: '' },
      ),
    );
  }, [unit, controlId]);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('输出格式')}</div>
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
