import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Dialog, Icon, Menu, MenuItem, Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetAjax from 'src/api/worksheet';
import RecordInfo from 'worksheet/common/recordInfo/RecordInfoWrapper';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { RowHead } from 'worksheet/components/WorksheetTable/components/';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { SYSTEM_ENUM } from 'src/components/newCustomFields/tools/config';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { emitter } from 'src/utils/common';
import { updateDraftTotalInfo } from './utils';
import WorksheetDraftOperate from './WorksheetDraftOperate';

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
  .closeBtn,
  .refreshBtn {
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

const TotalNumWrap = styled.span`
  background-color: #eaeaea;
  padding: 2px 6px;
  border-radius: 10px;
`;

function DraftModal(props) {
  const {
    onCancel = () => {},
    appId,
    view = {},
    worksheetInfo = {},
    sheetSwitchPermit,
    isCharge,
    allowAdd,
    setHighLightOfRows = () => {},
    updateDraftTotal = () => {},
  } = props;

  const { worksheetId, projectId, rules = [], isWorksheetQuery, advancedSetting = {}, enablePayment } = worksheetInfo;
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
        !_.includes(SYSTEM_ENUM, item.controlId) &&
        controlState(item, 2).visible,
    )
    .concat([
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
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
  const numberWidth = 16;

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
        pageIndex: 1,
        pageSize: 10,
      })
      .then(res => {
        setRecords(res.data);
        setLoading(false);
        updateDraftTotal(res.data.length);
        emitter.emit('UPDATE_DRAFT_TOTAL', {
          worksheetId,
          total: res.data.length,
        });
      });
  };

  const renderColumnHead = ({ className, style, control, isLast, updateSheetColumnWidths }) => {
    const maskData =
      _.get(control, 'advancedSetting.datamask') === '1' && _.get(control, 'advancedSetting.isdecrypt') === '1';

    return (
      <BaseColumnHead
        className={className}
        style={{ ...style }}
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
                {_l('解码')}
              </MenuItem>
            )}
          </Menu>
        )}
      />
    );
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
          setSelected([]);
          updateDraftTotal(data.length);
          updateDraftTotalInfo({ worksheetId, total: data.length });
          emitter.emit('UPDATE_DRAFT_TOTAL', { worksheetId, total: data.length });
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };

  return (
    <BrowserRouter>
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
            total={records.length}
            onCancel={() => {
              setSelected([]);
            }}
          />
          <Header>
            <div className="title">{records.length ? `${_l('草稿箱')}（${records.length}/10）` : _l('草稿箱')}</div>
            <div className="flex"></div>
            <span className="refreshBtn mRight10" onClick={() => loadRows({ appId, worksheetId })}>
              <i className="icon icon-refresh1" />
            </span>
            <span className="closeBtn" onClick={onCancel}>
              <i className="icon icon-close" />
            </span>
          </Header>
          <Body>
            <WorksheetTable
              loading={loading}
              worksheetId={worksheetId}
              appId={appId}
              lineNumberBegin={0}
              emptyIcon={<Icon icon="drafts_approval" />}
              emptyText={_l('暂无草稿')}
              noRenderEmpty={true}
              columns={columns}
              rowHeight={34}
              rowHeadWidth={88}
              selectedIds={selected}
              data={records}
              controls={controls}
              from={21}
              rules={rules}
              renderColumnHead={renderColumnHead}
              sheetSwitchPermit={sheetSwitchPermit}
              projectId={projectId}
              renderRowHead={({ className, style, rowIndex }) => (
                <RowHead
                  isDraftTable
                  className={className}
                  style={style}
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
            enablePayment={enablePayment}
            controls={controls}
            sheetSwitchPermit={sheetSwitchPermit}
            projectId={projectId}
            showPrevNext
            needUpdateRows
            rules={rules}
            isWorksheetQuery={isWorksheetQuery}
            isCharge={isCharge}
            allowAdd={allowAdd || advancedSetting.closedrafts !== '1'}
            appId={appId}
            view={{ ...view, controls: [] }}
            from={21}
            visible={recordInfoVisible}
            worksheetInfo={worksheetInfo}
            hideRecordInfo={closeId => {
              if (!closeId || closeId === recordId) {
                setRecordInfoVisible(false);
              }
            }}
            recordId={recordId}
            activeRelateTableControlId={activeRelateTableControlIdOfRecord}
            worksheetId={worksheetId}
            rowStatus={21}
            currentSheetRows={records}
            addNewRecord={props.addNewRecord}
            setHighLightOfRows={setHighLightOfRows}
            loadRowsWhenChildTableStoreCreated={true}
            updateDraftList={(rowId, rowData) => {
              let data = _.clone(records);
              if (!rowData) {
                data = data.filter(it => it.rowid !== rowId);
              } else {
                const index = _.findIndex(data, it => it.rowid === rowId);
                data[index] = rowData;
              }
              updateDraftTotal(data.length);
              setRecords(data);
            }}
          />
        )}
      </Modal>
    </BrowserRouter>
  );
}
export const openWorkSheetDraft = props => functionWrap(DraftModal, { ...props, closeFnName: 'onCancel' });

