import React, { useRef, useEffect, Fragment, useCallback } from 'react';
import styled from 'styled-components';
import { LoadDiv, Icon } from 'ming-ui';
import { every, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DndProvider, useDrop } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { emitter } from 'worksheet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import worksheetAjax from 'src/api/worksheet';
import * as boardActions from 'src/pages/worksheet/redux/actions/boardView';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import { getAdvanceSetting, browserIsMobile } from 'src/util';
import { filterAndFormatterControls } from '../util';
import SelectField from '../components/SelectField';
import ViewEmpty from '../components/ViewEmpty';
import Board from './RecordList';
import { ITEM_TYPE } from './config';
import { dealBoardViewData } from './util';
import cx from 'classnames';
import './index.less';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';

export const RecordBoardWrap = styled.div`
  height: 100%;
  padding-right: 14px;
  display: flex;
  .boardFixedWrap {
    margin-left: 14px;
    position: relative;
    display: flex;
    &::before {
      position: absolute;
      top: -20px;
      right: 0;
      width: 1px;
      bottom: 0;
      content: '';
      background: #ddd;
    }
  }
  .boardListWrap {
    flex: 1;
    overflow-x: auto;
    display: flex;
    flex-wrap: nowrap;
    padding: 0 14px;
  }
`;

function BoardView(props) {
  const {
    worksheetId,
    controls,
    getBoardViewPageData,
    isCharge,
    viewId,
    view,
    boardView,
    toCustomWidget,
    saveView,
    sortBoardRecord,
    initBoardViewData,
    clearBoardView,
    setViewConfigVisible,
    filters,
    addRecord,
    updateMultiSelectBoard,
    refreshSheet,
    navGroupFilters,
    ...rest
  } = props;

  const [collect, drop] = useDrop({
    accept: ITEM_TYPE.RECORD,
    hover(props, monitor) {
      function scroll() {
        const $wrap = document.querySelector('.boardListWrap');
        const pos = $wrap.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        if (offset.x < pos.x + 40) {
          $wrap.scrollLeft -= 20;
        }
        if (offset.x + 40 > pos.x + pos.width) {
          $wrap.scrollLeft += 20;
        }
      }
      _.throttle(scroll)();
    },
  });

  const cache = useRef({});
  const $listWrapRef = useRef(null);
  const flagRef = useRef({ preScrollLeft: 0, pending: false });

  const setFlagRef = obj => {
    const { current: flag } = flagRef;
    flagRef.current = { ...flag, ...obj };
  };

  const scrollLoad = () => {
    const $listWrap = _.get($listWrapRef, 'current');
    const { current: flag } = flagRef;
    const { preScrollLeft, pending } = flag;
    const { scrollLeft, scrollWidth, offsetWidth } = $listWrap;
    if (pending) return;
    setFlagRef({ preScrollLeft: scrollLeft });
    // 距离右侧边界还有两个看板的距离 且是在向右滚动  加载下一页看板
    if (scrollLeft + offsetWidth > scrollWidth - 560 && scrollLeft > preScrollLeft) {
      setFlagRef({ pending: true });
      getBoardViewPageData({
        alwaysCallback: () => {
          setFlagRef({ pending: false });
        },
      });
    }
  };

  const scrollHorizontal = e => {
    const $tar = e.target;
    const $listWrap = _.get($listWrapRef, 'current');
    if (!$listWrap) return;
    if (
      (_.includes($tar.className, 'boardViewRecordListWrap') || _.includes($tar.className, 'boardTitleWrap')) &&
      !!e.deltaY
    ) {
      $listWrap.scrollLeft = e.deltaY * 10 + $listWrap.scrollLeft;
    }
  };
  const refresh = useCallback(({ worksheetId }) => {
    if (worksheetId === props.worksheetId && !document.querySelector('.workSheetRecordInfo')) {
      refreshSheet(view);
    }
  });
  const bindEvent = () => {
    const scrollEvent = _.throttle(scrollHorizontal);
    const scrollLoadEvent = _.throttle(scrollLoad);
    const $listWrap = _.get($listWrapRef, 'current');
    document.body.addEventListener('mousewheel', scrollEvent);
    window.addEventListener('resize', scrollEvent);
    if ($listWrap) {
      $listWrap.addEventListener('scroll', scrollLoadEvent);
    }
    emitter.addListener('RELOAD_RECORD_INFO', refresh);
    return () => {
      document.body.removeEventListener('mousewheel', scrollEvent);
      emitter.removeListener('RELOAD_RECORD_INFO', refresh);
      window.removeEventListener('resize', scrollEvent);
      if ($listWrap) {
        $listWrap.removeEventListener('scroll', scrollLoadEvent);
      }
    };
  };

  useEffect(() => {
    const unBindEvent = bindEvent();
    return () => {
      clearBoardView();
      unBindEvent();
    };
  }, []);

  useEffect(() => {
    if (
      cache.current.prevColorId &&
      view.advancedSetting.colorid &&
      view.advancedSetting.colorid !== cache.current.prevColorId
    ) {
      // 修改颜色字段时晚一点取, 不然返回的数据还是不包括新改的字段的值
      setTimeout(() => {
        initBoardViewData();
      }, 200);
    } else {
      initBoardViewData();
    }
    cache.current.prevColorId = view.advancedSetting.colorid;
  }, [
    viewId,
    view.viewControl,
    view.coverCid,
    view.advancedSetting.navshow,
    JSON.stringify(view.advancedSetting.navfilters),
    view.advancedSetting.freezenav,
    view.advancedSetting.navempty,
    JSON.stringify(view.moreSort),
    view.advancedSetting.colorid,
    JSON.stringify(navGroupFilters),
    view.advancedSetting.navsorts,
    view.advancedSetting.customitems,
  ]);

  const handleSelectField = obj => {
    if (!isCharge) return;
    const nextView = { ...view, ...obj };
    const advancedSetting = _.omit(nextView.advancedSetting || {}, [
      'navfilters',
      'topfilters',
      'topshow',
      'customitems',
      'customnavs',
    ]);
    if (advancedSetting.navshow && _.get(nextView, 'viewControl')) {
      let control = controls.find(o => o.controlId === _.get(nextView, 'viewControl'));
      let type = control.type;
      if (type === 30) {
        type = control.sourceControlType;
      }
      advancedSetting.navshow = [26, 27, 48].includes(type) ? '1' : '0';
    }
    nextView.advancedSetting = advancedSetting;
    setViewConfigVisible(true);
    saveView(viewId, nextView, () => {
      initBoardViewData(nextView);
    });
  };

  const selectControl = () => {
    const { viewControl } = view;
    return _.find(controls, item => item.controlId === viewControl);
  };

  // 记录排序
  const sortRecord = obj => {
    const { rowId, value, rawRow } = obj;
    const { viewControl } = view;
    const para = {
      rowId,
      ..._.pick(props, ['appId', 'worksheetId', 'viewId', 'projectId']),
      newOldControl: [{ ..._.pick(selectControl(), ['controlId', 'type', 'controlName', 'dot']), value }],
    };
    if (Reflect.has(obj, 'rawRow')) {
      const originData = JSON.parse(rawRow) || {};
      worksheetAjax.updateWorksheetRow(para).then(res => {
        if (!isEmpty(res.data)) {
          // 后端更新后返回的权限不准 使用获取时候的权限
          const originAuth = _.pick(originData, ['allowedit', 'allowdelete']);
          updateMultiSelectBoard({
            rowId,
            item: { ...res.data, ...originAuth },
            prevValue: originData[viewControl],
            currentValue: value,
          });
        } else {
          alert(_l('拖拽更新失败!'), 2);
        }
      });
      return;
    }
    sortBoardRecord({
      ...obj,
      ...para,
    });
  };

  const renderContent = () => {
    const { boardViewLoading = true, boardData } = boardView;
    const { sheetSwitchPermit } = props;
    const { viewControl } = view;
    const viewData = dealBoardViewData({ view, controls, data: boardData });
    const { navshow, freezenav } = getAdvanceSetting(view);
    // 选择了控件作为看板且控件没有被删除
    const isHaveSelectControl =
      viewControl &&
      _.find(setSysWorkflowTimeControlFormat(controls, sheetSwitchPermit), item => item.controlId === viewControl);
    if (!isHaveSelectControl) {
      return (
        <SelectField
          sheetSwitchPermit={sheetSwitchPermit}
          isCharge={isCharge}
          fields={filterAndFormatterControls({
            controls: controls,
            formatter: ({ controlName, controlId, type }) => ({
              text: controlName,
              value: controlId,
              icon: getIconByType(type),
            }),
          })}
          handleSelect={handleSelectField}
          toCustomWidget={toCustomWidget}
        />
      );
    }

    const renderBoard = (fixFirst = false) => {
      // 显示指定项、显示全部 不做空数据的判断
      if (
        every(viewData, item => isEmpty(item.rows)) &&
        !_.includes(['0', '2'], view.advancedSetting.navshow) &&
        !fixFirst
      ) {
        return <ViewEmpty filters={filters} viewFilter={view.filters || []} />;
      }

      return (
        !browserIsMobile()
          ? (viewData || []).slice(freezenav === '1' && !fixFirst ? 1 : 0, fixFirst ? 1 : undefined)
          : viewData || []
      ).map((board, index) => {
        if (!(_.get(board, 'rows') || []).length && !fixFirst) {
          // 看板无数据时 当配置隐藏无数据看板或看板本身是未分类时 看板不显示
          if (board.noGroup || navshow === '1') return null;
        }

        return (
          <Board
            {...boardView}
            key={index}
            index={index}
            list={board}
            viewData={viewData}
            view={view}
            worksheetId={worksheetId}
            viewControl={viewControl}
            sortRecord={sortRecord}
            selectControl={selectControl()}
            addRecord={addRecord}
            {..._.pick(props, [
              'appId',
              'viewId',
              'searchRow',
              'updateBoardViewData',
              'isCharge',
              'sheetSwitchPermit',
              'fieldShowCount',
            ])}
            {...rest}
          />
        );
      });
    };

    return (
      <Fragment>
        {!boardViewLoading && freezenav === '1' && !browserIsMobile() && (
          <div className="boardFixedWrap">{renderBoard(true)}</div>
        )}

        <div
          className={cx('boardListWrap', { pLeft0: browserIsMobile() })}
          ref={$listWrapRef}
          style={{ paddingLeft: freezenav === '1' ? 0 : 14 }}
        >
          {boardViewLoading ? <LoadDiv /> : renderBoard()}
        </div>
      </Fragment>
    );
  };

  return (
    <div className="worksheetBoardViewWrap" ref={drop}>
      <RecordBoardWrap>{renderContent()}</RecordBoardWrap>
    </div>
  );
}

const ConnectedBoardView = connect(
  state =>
    _.pick(state.sheet, [
      'boardView',
      'worksheetInfo',
      'filters',
      'controls',
      'sheetSwitchPermit',
      'sheetButtons',
      'navGroupFilters',
      'fieldShowCount',
    ]),
  dispatch => bindActionCreators({ ...boardActions, ...baseAction }, dispatch),
)(BoardView);

export default function Wrap(props) {
  return (
    <DndProvider key="board" context={window} backend={HTML5Backend}>
      <ConnectedBoardView {...props} />
    </DndProvider>
  );
}
