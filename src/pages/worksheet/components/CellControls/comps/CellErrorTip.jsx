import React, { useEffect, useState } from 'react';
import { func, oneOf, string } from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  position: absolute;
  z-index: 1002;
  ${({ pos }) => `${pos === 'top' ? 'top' : 'bottom'}: -26px;`}
  left: 0;
  white-space: nowrap;
  padding: 0 8px;
  height: 26px;
  line-height: 26px;
  font-size: 12px;
  color: #fff;
  background-color: ${({ color }) => color || '#f44336'};
  .delIcon {
    cursor: pointer;
    color: rgba(0, 0, 0, 0.24);
    margin-left: 8px;
    &:hover {
      color: rgba(0, 0, 0, 0.5);
    }
  }
`;

const Angle = styled.div`
  position: absolute;
  ${({ pos }) => `${pos === 'top' ? 'bottom' : 'top'}: -6px;`}
  left: 0;
  border: 3px solid transparent;
  border-left-color: ${({ color }) => color || '#f44336'};
  ${({ pos, color }) =>
    pos === 'top' ? `border-top-color: ${color || '#f44336'};` : `border-bottom-color: ${color || '#f44336'};`}
`;

export default function CellErrorTip(props) {
  const { pos = 'top', error, color } = props;
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!!error);
  }, [error]);

  if (!show) return null;

  return (
    <Con pos={pos} color={color}>
      <Angle color={color} pos={pos} />
      {error}
      <i className="icon-close mLeft8 delIcon" onClick={() => setShow(false)} />
    </Con>
  );
}

CellErrorTip.propTypes = {
  pos: oneOf(['top', 'bottom']),
  error: string,
  updateErrorState: func,
};
