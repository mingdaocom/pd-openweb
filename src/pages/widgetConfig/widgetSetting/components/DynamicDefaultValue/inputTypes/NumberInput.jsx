import React, { createRef, useEffect, useState } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { formatNumberFromInput } from 'src/utils/control';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap, WrapMaxOrMin } from '../styled';

export default function NumberInput(props) {
  const { dynamicValue, data, clearOldDefault, onDynamicValueChange, defaultType, totalWidth, from, withMaxOrMin } =
    props;
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

  const handleChange = (value, noChange) => {
    const parsedValue = formatNumberFromInput(value);
    setValue(parsedValue);
    !noChange && onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: parsedValue }] : []);
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

  const getMaxOrMin = isMax => {
    return isMax
      ? (value || '').substring((value || '').indexOf('~') + 1)
      : (value || '').substring(0, (value || '').indexOf('~'));
  };

  const onSaveMaxOrMin = () => {
    if (value) {
      const max = getMaxOrMin(true) ? Number(getMaxOrMin(true)) : '';
      const min = getMaxOrMin() ? Number(getMaxOrMin()) : '';
      if (max !== '' && min !== '' && max < min) {
        return onDynamicValueChange([{ cid: '', rcid: '', staticValue: `${max}~${min}` }]);
      }
      return onDynamicValueChange([{ cid: '', rcid: '', staticValue: value }]);
    }
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
      ) : withMaxOrMin && from === DYNAMIC_FROM_MODE.FAST_FILTER ? (
        <WrapMaxOrMin>
          <Input
            value={getMaxOrMin()}
            style={{
              width: 'calc(50% - 18px)',
              borderRadius: '3px 0 0 3px',
              border: 0,
              lineHeight: '20px',
              minHeight: '34px',
            }}
            placeholder={_l('最小值')}
            onBlur={() => {
              onSaveMaxOrMin();
            }}
            onChange={e => {
              const parsedValue = formatNumberFromInput(e.target.value);
              setValue(`${parsedValue}~${getMaxOrMin(true)}`);
            }}
            maxLength={16}
          />
          -
          <Input
            maxLength={16}
            value={getMaxOrMin(true)}
            style={{
              width: 'calc(50% - 18px)',
              borderRadius: '0',
              border: 0,
              lineHeight: '20px',
              minHeight: '34px',
            }}
            placeholder={_l('最大值')}
            onBlur={() => {
              onSaveMaxOrMin();
            }}
            onChange={e => {
              const parsedValue = formatNumberFromInput(e.target.value);
              setValue(`${getMaxOrMin()}~${parsedValue}`);
            }}
          />
        </WrapMaxOrMin>
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
              if (from === DYNAMIC_FROM_MODE.FAST_FILTER) {
                return handleChange(String(dealValue));
              }
              if (isStep && (dealValue === 0 || dealValue)) {
                if (dealValue > parseFloat(maxValue)) dealValue = maxValue;
                if (dealValue < parseFloat(minValue)) dealValue = minValue;
                handleChange(String(dealValue));
              }
              setValue(dealValue);
              if (dealValue === '') {
                onDynamicValueChange([]);
              }
            } else if (from === DYNAMIC_FROM_MODE.FAST_FILTER) {
              onDynamicValueChange([]);
            }
          }}
          onChange={e => handleChange(e.target.value, from === DYNAMIC_FROM_MODE.FAST_FILTER)}
        />
      )}
      <SelectOtherField onDynamicValueChange={setDynamicValue} {...props} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
