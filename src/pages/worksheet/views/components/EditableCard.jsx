import React, { forwardRef, useState, useEffect } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import BaseCard from './BaseCard';
import worksheetAjax from 'src/api/worksheet';
import _ from 'lodash';

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
      color: #2196f3;
    }
  }
`;

const EditableCard = forwardRef((props, ref) => {
  const { stateData = {}, data, type, currentView, updateTitleData, showNull = false } = props;
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
