import React from 'react';
import styled from 'styled-components';
import { getIconByType } from 'src/pages/widgetConfig/util';

const Con = styled.div`
  border-radius: 3px;
  background-color: #f4f4f4;
  font-size: 13px;
  padding: 0 15px;
  height: 36px;
  line-height: 36px;
  margin-bottom: 10px;
`;
const Icon = styled.i`
  font-size: 15px;
  color: #9d9d9d;
  line-height: 36px;
`;

export default function({ disabled, controls, onAdd = () => {} }) {
  return controls.map((control, i) => (
    <Con className="flexRow" key={i}>
      <Icon className={`icon icon-${getIconByType(control.type)} mRight10`} />
      <div className="flex ellipsis">{control.controlName}</div>
      {!disabled && (
        <Icon
          className="icon icon-plus Hand ThemeHoverColor3"
          onClick={() => {
            onAdd(control);
          }}
        />
      )}
    </Con>
  ));
}
