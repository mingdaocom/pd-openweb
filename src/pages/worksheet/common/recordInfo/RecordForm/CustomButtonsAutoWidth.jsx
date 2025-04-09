import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Menu } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import CustomButtons from 'worksheet/common/recordInfo/RecordForm/CustomButtons';

const Con = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
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

const DropButton = styled(Button)`
  padding: 0 !important;
  text-align: center;
  background-color: transparent !important;;
  border-color: rgb(204, 204, 204) !important;;
  color: rgb(51, 51, 51) !important;;
}
  .dropIcon {
    display: inline-block;
  }
  &.active .dropIcon {
    transform: rotate(180deg);
  }
`;

function getButtonWidth(button, type) {
  let result;
  const div = document.createElement('div');
  if (type === 'iconText') {
    const { icon, name } = button;
    div.style.visibility = 'hidden';
    div.style.display = 'inline-block';
    div.innerHTML = `<div style="display: inline-block; margin: 0 12px; white-space: nowrap;">
      <span class="icon icon-${icon || 'custom_actions'}" style="margin: 0 2px;font-size: 18px;"></span>
      <span  style="font-size: 13px;">${name}</span>
    </div>`;
  } else {
    div.style.position = 'absolute';
    div.style.left = '-10000px';
    div.style.top = '-10000px';
    div.style.zIndex = '99999';
    div.style.border = '1px solid';
    div.style.border = '1px solid';
    div.innerHTML = `<span class="InlineBlock borderBox"><button type="button" class="ming Button--small Button--ghost Button recordCustomButton overflowHidden"><div class="content ellipsis"><i class="${`icon icon-${
      button.icon || 'custom_actions'
    }`}"></i><span class="breakAll overflow_ellipsis">${button.name}</span></div></button></span>`;
  }
  document.body.appendChild(div);
  result = div.clientWidth;
  if (type === 'button') {
    result += 6;
  }
  document.body.removeChild(div);
  return result;
}

function Buttons(props) {
  const {
    type = 'iconText',
    isCharge,
    count,
    width,
    appId,
    viewId,
    recordId,
    projectId,
    worksheetId,
    selectedRows = [],
    isAll,
    buttons,
    handleTriggerCustomBtn,
    handleUpdateWorksheetRow,
    onUpdateRow,
  } = props;
  const cache = useRef({});
  const [popupVisible, setPopupVisible] = useState(false);
  const hideDisabled = type === 'iconText' || !viewId;
  const sumWidth = _.sum(buttons.map(button => getButtonWidth(button, type)));
  const moreButtonWidth = getButtonWidth({ name: _l('更多') }, type) - 6;
  let buttonShowNum = 1;
  if (sumWidth < width) {
    buttonShowNum = buttons.length;
  } else {
    while (true) {
      if (
        buttonShowNum <= buttons.length &&
        _.sum(buttons.slice(0, buttonShowNum + 1).map(button => getButtonWidth(button, type))) < width - moreButtonWidth
      ) {
        buttonShowNum += 1;
      } else {
        break;
      }
    }
  }
  const buttonsProps = {
    isFromBatchEdit: true,
    count,
    appId,
    viewId,
    recordId,
    projectId,
    worksheetId,
    selectedRows,
    isAll,
    handleTriggerCustomBtn,
    handleUpdateWorksheetRow,
    onUpdateRow,
    ...props,
  };
  const updatePopupVisible = useCallback(newValue => {
    if (cache.current.customButtonActive && !newValue) {
      return;
    }
    setPopupVisible(newValue);
  });
  return (
    <Con>
      <CustomButtons
        {...buttonsProps}
        className={type}
        isCharge={isCharge}
        hideDisabled={hideDisabled}
        isBatchOperate={selectedRows.length > 1 || isAll}
        type={type}
        buttons={buttons.slice(0, buttonShowNum)}
      />
      {buttonShowNum < buttons.length && (
        <Trigger
          popupVisible={popupVisible}
          zIndex={1000}
          action={['hover']}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: {
              adjustX: true,
            },
            offset: type === 'button' ? [0, 6] : [],
          }}
          destroyPopupOnHide
          onPopupVisibleChange={updatePopupVisible}
          popup={
            <Menu
              style={{
                position: 'relative',
                maxHeight: 500,
                overflowY: 'auto',
                ...(type === 'button' ? { width: 240 } : {}),
              }}
              onClickAway={() => updatePopupVisible(false)}
              onClickAwayExceptions={[
                '.mdModalWrap',
                '.mui-dialog-container',
                '.dropdownTrigger',
                '.addFilterPopup',
                '.filterControlOptionsList',
                '.mui-datetimepicker',
                '.mui-datetimerangepicker',
                '.selectUserBox',
                '.worksheetFilterOperateList',
                '.ant-select-dropdown',
                '.ant-picker-dropdown',
                '.rc-trigger-popup',
                '#dialogSelectDept_container',
                '.CityPicker',
                '.CityPicker-wrapper',
              ]}
            >
              <CustomButtons
                {...buttonsProps}
                isCharge={isCharge}
                hideDisabled={hideDisabled}
                isBatchOperate={selectedRows.length > 1 || isAll}
                type="menu"
                icon
                buttons={buttons.slice(buttonShowNum)}
                setCustomButtonActive={v => (cache.current.customButtonActive = v)}
              />
            </Menu>
          }
        >
          {type === 'button' ? (
            <DropButton
              className={cx('recordCustomButton overflowHidden transparentButton moreButtons', {
                active: popupVisible,
              })}
              size="small"
              type="ghost"
            >
              <span className="breakAll overflow_ellipsis">{_l('更多')}</span>
              <i className="dropIcon icon icon-arrow-down Font12 mLeft6 mRight0 Gray_9d" />
            </DropButton>
          ) : (
            <MoreBtn>
              {_l('更多')}
              <i className="icon icon-arrow-down-border"></i>
            </MoreBtn>
          )}
        </Trigger>
      )}
    </Con>
  );
}

Buttons.propTypes = {
  width: number,
  count: number,
  appId: string,
  viewId: string,
  projectId: string,
  worksheetId: string,
  recordId: string,
  selectedRows: arrayOf(shape({})),
  isAll: bool,
  buttons: arrayOf(shape({})),
  onUpdateRow: func,
  handleTriggerCustomBtn: func,
  handleUpdateWorksheetRow: func,
};

export default autoSize(Buttons);
