import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import Hammer from 'hammerjs';
import _, { get, includes } from 'lodash';
import { bool, func, number } from 'prop-types';
import styled from 'styled-components';
import { useRefStore } from 'worksheet/hooks';
import { getScrollBarWidth } from 'src/utils/common';
import Skeleton from '../Skeleton';
import Grid from './Grid';
import ScrollBar from './ScrollBar';

const Con = styled.div`
  position: relative;
  border-top: 1px solid #f1f1f1;
  > div {
    box-sizing: border-box;
  }
  overscroll-behavior-x: none;
`;

const TableBorder = styled.div`
  border-left: 1px solid #f1f1f1;
  width: 0px;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
`;

function sum(array = []) {
  return array.reduce((a, b) => a + b, 0);
}

function setScrollX(cache, newLeft) {
  ['top-center', 'main-center', 'bottom-center', 'scrollX'].forEach(name => {
    if (cache[name] && _.isFunction(cache[name].scrollTo)) {
      cache[name].scrollTo({
        scrollLeft: newLeft,
      });
    }
  });
}

function setScrollY(cache, newTop) {
  if (newTop < 0) {
    newTop = 0;
  }
  ['main-left', 'main-center', 'main-right', 'scrollY'].forEach(name => {
    if (cache[name] && _.isFunction(cache[name].scrollTo)) {
      cache[name].scrollTo({ scrollTop: newTop });
    }
  });
}

