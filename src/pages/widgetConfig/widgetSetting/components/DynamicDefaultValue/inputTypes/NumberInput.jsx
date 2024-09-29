import React, { useEffect, useState, createRef } from 'react';
import { Input } from 'antd';
import { formatNumberFromInput } from 'src/util';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import _ from 'lodash';

export default function NumberInput(props) {
  const { dynamicValue, data, clearOldDefault, onDynamicValueChange, defaultType, totalWidth, from } = props;
  const { cid = '' } = dynamicValue[0] || {};
  const [value, setValue] = useState('');
  const [isDynamic, setDynamic] = useState(false);
  const $wrap = createRef(null);
  const isStep = _.get(data, 'type') === 6 && _.get(data, 'advancedSetting.showtype') === '2';
  const maxValue = _.get(data, 'advancedSetting.max');
  const minValue = _.get(data, 'advancedSetting.min');

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  const handleChange = value => {
    const parsedValue = formatNumberFromInput(value);
    setValue(parsedValue);
    onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: parsedValue }] : []);
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

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  return (
    <DynamicValueInputWrap>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList
          onClick={() => {
            if (!cid) {
              setDynamic(false);
            }
          }}
          {...props}
        />
      ) : (
        <Input
          value={value}
          style={{
            width: totalWidth ? '100%' : 'calc(100% - 36px)',
            borderRadius: '3px 0 0 3px',
            lineHeight: '20px',
            minHeight: '36px',
          }}
          placeholder={_l('请输入数值')}
          onBlur={() => {
            if (value) {
              let dealValue = value === '-' ? '' : parseFloat(value);
              if (isStep && (dealValue === 0 || dealValue)) {
                if (dealValue > parseFloat(maxValue)) dealValue = maxValue;
                if (dealValue < parseFloat(minValue)) dealValue = minValue;
                handleChange(String(dealValue));
              }
              setValue(dealValue);
              if (dealValue === '') {
                onDynamicValueChange([]);
              }
            }
          }}
          onChange={e => handleChange(e.target.value)}
        />
      )}
      <SelectOtherField onDynamicValueChange={setDynamicValue} {...props} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
