import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useMeasure, useSetState } from 'react-use';
import cx from 'classnames';
import _, { get, identity } from 'lodash';
import styled from 'styled-components';
import { LoadDiv, Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import sheetAjax from 'src/api/worksheet';
import { RecordInfoModal } from 'mobile/Record';
import { openAddRecord } from 'mobile/Record/addRecord';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import { FlexCenter } from 'worksheet/components/Basics';
import RecordCoverCard from 'worksheet/components/RelateRecordCards/RecordCoverCard';
import { getCardColNum, LoadingButton } from 'worksheet/components/RelateRecordCards/RelateRecordCards';
import RelateRecordTable from 'worksheet/components/RelateRecordTable';
import { Button } from 'worksheet/components/RelateRecordTable/RelateRecordBtn.jsx';
import { RECORD_INFO_FROM, RELATION_SEARCH_SHOW_TYPE } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { getValueStyle } from 'src/components/newCustomFields/tools/utils';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { browserIsMobile } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { replaceControlsTranslateInfo } from 'src/utils/translate';

const PAGE_SIZE = 50;

const CARD_MIN_WIDTH = 360;
const CARDS_GAP = 16;

const CardsCon = styled.div`
  ${({ width }) => (width > 700 ? 'display: grid;' : '')}
  grid-gap: ${CARDS_GAP}px;
  grid-template-columns: repeat(auto-fit, minmax(${CARD_MIN_WIDTH}px, 1fr));
  &.mobileCardsCom {
    display: flex;
    flex-direction: column;
    grid-gap: unset;
  }
`;

const Con = styled.div`
  margin: 5px 0 5px;
`;

const RecordText = styled.div`
  display: inline-block;
  color: #151515;
  font-size: 13px;
  line-height: 20px;
  white-space: break-spaces;
  word-break: break-all;
  .text {
    display: inline-block;
    max-width: 202px;
    ${({ inlineStyle }) => inlineStyle}
  }
`;

const Splitter = styled.span`
  margin-right: 6px;
  ${({ inlineStyle }) => inlineStyle}
`;

const RecordTextAdd = styled(FlexCenter)`
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  width: 20px;
  height: 20px;
  color: #151515;
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

const MobileCardsEmpty = styled.div`
  height: calc(100vh - 150px);
  background: #f5f5f5;
  margin: -20px -24px 0;
`;

const EmptyTag = styled.span`
    display: block;
    margin: 15px 0;
    width: 22px;
    height: 6px;
    background: #eaeaea;
    border-radius: 3px;
}`;

function getCoverUrl(coverId, record, controls) {
  const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
  if (!coverControl) {
    return;
  }
  try {
    const coverFile = _.find(JSON.parse(record[coverId]), file => RegExpValidator.fileIsPicture(file.ext));
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
    width,
    allowOpenRecord,
    allowNewRecord,
    entityName,
    showAll,
    colNum,
    projectId,
    viewId,
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
  let { records } = props;
  const showNewRecord = browserIsMobile() ? !disabled && allowNewRecord : allowNewRecord;
  if (control.type === 51 && control.enumDefault === 1) {
    records = records.slice(0, 1);
  }
  const hideTitle = control.type === 51 && control.enumDefault === 1;
  return (
    <Fragment>
      {showNewRecord && (
        <div className="mBottom10">
          <Button onClick={onAdd}>
            <div className="content">
              <i className={`icon icon-plus mRight5 Font16`}></i>
              {entityName || _l('记录')}
            </div>
          </Button>
        </div>
      )}
      <CardsCon width={width} className={cx({ mobileCardsCom: browserIsMobile() })}>
        {!loading &&
          !!records.length &&
          (showAll || records.length <= colNum * 3 ? records : records.slice(0, colNum * 3)).map((record, i) => (
            <RecordCoverCard
              projectId={projectId}
              viewId={viewId}
              disabled
              isCharge={isCharge}
              hideTitle={hideTitle}
              containerWidth={width}
              key={i}
              cover={getCoverUrl(control.coverCid, record, controls)}
              controls={control.showControls.map(cid => _.find(controls, { controlId: cid })).filter(identity)}
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
        {browserIsMobile() && advancedSetting.showtype === '2' && !loading && !isLoadingMore && !records.length && (
          <MobileCardsEmpty>
            <WithoutRows text={_l('暂无记录')} />
          </MobileCardsEmpty>
        )}
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
      </CardsCon>
    </Fragment>
  );
}
function Texts(props) {
  const { control, entityName, allowOpenRecord, allowNewRecord, records = [], onAdd, onOpen, disabled } = props;

  const isMobile = browserIsMobile();
  let valueStyle = {};
  let style = {};
  if (control.type === 51) {
    valueStyle = getValueStyle({ ...control, type: 2, value: '_' });
    style = {
      fontSize: valueStyle.size,
    };
  }

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
      {records.map((record, i) => {
        const text = getTitleTextFromRelateControl(control, record);
        return (
          <RecordText
            inlineStyle={valueStyle.valueStyle}
            style={style}
            key={i}
            className={cx({ 'ThemeColor3 Hand': allowOpenRecord })}
            onClick={() => {
              if (!allowOpenRecord) {
                return;
              }
              onOpen(record.rowid);
            }}
          >
            <div className="text ellipsis" title={text}>
              {text}
            </div>
            {i < records.length - 1 && <Splitter inlineStyle={valueStyle.valueStyle}>,</Splitter>}
          </RecordText>
        );
      })}
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

function RelationSearch(props) {
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

  const colNum = getCardColNum({
    width: browserIsMobile() ? undefined : width,
    isMobile: browserIsMobile(),
    enumDefault,
  });
  const allowOpenRecord = _.get(advancedSetting, 'allowlink') === '1' && !_.get(window, 'shareState.shareId');
  const allowNewRecord =
    worksheetAllowAdd &&
    !disabled &&
    recordId &&
    controlPermission.editable &&
    enumDefault2 !== 1 &&
    enumDefault2 !== 11 &&
    !window.isPublicWorksheet;
  const loadRecords = async (pageIndex = 1) => {
    let relationControls = [...controls];
    setState(oldState => ({ ...oldState, isLoadingMore: true, loading: pageIndex === 1 }));
    if (_.isEmpty(relationControls)) {
      relationControls = await sheetAjax
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          relationWorksheetId: worksheetId,
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
      setState(oldState => ({ ...oldState, isLoadingMore: false, loading: false }));
      return;
    }
    const args = {
      worksheetId,
      viewId,
      searchType: 1,
      status: 1,
      isGetWorksheet: true,
      getType: control.from === RECORD_INFO_FROM.DRAFT ? 21 : 7,
      filterControls: filterControls || [],
      rowId: recordId,
      controlId: control.controlId,
      pageIndex,
      pageSize: control.enumDefault === 1 ? 1 : PAGE_SIZE,
      getWorksheet: pageIndex === 1,
      getRules: pageIndex === 1,
    };
    sheetAjax.getRowRelationRows(args).then(res => {
      setWorksheetAllowAdd(_.get(res, 'worksheet.allowAdd'));
      if (_.get(res, 'worksheet.template.controls')) {
        res.worksheet.template.controls = replaceControlsTranslateInfo(
          res.worksheet.appId,
          res.worksheet.worksheetId,
          _.get(res, 'worksheet.template.controls'),
        );
      }
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
        isDraft: control.from === RECORD_INFO_FROM.DRAFT,
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
      isDraft: control.from === RECORD_INFO_FROM.DRAFT,
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
    addBehaviorLog('worksheetRecord', control.dataSource, { rowId: needOpenRecordId }); // 埋点
    if (isMobile) {
      handlePushState('page', `relateRecord-${recordId}`);
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

  const onQueryChange = () => {
    if (!recordInfoVisible) return;
    handleReplaceState('page', `relateRecord-${recordId}`, () => setRecordInfoVisible(false));
  };

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

  useEffect(() => {
    if (!isMobile) return;
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, [recordInfoVisible]);
  if ((control.type === 51 && control.enumDefault === 1 && control.showControls.length === 0) || !records.length) {
    return <EmptyTag />;
  }
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
            width,
            entityName,
            allowOpenRecord,
            allowNewRecord,
            records,
            showAll,
            colNum,
            projectId,
            viewId,
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
          viewId={_.get(control, 'advancedSetting.openview') || control.viewId}
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
    color: #151515;
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

export default function (props) {
  const { isCharge, worksheetId, recordId, disabled, formData, updateWorksheetControls } = props;

  if (props.advancedSetting.showtype === String(RELATION_SEARCH_SHOW_TYPE.EMBED_LIST)) {
    return (
      <RelateRecordTable
        control={{ ...props }}
        isDraft={props.isDraft}
        allowEdit={!disabled}
        recordId={recordId}
        worksheetId={worksheetId}
        formData={formData}
        isCharge={isCharge}
        updateWorksheetControls={updateWorksheetControls}
      />
    );
  } else {
    return <RelationSearch {...props} />;
  }
}
