import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import BatchOperate from 'worksheet/common/BatchOperate/BatchOperate';
import PrintList from 'worksheet/common/BatchOperate/PrintList';
import { importDataFromExcel } from 'worksheet/common/WorksheetBody/ImportDataFromExcel';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  &.isBatchEditing {
    width: 100%;
  }
`;

const MenuCon = styled.div`
  > .Menu {
    position: relative !important;
  }
`;

export const Button = styled.div`
  overflow: hidden;
  display: inline-flex;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  color: var(--color-text-title);
  border: 1px solid var(--color-border-primary);
  font-size: 13px;
  .content {
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    font-weight: bold;
    max-width: 150px;
    > .icon {
      color: var(--color-text-tertiary);
      font-weight: normal;
    }
  }
  &.printButton {
    .content {
      padding: 0 12px;
    }
  }
  &.importFromFile {
    width: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: var(--color-background-hover);
    }
  }
  &:not(.disabled) {
    .content:hover {
      background-color: var(--color-background-hover);
    }
  }
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: transparent;
  }
`;

const DropIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 36px;
  text-align: center;
  cursor: pointer;
  color: var(--color-text-title);
  height: 34px;
  &:hover {
    background-color: var(--color-background-hover);
  }
  &:before {
    position: absolute;
    content: '';
    width: 1px;
    height: 16px;
    top: 10px;
    left: -0.5px;
    background-color: var(--color-border-primary);
  }
`;

const Splitter = styled.span`
  width: 0;
  height: 18px;
  border-right: 1px solid var(--color-border-primary);
  margin: 0 14px 0 14px;
`;

