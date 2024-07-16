import React, { useState, useEffect, createRef } from 'react';
import { Input } from 'antd';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const maxValue = getAdvanceSetting(data, 'max') || (data.enumDefault === 1 ? 5 : 10);
  const [isDynamic, setDynamic] = useState(!!cid);
  const $wrap = createRef(null);

  useEffect(() => {
    setDynamic(!!cid);
  }, [data.controlId, cid]);

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  const handleChange = value => {
    onDynamicValueChange(value ? [{ cid: '', rcid: '', staticValue: Math.min(parseFloat(value), maxValue) }] : []);
  };

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
            setDynamic(false);
          }}
          {...props}
        />
      ) : (
        <Input
          value={staticValue}
          style={{ width: 'calc(100% - 36px)', borderRadius: '3px 0 0 3px' }}
          onChange={e => handleChange(e.target.value)}
        />
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
