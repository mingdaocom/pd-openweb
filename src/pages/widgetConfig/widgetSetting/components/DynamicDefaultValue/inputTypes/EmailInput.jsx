import React, { createRef, useEffect, useState } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DYNAMIC_FROM_MODE } from '../config';
import { DynamicValueInputWrap } from '../styled';

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
    setValue(value);
    withValueChange && onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: value }] : []);
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
          onBlur={() => {
            if (from === DYNAMIC_FROM_MODE.FAST_FILTER) {
              return onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: value }] : []);
            }
            if (value) {
              setValue(value);
            }
          }}
          onChange={e => handleChange(e.target.value, from !== DYNAMIC_FROM_MODE.FAST_FILTER)}
        />
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
