import React, { useState, useEffect } from 'react';
import Components from '../../components';
import styled from 'styled-components';
import { Input } from 'antd';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';

const PreSuffixWrap = styled.div`
  display: flex;
  align-items: center;
  .selectDropdown {
    border-radius: 4px 0 0 4px;
    width: 120px;
    margin-top: 0;
  }
  input {
    height: 36px;
    border-left: 0;
    border-radius: 0 4px 4px 0;
  }
`;

const TYPES = [
  {
    text: _l('前缀'),
    value: 'prefix',
  },
  {
    text: _l('后缀'),
    value: 'suffix',
  },
];
const types = ['suffix', 'prefix'];

export default function PreSuffix({ data, value, onChange }) {
  const setting = getAdvanceSetting(data);
  const getDefaultType = () => {
    const type = types.find(item => setting[item]);
    return type || 'suffix';
  };
  const [type, setType] = useState(getDefaultType);

  useEffect(() => {
    setType(getDefaultType);
  }, [data.controlId]);

  return (
    <PreSuffixWrap>
      <Components.Dropdown
        className="selectDropdown"
        value={type}
        data={TYPES}
        onChange={t => {
          if (t === type) return;
          setType(t);
          const prev = t === 'suffix' ? 'prefix' : 'suffix';
          const text = setting[prev];
          const nextSetting = { [prev]: '', [t]: text };
          onChange(handleAdvancedSettingChange(data, nextSetting));
        }}
      ></Components.Dropdown>
      <Input
        value={value || setting[type]}
        onChange={e => {
          onChange(handleAdvancedSettingChange(data, { [type]: e.target.value }));
        }}
      />
    </PreSuffixWrap>
  );
}
