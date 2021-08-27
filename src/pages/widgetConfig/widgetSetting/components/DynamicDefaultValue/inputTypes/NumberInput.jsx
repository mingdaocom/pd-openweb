import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import { formatNumberFromInput } from 'src/util';
import { DEFAULT_VALUE_VALIDATOR } from '../config';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField } from '../components';

export default function NumberInput(props) {
  const { dynamicValue, data, clearOldDefault, onDynamicValueChange } = props;
  const [value, setValue] = useState('');
  const [isDynamic, setDynamic] = useState(false);

  const handleTriggerClick = () => {
    setValue('');
    setDynamic(true);
    onDynamicValueChange([]);
  };

  const handleChange = value => {
    const parsedValue = formatNumberFromInput(value);
    setValue(parsedValue);
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: parsedValue }]);
  };

  useEffect(() => {
    const { default: defaultValue } = data;
    // 把以前旧的默认值合并到新的动态默认值上并清除掉旧的
    if (defaultValue) {
      handleChange(defaultValue);
      clearOldDefault();
    }
    const value = (_.head(dynamicValue) || {}).staticValue;
    if (value) {
      setValue(value);
    }
    if (dynamicValue.some(item => !!item.cid)) {
      setDynamic({ isDynamic: true });
    }
  }, []);

  useEffect(() => {
    const nextValue = (_.head(dynamicValue) || {}).staticValue;
    if (String(nextValue) !== value) {
      setValue(nextValue);
      setDynamic(false);
    }
    if (dynamicValue.some(item => !!item.cid)) {
      setDynamic({ isDynamic: true });
    }
  }, [dynamicValue]);

  return (
    <DynamicValueInputWrap>
      {isDynamic ? (
        <OtherFieldList
          onClick={() => {
            setDynamic(false);
          }}
          {...props}
        />
      ) : (
        <Input
          autoFocus
          value={value}
          style={{ width: 'calc(100% - 36px)', borderRadius: '3px 0 0 3px' }}
          onBlur={() => {
            if (value) {
              setValue(value === '-' ? '' : parseFloat(value));
            }
          }}
          onChange={e => handleChange(e.target.value)}
        />
      )}
      <SelectOtherField onTriggerClick={handleTriggerClick} {...props} />
    </DynamicValueInputWrap>
  );
}
