import React, { useState } from 'react';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField } from '../components';

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
