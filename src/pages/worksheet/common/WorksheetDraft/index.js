import React, { useState, useReducer, useEffect, useRef } from 'react';
import { Modal, Icon, Menu, MenuItem, Button, Tooltip } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import WorksheetDraftOperate from './WorksheetDraftOperate';
import WorksheetTable from 'worksheet/components/WorksheetTable/V2';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { RowHead } from 'worksheet/components/WorksheetTable/components/';
import RecordInfo from 'worksheet/common/recordInfo/RecordInfoWrapper';
import worksheetAjax from 'src/api/worksheet';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { emitter, fieldCanSort, getSortData } from 'worksheet/util';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { isOtherShowFeild } from 'src/pages/widgetConfig/util';
import styled from 'styled-components';
import cx from 'classnames';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 -24px;
  padding: 0 16px 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.09) !important;
  .title {
    font-size: 17px;
    font-weight: 500;
  }
  .closeBtn {
    cursor: pointer;
    line-height: 1em;
    font-size: 22px;
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

const Body = styled.div`
  flex: 1;
  overflow: hidden;
  margin: 0 -24px;
`;

const DraftButton = styled.div`
  height: 34px !important;
  line-height: 34px;
  border: 1px solid #ddd !important;
  color: #333 !important;
  background-color: #fff;
  &:hover {
    border: 1px solid #2196f3 !important;
    color: #2196f3 !important;
  }
`;

function DraftModal(props) {
  const {
    onCancel = () => {},
    appId,
    viewId,
    worksheetInfo = {},
    sheetSwitchPermit,
    isCharge,
    allowAdd,
    sheetViewData = {},
    updateDraftDataCount = () => {},
  } = props;
  const { worksheetId, projectId, rules = [], isWorksheetQuery, advancedSetting = {} } = worksheetInfo;
  const { rows } = sheetViewData;
  const [selected, setSelected] = useState([]);
  const [recordInfoVisible, setRecordInfoVisible] = useState(false);
  const [activeRelateTableControlIdOfRecord, setActiveRelateTableControlIdOfRecord] = useState({});
  const [recordId, setRecordId] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState(props.draftData || []);
  const [disableMaskDataControls, setDisableMaskDataControls] = useState({});
  const controls = _.get(worksheetInfo, 'template.controls');
  const columns = controls
    .filter(
      item =>
        !_.includes(SHEET_VIEW_HIDDEN_TYPES, item.type) &&
        !_.includes(
          [
            'wfname',
            'wfcuaids',
            'wfcaid',
            'wfctime',
            'wfrtime',
            'wfftime',
            'wfstatus',
            'rowid',
            'ownerid',
            'caid',
            'uaid',
          ],
          item.controlId,
        ) &&
        controlState(item, 2).visible,
    )
    .concat([
      { controlId: 'ctime', controlName: '创建时间', type: 16 },
      { controlId: 'utime', controlName: '最近修改时间', type: 16 },
    ])
    .map(c =>
      disableMaskDataControls[c.controlId]
        ? {
            ...c,
            advancedSetting: Object.assign({}, c.advancedSetting, {
              datamask: '0',
            }),
          }
        : c,
    );
  const recordInfoRef = useRef(null);
  const numberWidth = String(records.length).length * 8;
  const rowHeadWidth = numberWidth + 32;

  useEffect(() => {
    loadRows({ appId, worksheetId });
  }, []);

  const loadRows = () => {
    setLoading(true);
    worksheetAjax
      .getFilterRows({
        appId,
        worksheetId,
        getType: 21,
      })
      .then(res => {
        updateDraftDataCount(res.data.length);
        setRecords(res.data);
        setLoading(false);
      });
  };

  const renderColumnHead = ({ className, style, control, isLast, updateSheetColumnWidths }) => {
    const maskData =
      _.get(control, 'advancedSetting.datamask') === '1' && _.get(control, 'advancedSetting.isdecrypt') === '1';

    return (
      <BaseColumnHead
        className={className}
        style={style}
        worksheetId={worksheetId}
        control={
          disableMaskDataControls[control.controlId]
            ? {
                ...control,
                advancedSetting: Object.assign({}, control.advancedSetting, {
                  datamask: '0',
                }),
              }
            : control
        }
        showDropdown={!disableMaskDataControls[control.controlId] && maskData}
        isLast={isLast}
        selected={!!selected.length}
        updateSheetColumnWidths={updateSheetColumnWidths}
        renderPopup={({ closeMenu }) => (
          <Menu className="worksheetColumnHeadMenu" style={{ width: 180 }} onClickAway={closeMenu}>
            {maskData && (
              <MenuItem
                onClick={() => {
                  setDisableMaskDataControls({ ...disableMaskDataControls, [control.controlId]: true });
                }}
              >
                <i className="icon icon-eye_off"></i>
                {_l('解密')}
              </MenuItem>
            )}
          </Menu>
        )}
      />
    );
  };

  const changeSort = (newIsAsc, control) => {
    const newSortControl = _.isUndefined(newIsAsc)
      ? {}
      : {
          controlId: control.controlId,
          isAsc: newIsAsc,
        };
    setSortControl(newSortControl);
    loadRows({
      sortControls: _.isUndefined(newIsAsc)
        ? []
        : [
            {
              datatype: control.type,
              ...newSortControl,
            },
          ],
    });
  };

  const deleteSelete = ids => {
    worksheetAjax
      .deleteWorksheetRows({
        appId,
        worksheetId,
        rowIds: ids,
        deleteType: 21,
      })
      .then(res => {
        if (res.successCount === ids.length) {
          alert(_l('删除成功'));
          const data = records.filter(it => !_.includes(ids, it.rowid));
          setRecords(data);
          updateDraftDataCount(data.length);
          setSelected([]);
          if (props.loadDraftDataCount && _.isFunction(props.loadDraftDataCount) && !data.length) {
            props.loadDraftDataCount({ appId, worksheetId });
          }
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };

  return (
    <Modal
      visible
      closable={false}
      width={document.body.clientWidth * 0.9}
      type="fixed"
      bodyStyle={{ paddingTop: 0, position: 'relative' }}
      closeStyle={{ margin: '16px', width: '30px', height: '30px', lineHeight: '30px' }}
    >
      <Con>
        <WorksheetDraftOperate
          selected={selected}
          deleteSelete={deleteSelete}
          onCancel={() => {
            setSelected([]);
          }}
        />
        <Header>
          <div className="title">{records.length ? `${_l('草稿箱')}（${records.length}/10）` : _l('草稿箱')}</div>
          <span className="closeBtn" onClick={onCancel}>
            <i className="icon icon-close" />
          </span>
        </Header>
        <Body>
          <WorksheetTable
            loading={loading}
            viewId={viewId || _.get(worksheetInfo, 'views[0].viewId')}
            worksheetId={worksheetId}
            appId={appId}
            lineNumberBegin={0}
            emptyIcon={<Icon icon="drafts_approval" />}
            emptyText={_l('暂无草稿')}
            noRenderEmpty={true}
            columns={columns}
            rowHeight={34}
            selectedIds={selected}
            data={records}
            controls={controls}
            from={21}
            renderColumnHead={renderColumnHead}
            renderRowHead={({ className, style, rowIndex }) => (
              <RowHead
                isDraft
                className={className}
                style={{ ...style, with: String(rowIndex).length * 8 + 64 }}
                numberWidth={numberWidth}
                lineNumberBegin={0}
                allowEdit={false}
                selectedIds={selected}
                onSelectAllWorksheet={() => {
                  setIsAll(true);
                  setSelected(records.map(row => row.rowid));
                }}
                onSelect={newSelected => {
                  const selectRows = [];
                  newSelected.forEach(rowId => {
                    const row = _.find(records, trashRow => trashRow.rowid === rowId);
                    if (row && (row.allowedit || row.allowEdit)) {
                      selectRows.push(row);
                    }
                  });
                  setSelected(newSelected);
                }}
                rowIndex={rowIndex}
                data={records}
              />
            )}
            onCellClick={(cell, row, rowIndex) => {
              if (cell.type === 29 && cell.enumDefault === 2) {
                setActiveRelateTableControlIdOfRecord(cell.controlId);
              }
              setRecordId(row.rowid);
              setRecordInfoVisible(true);
            }}
          />
        </Body>
      </Con>
      {recordInfoVisible && (
        <RecordInfo
          ref={recordInfoRef}
          controls={controls}
          draftFormControls={controls.filter(
            item =>
              !_.includes(SHEET_VIEW_HIDDEN_TYPES, item.type) &&
              !_.includes(
                [
                  'wfname',
                  'wfcuaids',
                  'wfcaid',
                  'wfctime',
                  'wfrtime',
                  'wfftime',
                  'wfstatus',
                  'rowid',
                  'ownerid',
                  'caid',
                  'uaid',
                  'ctime',
                  'utime',
                ],
                item.controlId,
              ),
          )}
          sheetSwitchPermit={sheetSwitchPermit}
          projectId={projectId}
          showPrevNext
          needUpdateRows
          rules={rules}
          isWorksheetQuery={isWorksheetQuery}
          isCharge={isCharge}
          allowAdd={allowAdd}
          appId={appId}
          from={21}
          visible={recordInfoVisible}
          hideRecordInfo={closeId => {
            if (!closeId || closeId === recordId) {
              setRecordInfoVisible(false);
            }
          }}
          recordId={recordId}
          activeRelateTableControlId={activeRelateTableControlIdOfRecord}
          worksheetId={worksheetId}
          header={
            <div className="flex flexRow w100 alignItemsCenter">
              <div className="flex Font17 bold pLeft15">{`${advancedSetting.title || '创建记录'}（${_l(
                '草稿',
              )}）`}</div>
              <DraftButton
                className="ming Button--medium Button mRight12"
                onClick={() => {
                  if (recordInfoRef.current) {
                    recordInfoRef.current.saveDraftData({ draftType: 'draft' });
                  }
                }}
              >
                {_l('存草稿')}
              </DraftButton>
              <Button
                className="mRight12"
                onClick={() => {
                  if (recordInfoRef.current) {
                    recordInfoRef.current.saveDraftData({ draftType: 'submit' });
                  }
                }}
              >
                {advancedSetting.sub || _l('提交')}
              </Button>
            </div>
          }
          rowStatus={21}
          loadDraftList={loadRows}
          currentSheetRows={records}
          addNewRecord={props.addNewRecord}
          view={_.get(worksheetInfo, 'views[0]')}
        />
      )}
    </Modal>
  );
}
export const openWorkSheetDraft = props => functionWrap(DraftModal, { ...props, closeFnName: 'onCancel' });

function WorksheetDraft(props) {
  const { appId, viewId, worksheetInfo = {}, sheetSwitchPermit, isCharge, sheetViewData = {}, view, allowAdd } = props;
  const { worksheetId } = worksheetInfo;
  const [draftDataCount, setDraftDataCount] = useState(props.draftDataCount);

  useEffect(() => {
    setDraftDataCount(props.draftDataCount);
  }, [props.draftDataCount]);

  return (
    <Tooltip popupPlacement="bottom" text={<span>{_l('草稿箱')}</span>}>
      <span
        className="mRight16 mTop4 Relative"
        onClick={() => {
          openWorkSheetDraft({
            appId,
            viewId,
            worksheetInfo,
            sheetSwitchPermit,
            isCharge,
            sheetViewData,
            view,
            sheetViewData,
            allowAdd,
            addNewRecord: props.addNewRecord,
            updateDraftDataCount: draftDataCount => {
              setDraftDataCount(draftDataCount);
            },
          });
        }}
      >
        <Icon icon="drafts_approval" className="Font20 Gray_9e pointer mTop4" />
        {draftDataCount ? <span className="draftDot"></span> : ''}
      </span>
    </Tooltip>
  );
}
export default WorksheetDraft;
