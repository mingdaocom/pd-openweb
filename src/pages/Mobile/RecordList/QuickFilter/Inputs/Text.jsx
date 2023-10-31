import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const InputCon = styled.input`
  width: 100%;
  border: none;
  background-color: #F5F5F5;
  height: 36px;
  border-radius: 3px;
  padding: 0 12px;
  font-size: 14px;
`;

export default function Text(props) {
  const { values = [], control, onChange } = props;
  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15">{control.controlName}</div>
      <div className="flex">
        <InputCon
          placeholder={_l('请输入')}
          value={values.join(' ')}
          onChange={e => {
            const value = e.target.value
            onChange({ values: [value] });
          }}
        />
      </div>
    </div>
  );
}
