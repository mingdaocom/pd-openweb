import React, { forwardRef } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import BaseCard from './BaseCard';

const EditableCardWrap = styled.div`
  position: relative;
  &:hover {
    .editTitleText,
    .recordOperateWrap {
      visibility: visible;
    }
  }
  .editTitleText {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    right: 20px;
    top: 12px;
    visibility: hidden;
    text-align: center;
    line-height: 24px;
    color: #9e9e9e;
    cursor: pointer;
    i {
      vertical-align: text-top;
    }
    &:hover {
      color: #1677ff;
    }
  }
`;

const EditableCard = forwardRef((props, ref) => {
  const { stateData = {}, data, type, currentView, updateTitleData } = props;
  const rowId = data.rowId;
  let { childType, viewControls } = currentView;

  const updateRow = (controlItem, value) => {
    if (type === 'board') {
      updateTitleData({ ...controlItem, value });
      return;
    }
    let worksheetId = currentView.worksheetId;
    if (String(childType) === '2') {
      const currentIndex = stateData.path.length - 1;
      worksheetId = _.get(viewControls[currentIndex], 'worksheetId');
    }
    worksheetAjax.updateWorksheetRow({ rowId, worksheetId, newOldControl: [{ ...controlItem, value }] }).then(res => {
      if (res.data && res.resultCode === 1) {
        const nextControl = { [controlItem.controlId]: value };
        updateTitleData({ data: nextControl, rowId });
      }
    });
  };

  return (
    <EditableCardWrap ref={ref}>
      <BaseCard {...props} onChange={updateRow} />
    </EditableCardWrap>
  );
});

export default EditableCard;
