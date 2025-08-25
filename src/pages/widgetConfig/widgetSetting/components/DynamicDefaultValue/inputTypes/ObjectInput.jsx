import React from 'react';
import { OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default function (props) {
  const { onDynamicValueChange } = props;

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  return (
    <DynamicValueInputWrap>
      <OtherFieldList {...props} />
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} />
    </DynamicValueInputWrap>
  );
}
