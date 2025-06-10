import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import WidgetDropdown from '../../components/Dropdown';
import { UNIT_TYPE } from '../../config/setting';
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
    const type = types.find(item => !!setting[item]);
    return type || 'suffix';
  };
  const [type, setType] = useState(getDefaultType());

  useEffect(() => {}, [data.controlId]);

  useEffect(() => {
    if (setting.suffix || setting.prefix) {
      setType(getDefaultType());
    }
  }, [setting.suffix, setting.prefix]);

  return (
    <PreSuffixWrap>
      <WidgetDropdown
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
      />
      <Input
        value={value || setting[type]}
        placeholder={_.get(
          _.find(UNIT_TYPE, u => u.value === data.unit),
          'text',
        )}
        onChange={e => {
          onChange(handleAdvancedSettingChange(data, { [type]: e.target.value }));
        }}
        onBlur={e => {
          const value = e.target.value;
          // 空格不处理，空格代表无前后缀，不兜底处理
          if (!(value && !value.trim())) {
            onChange(handleAdvancedSettingChange(data, { [type]: value.trim() }));
          }
        }}
      />
    </PreSuffixWrap>
  );
}
