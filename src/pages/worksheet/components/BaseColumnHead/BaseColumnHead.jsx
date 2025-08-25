import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Tooltip } from 'ming-ui';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { isOtherShowFeild } from 'src/pages/widgetConfig/util';
import { emitter } from 'src/utils/common';
import { fieldCanSort } from 'src/utils/control';
import getTableColumnWidth from './getTableColumnWidth';
import './style.less';

export default class BaseColumnHead extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    canDrag: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.shape({}),
    columnIndex: PropTypes.number,
    isAsc: PropTypes.bool,
    control: PropTypes.shape({}),
    showRequired: PropTypes.bool,
    showDropdown: PropTypes.bool,
    renderPopup: PropTypes.func,
    changeSort: PropTypes.func,
    updateSheetColumnWidths: PropTypes.func,
  };

  static defaultProps = {
    changeSort: () => {},
    updateSheetColumnWidths: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.drag) {
      this.drag.addEventListener('mousedown', this.handleMouseDown);
    }
  }

  componentWillUnMount() {
    if (this.drag) {
      this.drag.removeEventListener('mousedown', this.handleMouseDown);
    }
  }

  handleMouseDown = e => {
    const { worksheetId, control, columnStyle, updateSheetColumnWidths, rows = [] } = this.props;
    e.preventDefault();
    if (window.dragclicktimer) {
      clearTimeout(window.dragclicktimer);
      window.dragclicktimer = undefined;
      const tableDom = document.querySelector('.sheetViewTable');
      if (!tableDom) {
        return;
      }
      const result = getTableColumnWidth(tableDom, rows, control, columnStyle, worksheetId);
      updateSheetColumnWidths({ controlId: control.controlId, value: result });
    } else {
      if (window.isFirefox) {
        this.resizeColumn(e);
      } else {
        window.dragclicktimer = setTimeout(() => {
          window.dragclicktimer = undefined;
          this.resizeColumn(e);
        }, 200);
      }
    }
  };

  resizeColumn({ clientX }) {
    const { isLast, columnIndex, control, style, updateSheetColumnWidths } = this.props;
    const columnWidth = style.width;
    const tableElement = $(this.drag).parents('.sheetViewTable')[0];
    if (!tableElement) {
      return;
    }
    const tableId = (tableElement.className.match(/id-([\w-]+)-id/) || [])[1];
    const defaultLeft = clientX - tableElement.getBoundingClientRect().left;
    let maskMinLeft;
    if (control.type === 6 && control.advancedSetting && control.advancedSetting.showtype === '2') {
      maskMinLeft = defaultLeft - (columnWidth - 10) + 120;
    }
    emitter.emit('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + tableId, {
      columnIndex,
      columnWidth: columnWidth - (control.appendWidth || 0),
      defaultLeft,
      maskMinLeft,
      target: tableElement,
      callback: newWidth => {
        updateSheetColumnWidths({ controlId: control.controlId, value: newWidth });
        if (isLast) {
          setTimeout(() => {
            if ($(tableElement).find('.scroll-x')[0]) {
              $(tableElement).find('.scroll-x')[0].scrollLeft = 100000;
            }
          }, 30);
        }
      },
    });
  }

  getSortIcon() {
    const { isAsc } = this.props;
    if (isAsc === true) {
      return <i className="icon icon-score-up sortIcon" />;
    } else if (isAsc === false) {
      return <i className="icon icon-score-down sortIcon" />;
    }
  }

  handleChangeSort = () => {
    const { isAsc, changeSort } = this.props;
    let newSortType;
    if (_.isUndefined(isAsc)) {
      newSortType = false;
    } else if (isAsc === false) {
      newSortType = true;
    }
    changeSort(newSortType);
  };

  render() {
    const {
      disabled,
      disableSort,
      canDrag = true,
      className,
      style,
      showDropdown,
      isAsc,
      showRequired,
      renderPopup,
      getPopupContainer,
    } = this.props;
    const { listVisible } = this.state;
    const control = redefineComplexControl(this.props.control);
    const controlType = control.sourceControlType || control.type;
    const canSort = !disableSort && !disabled && fieldCanSort(controlType) && !isOtherShowFeild(control);
    const maskData = _.get(control, 'advancedSetting.datamask') === '1';
    let sustractWidth = 0;
    if (showRequired) {
      sustractWidth += 8;
    }
    if (showRequired && control.required) {
      sustractWidth += 7;
    }
    if (canSort && typeof isAsc !== 'undefined') {
      sustractWidth += 13;
    }
    if (control.desc) {
      sustractWidth += 21;
    }
    const head = (
      <div className={cx('baseColumnHead columnHead', className)} style={style}>
        <div className="inner">
          <div
            className={cx('controlName', { 'ThemeHoverColor3 Hand': canSort })}
            style={{
              width: style.width - 10,
              height: style.height,
            }}
            onClick={canSort ? this.handleChangeSort : () => {}}
          >
            {showRequired && control.required && <span className="requiredStatus">*</span>}
            <span className="textCon" style={{ maxWidth: `calc(100% - ${sustractWidth}px)` }}>
              <span className="text ellipsis" title={control.controlName}>
                {control.controlName}
              </span>
            </span>
            {canSort && typeof isAsc !== 'undefined' && <span className="sortIcon">{this.getSortIcon()}</span>}
            {control.desc && (
              <Tooltip
                popupPlacement="bottom"
                autoCloseDelay={0}
                text={<span className="preWrap">{control.desc}</span>}
              >
                <i className="icon-info descIcon"></i>
              </Tooltip>
            )}
          </div>
          {maskData && <i className="icon icon-eye_off maskData Font16"></i>}
          {showDropdown && !disabled && (
            <span
              className="dropIcon"
              onClick={() => this.setState({ listVisible: true })}
              style={className.indexOf('headAlignCenter') > -1 ? { lineHeight: style.height - 2 + 'px' } : {}}
            >
              <i className="icon icon-arrow-down-border ThemeHoverColor3 Hand"></i>
            </span>
          )}
        </div>
        {!disabled && canDrag && <span ref={drag => (this.drag = drag)} className="resizeDrag Hand"></span>}
      </div>
    );
    return showDropdown && !disabled ? (
      <Trigger
        action={['click']}
        popup={
          renderPopup ? (
            renderPopup({
              closeMenu: () => {
                this.setState({ listVisible: false });
              },
            })
          ) : (
            <span>hello world</span>
          )
        }
        getPopupContainer={getPopupContainer || (() => document.body)}
        popupClassName="filterTrigger"
        popupVisible={listVisible}
        popupAlign={{
          points: style.width > 180 ? ['tr', 'br'] : ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        {head}
      </Trigger>
    ) : (
      head
    );
  }
}
