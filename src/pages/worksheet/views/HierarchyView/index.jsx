import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider, useDrop } from 'react-dnd-latest';
import { useSetState } from 'react-use';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { LoadDiv } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import * as hierarchyActions from 'worksheet/redux/actions/hierarchy';
import * as viewActions from 'worksheet/redux/actions/index';
import { getDynamicValue } from 'src/components/newCustomFields/tools/formUtils.js';
import { browserIsMobile } from 'src/utils/common';
import { emitter } from 'src/utils/common';
import { updateWorksheetControls, updateWorksheetInfo } from '../../redux/actions';
import SelectField from '../components/SelectField';
import ViewEmpty from '../components/ViewEmpty';
import { getSearchData, isAllowQuickSwitch, isDisabledCreate, isTextTitle } from '../util';
import DragLayer from './components/DragLayer';
import LayerTitle from './components/LayerTitle';
import LeftBoundary from './components/LeftBoundary';
import TreeNode from './components/TreeNode';
import { ITEM_TYPE, SCROLL_CONFIG } from './config';
import EmptyHierarchy from './EmptyHierarchy';
import ToolBar from './ToolBar';
import { hierarchyViewCanSelectFields } from './util';
import './index.less';

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
  .nodeWrap {
    position: relative;
    display: flex;
    align-items: flex-start;
    canvas.nodeItemCanvas {
      position: absolute;
      top: 50%;
      left: ${props => (props.isStraightLine ? '-100px' : '-120px')};
      width: ${props => (props.isStraightLine ? '100px' : '120px')};
    }
  }
  .childNodeWrap {
    transform: ${props => (props.isStraightLine ? 'translateX(100px)' : 'translateX(120px)')};
  }
