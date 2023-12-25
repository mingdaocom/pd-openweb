import React, { useState, useEffect, createRef } from 'react';
import { Input } from 'antd';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType } = props;
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

  const handleChange = value => {
    setValue(value);
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: value }]);
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
          autoFocus
          value={value}
          style={{ width: 'calc(100% - 36px)', borderRadius: '3px 0 0 3px' }}
          onBlur={() => {
            if (value) {
              setValue(value);
            }
          }}
          onChange={e => handleChange(e.target.value)}
        />
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
