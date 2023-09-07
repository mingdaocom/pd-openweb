import React, { Fragment, useCallback, useEffect, useState, useRef } from 'react';
import { useMeasure, useSetState } from 'react-use';
import styled from 'styled-components';
import { Modal, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import functionWrap from 'ming-ui/components/FunctionWrap';
import _ from 'lodash';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { RELATION_SEARCH_SHOW_TYPE, controlName } from 'worksheet/constants/enum';
import { FlexCenter } from 'worksheet/components/Basics';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import sheetAjax from 'src/api/worksheet';
import RecordCoverCard from 'worksheet/components/RelateRecordCards/RecordCoverCard';
import { LoadingButton, getCardWidth } from 'worksheet/components/RelateRecordCards/RelateRecordCards';
import { Button } from 'worksheet/common/recordInfo/RecordForm/RelateRecordBtn';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { browserIsMobile, addBehaviorLog } from 'src/util';
import { openAddRecord } from 'mobile/Record/addRecord';
import { RecordInfoModal } from 'mobile/Record';

const PAGE_SIZE = 50;

const Con = styled.div`
  margin: 5px 0 5px;
`;

const RecordText = styled.div`
  display: inline-block;
  color: #333;
  font-size: 13px;
  line-height: 20px;
  .splitter {
    margin-right: 6px;
  }
`;

const RecordTextAdd = styled(FlexCenter)`
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  width: 20px;
  height: 20px;
  color: #333;
  font-size: 13px;
  background: #f7f6f8;
  color: #9d9d9d;
  &:hover {
    color: #2196f3;
  }
`;

const MobileTestWrap = styled.div`
  display: flex;
  .recordText {
    border: 1px solid #e0e0e0;
    padding-bottom: 5px;
    background: #f9f9f9;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .disabledRecordText {
    border: none;
    padding-bottom: 0px;
    background: #fff;
  }
  .recordTextItem {
    display: inline-block;
    height: 28px;
    line-height: 28px;
    padding: 0 16px;
    margin: 5px 0 0 6px;
    background: #f0f0f0;
    border-radius: 5px;
  }
  .mobileRecordTextAdd {
    width: 40px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    color: #757575;
    text-align: center;
    line-height: 38px;
    margin-left: 6px;
  }
`;

function getCoverUrl(coverId, record, controls) {
  const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
  if (!coverControl) {
    return;
  }
  try {
    const coverFile = _.find(JSON.parse(record[coverId]), file => File.isPicture(file.ext));
    const { previewUrl = '' } = coverFile;
    return previewUrl.indexOf('imageView2') > -1
      ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
      : `${previewUrl}&imageView2/1/w/200/h/140`;
  } catch (err) {}
  return;
}

function Cards(props) {
  const {
    loading,
    allowOpenRecord,
    allowNewRecord,
    entityName,
    records,
    showAll,
    colNum,
    projectId,
    viewId,
    cardWidth,
    isCharge,
    controls,
    advancedSetting,
    control,
    showLoadMore,
    isLoadingMore,
    setState,
    loadRecords,
    pageIndex,
    onAdd,
    onOpen,
    disabled,
  } = props;
  const showNewRecord = browserIsMobile() ? !disabled && allowNewRecord : allowNewRecord;

  return (
    <Fragment>
      {showNewRecord && (
        <div className="mBottom10">
          <Button onClick={onAdd}>
            <div className="content">
              <i className={`icon icon-plus mRight5 Font16`}></i>
              {entityName}
            </div>
          </Button>
        </div>
      )}
      {!loading &&
        !!records.length &&
        (showAll || records.length <= colNum * 3 ? records : records.slice(0, colNum * 3)).map((record, i) => (
          <RecordCoverCard
            projectId={projectId}
            viewId={viewId}
            disabled
            width={cardWidth}
            isCharge={isCharge}
            key={i}
            cover={getCoverUrl(control.coverCid, record, controls)}
            controls={control.showControls
              .map(cid => _.find(controls, { controlId: cid }))
              .filter(c => c && c.attribute !== 1)}
            data={record}
            allowlink={allowOpenRecord ? '1' : '0'}
            parentControl={{ ...control, relationControls: controls }}
            onClick={() => {
              if (!allowOpenRecord) {
                return;
              }
              onOpen(record.rowid);
            }}
          />
        ))}
      {records.length > colNum * 3 && (
        <div>
          {showLoadMore && showAll && (
            <LoadingButton
              onClick={() => {
                if (!isLoadingMore) {
                  loadRecords(pageIndex + 1);
                }
              }}
            >
              {isLoadingMore && (
                <span className="loading">
                  <i className="icon icon-loading_button"></i>
                </span>
              )}
              {_l('加载更多')}
            </LoadingButton>
          )}
          <LoadingButton
            className="ThemeColor3 Hand mBottom10 InlineBlock"
            onClick={() => setState(old => ({ ...old, showAll: !showAll }))}
          >
            {showAll ? _l('收起') : _l('展开更多')}
          </LoadingButton>
        </div>
      )}
    </Fragment>
  );
}
function Texts(props) {
  const { control, entityName, allowOpenRecord, allowNewRecord, records = [], onAdd, onOpen, disabled } = props;

  const isMobile = browserIsMobile();

  if (isMobile) {
    return (
      <MobileTestWrap>
        {!_.isEmpty(records) && (
          <div className={cx('flex recordText', { disabledRecordText: disabled })}>
            {records.map((record, i) => {
              return (
                <span
                  key={i}
                  className={cx('recordTextItem', { ThemeColor3: allowOpenRecord, bold: allowOpenRecord })}
                  onClick={() => {
                    if (!allowOpenRecord) {
                      return;
                    }
                    onOpen(record.rowid);
                  }}
                >
                  {getTitleTextFromRelateControl(control, record)}
                </span>
              );
            })}
          </div>
        )}
        {!disabled && allowNewRecord && (
          <div
            className="mobileRecordTextAdd"
            data-tip={entityName ? _l('新建') + entityName : undefined}
            onClick={onAdd}
          >
            <i className="icon icon-plus"></i>
          </div>
        )}
      </MobileTestWrap>
    );
  }
  return (
    <div>
      {records.map((record, i) => (
        <RecordText
          key={i}
          className={cx('w100 ellipsis', { 'ThemeColor3 Hand': allowOpenRecord })}
          onClick={() => {
            if (!allowOpenRecord) {
              return;
            }
            onOpen(record.rowid);
          }}
        >
          {getTitleTextFromRelateControl(control, record)}
          {i < records.length - 1 && <span className="splitter">,</span>}
        </RecordText>
      ))}
      {allowNewRecord && (
        <RecordTextAdd
          data-tip={`新建${entityName || _l('记录')}`}
          style={records.length ? { marginLeft: 13 } : {}}
          onClick={onAdd}
        >
          <i className="icon icon-plus"></i>
        </RecordTextAdd>
      )}
    </div>
  );
}

export default function RelationSearch(props) {
  const {
    isDialog,
    from,
    flag,
    disabled,
    projectId,
    recordId,
    worksheetId,
    viewId,
    isCharge,
    advancedSetting,
    enumDefault,
    enumDefault2,
    isDraft,
  } = props;

  const control = { ...props };
  const controlPermission = controlState(control, from);
  const cache = useRef({});
  const [ref, { width }] = useMeasure();
  const [state, setState] = useState({
    showAll: isDialog,
  });
  const [recordInfoVisible, setRecordInfoVisible] = useState(false);
  const [worksheetAllowAdd, setWorksheetAllowAdd] = useState(true);
  const [openRecordId, setOpenRecordId] = useState('');
  const {
    loading = true,
    entityName,
    showAll,
    records = [],
    controls = [],
    showLoadMore,
    pageIndex,
    isLoadingMore,
  } = state;
  const isMobile = browserIsMobile();
  const { cardWidth, colNum } = getCardWidth({ width, enumDefault });
  const allowOpenRecord = _.get(advancedSetting, 'allowlink') === '1' && !_.get(window, 'shareState.shareId');
  const allowNewRecord =
    worksheetAllowAdd &&
    !disabled &&
    recordId &&
    controlPermission.editable &&
    enumDefault2 !== 1 &&
    enumDefault2 !== 11 &&
    !window.isPublicWorksheet &&
    !isDraft;
  const loadRecords = async (pageIndex = 1) => {
    let relationControls = [...controls];
    setState(oldState => ({ ...oldState, isLoadingMore: true, loading: pageIndex === 1 }));
    if (_.isEmpty(relationControls)) {
      relationControls = await sheetAjax
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
        })
        .then(res => {
          setWorksheetAllowAdd(res.allowAdd);
          return _.get(res, 'template.controls') || [];
        });
      setState(oldState => ({ ...oldState, controls: relationControls }));
    }
    const filterControls = getFilter({
      control: { ...control, relationControls, recordId },
      formData: control.formData,
      filterKey: 'resultfilters',
    });
    cache.current.filter = filterControls;
    if (filterControls === false) {
      setState(oldState => ({ ...oldState, isLoadingMore: false }));
      return;
    }
    const args = {
      worksheetId,
      viewId,
      searchType: 1,
      status: 1,
      isGetWorksheet: true,
      getType: 7,
      filterControls: filterControls || [],
      rowId: recordId,
      controlId: control.controlId,
      pageIndex,
      pageSize: PAGE_SIZE,
      getWorksheet: pageIndex === 1,
      getRules: pageIndex === 1,
    };
    if (window.shareState.shareId) {
      args.shareId = window.shareState.shareId;
    }
    sheetAjax.getRowRelationRows(args).then(res => {
      setWorksheetAllowAdd(_.get(res, 'worksheet.allowAdd'));
      setState(oldState => {
        const newRecords = _.uniqBy([...(oldState.records || []), ...(res.data || [])], 'rowid');
        return {
          ...oldState,
          loading: false,
          records: newRecords,
          pageIndex,
          isLoadingMore: false,
          controls: pageIndex === 1 ? _.get(res, 'worksheet.template.controls') : oldState.controls,
          entityName: _.get(res, 'worksheet.entityName'),
          showAll,
          showLoadMore: newRecords.length < res.count && res.data.length > 0,
        };
      });
    });
  };
  const debounceClearAndLoad = useCallback(
    _.debounce(() => {
      setState(oldState => ({ ...oldState, records: [] }));
      loadRecords();
    }, 400),
    [control.formData, state],
  );
  const handleAddRecord = useCallback(() => {
    if (isMobile) {
      openAddRecord({
        className: 'full',
        worksheetId: control.dataSource,
        showDraftsEntry: true,
        entityName,
        onAdd: record => {
          if (record) {
            setState({ ...state, records: [record, ...records] });
          }
        },
      });
      return;
    }
    addRecord({
      worksheetId: control.dataSource,
      directAdd: true,
      showFillNext: true,
      onAdd: record => {
        if (record) {
          setState({ ...state, records: [record, ...records] });
        }
      },
    });
  });
  const handleOpenRecord = useCallback(needOpenRecordId => {
    if (location.pathname.indexOf('public') === -1) {
      addBehaviorLog('worksheetRecord', control.dataSource, { rowId: needOpenRecordId }); // 埋点
    }
    if (isMobile) {
      setRecordInfoVisible(true);
      setOpenRecordId(needOpenRecordId);
      return;
    }
    openRecordInfo({
      appId: control.appId,
      worksheetId: control.dataSource,
      recordId: needOpenRecordId,
      viewId: advancedSetting.openview || control.viewId,
    });
  });
  useEffect(() => {
    loadRecords();
    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(`relation_search_${control.controlId}`, () => {
        setState({ ...state, records: [] });
        loadRecords();
      });
    }
  }, []);
  useEffect(() => {
    const newFilter = getFilter({
      control: { ...control, relationControls: controls, recordId },
      formData: control.formData,
      filterKey: 'resultfilters',
    });
    if (!_.isUndefined(cache.current.filter) && newFilter && !_.isEqual(cache.current.filter, newFilter)) {
      cache.current.filter = newFilter;
      debounceClearAndLoad();
    } else if (!_.isEqual(cache.current.filter, newFilter) && newFilter === false) {
      cache.current.filter = newFilter;
      setState(oldState => ({ ...oldState, loading: false, records: [] }));
    }
  });

  return (
    <Con ref={ref}>
      {loading && (
        <div
          style={
            isDialog
              ? {
                  paddingTop: 'calc(50% - 50px)',
                }
              : {
                  display: 'inline-block',
                  marginBottom: 6,
                }
          }
        >
          <LoadDiv size={isDialog ? 'big' : 'small'} />
        </div>
      )}
      {_.get(advancedSetting, 'showtype') === String(RELATION_SEARCH_SHOW_TYPE.CARD) ||
      (isMobile && _.get(advancedSetting, 'showtype') === String(RELATION_SEARCH_SHOW_TYPE.LIST)) ? (
        <Cards
          {...{
            loading,
            entityName,
            allowOpenRecord,
            allowNewRecord,
            records,
            showAll,
            colNum,
            projectId,
            viewId,
            cardWidth,
            isCharge,
            controls,
            advancedSetting,
            control,
            showLoadMore,
            isLoadingMore,
            setState,
            loadRecords,
            pageIndex,
            onAdd: handleAddRecord,
            onOpen: handleOpenRecord,
            disabled,
          }}
        />
      ) : (
        <Texts
          allowOpenRecord={allowOpenRecord}
          allowNewRecord={allowNewRecord}
          entityName={entityName}
          records={records}
          control={{ ...control, relationControls: controls }}
          onAdd={handleAddRecord}
          onOpen={handleOpenRecord}
          disabled={disabled}
        />
      )}

      {recordInfoVisible && (
        <RecordInfoModal
          className="full"
          visible
          appId={control.appId}
          worksheetId={control.dataSource}
          rowId={openRecordId}
          onClose={() => {
            setRecordInfoVisible(false);
          }}
        />
      )}
      {!loading && !allowNewRecord && _.isEmpty(records) && <div className="customFormNull" />}
    </Con>
  );
}