export default function RelateRecordBtn(props) {
  const {
    view,
    sheetSwitchPermit,
    btnName,
    entityName,
    btnVisible,
    control,
    records,
    selectedRowIds,
    addVisible,
    isCharge,
    worksheetId,
    masterWorksheetId,
    viewId,
    appId,
    projectId,
    recordId,
    selectVisible,
    isBatchEditing,
    worksheetInfo,
    refresh,
    onNew,
    onSelect,
    onBatchOperate,
    updateRowsWithChanges,
  } = props;
  const { enterBatchEdit, deleteRecords, removeRelation, exportRecords, edit, print, customButton, importFromFile } =
    btnVisible;
  const isShareState = !!get(window, 'shareState.shareId');
  const [menuVisible, setMenuVisible] = useState();
  const [selectedRecords, setSelectedRecords] = useState([]);
  const conRef = useRef();
  const btnText = addVisible ? btnName || entityName : _l('选择%0', entityName);
  const iconName = addVisible ? 'icon-plus' : 'icon-link_record';
  const btnClick = addVisible ? onNew : onSelect;
  const noSelected = isEmpty(selectedRowIds);
  const showCodePrint = isOpenPermit(permitList.QrCodeSwitch, sheetSwitchPermit, view?.id);
  const showSystemPrint = isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, view?.id);
  const canImportSwitch = isOpenPermit(permitList.importSwitch, sheetSwitchPermit, view?.id);
  const showCustomButton = isOpenPermit(permitList.execute, sheetSwitchPermit, view?.id);

  useEffect(() => {
    if (!isEmpty(records) && !isEmpty(selectedRowIds)) {
      setSelectedRecords(records.filter(record => selectedRowIds.includes(record.rowid)));
    }
  }, [records, selectedRowIds]);
  return (
    <Con ref={conRef} className={cx({ isBatchEditing })}>
      {!isBatchEditing && (
        <Fragment>
          {(addVisible || selectVisible) && (
            <Trigger
              zIndex={999}
              popupVisible={menuVisible && addVisible && selectVisible}
              actions={['click']}
              getPopupContainer={() => conRef.current}
              onPopupVisibleChange={setMenuVisible}
              popup={
                <MenuCon>
                  <Menu
                    style={{ top: 0 }}
                    onClickAwayExceptions={['.relateRecordBtnDropIcon']}
                    onClickAway={() => setMenuVisible(false)}
                  >
                    <MenuItem onClick={onNew}>{_l('新建%0', entityName)}</MenuItem>
                    <MenuItem onClick={onSelect}>{_l('关联已有%0', entityName)}</MenuItem>
                  </Menu>
                </MenuCon>
              }
              popupClassName="filterTrigger"
              destroyPopupOnHide
              popupAlign={{
                offset: [0, 4],
                points: ['tl', 'bl'],
                overflow: { adjustY: true },
              }}
            >
              <Button onClick={btnClick}>
                <div className="content">
                  <i className={`icon ${iconName} mRight5 Font16`}></i>
                  <span className="overflow_ellipsis WordBreak">{btnText || _l('记录')}</span>
                </div>
                {addVisible && selectVisible && (
                  <DropIcon
                    className="relateRecordBtnDropIcon"
                    onClick={e => {
                      e.stopPropagation();
                      setMenuVisible(true);
                    }}
                  >
                    <i className="icon icon-arrow-down"></i>
                  </DropIcon>
                )}
              </Button>
            </Trigger>
          )}
          {!get(window, 'shareState.isPublicForm') &&
            !!recordId &&
            importFromFile &&
            canImportSwitch &&
            worksheetInfo &&
            worksheetInfo.allowAdd && (
              <Tooltip title={_l('导入数据')} placement="top">
                <Button
                  className="importFromFile mLeft10"
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    importDataFromExcel({
                      isFromRelateRecord: true,
                      isCharge,
                      appId,
                      worksheetId: worksheetId,
                      worksheetName: worksheetInfo.name,
                      hideControlIds: [control.controlId, control.sourceControlId],
                      extendOptions: {
                        controlId: control.controlId,
                        rowId: recordId,
                        masterSheetId: masterWorksheetId,
                      },
                    });
                  }}
                >
                  <i className="icon icon-file_upload Font16 textSecondary"></i>
                </Button>
              </Tooltip>
            )}
          {(addVisible || selectVisible) && enterBatchEdit && <Splitter />}
          {enterBatchEdit && (
            <Fragment>
              <Button onClick={() => onBatchOperate({ action: 'enterBatchEditing' })}>
                <div className="content">{_l('批量操作')}</div>
              </Button>
            </Fragment>
          )}
        </Fragment>
      )}
      {isBatchEditing && (
        <Fragment>
          {enterBatchEdit && (
            <Button className="mRight10" onClick={() => onBatchOperate({ action: 'exitBatchEditing' })}>
              <div className="content" style={{ paddingLeft: 10 }}>
                <i className="icon icon-close textTertiary Font18 mRight5"></i>
                {_l('退出')}
              </div>
            </Button>
          )}
          {removeRelation && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'removeRelation' });
              }}
            >
              <div className="content">{_l('取消关联')}</div>
            </Button>
          )}
          {edit && !get(window, 'shareState.shareId') && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'edit' });
              }}
            >
              <div className="content">{_l('编辑')}</div>
            </Button>
          )}
          {print && !isShareState && (
            <PrintList
              disabled={noSelected}
              showCodePrint={showCodePrint}
              showSystemPrint={showSystemPrint}
              isCharge={isCharge}
              appId={appId}
              worksheetId={worksheetId}
              projectId={projectId}
              viewId={viewId}
              controls={worksheetInfo?.template?.controls || []}
              selectedRows={selectedRecords}
              selectedRowIds={selectedRowIds}
              count={selectedRecords.length}
            >
              <Button
                className={cx('printButton mRight10', { disabled: noSelected })}
                onClick={() => {
                  if (noSelected) {
                    return;
                  }
                  onBatchOperate({ action: 'print' });
                }}
              >
                <div className="content">
                  {_l('打印')}
                  <i className="icon icon-arrow-down-border mLeft5 textTertiary"></i>
                </div>
              </Button>
            </PrintList>
          )}
          {deleteRecords && !isShareState && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'deleteRecords' });
              }}
            >
              <div className="content">{_l('删除')}</div>
            </Button>
          )}
          {exportRecords && !isShareState && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'exportRecords' });
              }}
            >
              <div className="content">{_l('导出')}</div>
            </Button>
          )}
          {showCustomButton && !noSelected && !!customButton && (
            <BatchOperate
              buttonType="button"
              buttonsConStyle={{ marginLeft: 0 }}
              onlyShowCustomButtons
              isCharge={isCharge}
              selectedLength={selectedRecords.length}
              worksheetId={worksheetId}
              viewId={viewId}
              appId={appId}
              projectId={projectId}
              recordId={recordId}
              entityName={entityName}
              worksheetInfo={worksheetInfo}
              selectedRows={selectedRecords}
              updateRows={(rowIds, changes) => {
                updateRowsWithChanges(rowIds, changes);
              }}
              reload={refresh}
            />
          )}
        </Fragment>
      )}
    </Con>
  );
}

RelateRecordBtn.propTypes = {
  btnName: PropTypes.string,
  entityName: PropTypes.string,
  btnVisible: PropTypes.shape({}),
  selectedRowIds: PropTypes.arrayOf(PropTypes.string),
  addVisible: PropTypes.bool,
  isBatchEditing: PropTypes.bool,
  selectVisible: PropTypes.bool,
  onNew: PropTypes.func,
  onSelect: PropTypes.func,
  onBatchOperate: PropTypes.func,
};
