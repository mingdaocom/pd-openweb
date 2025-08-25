import React, { Fragment, useContext, useLayoutEffect, useRef, useState } from 'react';
import { find, get, includes, isEmpty } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import CustomButtonsWithAutoWidth from 'worksheet/common/recordInfo/RecordForm/CustomButtonsAutoWidth.jsx';
import { handleSystemPrintRecord, handleTemplateRecordPrint } from 'worksheet/common/recordInfo/RecordForm/PrintList';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import { handleCopyRecord, handleDeleteRecord, handleShareRecord } from 'worksheet/components/RecordOperate';
import {
  filterButtonBySheetSwitchPermit,
  getSheetOperatesButtons,
  getSheetOperatesButtonsStyle,
} from 'src/utils/worksheet';

const CardWrapper = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  ${({ btnStyle }) =>
    btnStyle === 'icon' &&
    `
    margin: 0 -14px;
  `}
  .customButtonsCon {
    justify-content: center;
    padding: 0 14px;
    height: 100%;
    > * {
      max-width: ${({ maxWidth }) => maxWidth}px !important;
    }
    .recordCustomButton.ming.Button .content {
      z-index: auto;
    }
    > span,
    .operates-icon {
      flex: 1;
      button.ming.Button.isOperates {
        width: 100% !important;
        text-align: center;
        display: flex !important;
        justify-content: center;
      }
      .ming.Button.isOperates.operates-icon {
        height: 20px !important;
        min-height: 20px !important;
        border-radius: 0 !important;
        line-height: 20px !important;
        .content {
          height: 20px !important;
          justify-content: center;
          span,
          i {
            height: 18px !important;
            line-height: 18px !important;
          }
        }
      }
    }
    ${({ btnStyle }) =>
      includes(['text', 'icon'], btnStyle) &&
      `
      > span {
        border-right: 1px solid #eaeaea !important;
      }
    `}
    .moreButtons.operates-text {
      width: 40px;
    }
    &:not(.showMore) {
      ${({ btnStyle }) =>
        includes(['text', 'icon'], btnStyle) &&
        `
      > span:last-child {
        border-right: none !important;
      }
    `}
    }
  }
`;

export default function OperateButtons({
  row = {},
  status,
  rowHeight,
  worksheetId: worksheetIdFromProps,
  isInCard,
  recordId,
  entityName = _l('记录'),
  onCopySuccess = () => {},
  onDeleteSuccess = () => {},
}) {
  const context = useContext(SheetContext);
  const { isCharge, appId, projectId, worksheetId, view, sheetButtons, printList, sheetSwitchPermit, controls } =
    context || {};
  const [btnDisable, setBtnDisable] = useState({});
  const conRef = useRef();
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(isInCard);
  const viewId = view?.viewId;
  let buttons = getSheetOperatesButtons(view, {
    buttons: sheetButtons,
    printList,
  });
  buttons = filterButtonBySheetSwitchPermit(buttons, sheetSwitchPermit, viewId, row);
  if (_.isObject(status)) {
    buttons = buttons.map(button => ({
      ...button,
      disabled: button.type === 'custom_button' && !status[`${recordId}-${button.btnId}`],
    }));
  }
  const operatesButtonsStyle = getSheetOperatesButtonsStyle(view);
  const { visibleNum, primaryNum, style, showIcon } = operatesButtonsStyle;
  const showMore = visibleNum < buttons.length;
  const Wrapper = isInCard ? CardWrapper : Fragment;
  const visibleButtons = buttons.slice(0, visibleNum);
  useLayoutEffect(() => {
    if (loading && isInCard && conRef.current) {
      setTimeout(() => {
        setWidth(conRef.current.clientWidth);
        setLoading(false);
      }, 0);
    }
  });
  if (isEmpty(context)) return null;
  if (
    !buttons.length ||
    !!get(window, 'shareState.shareId') ||
    (worksheetIdFromProps && worksheetIdFromProps !== worksheetId)
  )
    return null;
  return (
    <Wrapper
      {...(isInCard
        ? {
            ref: conRef,
            className: showMore,
            btnStyle: style,
            maxWidth: Math.floor(
              (width - 28 - (showMore ? 32 : 0) - 6 * (visibleButtons.length + (showMore ? 1 : 0) - 1)) /
                visibleButtons.length,
            ),
            onClick: e => e.stopPropagation(),
          }
        : {})}
    >
      {!loading && (
        <CustomButtonsWithAutoWidth
          rowHeight={rowHeight}
          type="button"
          isOperates
          isInCard={isInCard}
          isCharge={isCharge}
          projectId={projectId}
          appId={appId}
          viewId={viewId}
          isRecordLock={row.sys_lock}
          entityName={entityName}
          worksheetId={worksheetId}
          recordId={recordId}
          buttons={buttons.map((button, index) => ({
            ...button,
            icon: button.icon || (style === 'icon' ? 'custom_actions' : ''),
            color: button.color === 'transparent' ? '#1677ff' : button.color,
            style,
            showIcon,
            showAsPrimary: style === 'standard' && index < primaryNum,
            className: ['operates-' + style, 'operates-showIcon-' + showIcon].join(' '),
            ...(button.type !== 'custom_button' && {
              onClick: () => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                if (button.type === 'copy') {
                  handleCopyRecord({
                    worksheetId,
                    viewId,
                    recordId,
                    onCopySuccess,
                  });
                } else if (button.type === 'delete') {
                  if (row.sys_lock) {
                    alert(_l('%0已锁定', entityName), 3);
                    return;
                  }
                  handleDeleteRecord({
                    worksheetId,
                    recordId,
                    // onDelete,
                    onDeleteSuccess,
                  });
                } else if (button.type === 'share') {
                  handleShareRecord({
                    isCharge,
                    appId,
                    worksheetId,
                    viewId,
                    recordId,
                    sheetSwitchPermit,
                  });
                } else if (button.type === 'sysprint') {
                  handleSystemPrintRecord({
                    worksheetId,
                    viewId,
                    recordId,
                    appId,
                    projectId,
                  });
                } else if (button.type === 'print') {
                  worksheetAjax
                    .getPrintList({
                      viewId,
                      worksheetId,
                      rowIds: [recordId].filter(Boolean),
                    })
                    .then(templates => {
                      if (find(templates, template => template.id === button.printItem.id && !template.disabled)) {
                        handleTemplateRecordPrint({
                          worksheetId,
                          viewId,
                          recordId,
                          appId,
                          projectId,
                          template: button.printItem,
                          attriData: controls
                            .filter(o => o.attribute === 1)
                            .map(o => ({
                              ...o,
                              value: get(row, o.controlId),
                            })),
                        });
                      } else {
                        alert(_l('无法打印“%0”', button.printItem.name), 3);
                        setBtnDisable(old => ({ ...old, [button.printItem.id]: true }));
                      }
                    });
                }
              },
            }),
          }))}
          btnDisable={btnDisable}
          onButtonClick={btnId => {
            setBtnDisable(old => ({ ...old, [btnId]: true }));
          }}
          sheetSwitchPermit={sheetSwitchPermit}
          // TODO
          // reloadRecord
          // loadBtns
          // onUpdate
          // hideRecordInfo
          // triggerCallback
          //
          visibleNum={visibleNum}
        />
      )}
    </Wrapper>
  );
}

OperateButtons.propTypes = {
  isInCard: PropTypes.bool,
  recordId: PropTypes.string,
  relateRecordControlId: PropTypes.string,
  onCopySuccess: PropTypes.func,
  onDeleteSuccess: PropTypes.func,
};