const DialogCon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 57px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  .main {
    font-size: 17px;
    color: #333;
    font-weight: bold;
  }
  .split {
    font-size: 16px;
    margin: 0 8px;
    color: #9e9e9e;
  }
  .sec {
    font-size: 14px;
    color: #9e9e9e;
  }
`;
const Content = styled.div`
  padding: 0 24px 36px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  .relateRecordTable {
    height: 100%;
  }
  .tableCon {
    flex: 1;
  }
`;

export function RelationSearchDialog(props) {
  const { from, flag, projectId, recordId, worksheetId, viewId, isCharge, control, onClose } = props;
  return (
    <Modal
      visible
      type="fixed"
      verticalAlign="bottom"
      width={1300}
      closeSize={57}
      onCancel={onClose}
      bodyStyle={{ padding: 0, position: 'relative' }}
    >
      <DialogCon>
        <Header>
          <div className="main">{control.controlName}</div>
        </Header>
        <Content>
          <RelationSearch
            isDialog
            {...{
              from,
              flag,
              projectId,
              recordId,
              worksheetId,
              viewId,
              isCharge,
              ...control,
            }}
          />
        </Content>
      </DialogCon>
    </Modal>
  );
}
export const openRelationSearchDialog = props => functionWrap(RelationSearchDialog, props);
