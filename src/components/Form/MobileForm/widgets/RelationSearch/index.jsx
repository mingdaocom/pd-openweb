import React, { useCallback, useEffect, useState, useRef, Fragment } from 'react';
import { LoadDiv } from 'ming-ui';
import { controlState } from '../../../core/formUtils';
import { RECORD_INFO_FROM, RELATION_SEARCH_SHOW_TYPE } from '../../../core/enum';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import sheetAjax from 'src/api/worksheet';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/util';
import { openAddRecord } from 'mobile/Record/addRecord';
import { RecordInfoModal } from 'mobile/Record';
import { replaceControlsTranslateInfo } from 'src/pages/worksheet/util';
import Cards from './Cards';
import Texts from './Text';
import _ from 'lodash';

const PAGE_SIZE = 50;

export default function RelationSearch(props) {
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
    enumDefault2,
  } = props;

  const control = { ...props };
  const controlPermission = controlState(control, from);
  const cache = useRef({});
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
      getType: 7,
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
  });
  const handleOpenRecord = useCallback(needOpenRecordId => {
    addBehaviorLog('worksheetRecord', control.dataSource, { rowId: needOpenRecordId }); // 埋点
    handlePushState('page', `relateRecord-${recordId}`);
    setRecordInfoVisible(true);
    setOpenRecordId(needOpenRecordId);
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
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, [recordInfoVisible]);

  if ((control.type === 51 && control.enumDefault === 1 && control.showControls.length === 0) || !records.length) {
    return <div className="customFormNull" />;
  }

  return (
    <Fragment>
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
      _.get(advancedSetting, 'showtype') === String(RELATION_SEARCH_SHOW_TYPE.LIST) ? (
        <Cards
          {...{
            loading,
            entityName,
            allowOpenRecord,
            allowNewRecord,
            records,
            showAll,
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
    </Fragment>
  );
}
