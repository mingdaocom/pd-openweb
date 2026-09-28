import React, { Fragment, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import BatchOperate from 'worksheet/common/BatchOperate/BatchOperate';
import PrintList from 'worksheet/common/BatchOperate/PrintList';
import { useImportDataFromExcel } from 'worksheet/common/WorksheetBody/ImportDataFromExcel';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';

const RELATE_RECORD_MAIN_BUTTON_STYLE = { maxWidth: 150 };

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  &.isBatchEditing {
    width: 100%;
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
  const selectedRecords = useMemo(
    () => (records || []).filter(record => (selectedRowIds || []).includes(record.rowid)),
    [records, selectedRowIds],
  );
  const { open: importDataFromExcel, holder: importDataFromExcelHolder } = useImportDataFromExcel();
  const conRef = useRef();
  const btnText = addVisible ? btnName || entityName : _l('选择%0', entityName);
  const iconName = addVisible ? 'icon-plus' : 'icon-link_record';
  const btnClick = addVisible ? onNew : onSelect;
  const noSelected = isEmpty(selectedRowIds);
  const showSystemPrint = isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, view?.id);
  const showCodePrint = showSystemPrint && isOpenPermit(permitList.QrCodeSwitch, sheetSwitchPermit, view?.id);
  const canImportSwitch = isOpenPermit(permitList.importSwitch, sheetSwitchPermit, view?.id);
  const showCustomButton = isOpenPermit(permitList.execute, sheetSwitchPermit, view?.id);

  return (
    <Con ref={conRef} className={cx({ isBatchEditing })}>
      {importDataFromExcelHolder}
      {!isBatchEditing && (
        <Fragment>
          {(addVisible || selectVisible) && (
            <Button.Group>
              <Button
                className="relateRecordMainBtn"
                color="default"
                variant="textBordered"
                style={RELATE_RECORD_MAIN_BUTTON_STYLE}
                icon={<i className={`icon ${iconName} Font16`} />}
                onClick={btnClick}
              >
                <span className="overflow_ellipsis WordBreak">{btnText || _l('记录')}</span>
              </Button>
              {addVisible && selectVisible && (
                <Dropdown
                  open={menuVisible}
                  trigger={['click']}
                  placement="bottomLeft"
                  onOpenChange={open => {
                    setMenuVisible(open);
                  }}
                  menu={{
                    items: [
                      { key: 'new', label: _l('新建%0', entityName), onClick: onNew },
                      { key: 'select', label: _l('关联已有%0', entityName), onClick: onSelect },
                    ],
                  }}
                >
                  <Button
                    aria-label={_l('更多操作')}
                    className="relateRecordBtnDropIcon"
                    color="default"
                    variant="textBordered"
                    icon={<i className="icon icon-arrow-down" />}
                  />
                </Dropdown>
              )}
            </Button.Group>
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
                  color="default"
                  variant="textBordered"
                  icon={<i className="icon icon-worksheet_import Font16" />}
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
                />
              </Tooltip>
            )}
          {(addVisible || selectVisible) && enterBatchEdit && <Splitter />}
          {enterBatchEdit && (
            <Fragment>
              <Button
                color="default"
                variant="textBordered"
                onClick={() => onBatchOperate({ action: 'enterBatchEditing' })}
              >
                {_l('批量操作')}
              </Button>
            </Fragment>
          )}
        </Fragment>
      )}
      {isBatchEditing && (
        <Fragment>
          {enterBatchEdit && (
            <Button
              className="mRight10"
              color="default"
              variant="textBordered"
              icon={<i className="icon icon-close Font18" />}
              onClick={() => onBatchOperate({ action: 'exitBatchEditing' })}
            >
              {_l('退出')}
            </Button>
          )}
          {removeRelation && (
            <Button
              className="mRight10"
              color="default"
              variant="textBordered"
              disabled={noSelected}
              onClick={() => {
                if (noSelected) {
                  return;
                }

                onBatchOperate({ action: 'removeRelation' });
              }}
            >
              {_l('取消关联')}
            </Button>
          )}
          {edit && !get(window, 'shareState.shareId') && (
            <Button
              className="mRight10"
              color="default"
              variant="textBordered"
              disabled={noSelected}
              onClick={() => {
                if (noSelected) {
                  return;
                }

                onBatchOperate({ action: 'edit' });
              }}
            >
              {_l('编辑')}
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
                className="printButton mRight10"
                color="default"
                variant="textBordered"
                disabled={noSelected}
                onClick={() => {
                  if (noSelected) {
                    return;
                  }

                  onBatchOperate({ action: 'print' });
                }}
              >
                {_l('打印')}
                <i className="icon icon-arrow-down-border mLeft5 textTertiary"></i>
              </Button>
            </PrintList>
          )}
          {deleteRecords && !isShareState && (
            <Button
              className="mRight10"
              color="default"
              variant="textBordered"
              disabled={noSelected}
              onClick={() => {
                if (noSelected) {
                  return;
                }

                onBatchOperate({ action: 'deleteRecords' });
              }}
            >
              {_l('删除')}
            </Button>
          )}
          {exportRecords && !isShareState && (
            <Button
              className="mRight10"
              color="default"
              variant="textBordered"
              disabled={noSelected}
              onClick={() => {
                if (noSelected) {
                  return;
                }

                onBatchOperate({ action: 'exportRecords' });
              }}
            >
              {_l('导出')}
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
