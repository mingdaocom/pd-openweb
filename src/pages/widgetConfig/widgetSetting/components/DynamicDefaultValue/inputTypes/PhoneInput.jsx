import React, { useState, useEffect, createRef } from 'react';
import { Input } from 'antd';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DYNAMIC_FROM_MODE } from '../config';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType, from } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const hasAccountId = !!_.get(safeParse(staticValue), 'accountId');
  const [value, setValue] = useState(staticValue);
  const [isDynamic, setDynamic] = useState(hasAccountId || !!cid);
  const $wrap = createRef(null);

  useEffect(() => {
    setValue(staticValue);
    setDynamic(hasAccountId || !!cid);
  }, [data.controlId, cid, staticValue]);

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  const handleChange = (value, withValueChange = true) => {
    const formatValue = value.replace(/[^\d]/g, '');
    const parseValue = formatValue ? parseFloat(value) : '';
    setValue(parseValue);
    withValueChange && onDynamicValueChange(parseValue ? [{ cid: '', rcid: '', staticValue: parseValue }] : []);
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  return (
    <DynamicValueInputWrap>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList {...props} />
      ) : (
        <Input
          value={value}
          style={{ width: 'calc(100% - 36px)', borderRadius: '3px 0 0 3px' }}
          onChange={e => handleChange(e.target.value, from !== DYNAMIC_FROM_MODE.FAST_FILTER)}
          onBlur={() => {
            from === DYNAMIC_FROM_MODE.FAST_FILTER &&
              onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: value }] : []);
          }}
        />
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
