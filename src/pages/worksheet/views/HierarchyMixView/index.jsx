import React, { Fragment, useRef, useEffect, useState, useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { bindActionCreators } from 'redux';
import { useSetState } from 'react-use';
import { connect } from 'react-redux';
import styled from 'styled-components';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import worksheetAjax from 'src/api/worksheet';
import { isAllowQuickSwitch, isDisabledCreate, isTextTitle, getSearchData } from '../util';
import { hierarchyViewCanSelectFields } from '../HierarchyView/util';
import { ITEM_TYPE, SCROLL_CONFIG } from '../HierarchyView/config';
import * as hierarchyActions from 'worksheet/redux/actions/hierarchy';
import * as viewActions from 'worksheet/redux/actions/index';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import { updateWorksheetControls, updateWorksheetInfo } from '../../redux/actions';
import ToolBar from '../HierarchyView/ToolBar';
import SelectField from '../components/SelectField';
import ViewEmpty from '../components/ViewEmpty';
import VertricalTreeNode from '../HierarchyVerticalView/components/VertricalTreeNode';
import DragLayer from '../HierarchyView/components/DragLayer';
import EmptyHierarchy from '../HierarchyView/EmptyHierarchy';
import './index.less';
import { emitter } from 'src/util';

const RecordStructureWrap = styled.div`
  padding-left: 48px;
  height: 100%;
  overflow: auto;
  ::-webkit-scrollbar-x {
    height: 14px;
  }
`;

const SortableTreeWrap = styled.div`
  position: relative;
  transform-origin: left top;
  transform: ${props => (props.scale ? `scale(${props.scale / 100})` : 'scale(1)')};
  width: fit-content;
  margin: 0 auto;
  .nodeWrap {
    position: relative;
    display: flex;
    align-items: flex-start;
    canvas.nodeItemCanvas {
      position: absolute;
      top: 50%;
      left: -120px;
      width: 120px;
    }
  }
  .childNodeWrap {
    transform: translateX(120px);
  }
`;

function HierarchyMix(props) {
  const {
    view,
    viewId,
    controls,
    isCharge,
    toCustomWidget,
    filters,
    hierarchyDataStatus,
    getHierarchyRecord,
    hierarchyTopLevelDataCount,
    changeWorksheetStatusCode,
    addHierarchyRecord,
    hierarchyViewData,
    hierarchyViewState,
    sheetSwitchPermit,
    worksheetId,
    addTextTitleRecord,
    worksheetInfo,
    hierarchyRelateSheetControls,
    addHierarchyChildrenRecord,
    addTopLevelStateFromTemp,
    getTopLevelHierarchyData,
    saveView,
    updateWorksheetControls,
    updateWorksheetInfo,
    expandedMultiLevelHierarchyData,
    expandMultiLevelHierarchyDataOfMultiRelate,
    getDefaultHierarchyData,
    setViewConfigVisible,
    getAssignChildren,
    changeHierarchyChildrenVisible,
    initHierarchyRelateSheetControls,
    recordInfoId,
    navGroupFilters,
    ...rest
  } = props;
  const IS_MOBILE = browserIsMobile();
  const uniqId = useMemo(() => uuidv4());
  const { scale: configScale, level: configLevel = '' } = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
  const { loading, pageIndex } = hierarchyDataStatus;
  const [{ addRecordDefaultValue, level, scale, createRecordVisible, addRecordPath }, setState] = useSetState({
    scale: (!IS_MOBILE && configScale) || 100,
    level: configLevel,
    addRecordDefaultValue: '',
    createRecordVisible: false,
    addRecordPath: {},
  });

  const [collect, drop] = useDrop({
    accept: ITEM_TYPE.ITEM,
    hover(item, monitor) {
      function scroll() {
        const $wrap = document.querySelector('.hierarchyViewMinWrap');
        const pos = $wrap.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        const { SCROLL_LIMIT, SCROLL_STEP } = SCROLL_CONFIG;

        // 向左滚动
        if (offset.x < pos.x + SCROLL_LIMIT) {
          $wrap.scrollLeft -= SCROLL_STEP;
        }
        // 向右滚动
        if (offset.x + SCROLL_LIMIT > pos.x + pos.width) {
          $wrap.scrollLeft += SCROLL_STEP;
        }
        if (offset.y < pos.y + SCROLL_LIMIT) {
          $wrap.scrollTop -= SCROLL_STEP;
        }
        if (offset.y + SCROLL_LIMIT > pos.y + pos.height) {
          $wrap.scrollTop += SCROLL_STEP;
        }
      }
      _.throttle(scroll)();
    },
  });

  const { viewControl, viewControls } = view;
  const $wrapRef = useRef(null);
  const [scrollMiddleSign, setScrollMiddleSign] = useState(false);

  const scrollToMiddle = () => {
    let $ele = document.querySelector('.hierarchyViewMinWrap');
    if (scrollMiddleSign || !$ele) return;
    setScrollMiddleSign(true);
    const viewWidth = $ele.offsetWidth;
    const $scrollWrap = _.get($wrapRef, 'current');
    if ($scrollWrap.scrollWidth <= viewWidth) return;
    $scrollWrap.scrollLeft = ($scrollWrap.scrollWidth - viewWidth) / 2;
  };

  useEffect(() => {
    if (loading || scrollMiddleSign || pageIndex !== 1) return;
    if (!hierarchyViewState || hierarchyViewState.length === 0) return;

    scrollToMiddle();
  }, []);

  useEffect(() => {
    getDefaultHierarchyData();
    const { level } = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
    level && setState({ level: level });
    // 多表关联把所有的关联控件获取到 以便后续展示
    const { viewType, childType } = view;
    if (viewType === 2 && childType === 2) {
      const ids = (viewControls || []).slice(1).map(item => item.worksheetId);
      worksheetAjax
        .getWorksheetsControls({ worksheetIds: ids, handControlSource: true, appId: _.get(props, 'appId') })
        .then(({ code, data }) => {
          if (code === 1) {
            const relateControls = ids.map(id =>
              _.get(_.find(data || [], i => i.worksheetId === id) || {}, 'controls'),
            );
            initHierarchyRelateSheetControls({ ids, controls: relateControls });
          }
        });
    }
  }, [
    viewId,
    viewControl,
    viewControls.map(item => item.worksheetId).join(','),
    _.get(view, 'advancedSetting.topshow'),
    _.get(view, 'advancedSetting.topfilters'),
    _.get(view, 'advancedSetting.defaultlayer'),
    JSON.stringify(navGroupFilters),
  ]);

  const genScreenshot = () => {
    const $wrap = document.querySelector('.hierarchyViewMinWrap');
    const height = $wrap.scrollHeight;
    const width = $wrap.scrollWidth;
    let copyDom = $wrap.cloneNode(true);
    copyDom.style.width = width;
    copyDom.style.height = height;
    document.querySelector('body').appendChild(copyDom);
    const name = (view.name || 'scrennshot') + '.png';
    try {
      domtoimage.toBlob(copyDom, { bgcolor: '#f5f5f5', width: width, height: height }).then(function (blob) {
        saveAs(blob, name);
        document.querySelector('body').removeChild(copyDom);
      });
    } catch (error) {
      alert(_l('生成失败'), 2);
      document.querySelector('body').removeChild(copyDom);
    }
  };

  const handleToolClick = (type, obj) => {
    if (type === 'genScreenshot') {
      genScreenshot();
    }
    if (type === 'toOrigin') {
      const $wrap = _.get(this.$wrap, 'current');
      $wrap.scrollLeft = 0;
      $wrap.scrollTop = 0;
    }
    if (type === 'adjustScale') {
      setState({ scale: obj.scale });
    }
  };

  const handleSelectField = obj => {
    if (!isCharge) return;
    setViewConfigVisible(true);
    saveView(viewId, { ...obj, viewType: 2 }, newView => {
      getDefaultHierarchyData(newView);
      worksheetAjax
        .getWorksheetInfo({
          worksheetId: worksheetId,
          getTemplate: true,
        })
        .then(res => {
          const allControls = _.get(res, 'template.controls') || [];
          updateWorksheetControls(allControls);
          updateWorksheetInfo(res);
        });
    });
  };

  const updateView = obj => {
    saveView(viewId, { ...view, ...obj });
  };

  const toggleChildren = ({ rowId, visible, ...rest }) => {
    if (level) {
      setState({ level: '' });
    }
    // 展开时需要拉数据
    if (visible) {
      const { viewControls, childType } = view;
      if (childType === 2) {
        const level = rest.path.length;
        const { controlId, worksheetId: relationWorksheetId } = viewControls[level] || {};
        getAssignChildren({
          kanbanKey: rowId,
          controlId,
          relationWorksheetId,
          isGetWorksheet: true,
          sortControls: [{ controlId: 'ctime', isAsc: true, datatype: 16 }],
          ...rest,
        });
      } else {
        getAssignChildren({ kanbanKey: rowId, ...rest });
      }
    } else {
      changeHierarchyChildrenVisible({ visible, ...rest });
    }
  };

  const createTextTitleTempRecord = ({ pathId, visible, pid, ...rest }) => {
    const rowId = uuidv4();
    // 记录不是顶级且子级没有展开则先展开子级
    if (pathId.length > 0 && !visible) {
      toggleChildren({
        rowId: pid,
        visible: true,
        ...rest,
        callback: () => {
          addTextTitleRecord({
            pathId: pathId.concat(rowId),
            rowId,
            pid,
            ...rest,
          });
        },
      });
    } else {
      addTextTitleRecord({ pathId: pathId.concat(rowId), rowId, pid, ...rest });
    }
  };

  const handleAddRecord = obj => {
    const { isTextTitle, value = '', pid, visible, ...rest } = obj;
    if (isTextTitle && isAllowQuickSwitch(sheetSwitchPermit)) {
      createTextTitleTempRecord({ ...rest, visible, pid });
      setState({ addRecordDefaultValue: value, addRecordPath: rest });
    } else {
      setState({
        createRecordVisible: true,
        addRecordDefaultValue: value,
        addRecordPath: rest,
      });
    }
  };

  const getNewRecordPara = ({ path, pathId }) => {
    const { viewControls, childType, viewId } = view;
    // 兼容错误格式{path: [],pathId: ['12123']},顶级记录
    if (pathId.length > 0 && String(childType) === '2' && viewControls.length > 1) {
      const { worksheetId, worksheetName, controlId } = viewControls[_.isEmpty(path) ? 0 : pathId.length];
      const { worksheetId: masterWorksheetId } = viewControls[pathId.length - 1];
      return {
        worksheetId,
        entityName: worksheetName,
        showFillNext: true,
        masterRecord: {
          rowId: _.last(pathId),
          controlId: controlId,
          worksheetId: masterWorksheetId,
        },
      };
    }
    return {
      ..._.pick(worksheetInfo, ['worksheetId', 'entityName', 'projectId']),
      viewId,
    };
  };

  const scrollToRight = () => {
    const $dom = _.get($wrapRef, 'current');
    if (!$dom) return;

    if ($dom.scrollLeft > 0) {
      $dom.scrollLeft = $dom.scrollWidth;
    }
  };

  const createTextTitleRecord = (value, spliceTempRecord = false) => {
    const idPara = _.pick(props, ['appId', 'viewId']);
    const isTextTitle = item => item.attribute === 1 && item.type === 2;
    const { viewControl } = view;
    const filteredControls = _.filter(
      controls,
      item => isTextTitle(item) || item.controlId === viewControl || !!_.get(item, 'advancedSetting.defsource'),
    );
    const getReceiveControls = val =>
      filteredControls.map(item => {
        if (isTextTitle(item)) return { ..._.pick(item, ['controlId', 'type']), value: val };

        const defsource = safeParse(_.get(item, 'advancedSetting.defsource'));

        return {
          ..._.pick(item, ['controlId', 'type']),
          value: item.controlId === viewControl ? addRecordDefaultValue : _.get(defsource, '[0].staticValue'),
        };
      });
    if (Array.isArray(value)) {
      worksheetAjax
        .addWSRowsBatch({
          worksheetId,
          ...idPara,
          receiveRows: value.map(item => getReceiveControls(item)),
        })
        .then(res => {
          emitter.emit('ROWS_UPDATE');
          if (res === value.length) {
            if (_.isEmpty(addRecordPath.path)) {
              getTopLevelHierarchyData({ worksheetId, ...idPara });
            }
            toggleChildren({
              ...addRecordPath,
              rowId: _.last(addRecordPath.pathId),
              visible: true,
            });
          }
        });
    } else {
      worksheetAjax
        .addWorksheetRow({
          worksheetId,
          ...idPara,
          receiveControls: getReceiveControls(value),
        })
        .then(({ data }) => {
          if (data) {
            emitter.emit('ROWS_UPDATE');
            if (_.isEmpty(addRecordPath.path)) {
              addTopLevelStateFromTemp(data);
            } else {
              addHierarchyChildrenRecord({
                data,
                ...addRecordPath,
                spliceTempRecord,
              });
            }
            scrollToRight();
          }
        });
    }
  };

  let pending = false;
  const handleScroll = e => {
    const $wrap = $wrapRef.current;
    const $right = $wrap.scrollWidth - $wrap.scrollLeft - $wrap.clientWidth;
    if ($right < Math.min(280, $wrap.clientWidth / 2)) {
      const hasMoreData =
        (_.toArray(hierarchyViewData).filter(item => !item.pid) || []).length < hierarchyTopLevelDataCount;
      if (hasMoreData && !pending) {
        pending = true;
        getHierarchyRecord({ pageSize: 50, pageIndex: pageIndex + 1 }, () => (pending = false));
      }
    }
  };

  // 展开多级
  const showLevelData = obj => {
    const isCurrentSheetRelate = _.get(view, 'childType') !== 2;
    setState({ level: obj.layer });
    if (isCurrentSheetRelate) {
      expandedMultiLevelHierarchyData(obj);
    } else {
      expandMultiLevelHierarchyDataOfMultiRelate(+obj.layer);
    }
  };

  const getDefaultValueInCreate = () => {
    const { viewControl, childType, viewControls } = view;
    // 多表关联根据控件id获取默认关联
    if (childType === 2) {
      const index = addRecordPath.path.length;
      const sourceControlId = (viewControls[index] || {}).controlId;
      const { worksheetId: relateSheetId } = viewControls[index] || {};
      const { controlId } =
        (hierarchyRelateSheetControls[relateSheetId] || []).find(item => item.sourceControlId === sourceControlId) ||
        {};
      return { [controlId]: addRecordDefaultValue };
    }
    return { [viewControl]: addRecordDefaultValue };
  };

  const renderContent = () => {
    const { viewControl, viewType, viewId, layersName = [], viewControls, advancedSetting = {} } = view;
    const hierarchyData = hierarchyViewCanSelectFields({
      controls,
      worksheetId,
    });
    const isHaveSelectControl =
      viewControl === 'create' ||
      (viewControl &&
        _.find(controls, item => item.controlId === viewControl) &&
        hierarchyData.map(o => o.value).includes(viewControl)) ||
      !_.isEmpty(viewControls);
    let isNarrow = advancedSetting.coverposition === '2';

    if (!isHaveSelectControl) {
      return (
        <SelectField
          isCharge={isCharge}
          viewType={viewType}
          controls={controls}
          worksheetInfo={worksheetInfo}
          fields={hierarchyData}
          updateView={updateView}
          handleSelect={handleSelectField}
          toCustomWidget={toCustomWidget}
        />
      );
    }

    if (loading) {
      return <LoadDiv />;
    }

    if (!_.isEmpty(viewControls) && viewControls.length > 1) {
      let sign = viewControls.slice(1).some(item => {
        return (
          isNarrow && (item.advancedSetting || {}).coverposition && (item.advancedSetting || {}).coverposition !== '2'
        );
      });
      if (sign) isNarrow = false;
    }

    const showTopAdd =
      !isDisabledCreate(sheetSwitchPermit) &&
      !_.isEmpty(hierarchyViewData) &&
      (viewControl || !_.isEmpty(viewControls)) &&
      !(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage'));

    return (
      <RecordStructureWrap
        className="hierarchyViewMinWrap"
        ref={$wrapRef}
        style={IS_MOBILE ? { paddingLeft: '20px', paddingRight: '20px' } : { paddingRight: '24px' }}
        onScroll={_.throttle(handleScroll)}
      >
        {(_.isEmpty(hierarchyViewState) && (filters.keyWords || !_.isEmpty(filters.filterControls))) ||
        (_.isEmpty(hierarchyViewState) && IS_MOBILE) ? (
          <ViewEmpty filters={filters} viewFilter={view.filters || []} />
        ) : (
          <Fragment>
            <SortableTreeWrap scale={scale} id={viewId}>
              {_.isEmpty(hierarchyViewState) ? (
                <EmptyHierarchy
                  layersName={layersName}
                  needTitle={false}
                  updateLayersName={names => saveView(viewId, { layersName: names })}
                  allowAdd={worksheetInfo.allowAdd}
                  onAdd={() =>
                    handleAddRecord({
                      isTextTitle: isTextTitle(controls),
                      path: [],
                      pathId: [],
                    })
                  }
                />
              ) : (
                <VertricalTreeNode
                  isRoot={true}
                  {..._.pick(props, [
                    'hierarchyRelateSheetControls',
                    'deleteHierarchyRecord',
                    'hideHierarchyRecord',
                    'updateHierarchyData',
                    'appId',
                    'worksheetInfo',
                    'sheetSwitchPermit',
                    'sheetButtons',
                  ])}
                  {...rest}
                  uniqId={uniqId}
                  key={hierarchyViewData.length === 1 ? hierarchyViewData[0].pathId.join('-') : 'root'}
                  index={0}
                  data={hierarchyViewState.length === 1 ? hierarchyViewState[0] : hierarchyViewState}
                  scale={scale / 100}
                  depth={0}
                  view={view}
                  isCharge={isCharge}
                  stateTree={hierarchyViewState}
                  treeData={hierarchyViewData}
                  controls={controls}
                  handleAddRecord={handleAddRecord}
                  toggleChildren={toggleChildren}
                  viewId={viewId}
                  worksheetId={worksheetId}
                  allowAdd={worksheetInfo.allowAdd}
                  recordInfoId={recordInfoId}
                  createTextTitleRecord={createTextTitleRecord}
                  broCount={1}
                  isNarrow={isNarrow}
                  isMix={true}
                  showTopAdd={showTopAdd}
                />
              )}
            </SortableTreeWrap>
          </Fragment>
        )}
      </RecordStructureWrap>
    );
  };

  return (
    <div ref={drop} className="structureViewWrap">
      <DragLayer
        scale={scale}
        treeData={hierarchyViewData}
        controls={controls}
        isCharge={isCharge}
        currentView={view}
        hierarchyRelateSheetControls={hierarchyRelateSheetControls}
      />
      {(viewControl || !_.isEmpty(viewControls)) && (
        <ToolBar
          currentView={view}
          scale={scale}
          level={level}
          onClick={handleToolClick}
          showLevelData={showLevelData}
          searchData={props.searchData}
          updateSearchRecord={props.updateSearchRecord}
          view={view}
        />
      )}
      {renderContent()}
      {createRecordVisible && (
        <NewRecord
          showFillNext
          visible
          onAdd={record => {
            addHierarchyRecord({ data: record, ...addRecordPath });
          }}
          hideNewRecord={() => setState({ createRecordVisible: false })}
          defaultFormData={getDefaultValueInCreate()}
          changeWorksheetStatusCode={changeWorksheetStatusCode}
          {...getNewRecordPara(addRecordPath)}
        />
      )}
    </div>
  );
}

const ConnectedHierarchyMixView = connect(
  state => ({
    ..._.pick(state.sheet, [
      'worksheetInfo',
      'filters',
      'controls',
      'sheetSwitchPermit',
      'sheetButtons',
      'navGroupFilters',
    ]),
    ..._.get(state.sheet, 'hierarchyView'),
    searchData: getSearchData(state.sheet),
  }),
  dispatch =>
    bindActionCreators({ ...hierarchyActions, ...viewActions, updateWorksheetControls, updateWorksheetInfo }, dispatch),
)(HierarchyMix);

export default function HierarchyMixView(props) {
  return (
    <DndProvider context={window} backend={HTML5Backend}>
      <ConnectedHierarchyMixView {...props} />
    </DndProvider>
  );
}
