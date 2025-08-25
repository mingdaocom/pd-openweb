import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrop } from 'react-dnd-latest';
import { every, isEmpty } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { emitter } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import SelectField from '../../components/SelectField';
import ViewEmpty from '../../components/ViewEmpty';
import { filterAndFormatterControls } from '../../util';
import CustomDragLayer from '../components/CustomDragLayer';
import { ITEM_TYPE } from '../config';
import { dealBoardViewData, viewSortRecord } from '../util';
import Board from './RecordList';
import './index.less';

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

function CommonBoard(props) {
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
    initBoardViewData,
    clearBoardView,
    setViewConfigVisible,
    filters,
    addRecord,
    refreshSheet,
    ...rest
  } = props;

  const [, drop] = useDrop({
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

  const $listWrapRef = useRef(null);
  const flagRef = useRef({ preScrollLeft: 0, pending: false });
  const commonBoardRef = useRef(null);
  const [intersectionBox, setIntersectionBox] = useState(null);

  const allowOperation = useMemo(() => {
    const firstGroupControl = _.find(controls, item => item.controlId === view.viewControl);
    return firstGroupControl && firstGroupControl.type !== 30;
  }, [view.viewControl]);

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
    if (commonBoardRef.current) {
      setIntersectionBox(commonBoardRef.current);
    }
  }, []);

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
    viewSortRecord(obj, view, props, selectControl);
  };

  const renderContent = () => {
    const { boardViewLoading = true, boardData } = boardView;
    const { isFirstGroupValidField, sheetSwitchPermit } = props;
    const { viewControl } = view;
    const viewData = dealBoardViewData({ view, controls, data: boardData });
    const { navshow, freezenav } = getAdvanceSetting(view);
    // 选择了控件作为看板且控件没有被删除
    if (!isFirstGroupValidField) {
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

      return (viewData || [])
        .slice(freezenav === '1' && !fixFirst ? 1 : 0, fixFirst ? 1 : undefined)
        .map((board, index) => {
          if (!(_.get(board, 'rows') || []).length && !fixFirst) {
            // 看板无数据时 当配置隐藏无数据看板或看板本身是未分类时 看板不显示
            if (board.noGroup || navshow === '1') return null;
          }

          return (
            <Board
              {...boardView}
              key={`${viewId}-${board.key}`}
              index={index}
              list={board}
              viewData={viewData}
              view={view}
              worksheetId={worksheetId}
              viewControl={viewControl}
              sortRecord={sortRecord}
              selectControl={selectControl()}
              addRecord={addRecord}
              allowOperation={allowOperation}
              viewRootEl={intersectionBox}
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

    if (boardViewLoading) return <LoadDiv />;

    // if (_.every(Object.values(boardViewRecordCount), val => !val)) {
    //   return <ViewEmpty />;
    // }

    return (
      <Fragment>
        {freezenav === '1' && <div className="boardFixedWrap">{renderBoard(true)}</div>}

        <div className="boardListWrap" ref={$listWrapRef} style={{ paddingLeft: freezenav === '1' ? 0 : 14 }}>
          {renderBoard()}
        </div>
      </Fragment>
    );
  };

  return (
    <div className="worksheetBoardViewWrap" ref={drop}>
      <RecordBoardWrap ref={commonBoardRef}>{renderContent()}</RecordBoardWrap>
      <CustomDragLayer />
    </div>
  );
}

export default function Wrap(props) {
  return <CommonBoard {...props} />;
}