`;

function Hierarchy(props) {
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
    mobileViewType,
    refreshSheet,
    ...rest
  } = props;

  const uniqId = useMemo(() => uuidv4());
  const { scale: configScale, level: configLevel = '' } = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
  const { loading, pageIndex } = hierarchyDataStatus;
  const [{ addRecordDefaultValue, level, scale, createRecordVisible, addRecordPath }, setState] = useSetState({
    scale: (!browserIsMobile() && configScale) || 100,
    level: configLevel,
    addRecordDefaultValue: '',
    createRecordVisible: false,
    addRecordPath: {},
  });
  const [, drop] = useDrop({
    accept: ITEM_TYPE.ITEM,
    hover(item, monitor) {
      function scroll() {
        const $wrap = document.querySelector('.hierarchyViewWrap');
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
  const cache = useRef({});
  const [refreshFlag, setRefreshFlag] = useState();

  useEffect(() => {
    if (!cache.current.didMount) return;
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
    JSON.stringify(view.moreSort),
    viewControls.map(item => item.worksheetId).join(','),
    _.get(view, 'advancedSetting.topshow'),
    _.get(view, 'advancedSetting.topfilters'),
    _.get(view, 'advancedSetting.defaultlayer'),
    _.get(view, 'advancedSetting.viewtitle'),
    JSON.stringify(navGroupFilters),
    refreshFlag,
  ]);

  useEffect(() => {
    if (!cache.current.didMount) {
      cache.current.didMount = true;
      setRefreshFlag(Math.random());
    }
  }, []);

  const genScreenshot = () => {
    const $wrap = document.querySelector('.hierarchyViewWrap');
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
      console.log(error);
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
    if (isTextTitle && isAllowQuickSwitch(sheetSwitchPermit, viewId)) {
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
  const scrollToBottom = () => {
    const $dom = _.get($wrapRef, 'current');
    if (!$dom) return;

    // 底部空间不够才滚动到底部
    if ($dom.scrollHeight - $dom.scrollTop < 100) {
      $dom.scrollTop = $dom.scrollHeight;
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
        const staticValue = _.get(defsource, '[0].staticValue');

        return {
          ..._.pick(item, ['controlId', 'type']),
          value:
            item.controlId === viewControl
              ? addRecordDefaultValue
              : staticValue
                ? getDynamicValue(filteredControls, item)
                : '',
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
            scrollToBottom();
          }
        });
    }
  };
  let pending = false;
  const handleScroll = () => {
    const $wrap = $wrapRef.current;
    const $bottom = $wrap.scrollHeight - $wrap.scrollTop - $wrap.clientHeight;
    if ($bottom < Math.min(280, $wrap.clientHeight / 2)) {
      const hasMoreData =
        (_.toArray(hierarchyViewData).filter(item => !item.pid) || []).length < hierarchyTopLevelDataCount;
      if (hasMoreData && !pending) {
        pending = true;
        getHierarchyRecord({ pageSize: 50, pageIndex: pageIndex + 1 }, () => (pending = false));
      }
    }
  };
  // 获取层级数
  const getLayerCount = arr => {
    if (!arr.length) return 0;
    const len = arr.map(item => {
      if (typeof item === 'string') return 0;
      if (_.every(item.children, item => typeof item === 'string')) return item.path.length;
      if (item.visible !== 'undefined' && !item.visible) return (item.path || []).length;
      return item.children.length ? getLayerCount(item.children) : item.path.length;
    });
    return len;
  };

  const getLayerLength = () => {
    if (view.childType === 2) return (view.viewControls || []).length || 1;
    return _.max(_.flattenDeep(getLayerCount(hierarchyViewState))) || 1;
  };

  const initLayerTitle = currentView => {
    const { viewControls, childType } = currentView;
    if (childType === 2) return viewControls.map(item => item.controlName || item.worksheetName);
    return _.fill(Array.from({ length: getLayerLength() }), '');
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
    const { viewControl, viewType, viewId, layersName = [], viewControls } = view;
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
          refreshSheet={() => refreshSheet(view)}
        />
      );
    }

    const renderHierarchy = () => {
      const { advancedSetting = {} } = view;
      return (isEmpty(hierarchyViewState) && (filters.keyWords || !isEmpty(filters.filterControls))) ||
        (isEmpty(hierarchyViewState) && browserIsMobile()) ? (
        <ViewEmpty filters={filters} viewFilter={view.filters || []} />
      ) : (
        <Fragment>
          {_.keys(hierarchyViewData).length > 0 && (
            <LayerTitle
              scale={scale}
              layerLength={getLayerLength()}
              layersName={_.isEmpty(layersName) ? initLayerTitle(view) : layersName}
              updateLayersName={names => saveView(viewId, { layersName: names })}
              isStraightLine={advancedSetting.hierarchyViewConnectLine === '1'}
            />
          )}
          <SortableTreeWrap scale={scale} id={viewId} isStraightLine={advancedSetting.hierarchyViewConnectLine === '1'}>
            {_.isEmpty(hierarchyViewState) ? (
              <EmptyHierarchy
                layersName={layersName}
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
              hierarchyViewState.map((item, index) => {
                return (
                  <TreeNode
                    {..._.pick(props, [
                      'hierarchyRelateSheetControls',
                      'deleteHierarchyRecord',
                      'hideHierarchyRecord',
                      'updateHierarchyData',
                      'appId',
                      'worksheetInfo',
                      'sheetSwitchPermit',
                      'sheetButtons',
                      'hierarchyTopLevelDataCount',
                    ])}
                    {...rest}
                    uniqId={uniqId}
                    key={item.pathId.join('-')}
                    index={index}
                    data={item}
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
                  />
                );
              })
            )}
          </SortableTreeWrap>
        </Fragment>
      );
    };

    return (
      <RecordStructureWrap
        className="hierarchyViewWrap"
        ref={$wrapRef}
        onScroll={_.throttle(handleScroll)}
        style={browserIsMobile() ? { paddingLeft: '20px' } : {}}
      >
        {loading ? <LoadDiv /> : renderHierarchy()}
      </RecordStructureWrap>
    );
  };
  return (
    <div ref={drop} className="structureViewWrap">
      {!browserIsMobile() && (
        <LeftBoundary
          {..._.pick(props, ['becomeTopLevelRecord'])}
          showAdd={
            !isDisabledCreate(sheetSwitchPermit) &&
            !_.isEmpty(hierarchyViewData) &&
            (viewControl || !_.isEmpty(viewControls)) &&
            !(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage'))
          }
          onClick={() =>
            handleAddRecord({
              isTextTitle: isTextTitle(controls),
              path: [],
              pathId: [],
            })
          }
        />
      )}
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
          mobileViewType={mobileViewType}
          hierarchyTopLevelDataCount={hierarchyTopLevelDataCount}
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
const ConnectedHierarchyView = connect(
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
    mobileViewType: _.get(state.mobile, ['base', 'type']),
  }),
  dispatch =>
    bindActionCreators({ ...hierarchyActions, ...viewActions, updateWorksheetControls, updateWorksheetInfo }, dispatch),
)(Hierarchy);

export default function HierarchyView(props) {
  return (
    <DndProvider context={window} backend={HTML5Backend}>
      <ConnectedHierarchyView {...props} />
    </DndProvider>
  );
}
