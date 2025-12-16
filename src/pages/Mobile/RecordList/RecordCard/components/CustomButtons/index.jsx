import React, { Fragment, memo, useRef } from 'react';
import cx from 'classnames';
import { includes, isFunction, isUndefined } from 'lodash';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import RecordAction from 'mobile/components/RecordInfo/RecordAction';
import { getButtonColor } from 'src/utils/control';

const CustomButtonInCard = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding 0 8px;
  height: 32px;
  border-radius: 3px;
  ${props => props.disabled && 'opacity: 0.5;'}
  &.operates-text,
  &.operates-icon {
    border: none !important;
    background: transparent !important;
  }
  &.operates-icon {
    .icon {
      color: var(--color-text-secondary) !important;
    }
  }
  .icon {
    font-size: 18px;
  }
  .svgIcon {
    svg {
      display: block;
    }
  }
  .operateButtonText {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const OperatesDivider = styled.div`
  width: 1px;
  height: 20px;
  background: var(--color-border-secondary);
`;

const CustomButtonInPopup = styled.div`
  display: flex;
  align-items: center;
  ${props => props.disabled && 'opacity: 0.5;'}
  height: 50px;
  .icon {
    font-size: 20px;
  }
  .operateButtonText {
    margin-left: 25px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// standard
const CustomButtons = props => {
  const {
    appId,
    showType,
    buttons,
    showMore,
    isInCard,
    worksheetId,
    row,
    view,
    btnDisable,
    onButtonClick,
    isEditLock,
    worksheetInfo = {},
    updateRecord,
  } = props;
  const isRecordLock = row.sys_lock;
  const recordId = row.rowid;
  const { entityName = _l('记录'), switches } = worksheetInfo;
  const recordRef = useRef(null);

  const getButtonIcon = (button = {}, buttonColor = {}) => {
    const { icon, iconUrl } = button;

    if (!!iconUrl && !!icon && icon.endsWith('_svg')) {
      let fillColor =
        !button.color || button.color === 'transparent' || btnDisable[button.btnId] || button.disabled
          ? '#bdbdbd'
          : buttonColor.color;
      if (!button.showAsPrimary) {
        fillColor = button.color;
      }
      return (
        <SvgIcon
          className="InlineBlock icon svgIcon"
          addClassName="TxtMiddle"
          url={button.iconUrl}
          fill={fillColor}
          size={18}
        />
      );
    }

    if (icon) {
      return (
        <i
          className={cx(`icon icon-${button.icon || 'custom_actions'}`, {
            Gray_bd: !button.showAsPrimary && !button.icon && (!button.color || button.color === 'transparent'),
          })}
          style={
            (!button.showAsPrimary && !(btnDisable[button.btnId] || button.disabled)) || !isInCard
              ? { color: button.color || '#1677ff' }
              : {}
          }
        />
      );
    }

    if (!isInCard) {
      return <i className="icon icon-custom_actions Gray_bd" />;
    }

    return null;
  };

  const handleButtonClick = button => {
    if (button.disabled || btnDisable[button.btnId]) {
      return true;
    }
    if ((isRecordLock && !includes(['print', 'share'], button.type)) || (isEditLock && button.clickType === 3)) {
      alert(isRecordLock ? _l('%0已锁定', entityName) : _l('不允许多人同时编辑，稍后重试'), 3);
      return true;
    }
    if (isUndefined(button.type) || button.type === 'custom_button') {
      worksheetAjax
        .checkWorksheetRowBtn({
          worksheetId,
          rowId: row.rowid,
          btnId: button.btnId,
        })
        .then(allowTrigger => {
          if (allowTrigger) {
            triggerCustomBtn(button);
          } else {
            alert(_l('不满足执行条件'), 3);
            onButtonClick(button.btnId);
          }
        });
    } else if (isFunction(button.onClick)) {
      button.onClick(button);
    }
  };

  const triggerCustomBtn = btn => {
    recordRef.current.handleTriggerCustomBtn(btn);
  };

  return (
    <Fragment>
      {isInCard &&
        buttons.map((button, index) => {
          const buttonColor = getButtonColor(button.color, button.showAsPrimary);
          const isLastButton = index === buttons.length - 1;
          const isBeforeLast = index < buttons.length - 1;

          const shouldShowDivider = showType !== 'standard' && ((isLastButton && showMore) || isBeforeLast);
          return (
            <Fragment key={button.btnId}>
              <CustomButtonInCard
                className={`operates-${showType}`}
                disabled={btnDisable[button.btnId] || button.disabled}
                style={{
                  ...buttonColor,
                  ...(!button.showAsPrimary && button.style === 'text' && { color: button.color }),
                }}
                onClick={() => handleButtonClick(button)}
              >
                {(showType === 'icon' || button.showIcon) && getButtonIcon(button, buttonColor)}
                {showType !== 'icon' && <div className="operateButtonText">{button.name}</div>}
              </CustomButtonInCard>
              {shouldShowDivider && <OperatesDivider />}
            </Fragment>
          );
        })}
      {!isInCard &&
        buttons.map(button => {
          const buttonColor = getButtonColor(button.color, button.showAsPrimary);
          return (
            <Fragment key={button.btnId}>
              <CustomButtonInPopup
                disabled={btnDisable[button.btnId] || button.disabled}
                onClick={() => handleButtonClick(button)}
              >
                {getButtonIcon(button, buttonColor)}
                <div className="operateButtonText">{button.name}</div>
              </CustomButtonInPopup>
            </Fragment>
          );
        })}
      <RecordAction
        isViewCard
        appId={appId}
        worksheetId={worksheetId}
        viewId={view?.viewId}
        rowId={recordId}
        sheetRow={{ projectId: worksheetInfo.projectId }}
        customBtns={[]}
        switchPermit={switches}
        loadRow={updateRecord}
        ref={recordRef}
        isRecordLock={isRecordLock}
        hideRecordActionVisible={() => {}}
        updateBtnDisabled={onButtonClick}
        loadCustomBtns={() => {}}
      />
    </Fragment>
  );
};

export default memo(CustomButtons);
