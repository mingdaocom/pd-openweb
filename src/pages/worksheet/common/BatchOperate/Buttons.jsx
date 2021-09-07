import React from 'react';
import { arrayOf, number, string, func, shape, bool } from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Menu } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import CustomButtons from 'worksheet/common/recordInfo/RecordForm/CustomButtons';

const Con = styled.div`
  display: flex;
  align-items: center;
  margin-left: 12px;
  padding-left: 12px;
  overflow: hidden;
  &:before {
    content: ' ';
    display: inline-block;
    position: relative;
    left: -12px;
    width: 1px;
    height: 13px;
    background-color: #ddd;
  }
`;

const MoreBtn = styled.span`
  height: 28px;
  padding: 0 11px;
  line-height: 30px;
  border-radius: 4px;
  font-size: 13px;
  color: #757575;
  cursor: pointer;
  .icon {
    color: #9d9d9d;
    margin-left: 3px;
  }
  &:hover {
    background: #f5f5f5;
  }
`;

function getButtonWidth({ icon, name }) {
  let result;
  const div = document.createElement('div');
  div.style.visibility = 'hidden';
  div.style.display = 'inline-block';
  div.innerHTML = `<div style="display: inline-block; margin: 0 12px;">${
    icon ? `<span class="icon icon-${icon}" style="margin: 0 2px;font-size: 18px;"></span>` : ''
  }<span  style="font-size: 13px;">${name}</span></div>`;
  document.body.appendChild(div);
  result = div.clientWidth;
  document.body.removeChild(div);
  return result;
}

function Buttons(props) {
  const {
    width,
    appId,
    viewId,
    projectId,
    worksheetId,
    selectedRows,
    isAll,
    buttons,
    handleTriggerCustomBtn,
    handleUpdateWorksheetRow,
    onUpdateRow,
  } = props;
  const sumWidth = _.sum(buttons.map(getButtonWidth));
  let buttonShowNum = 1;
  if (sumWidth < width) {
    buttonShowNum = buttons.length;
  } else {
    while (true) {
      if (
        buttonShowNum <= buttons.length &&
        _.sum(buttons.slice(0, buttonShowNum + 1).map(getButtonWidth)) < width - 64
      ) {
        buttonShowNum += 1;
      } else {
        break;
      }
    }
  }
  const buttonsProps = {
    isFromBatchEdit: true,
    appId,
    viewId,
    projectId,
    worksheetId,
    selectedRows,
    isAll,
    handleTriggerCustomBtn,
    handleUpdateWorksheetRow,
    onUpdateRow,
  };
  return (
    <Con>
      <CustomButtons isBatchOperate type="iconText" {...buttonsProps} buttons={buttons.slice(0, buttonShowNum)} />
      {buttonShowNum < buttons.length && (
        <Trigger
          zIndex={1000}
          action={['click']}
          popupAlign={{
            points: ['tr', 'br'],
            overflow: {
              adjustX: true,
            },
          }}
          destroyPopupOnHide
          popup={
            <Menu style={{ position: 'relative' }}>
              <CustomButtons isBatchOperate type="menu" icon {...buttonsProps} buttons={buttons.slice(buttonShowNum)} />
            </Menu>
          }
        >
          <MoreBtn>
            {_l('更多')}
            <i className="icon icon-arrow-down-border"></i>
          </MoreBtn>
        </Trigger>
      )}
    </Con>
  );
}

Buttons.propTypes = {
  width: number,
  appId: string,
  viewId: string,
  projectId: string,
  worksheetId: string,
  selectedRows: arrayOf(shape({})),
  isAll: bool,
  buttons: arrayOf(shape({})),
  onUpdateRow: func,
  handleTriggerCustomBtn: func,
  handleUpdateWorksheetRow: func,
};

export default autoSize(Buttons);
