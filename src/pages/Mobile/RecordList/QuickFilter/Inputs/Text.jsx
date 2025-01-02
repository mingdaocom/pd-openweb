import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';

const InputCon = styled.input`
  width: 100%;
  border: none;
  background-color: #f5f5f5;
  height: 36px;
  border-radius: 3px;
  padding: 0 12px;
  font-size: 14px;
`;

export default function Text(props) {
  const { values = [], control, filterType, onChange } = props;
  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15 controlName">{control.controlName}</div>
      <div className="flex">
        <InputCon
          placeholder={_l('请输入')}
          value={values.join(' ')}
          onChange={e => {
            const value = e.target.value;
            if (filterType === FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN) {
              onChange({ values: value.split(' ') });
            } else {
              onChange({ values: [value] });
            }
          }}
        />
      </div>
    </div>
  );
}
