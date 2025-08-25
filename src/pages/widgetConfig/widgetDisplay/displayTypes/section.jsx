import React from 'react';
import _, { isEmpty } from 'lodash';
import styled from 'styled-components';
import { DRAG_ACCEPT } from '../../config/Drag';
import { putControlByOrder } from '../../util';
import BottomDragPointer from '../components/BottomDragPointer';
import RowItem from '../rowItem';

const SectionWrap = styled.div`
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
`;

export default function Section(props) {
  const { data = {}, path = [] } = props;
  const [row] = path;
  const relationControls = putControlByOrder(data.relationControls || []);

  return (
    <SectionWrap id="widgetSection">
      {data.desc && <div className="Gray_9e WordBreak pLeft12 pRight12">{data.desc}</div>}
      {relationControls.map((childRow = [], index = 0) => {
        const id = childRow.reduce((p, c) => p + c.controlId, '');
        return (
          !isEmpty(childRow) && (
            <RowItem
              key={id}
              sectionId={data.controlId}
              row={childRow}
              index={row + index + 1}
              {..._.omit(props, ['data', 'path'])}
              acceptList={DRAG_ACCEPT.tabItem}
              splitWidgets={relationControls}
              displayItemType="tabItem"
            />
          )
        );
      })}
      <BottomDragPointer
        sectionId={data.controlId}
        rowIndex={row + relationControls.length + 1}
        showEmpty={isEmpty(relationControls)}
        displayItemType="tabItem"
      />
    </SectionWrap>
  );
}
