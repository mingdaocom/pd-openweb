import React from 'react';
import { oneOf, string } from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  position: absolute;
  z-index: 1051;
  ${({ pos }) => `${pos === 'top' ? 'top' : 'bottom'}: -26px;`}
  left: 0;
  white-space: nowrap;
  padding: 0 8px;
  height: 26px;
  line-height: 26px;
  font-size: 12px;
  color: #fff;
  background-color: #f44336;
`;

const Angle = styled.div`
  position: absolute;
  ${({ pos }) => `${pos === 'top' ? 'bottom' : 'top'}: -6px;`}
  left: 0;
  border: 3px solid transparent;
  border-left-color: #f44336;
  ${({ pos }) => (pos === 'top' ? 'border-top-color: #f44336;' : 'border-bottom-color: #f44336;')}
`;

export default function CellErrorTip(props) {
  const { pos = 'top', error } = props;
  return (
    <Con pos={pos}>
      <Angle pos={pos} />
      {error}
    </Con>
  );
}

CellErrorTip.propTypes = {
  pos: oneOf('top', 'bottom'),
  error: string,
};