function FixedTable(props, ref) {
  const {
    noRenderEmpty,
    isSubList,
    loading,
    showLoadingMask,
    loadingMaskChildren = null,
    className,
    showHead,
    showFoot,
    width,
    columnHeadHeight = 34,
    setHeightAsRowCount,
    rowCount,
    disableYScroll,
    columnCount,
    barWidth = getScrollBarWidth(),
    sheetColumnWidths = {},
    rowHeight = 34,
    getColumnWidth,
    leftFixedCount = 0,
    rightFixedCount = 0,
    hasSubListFooter,
    defaultScrollLeft, // 默认横向滚动距离
    Cell,
    tableData,
    renderEmpty, // 渲染空状态
    disablePanVertical,
    tableFooter,
  } = props;
  let height = props.height;
  let withFooterHeight = props.height;
  const hasFooter = tableFooter && tableFooter.height;
  if (hasFooter) {
    withFooterHeight += tableFooter.height;
  }
  const bottomFixedCount = showFoot ? 1 : 0;
  const topFixedCount = showHead ? 1 : 0;
  const conRef = useRef();
  const tablehammer = useRef();
  const [hammerCache, setHammer] = useRefStore();
  const [cache, set] = useRefStore({
    left: 0,
    top: 0,
    needUpdated: {},
  });
  window.cache = cache;
  const tableSize = useMemo(
    () => ({
      width: sum([...new Array(columnCount)].map((a, i) => getColumnWidth(i) || 200)),
      height: rowHeight * rowCount - (hasSubListFooter ? 8 : 0),
    }),
    [rowHeight, columnCount, rowCount, sheetColumnWidths, width],
  );
  const XIsScroll = useMemo(
    () => tableSize.width > width,
    [width, tableSize.width, leftFixedCount, rightFixedCount, columnCount],
  );
  const YIsScroll = useMemo(
    () => !disableYScroll && tableSize.height > height - columnHeadHeight - (bottomFixedCount ? 28 : 0),
    [height, tableSize.height, topFixedCount, columnHeadHeight, bottomFixedCount, rowCount],
  );
  const tableConfigs = [
    {
      id: 'top-left',
      topFixed: true,
      leftFixed: true,
      visible: leftFixedCount > 0 && topFixedCount > 0,
    },
    {
      id: 'top-center',
      topFixed: true,
      visible: topFixedCount > 0,
    },
    {
      id: 'top-right',
      topFixed: true,
      rightFixed: true,
      visible: rightFixedCount > 0 && topFixedCount > 0,
    },
    {
      id: 'main-left',
      leftFixed: true,
      visible: leftFixedCount > 0 && rowCount > 0,
    },
    { id: 'main-center', visible: rowCount > 0 },
    { id: 'main-right', rightFixed: true, visible: rightFixedCount > 0 && rowCount > 0 },
    {
      id: 'bottom-left',
      bottomFixed: true,
      leftFixed: true,
      visible: leftFixedCount > 0 && bottomFixedCount > 0 && rowCount > 0,
    },
    {
      id: 'bottom-center',
      bottomFixed: true,
      visible: bottomFixedCount > 0 && rowCount > 0,
    },
    {
      id: 'bottom-right',
      bottomFixed: true,
      rightFixed: true,
      visible: rightFixedCount > 0 && bottomFixedCount > 0 && rowCount > 0,
    },
  ];
  const forceUpdate = useCallback(() => {
    tableConfigs
      .filter(t => t.visible)
      .forEach(t => {
        if (cache[t.id]) {
          cache[t.id].resetAfterRowIndex(0);
          cache[t.id].resetAfterColumnIndex(0);
        }
      });
  }, [rowCount]);
  const tables = tableConfigs
    .filter(item => item.visible && (!loading || includes(item.id, 'top')))
    .map(t => (
      <Grid
        {...Object.assign(t, {
          width: YIsScroll ? width - barWidth : width,
          height: XIsScroll ? height + barWidth * -1 : height,
          columnHeadHeight,
          rowCount,
          columnCount,
          topFixedCount,
          bottomFixedCount,
          leftFixedCount,
          rightFixedCount,
          rowHeight,
          cache, // 用来更新指定位置
          getColumnWidth,
          Cell,
          tableData,
          setRef: ref => {
            cache[t.id] = ref;
          },
        })}
      />
    ));
  const verticalScroll = useMemo(
    () => (
      <ScrollBar
        {...{
          type: 'y',
          barWidth,
          style: {
            right: 0,
            top: topFixedCount * columnHeadHeight,
            bottom: bottomFixedCount * 28 + (hasFooter ? tableFooter.height : 0),
          },
          contentStyle: {
            height: tableSize.height + (XIsScroll ? 10 : 0),
          },
          setRef: ref => {
            cache.scrollY = ref;
          },
          setScrollY: y => {
            set('top', y);
            setScrollY(cache, y);
          },
        }}
      />
    ),
    [tableSize.height, XIsScroll, bottomFixedCount],
  );
  const horizontalScroll = useMemo(
    () => (
      <ScrollBar
        {...{
          type: 'x',
          style: {
            left: 0,
            right: 0,
            bottom: 0,
          },
          contentStyle: {
            width: tableSize.width + (YIsScroll ? 10 : 0),
          },
          barWidth,
          setRef: ref => {
            cache.scrollX = ref;
          },
          setScrollX: x => {
            set('left', x);
            setScrollX(cache, x);
          },
        }}
      />
    ),
    [tableSize.width, YIsScroll, leftFixedCount],
  );
  function handleMouseWheel(e) {
    if (e.target.closest('.scrollInTable')) {
      return;
    }
    let direction = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? 'x' : 'y';
    if (window.isWindows && e.shiftKey) {
      direction = 'x';
    }
    const $scrollX = conRef.current.querySelector('.scroll-x');
    const $scrollY = conRef.current.querySelector('.scroll-y');
    if (direction === 'x') {
      let newLeft = cache.left + (window.isWindows && e.shiftKey ? e.deltaY : e.deltaX);
      if ($scrollX) {
        $scrollX.scrollLeft = newLeft;
      }
      e.preventDefault();
      e.stopPropagation();
    } else if (direction === 'y') {
      let newTop = cache.top + e.deltaY;
      if ($scrollY) {
        $scrollY.scrollTop = newTop;
      }
    }
    if (!$scrollY) {
      return;
    }
    if (
      isSubList &&
      (!$scrollY ||
        ($scrollY &&
          ((e.deltaY < 0 && $scrollY.scrollTop === 0) ||
            (e.deltaY > 0 && $scrollY.scrollTop + $scrollY.clientHeight === $scrollY.scrollHeight))))
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }
  // hammer event
  function handlePanMove(e) {
    if (window.disableTableScroll) {
      return;
    }
    const isScrollVer = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    setHammer('leftForHammer', hammerCache.leftForHammer + hammerCache.lastPandeltaX - e.deltaX);
    setHammer('topForHammer', hammerCache.topForHammer + hammerCache.lastPandeltaY - e.deltaY);
    setHammer('lastPandeltaX', e.deltaX);
    setHammer('lastPandeltaY', e.deltaY);
    const $scrollX = conRef.current.querySelector('.scroll-x');
    const $scrollY = conRef.current.querySelector('.scroll-y');
    if (isScrollVer) {
      if ($scrollY) {
        $scrollY.scrollTop = hammerCache.topForHammer;
      }
    } else {
      if ($scrollX) {
        $scrollX.scrollLeft = hammerCache.leftForHammer;
      }
    }
  }

  // hammer event
  function handlePanEnd(e) {
    setHammer('lastPandeltaX', 0);
    setHammer('lastPandeltaY', 0);
  }

  useImperativeHandle(ref, () => ({
    dom: conRef,
    forceUpdate,
    setScroll: (left, top) => {
      const $scrollX = conRef.current.querySelector('.scroll-x');
      const $scrollY = conRef.current.querySelector('.scroll-y');
      if (!_.isUndefined(left) && $scrollX) {
        $scrollX.scrollLeft = left;
      }
      if (!_.isUndefined(top) && $scrollY) {
        $scrollY.scrollTop = top;
      }
    },
  }));
  useEffect(() => {
    if (get(cache, 'scrollX.scrollLeft')) {
      setScrollX(cache, get(cache, 'scrollX.scrollLeft'));
    }
  }, [loading]);
  useEffect(forceUpdate, [tableSize.width]);
  useLayoutEffect(() => {
    cache.didMount = true;
    document.body.style.overscrollBehaviorX = 'none';
    conRef.current.addEventListener('wheel', handleMouseWheel);
    // --- 表格触摸事件处理 ---
    tablehammer.current = new Hammer(conRef.current, { inputClass: Hammer.TouchInput });
    setHammer('leftForHammer', _.get(conRef.current.querySelector('.scroll-x'), 'scrollLeft') || 0);
    setHammer('topForHammer', _.get(conRef.current.querySelector('.scroll-y'), 'scrollTop') || 0);
    setHammer('lastPandeltaX', 0);
    setHammer('lastPandeltaY', 0);
    tablehammer.current
      .get('pan')
      .set({ direction: disablePanVertical ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_ALL });
    tablehammer.current.on('panmove', handlePanMove);
    tablehammer.current.on('panend', handlePanEnd);
    // ---
    if (defaultScrollLeft) {
      if (conRef.current.querySelector('.scroll-x')) {
        conRef.current.querySelector('.scroll-x').scrollLeft = defaultScrollLeft;
      }
    }
    return () => {
      conRef.current.removeEventListener('wheel', handleMouseWheel);
      if (tablehammer.current) {
        tablehammer.current.off('panmove', handlePanMove);
        tablehammer.current.off('panend', handlePanEnd);
        tablehammer.current.destroy();
      }
    };
  }, []);
  return (
    <Con ref={conRef} className={className} style={{ width, height: hasFooter ? withFooterHeight : height }}>
      <TableBorder
        className="tableBorder"
        style={{
          left: 0,
          bottom: XIsScroll ? barWidth : 0,
        }}
      />
      <TableBorder
        className="tableBorder"
        style={{
          right: 0,
          bottom: XIsScroll ? barWidth : 0,
        }}
      />
      {/* 表格 */}
      {tables}
      {tableFooter && tableFooter.comp && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: width,
            height: tableFooter.height - 2,
            bottom: XIsScroll ? barWidth : 0,
          }}
        >
          {tableFooter.comp}
        </div>
      )}
      {/* 滚动条 */}
      {YIsScroll && verticalScroll}
      {XIsScroll && horizontalScroll}
      {/* 空状态 */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: columnHeadHeight,
            width: '100%',
            height: `calc(100% - ${columnHeadHeight}px)`,
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['30%', '40%', '90%', '60%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
        </div>
      )}
      {/* 加载遮罩 */}
      {showLoadingMask && (
        <div
          className="flexCenter justifyContentCenter"
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: '#777',
          }}
        >
          {loadingMaskChildren}
        </div>
      )}
      {!loading &&
        rowCount === 0 &&
        !noRenderEmpty &&
        renderEmpty({
          style: {
            top: columnHeadHeight,
            ...(XIsScroll ? { height: 'auto', bottom: barWidth } : {}),
          },
        })}
      {}
    </Con>
  );
}

FixedTable.propTypes = {
  width: number.isRequired,
  height: number.isRequired,
  columnCount: number.isRequired,
  rowCount: number.isRequired,
  rowHeight: number.isRequired,
  getColumnWidth: func.isRequired,
  disablePanVertical: bool,
};

export default forwardRef(FixedTable);
