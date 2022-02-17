import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { autobind } from 'core-decorators';
import { Tooltip } from 'ming-ui';
import { emitter } from 'worksheet/util';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { fieldCanSort, checkIsTextControl } from 'worksheet/util';
import './style.less';

export default class BaseColumnHead extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
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

  @autobind
  handleMouseDown(e) {
    const { control, columnIndex, updateSheetColumnWidths } = this.props;
    function getColumnTextMaxWidth() {
      const texts = [...document.querySelectorAll('.col-' + columnIndex)].slice(1).map(a => a.innerText);
      const con = document.createElement('div');
      con.style.fontSize = '13px';
      con.style.display = 'inline-block';
      con.innerHTML = texts.map(text => `<div>${text}</div>`);
      document.body.append(con);
      const result = con.clientWidth;
      document.body.removeChild(con);
      return result + 14;
    }
    if (window.dragclicktimer) {
      clearTimeout(window.dragclicktimer);
      window.dragclicktimer = undefined;
      if (!checkIsTextControl(control.type)) {
        return;
      }
      let width = getColumnTextMaxWidth();
      if (width < 60) {
        width = 60;
      }
      if (width > 600) {
        width = 600;
      }
      updateSheetColumnWidths({ controlId: control.controlId, value: width });
    } else {
      window.dragclicktimer = setTimeout(() => {
        window.dragclicktimer = undefined;
        this.resizeColumn(e);
      }, 200);
    }
  }

  resizeColumn({ clientX }) {
    const { isLast, columnIndex, control, style, updateSheetColumnWidths } = this.props;
    const columnWidth = style.width;
    const mdtableElement = $(this.drag).parents('.mdTable')[0];
    if (!mdtableElement) {
      return;
    }
    const mdtableId = (mdtableElement.className.match(/id-([\w-]+)-id/) || [])[1];
    emitter.emit('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + mdtableId, {
      columnIndex,
      columnWidth,
      defaultLeft: clientX - mdtableElement.getBoundingClientRect().left,
      target: mdtableElement,
      callback: newWidth => {
        updateSheetColumnWidths({ controlId: control.controlId, value: newWidth });
        if (isLast) {
          setTimeout(() => {
            if ($(mdtableElement).find('.scroll-hor')[0]) {
              $(mdtableElement).find('.scroll-hor')[0].scrollLeft = 100000;
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

  @autobind
  handleChangeSort() {
    const { isAsc, changeSort } = this.props;
    let newSortType;
    if (_.isUndefined(isAsc)) {
      newSortType = true;
    } else if (isAsc === true) {
      newSortType = false;
    }
    changeSort(newSortType);
  }

  render() {
    const { disabled, className, style, showDropdown, isAsc, showRequired, renderPopup, getPopupContainer } =
      this.props;
    const { listVisible } = this.state;
    const control = redefineComplexControl(this.props.control);
    const controlType = control.sourceControlType || control.type;
    const canSort = !disabled && fieldCanSort(controlType);
    let sustractWidth = 13;
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
            onClick={canSort ? this.handleChangeSort : () => {}}
          >
            {showRequired && control.required && <span className="requiredStatus">*</span>}
            <span
              className="text ellipsis"
              title={control.controlName}
              style={{ maxWidth: `calc(100% - ${sustractWidth}px)` }}
            >
              {control.controlName}
            </span>
            {canSort && typeof isAsc !== 'undefined' && <span className="sortIcon">{this.getSortIcon()}</span>}
            {control.desc && (
              <Tooltip popupPlacement="bottom" text={<span>{control.desc}</span>}>
                <i className="icon-info descIcon"></i>
              </Tooltip>
            )}
          </div>
          {showDropdown && !disabled && (
            <span className="dropIcon">
              <i
                className="icon icon-arrow-down-border ThemeHoverColor3 Hand"
                onClick={() => this.setState({ listVisible: true })}
              ></i>
            </span>
          )}
        </div>
        {!disabled && <span ref={drag => (this.drag = drag)} className="resizeDrag Hand"></span>}
      </div>
    );
    return showDropdown && !disabled ? (
      <Trigger
        action={['click']}
        popup={
          renderPopup
            ? renderPopup({
                closeMenu: () => {
                  this.setState({ listVisible: false });
                },
              })
            : 'hello world'
        }
        getPopupContainer={getPopupContainer || (() => document.body)}
        popupClassName="filterTrigger"
        popupVisible={listVisible}
        popupAlign={{
          points: ['tr', 'br'],
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
