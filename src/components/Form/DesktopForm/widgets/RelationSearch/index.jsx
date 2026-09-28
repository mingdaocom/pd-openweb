import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import _, { identity } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Button, Modal, Tooltip } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import sheetAjax from 'src/api/worksheet';
import { useAddRecord } from 'worksheet/common/newRecord/addRecord';
import { useRecordInfo } from 'worksheet/common/recordInfo';
import { FlexCenter } from 'worksheet/components/Basics';
import RecordCoverCard from 'worksheet/components/RelateRecordCards/RecordCoverCard';
import { getCardColNum, LoadingButton } from 'worksheet/components/RelateRecordCards/RelateRecordCards';
import RelateRecordTable from 'worksheet/components/RelateRecordTable';
import { useWidgetEvent } from 'src/components/Form/core/useFormEventManager';
import { getTitleTextFromRelateControl } from 'src/utils/domain/control/display';
import { controlState } from 'src/utils/domain/control/state';
import { getValueStyle } from 'src/utils/domain/control/style';
import { RECORD_INFO_FROM, RELATION_SEARCH_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { getFilter } from 'src/utils/domain/worksheet/filterDynamic';
import { getCoverUrl } from 'src/utils/domain/worksheet/view';
import { addBehaviorLog } from 'src/utils/services/project';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';

const PAGE_SIZE = 50;

const CARD_MIN_WIDTH = 360;
const CARDS_GAP = 16;
const ADD_RECORD_BUTTON_STYLE = { maxWidth: 150 };

const CardsCon = styled.div`
  ${({ $width }) => ($width > 700 ? 'display: grid;' : '')}
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
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 20px;
  white-space: break-spaces;
  word-break: break-all;
  .text {
    display: inline-block;
    max-width: 202px;
    ${({ $inlineStyle }) => $inlineStyle}
  }
  &.isSingle {
    .text {
      max-width: 100%;
    }
  }
`;

const Splitter = styled.span`
  margin-right: 6px;
  ${({ $inlineStyle }) => $inlineStyle}
`;

const RecordTextAdd = styled(FlexCenter)`
  border-radius: 3px;
  cursor: pointer;
  display: inline-flex;
  width: 20px;
  height: 20px;
  color: var(--color-text-primary);
  font-size: 13px;
  background: var(--color-background-secondary);
  color: var(--color-text-tertiary);
  &:hover {
    color: var(--color-primary);
  }
`;

const EmptyTag = styled.span`
    display: block;
    margin: 15px 0;
    width: 22px;
    height: 6px;
    background: var(--color-border-secondary);
    border-radius: 3px;
}`;

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
    control,
    showLoadMore,
    isLoadingMore,
    setState,
    loadRecords,
    pageIndex,
    onAdd,
    onOpen,
    appId,
  } = props;
  let { records } = props;

  if (control.type === 51 && control.enumDefault === 1) {
    records = records.slice(0, 1);
  }

  const hideTitle = control.type === 51 && control.enumDefault === 1;
  return (
    <Fragment>
      {allowNewRecord && (
        <div className="mBottom10">
          <Button
            color="default"
            variant="textBordered"
            style={ADD_RECORD_BUTTON_STYLE}
            icon={<i className="icon icon-plus Font16" />}
            onClick={onAdd}
          >
            <span className="overflow_ellipsis WordBreak">{entityName || _l('记录')}</span>
          </Button>
        </div>
      )}
      <CardsCon $width={width}>
        {!loading &&
          !!records.length &&
          (showAll || records.length <= colNum * 3 ? records : records.slice(0, colNum * 3)).map((record, i) => (
            <RecordCoverCard
              projectId={projectId}
              viewId={viewId}
              appId={appId}
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
              className="colorPrimary Hand mBottom10 InlineBlock"
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
  const { control, entityName, allowOpenRecord, allowNewRecord, records = [], onAdd, onOpen } = props;

  let valueStyle = {};
  let style = {};

  if (control.type === 51) {
    valueStyle = getValueStyle({ ...control, type: 2, value: '_' });
    style = {
      fontSize: valueStyle.size,
    };
  }

  const recordName = entityName || _l('记录');

  return (
    <div>
      {records.map((record, i) => {
        const text = getTitleTextFromRelateControl(control, record);
        return (
          <RecordText
            $inlineStyle={valueStyle.valueStyle}
            style={style}
            key={i}
            className={cx({ 'colorPrimary Hand': allowOpenRecord, isSingle: records.length === 1 })}
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
            {i < records.length - 1 && <Splitter $inlineStyle={valueStyle.valueStyle}>,</Splitter>}
          </RecordText>
        );
      })}
      {allowNewRecord && (
        <Tooltip title={_l('新建%0', recordName)}>
          <RecordTextAdd style={records.length ? { marginLeft: 13 } : {}} onClick={onAdd}>
            <i className="icon icon-plus"></i>
          </RecordTextAdd>
        </Tooltip>
      )}
    </div>
  );
}

function RelationSearch(props) {
  const {
    isDialog,
    from,
    disabled,
    projectId,
    recordId,
    worksheetId,
    viewId,
    isCharge,
    advancedSetting,
    enumDefault,
    enumDefault2,
    appId,
  } = props;
  const { open: openAddRecord, holder: addRecordHolder } = useAddRecord();
  const { open: openRecordInfo, holder: recordInfoHolder } = useRecordInfo();

  const control = { ...props };
  const controlPermission = controlState(control, from);
  const cache = useRef({});
  const [ref, { width }] = useMeasure();
  const [state, setState] = useState({
    showAll: isDialog,
  });
  const [worksheetAllowAdd, setWorksheetAllowAdd] = useState(true);
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

  const colNum = getCardColNum({
    width: width,
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
      appId,
    });
    cache.current.filter = filterControls;
    if (filterControls === false) {
      setState(oldState => ({ ...oldState, isLoadingMore: false, loading: false }));
      return;
    }

    const { instanceId, workId } = _.get(control, 'dataFormat.current') || {};
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
      langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
      instanceId,
      workId,
    };
    sheetAjax.getRowRelationRows(args).then(res => {
      if (res.resultCode === 7) {
        // 无权限响应不含工作表结构，保留已加载的 controls，避免动态筛选变化触发循环查询。
        setWorksheetAllowAdd(false);
        setState(oldState => ({
          ...oldState,
          loading: false,
          isLoadingMore: false,
          records: [],
          showLoadMore: false,
        }));
        return;
      }

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
    openAddRecord({
      isDraft: control.from === RECORD_INFO_FROM.DRAFT,
      worksheetId: control.dataSource,
      directAdd: true,
      showFillNext: true,
      onAdd: record => {
        if (record) {
          setState(oldState => ({ ...oldState, records: [record, ...(oldState.records || [])] }));
        }
      },
    });
  }, [control.dataSource, control.from, openAddRecord]);
  const handleOpenRecord = needOpenRecordId => {
    addBehaviorLog('worksheetRecord', control.dataSource, { rowId: needOpenRecordId }); // 埋点

    openRecordInfo({
      appId: control.appId,
      worksheetId: control.dataSource,
      recordId: needOpenRecordId,
      viewId: advancedSetting.openview || control.viewId,
    });
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
      appId,
    });

    if (!_.isUndefined(cache.current.filter) && newFilter && !_.isEqual(cache.current.filter, newFilter)) {
      cache.current.filter = newFilter;
      debounceClearAndLoad();
    } else if (!_.isEqual(cache.current.filter, newFilter) && newFilter === false) {
      cache.current.filter = newFilter;
      setState(oldState => ({ ...oldState, loading: false, records: [] }));
    }
  });

  if ((control.type === 51 && control.enumDefault === 1 && control.showControls.length === 0) || !records.length) {
    return (
      <Fragment>
        {addRecordHolder}
        {recordInfoHolder}
        <EmptyTag />
      </Fragment>
    );
  }

  return (
    <Con ref={ref}>
      {addRecordHolder}
      {recordInfoHolder}
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
      {_.get(advancedSetting, 'showtype') === String(RELATION_SEARCH_SHOW_TYPE.CARD) ? (
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
            appId,
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

const Content = styled.div`
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
      open
      type="fixed"
      verticalAlign="bottom"
      width={1300}
      onCancel={onClose}
      title={control.controlName}
      styles={{ body: { padding: 0, position: 'relative' } }}
    >
      <DialogCon>
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

export function useRelationSearchDialog() {
  return useFunctionWrapComponent(RelationSearchDialog);
}

export default function (props) {
  const { isCharge, appId, worksheetId, recordId, disabled, formData, formItemId, updateWorksheetControls } = props;
  const showtype = _.get(props, 'advancedSetting.showtype');

  useWidgetEvent(formItemId, ({ triggerType }) => {
    if (triggerType === 'Enter' && formItemId) {
      const root = document.querySelector(`[data-instance-id="${formItemId}"]`);
      if (!root) return;
      if (showtype === String(RELATION_SEARCH_SHOW_TYPE.EMBED_LIST)) {
        const btn = root.querySelector('.relateRecordMainBtn');
        if (btn) btn.click();
      }
    }
  });

  if (showtype === String(RELATION_SEARCH_SHOW_TYPE.EMBED_LIST)) {
    return (
      <RelateRecordTable
        appId={appId}
        control={{ ...props }}
        isDraft={props.isDraft}
        allowEdit={!disabled}
        recordId={recordId}
        worksheetId={worksheetId}
        formData={formData}
        formItemId={formItemId}
        isCharge={isCharge}
        updateWorksheetControls={updateWorksheetControls}
      />
    );
  } else {
    return <RelationSearch {...props} />;
  }
}
