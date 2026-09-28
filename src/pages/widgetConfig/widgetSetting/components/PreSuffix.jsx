import React, { useState } from 'react';
import { Input, Select, Space } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { UNIT_TYPE } from 'src/utils/domain/control/setting';

const TYPES = [
  {
    label: _l('前缀'),
    value: 'prefix',
  },
  {
    label: _l('后缀'),
    value: 'suffix',
  },
];
const types = ['suffix', 'prefix'];

function PreSuffixContent({ data, value, onChange }) {
  const setting = getAdvanceSetting(data);
  const configuredType = types.find(item => !!setting[item]);
  const [emptyType, setEmptyType] = useState(configuredType || 'suffix');
  const type = configuredType || emptyType;

  return (
    <Space.Compact block>
      <Select
        className="Width120"
        value={type}
        options={TYPES}
        onChange={t => {
          if (t === type) return;
          setEmptyType(t);
          const prev = t === 'suffix' ? 'prefix' : 'suffix';
          const text = setting[prev];
          const nextSetting = { [prev]: '', [t]: text };
          onChange(handleAdvancedSettingChange(data, nextSetting));
        }}
      />
      <Input
        className="flex"
        value={value || setting[type]}
        placeholder={UNIT_TYPE.find(item => item.value === data.unit)?.text}
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
    </Space.Compact>
  );
}

export default function PreSuffix(props) {
  return <PreSuffixContent key={props.data.controlId} {...props} />;
}
