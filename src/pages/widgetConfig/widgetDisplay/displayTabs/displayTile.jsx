import React, { Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { getPathById } from '../../util/widgets';
import BottomDragPointer from '../components/BottomDragPointer';
import DisplayItem from '../displayItem';

const DisplayTabWrap = styled.div`
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 16px 1px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
`;

export default function DisplayTab(props) {
  const { tabWidgets = [], widgets = [] } = props;

  return (
    <Fragment>
      {tabWidgets.map(data => {
        const row = _.head(getPathById(widgets, data.controlId));
        return (
          <DisplayTabWrap className="displayRow tabItemWrap">
            <DisplayItem {...props} key={data.controlId} data={data} displayItemType="tab" path={[row, 0]} />
          </DisplayTabWrap>
        );
      })}
      <BottomDragPointer displayItemType="tab" rowIndex={widgets.length} />
    </Fragment>
  );
}
