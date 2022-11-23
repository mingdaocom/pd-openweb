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
  const { unit, enumDefault, controlId } = data;
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

  if (['3', '4', '5'].includes(unit)) {
    return (
      <SuffixWrap>
        <div className="settingItemTitle">{_l('输出单位')}</div>
        <Dropdown
          border
          className="unitDropdown"
          value={unit}
          data={UNIT_TYPE}
          onChange={value => {
            onChange(
              handleAdvancedSettingChange(
                { ...data, unit: value },
                _.includes(['3', '5'], value) && setting.autocarry === '1' ? { autocarry: '' } : {},
              ),
            );
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
