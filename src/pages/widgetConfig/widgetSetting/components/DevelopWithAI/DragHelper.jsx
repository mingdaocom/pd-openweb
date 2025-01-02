import React, { useState } from 'react';
import DragMask from 'worksheet/common/DragMask';
import styled from 'styled-components';

const DragLine = styled.div`
  position: absolute;
  height: 4px;
  width: 100%;
  cursor: row-resize;
`;
export default function DragHelper({ defaultTop = 0, min = 0, max = 1000, onChange = _.noop }) {
  const [dragMaskVisible, setDragMaskVisible] = useState(false);
  return !dragMaskVisible ? (
    <DragLine style={{ top: defaultTop }} onMouseDown={() => setDragMaskVisible(true)} />
  ) : (
    <DragMask
      direction="vertical"
      value={defaultTop}
      min={min}
      max={max}
      onChange={value => {
        onChange(value);
        setDragMaskVisible(false);
      }}
    />
  );
}
