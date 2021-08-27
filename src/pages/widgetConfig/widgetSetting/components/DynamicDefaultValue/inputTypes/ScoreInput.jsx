import React from 'react';
import { Input } from 'ming-ui';

export default function ScoreDefaultValue(props) {
  const { onDynamicValueChange, data, dynamicValue } = props;
  const maxValue = data.enumDefault === 1 ? 5 : 10;
  const getValue = () => {
    const { staticValue } = dynamicValue[0] || { staticValue: '' };
    return staticValue ? Math.min(maxValue, staticValue) : '';
  };
  const handleChange = value => {
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: value ? Math.min(parseFloat(value), maxValue) : '' }]);
  };
  const value = getValue();
  return <Input value={value} style={{ width: '100%' }} onBlur={() => {}} onChange={handleChange} />;
}
