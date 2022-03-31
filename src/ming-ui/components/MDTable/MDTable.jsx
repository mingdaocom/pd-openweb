import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Hammer from 'hammerjs';
import { v4 as uuidv4 } from 'uuid';
import { autobind } from 'core-decorators';
import { emitter } from 'worksheet/util';
import DragMask from 'worksheet/common/DragMask';
import Skeleton from 'src/router/Application/Skeleton';
import { VariableSizeGrid } from 'react-window';

delete Hammer.defaults.cssProps.userSelect;
import './style.less';

const FIXED_ROW_HEIGHT = 34;
const FOOTER_ROW_HEIGHT = 28;

const Cell = memo(
  ({ renderFooter, renderCell, renderFooterCell, ...args }) => {
    return (renderFooter ? renderFooterCell : renderCell)(args);
  },
  (prevProps, nextProps) => {
    return (
      prevProps.columnIndex === nextProps.columnIndex &&
      prevProps.rowIndex === nextProps.rowIndex &&
      !(!_.isEmpty(nextProps.needUpdateRows) && _.includes(nextProps.needUpdateRows, nextProps.rowIndex))
    );
  },
);
export default class MDTable extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    topFixed: PropTypes.bool,
    disableFrozen: PropTypes.bool,
    forceScrollOffset: PropTypes.shape({}),
    scrollBarHoverShow: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    responseHeight: PropTypes.bool, // 垂直方向不需要滚动
    columnScrollStartIndex: PropTypes.number, // 表格起始位置 column index
    defaultScrollLeft: PropTypes.number,
    fixedRowCount: PropTypes.number,
    sheetColumnWidths: PropTypes.shape({}),
    className: PropTypes.string,
    rowHeight: PropTypes.number,
    fixedColumnCount: PropTypes.number,
    columnCount: PropTypes.number,
    rowCount: PropTypes.number,
    scrollbarWidth: PropTypes.number,
    getCellWidth: PropTypes.func,
    showFooterRow: PropTypes.bool,
    renderCell: PropTypes.func,
    renderFooterCell: PropTypes.func,
    renderEmpty: PropTypes.func,
  };

  static defaultProps = {
    topFixed: true,
    fixedRowCount: 1,
    fixedColumnCount: 0,
    columnScrollStartIndex: 0,
    rowHeight: 36,
    scrollbarWidth: 0,
    renderEmpty: () => {},
    renderCell: () => {},
    renderFooterCell: () => {},
  };
  topleftgrid = React.createRef();
  toprightgrid = React.createRef();
  mainleftgrid = React.createRef();
  mainrightgrid = React.createRef();
  bottomleftgrid = React.createRef();
  bottomrightgrid = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      scrollLeft: 100,
      scrollTop: 100,
      columnWidthChangeMaskVisible: false,
    };
    this.mdtabldId = props.id || uuidv4();
    this.scrollbarWidth = props.scrollbarWidth;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.fixedColumnsWidth = this.updateFixedWidth(props);
    this.scrollWidth = this.getSumSize(props.columnCount, props.getCellWidth);
    this.scrollHeight = this.getSumSize(props.rowCount - props.fixedRowCount, props.rowHeight);
  }

  componentDidMount() {
    const { defaultScrollLeft, columnScrollStartIndex } = this.props;
    const { fixedColumnCount } = this;
    emitter.addListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + this.mdtabldId, this.showColumnWidthChangeMask);
    $(this.mdtable).on('mouseenter', '.cell:not(.row-0)', this.handleCellEnter);
    $(this.mdtable).on('mouseleave', '.cell:not(.row-0)', this.handleCellLeave);
    $(this.mdtable).on('mousewheel', '.scrollInTable', this.handleStopPop);
    // --- 表格触摸事件处理 ---
    var tablehammer = new Hammer(this.mdtable, { inputClass: Hammer.TouchInput });
    this.tablehammer = tablehammer;
    this.leftForHammer = _.get(this.scrollhor, 'scrollLeft') || 0;
    this.topForHammer = _.get(this.scrollver, 'scrollTop') || 0;
    this.lastPandeltaX = 0;
    this.lastPandeltaY = 0;
    tablehammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    tablehammer.on('panmove', this.handlePanMove);
    tablehammer.on('panend', this.handlePanEnd);
    // ---
    $(this.mdtable).on('mousewheel', this.handleMouseWheel);
    if (columnScrollStartIndex > fixedColumnCount) {
      const column = document.querySelector('.row-0.col-' + (columnScrollStartIndex - fixedColumnCount + 1));
      if (column) {
        this.setScroll({ left: column.offsetLeft });
      }
    }
    if (defaultScrollLeft) {
      this.setScroll({ left: defaultScrollLeft });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rowHeight !== this.props.rowHeight) {
      this.scrollHeight = this.getSumSize(nextProps.rowCount - nextProps.fixedRowCount, nextProps.rowHeight);
      this.fixedColumnsWidth = this.updateFixedWidth(nextProps);
      if (this.mainleftgrid.current) {
        this.mainleftgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
      }
      if (this.mainrightgrid.current) {
        this.mainrightgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
      }
    }
    if (
      !_.isEqual(nextProps.sheetColumnWidths, this.props.sheetColumnWidths) ||
      nextProps.fixedColumnCount !== this.props.fixedColumnCount ||
      nextProps.rowCount !== this.props.rowCount ||
      nextProps.columnCount !== this.props.columnCount ||
      nextProps.width !== this.props.width ||
      nextProps.height !== this.props.height
    ) {
      this.updateTableLayout(nextProps);
    }
    if (nextProps.defaultScrollLeft !== this.props.defaultScrollLeft) {
      this.setScroll({ left: nextProps.defaultScrollLeft });
    }
  }
  componentDidUpdate() {
    this.needUpdateRows = [];
  }

  componentWillUnmount() {
    emitter.removeListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + this.mdtabldId, this.showColumnWidthChangeMask);
    $(this.mdtable).off('mouseenter', '.cell:not(.row-0)', this.handleCellEnter);
    $(this.mdtable).off('mouseleave', '.cell:not(.row-0)', this.handleCellLeave);
    $(this.mdtable).off('mousewheel', '.scrollInTable', this.handleStopPop);
    $(this.mdtable).off('mousewheel', this.handleMouseWheel);
    if (this.tablehammer) {
      this.tablehammer.off('panmove', this.handlePanMove);
      this.tablehammer.off('panend', this.handlePanEnd);
      this.tablehammer.destroy();
    }
  }

  get widthScroll() {
    return this.scrollWidth > this.props.width;
  }

  get heightScroll() {
    const { height, showFooterRow } = this.props;
    return (
      this.scrollHeight >
      height - FIXED_ROW_HEIGHT - (showFooterRow ? FOOTER_ROW_HEIGHT : 0) - (this.widthScroll ? this.scrollbarWidth : 0)
    );
  }

  get width() {
    const { width, responseHeight } = this.props;
    return this.heightScroll && !responseHeight ? width - this.scrollbarWidth : width;
  }

  get height() {
    const { height } = this.props;
    return this.widthScroll ? height - this.scrollbarWidth - 3 : height;
  }

  updateFixedWidth(props) {
    let fixedWidth = this.getSumSize(props.fixedColumnCount, props.getCellWidth);
    this.fixedColumnCount = props.fixedColumnCount;
    if (fixedWidth > props.width) {
      this.fixedColumnCount = 1;
      fixedWidth = this.getSumSize(this.fixedColumnCount, props.getCellWidth);
    }
    return fixedWidth;
  }

  updateRow(rowIndex) {
    this.needUpdateRows = [rowIndex];
    this.updateTableLayout();
  }

  // hammer event
  @autobind
  handlePanMove(e) {
    if (window.disableTableScroll) {
      return;
    }
    const isScrollVer = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    this.leftForHammer = this.leftForHammer + this.lastPandeltaX - e.deltaX;
    this.topForHammer = this.topForHammer + this.lastPandeltaY - e.deltaY;
    this.lastPandeltaX = e.deltaX;
    this.lastPandeltaY = e.deltaY;
    if (isScrollVer) {
      this.touchScroll({ top: this.topForHammer });
    } else {
      this.touchScroll({ left: this.leftForHammer });
    }
  }

  // hammer event
  @autobind
  handlePanEnd(e) {
    this.lastPandeltaX = 0;
    this.lastPandeltaY = 0;
  }

  handleStopPop(event) {
    event.stopPropagation();
  }

  @autobind
  handleMouseWheel(event) {
    let { deltaX, deltaY } = event;
    let isScrollVer = Math.abs(deltaY) > Math.abs(deltaX);

    if ((isScrollVer && this.heightScroll) || (!isScrollVer && this.widthScroll)) {
      if (
        this.scrollver &&
        ((deltaY > 0 && this.scrollver.scrollTop === 0) ||
          (deltaY < 0 && this.scrollver.scrollTop + this.scrollver.clientHeight === this.scrollver.scrollHeight))
      ) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
    }

    if (navigator.platform.indexOf('Win') > -1 && event.shiftKey) {
      isScrollVer = false;
      deltaX = deltaX * -1;
    }

    if (isScrollVer && this.scrollver) {
      const newTop = this.scrollver.scrollTop - deltaY * event.deltaFactor;
      this.scrollver.scrollTop = newTop;
      this.topForHammer = newTop;
    } else if (this.scrollhor) {
      const newLeft = this.scrollhor.scrollLeft + deltaX * event.deltaFactor;
      this.scrollhor.scrollLeft = newLeft;
      this.leftForHammer = newLeft;
    }
  }

  @autobind
  handleCellLeave() {
    const { onCellLeave = () => {} } = this.props;
    if (this.mdtable) {
      $(this.mdtable).find('.cell').removeClass('hover');
      onCellLeave();
    }
  }

  @autobind
  handleCellEnter(e) {
    const { onCellEnter = () => {} } = this.props;
    const $target = $(e.originalEvent.target).closest('.cell');
    const classMatch = $target.attr('class').match(/.*(row-[0-9]+) .*/);
    if (classMatch && this.mdtable) {
      $(this.mdtable).find('.cell').removeClass('hover');
      $(this.mdtable)
        .find('.' + classMatch[1])
        .addClass('hover');
      onCellEnter($target[0]);
    }
  }

  @autobind
  updateTableLayout(props) {
    props = props || this.props;
    this.scrollWidth = this.getSumSize(props.columnCount, props.getCellWidth);
    this.scrollHeight = this.getSumSize(props.rowCount - props.fixedRowCount, props.rowHeight);
    this.fixedColumnsWidth = this.updateFixedWidth(props);
    if (this.topleftgrid.current) {
      this.topleftgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
    if (this.toprightgrid.current) {
      this.toprightgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
    if (this.mainleftgrid.current) {
      this.mainleftgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
    if (this.mainrightgrid.current) {
      this.mainrightgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
    if (this.bottomleftgrid.current) {
      this.bottomleftgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
    if (this.bottomrightgrid.current) {
      this.bottomrightgrid.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  }

  getSumSize(index, size) {
    let width = 0;
    for (let i = 0; i < index; i++) {
      if (typeof size === 'function') {
        width += size(i);
      } else {
        width += size;
      }
    }
    return width;
  }

  @autobind
  touchScroll({ left, top }) {
    if (_.isNumber(top) && this.scrollver) {
      this.scrollver.scrollTop = top;
    }
    if (_.isNumber(left) && this.scrollhor) {
      this.scrollhor.scrollLeft = left;
    }
  }

  @autobind
  setScroll({ left, top }) {
    const newPos = {};
    if (_.isNumber(left)) {
      newPos.left = left;
    }
    if (_.isNumber(top)) {
      newPos.top = top;
    }
    if (!_.isEmpty(newPos)) {
      this.scrollTo(newPos);
      if (!_.isUndefined(left) && this.scrollhor) {
        this.scrollhor.scrollLeft = left;
      }
      if (!_.isUndefined(top) && this.scrollver) {
        this.scrollver.scrollTop = top;
      }
    }
  }

  @autobind
  scrollTo({ top, left }) {
    if (_.isNumber(left)) {
      this.scrollLeft = left;
      emitter.emit('MDTABLE_SCROLL');
      if (this.toprightgrid.current) {
        this.toprightgrid.current.scrollTo({
          scrollLeft: left,
        });
      }
      if (this.mainrightgrid.current) {
        this.mainrightgrid.current.scrollTo({
          scrollLeft: left,
        });
      }
      if (this.bottomrightgrid.current) {
        this.bottomrightgrid.current.scrollTo({
          scrollLeft: left,
        });
      }
    }
    if (_.isNumber(top)) {
      this.scrollTop = top;
      if (this.mainrightgrid.current) {
        this.mainrightgrid.current.scrollTo({
          scrollTop: top,
        });
      }
      if (this.mainleftgrid.current) {
        this.mainleftgrid.current.scrollTo({
          scrollTop: top,
        });
      }
    }
  }

  @autobind
  renderTable({ hide, className, top, left, ref, isColumnFixed, isRowFixed, renderFooter, virtualdom }, index) {
    const {
      disableFrozen,
      responseHeight,
      topFixed,
      columnCount,
      rowCount,
      getCellWidth,
      rowHeight,
      showFooterRow,
      heightOffset,
      renderCell,
      renderFooterCell,
    } = this.props;
    const { fixedColumnCount } = this;
    const { width, height } = this;
    let cellHeight;
    let gridHeight;
    const fixedRowCount = topFixed ? 1 : 0;
    if (renderFooter) {
      cellHeight = FOOTER_ROW_HEIGHT;
      gridHeight = FOOTER_ROW_HEIGHT;
    } else if (isRowFixed) {
      cellHeight = FIXED_ROW_HEIGHT;
      gridHeight = FIXED_ROW_HEIGHT;
    } else {
      cellHeight = rowHeight;
      gridHeight = responseHeight
        ? (rowCount - fixedRowCount) * rowHeight + heightOffset
        : height - FIXED_ROW_HEIGHT - (showFooterRow ? FOOTER_ROW_HEIGHT : 0);
    }
    if (hide) {
      return;
    }
    return (
      <VariableSizeGrid
        key={index}
        className={className}
        style={{
          position: 'absolute',
          overflow: 'hidden',
          top,
          left,
          borderRight:
            fixedColumnCount > 1 && !disableFrozen && className.match(/left-grid/) ? '1px solid rgba(0,0,0,0.16)' : '',
        }}
        ref={ref}
        virtualdom={virtualdom}
        columnCount={isColumnFixed ? fixedColumnCount : columnCount - fixedColumnCount}
        columnWidth={columnIndex => getCellWidth(isColumnFixed ? columnIndex : columnIndex + fixedColumnCount)}
        height={gridHeight}
        rowCount={isRowFixed ? fixedRowCount : rowCount - fixedRowCount}
        rowHeight={() => cellHeight}
        width={isColumnFixed ? this.fixedColumnsWidth : width - this.fixedColumnsWidth}
      >
        {args => (
          <Cell
            {...args}
            {...{
              needUpdateRows: this.needUpdateRows,
              renderCell,
              renderFooterCell,
              renderFooter,
              columnIndex: isColumnFixed ? args.columnIndex : args.columnIndex + fixedColumnCount,
              rowIndex: isRowFixed ? args.rowIndex : args.rowIndex + fixedRowCount,
              grid: ref,
              scrollTo: this.setScroll,
              tableScrollTop: this.scrollTop,
              gridHeight: gridHeight,
            }}
          />
        )}
      </VariableSizeGrid>
    );
  }

  @autobind
  showColumnWidthChangeMask({ columnWidth, defaultLeft, callback }) {
    this.setState({
      columnWidthChangeMaskVisible: true,
      maskLeft: defaultLeft,
      maskMinLeft: defaultLeft - (columnWidth - 10),
      maskMaxLeft: window.innerWidth,
      maskOnChange: left => {
        this.setState({
          columnWidthChangeMaskVisible: false,
        });
        const newWidth = columnWidth + (left - defaultLeft);
        callback(newWidth);
      },
    });
  }

  render() {
    //
    const {
      loading,
      width,
      heightOffset,
      topFixed,
      scrollBarHoverShow,
      responseHeight,
      forceScrollOffset,
      rowHeight,
      className,
      fixedRowCount,
      rowCount,
      renderEmpty,
      showFooterRow,
    } = this.props;
    const { fixedColumnCount } = this;
    const { columnWidthChangeMaskVisible, maskLeft, maskMaxLeft, maskMinLeft, maskOnChange } = this.state;
    const { height } = this;
    const isEmpty = rowCount === 0;
    const tables = [
      {
        hide: !topFixed,
        className: 'top-left-grid',
        top: 0,
        left: 0,
        height: FIXED_ROW_HEIGHT,
        isColumnFixed: true,
        isRowFixed: true,
        ref: this.topleftgrid,
      },
      {
        hide: !topFixed,
        className: 'top-right-grid',
        top: 0,
        left: this.fixedColumnsWidth,
        isColumnFixed: false,
        isRowFixed: true,
        ref: this.toprightgrid,
      },
      {
        hide: !fixedColumnCount || isEmpty,
        className: 'main-left-grid',
        top: FIXED_ROW_HEIGHT,
        left: 0,
        isColumnFixed: true,
        isRowFixed: false,
        ref: this.mainleftgrid,
      },
      {
        hide: isEmpty,
        className: 'main-right-grid',
        top: FIXED_ROW_HEIGHT,
        left: this.fixedColumnsWidth,
        isColumnFixed: false,
        isRowFixed: false,
        ref: this.mainrightgrid,
        virtualdom: true,
      },
      {
        hide: !showFooterRow || isEmpty,
        className: 'bottom-left-grid',
        top: height - FOOTER_ROW_HEIGHT,
        left: 0,
        isColumnFixed: true,
        isRowFixed: true,
        ref: this.bottomleftgrid,
        renderFooter: true,
      },
      {
        hide: !showFooterRow || isEmpty,
        className: 'bottom-right-grid footer',
        top: height - FOOTER_ROW_HEIGHT,
        left: this.fixedColumnsWidth,
        isColumnFixed: false,
        isRowFixed: true,
        ref: this.bottomrightgrid,
        renderFooter: true,
      },
    ];
    return (
      <div
        className={cx('mdTable', `id-${this.mdtabldId}-id`, className, { widthScroll: !!this.widthScroll })}
        ref={mdtable => (this.mdtable = mdtable)}
        style={
          responseHeight
            ? {
                height:
                  (topFixed ? FIXED_ROW_HEIGHT + (rowCount - 1) * rowHeight : rowCount * rowCount) +
                  (this.widthScroll || (forceScrollOffset && forceScrollOffset.height) ? this.scrollbarWidth : 0) +
                  heightOffset,
              }
            : {}
        }
      >
        {columnWidthChangeMaskVisible && (
          <DragMask value={maskLeft} min={maskMinLeft} max={maskMaxLeft} onChange={maskOnChange} />
        )}
        {!this.widthScroll && forceScrollOffset && forceScrollOffset.height && (
          <div
            style={{
              width: width - (this.heightScroll ? this.scrollbarWidth : 0),
              height: this.scrollbarWidth,
              overflow: 'auto',
              position: 'absolute',
              bottom: 1,
            }}
          />
        )}
        {this.widthScroll && (
          <div
            className={cx('scroll-hor', { hoverShow: scrollBarHoverShow })}
            ref={scroll => (this.scrollhor = scroll)}
            style={{
              width: width - (this.heightScroll ? this.scrollbarWidth : 0),
              height: this.scrollbarWidth,
              overflow: 'auto',
              position: 'absolute',
              bottom: 1,
            }}
            onScroll={e => {
              this.scrollTo({ left: e.target.scrollLeft });
            }}
          >
            <div className="content" style={{ width: this.scrollWidth, height: this.scrollbarWidth }}></div>
          </div>
        )}
        {this.heightScroll && (
          <div
            className={cx('scroll-ver', { hide: responseHeight, hoverShow: scrollBarHoverShow })}
            ref={scroll => (this.scrollver = scroll)}
            style={{
              top: FIXED_ROW_HEIGHT * fixedRowCount,
              height: height - fixedRowCount * FIXED_ROW_HEIGHT - (showFooterRow ? FOOTER_ROW_HEIGHT : 0),
              width: this.scrollbarWidth,
              overflow: 'auto',
              position: 'absolute',
              right: 1,
            }}
            onScroll={e => {
              this.scrollTo({ top: e.target.scrollTop });
            }}
          >
            <div className="content" style={{ height: this.scrollHeight, width: this.scrollbarWidth }}></div>
          </div>
        )}
        <div className={cx('mdTableContent', { isEmpty })} ref={table => (this.table = table)}>
          {tables.map(this.renderTable)}
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: FIXED_ROW_HEIGHT,
                width: '100%',
                height: '100%',
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
          {!loading &&
            isEmpty &&
            renderEmpty({
              style: {
                top: FIXED_ROW_HEIGHT,
                ...(this.widthScroll ? { height: 'auto', bottom: this.scrollbarWidth } : {}),
              },
            })}
        </div>
      </div>
    );
  }
}
