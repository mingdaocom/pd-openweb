import React, { useState, useEffect } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../../styled';
import { UNIT_TYPE } from '../../../config/setting';
import styled from 'styled-components';
import { Input } from 'antd';
import { handleAdvancedSettingChange } from '../../../util/setting';
import { getAdvanceSetting } from '../../../util';
import PreSuffix from '../PreSuffix';

const SuffixWrap = styled(SettingItem)`
  .unitDropdown {
    margin-bottom: 12px;
  }
`;

export default function InputSuffix({ data, onChange }) {
  const { unit, enumDefault } = data;
  const { suffix } = getAdvanceSetting(data);

  if (['3', '4', '5'].includes(unit)) {
    return (
      <SuffixWrap>
        <div className="settingItemTitle">{_l('输出单位')}</div>
        <Dropdown
          border
          className="unitDropdown"
          value={unit}
          data={enumDefault === 3 ? UNIT_TYPE.slice(0, 3) : UNIT_TYPE}
          onChange={value => {
            if (_.includes(['3', '4', '5'], value)) {
              const initSuffix = UNIT_TYPE.find(item => item.value === value) || {};
              onChange(handleAdvancedSettingChange({ ...data, unit: value }, { suffix: initSuffix.text }));
              return;
            }
            onChange(handleAdvancedSettingChange({ ...data, unit: value }, { prefix: '', suffix: '' }));
            return;
          }}
        />
        <PreSuffix data={data} onChange={onChange} />
      </SuffixWrap>
    );
  }
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('输出单位')}</div>
      <Dropdown
        border
        value={unit}
        data={UNIT_TYPE}
        onChange={value => onChange(handleAdvancedSettingChange({ ...data, unit: value }, { suffix: '' }))}
      />
    </SettingItem>
  );
}