let request = null;
function WorksheetDraft(props) {
  const {
    appId,
    view = {},
    worksheetInfo = {},
    sheetSwitchPermit,
    isCharge,
    allowAdd,
    setHighLightOfRows,
    isNewRecord,
    className = '',
    totalNumStyle = {},
  } = props;
  const { worksheetId } = worksheetInfo;
  const [total, setTotal] = useState(_.get(window, `draftTotalNumInfo[${worksheetId}]`));

  // 获取草稿箱计数
  const loadDraftDataCount = () => {
    if (window.draftTotalNumInfo && window.draftTotalNumInfo[worksheetId]) return;

    if (request && request.abort) {
      request.abort();
    }

    request = worksheetAjax.getFilterRowsTotalNum;

    request({
      appId,
      worksheetId,
      getType: 21,
    }).then(res => {
      const total = Number(res) || 0;
      updateDraftTotalInfo({ worksheetId, total });
      setTotal(total);
    });
  };

  useEffect(() => {
    loadDraftDataCount();
  }, []);

  const updateTotal = (obj = {}) => {
    if (worksheetId === obj.worksheetId) {
      setTotal(obj.total);
    }
  };

  useEffect(() => {
    emitter.addListener('UPDATE_DRAFT_TOTAL', updateTotal);

    return () => {
      emitter.removeListener('UPDATE_DRAFT_TOTAL', updateTotal);
    };
  }, []);

  // v11.1变更: 草稿箱入口不受存草稿开关限制（有草稿记录就显示草稿箱列表入口）
  if ((isNewRecord && !total) || (_.get(worksheetInfo, 'advancedSetting.closedrafts') === '1' && !Number(total))) {
    return null;
  }

  return (
    <span
      className={`Relative Hand draftEntry inlineFlex alignItemsCenter ${className}`}
      onClick={() => {
        openWorkSheetDraft({
          view,
          appId,
          worksheetInfo,
          sheetSwitchPermit,
          isCharge,
          allowAdd,
          addNewRecord: props.addNewRecord,
          setHighLightOfRows,
          updateDraftTotal: total => {
            setTotal(total);
            updateDraftTotalInfo({ worksheetId, total });
          },
        });
      }}
    >
      <Icon icon="drafts_approval" className="Font18 Gray_9e" />
      <span className="mLeft5 Font13 Gray_75 draftTxt">{_l('草稿箱')}</span>
      {total ? (
        <TotalNumWrap className="mLeft5 Gray Font13" style={totalNumStyle}>
          {total}
        </TotalNumWrap>
      ) : (
        ''
      )}
    </span>
  );
}
export default WorksheetDraft;
