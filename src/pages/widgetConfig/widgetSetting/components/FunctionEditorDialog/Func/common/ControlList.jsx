import React, { useState } from 'react';
import styled from 'styled-components';
import { func, arrayOf, shape, string } from 'prop-types';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { checkTypeSupportForFunction } from '../enum';

const Con = styled.div`
  padding: 10px 0;
`;

const ControlItem = styled.div`
  display: flex;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  padding: 0 20px;
  cursor: pointer;
  &:hover {
    background: #e8e8e8;
  }
`;

const Icon = styled.i`
  font-size: 18px;
  color: #9e9e9e;
  margin-right: 8px;
  line-height: 36px;
`;

export default function ControlList(props) {
  const { keywords, controls, insertTagToEditor } = props;
  const [visibleControls, setVisibleControls] = useState(
    controls.filter(c => c.controlName && checkTypeSupportForFunction(c)),
  );
  return (
    <Con>
      {(keywords ? visibleControls.filter(c => new RegExp(keywords).test(c.controlName)) : visibleControls).map(
        (c, i) => (
          <ControlItem
            key={i}
            onClick={() => {
              insertTagToEditor({
                value: c.controlId,
                text: c.controlName,
              });
            }}
          >
            <Icon className={`icon icon-${getIconByType(c.type || 6)}`} />
            {c.controlName}
          </ControlItem>
        ),
      )}
    </Con>
  );
}

ControlList.propTypes = {
  insertTagToEditor: func,
  keywords: string,
  controls: arrayOf(shape({})),
};
