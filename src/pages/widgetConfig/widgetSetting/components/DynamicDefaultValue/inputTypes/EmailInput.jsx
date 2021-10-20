import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField } from '../components';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {} } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const [value, setValue] = useState(staticValue);
  const [isDynamic, setDynamic] = useState(!!cid);

  useEffect(() => {
    setValue(staticValue);
    setDynamic(!!cid);
  }, [data.controlId, cid]);

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  const handleChange = value => {
    setValue(value);
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: value }]);
  };
  return (
    <DynamicValueInputWrap>
      {isDynamic ? (
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
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} />
    </DynamicValueInputWrap>
  );
}
