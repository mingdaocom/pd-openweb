import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Popover } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import TimePicker from 'src/components/Form/DesktopForm/widgets/Time';
import { renderText } from 'src/utils/domain/control/display';
import { WORKSHEETTABLE_FROM_MODULE } from 'src/utils/domain/worksheet/constants';
import EditableCellCon from '../EditableCellCon';
import CellErrorTips from './comps/CellErrorTip';

const ClickAwayable = ClickAway;
const ERROR_POPOVER_STYLES = {
  container: {
    background: 'transparent',
    boxShadow: 'none',
  },
};
const FIRST_ROW_ERROR_ALIGN = { offset: [0, -3] };
const ERROR_ALIGN = { offset: [0, 0] };
// 表格主体是 react-window 的 Grid（overflow: hidden + 固定高宽），面板挂进去会被裁剪且没有翻转空间，
// 与日期单元格保持一致挂到 body
const getBodyPopupContainer = () => document.body;
// rc-picker 内置的浮层位置只有翻转（adjustX/adjustY），而翻转仅在「翻到另一侧可见面积更大」时生效，
// 上下都放不下（如屏幕高度不足）时面板会被截断。补上 shiftY 让它贴着可视区边缘完整显示。
// 只覆盖 overflow，points 和 offset 仍取 rc-picker 内置位置
const PICKER_POPUP_ALIGN = { overflow: { adjustX: 1, adjustY: 1, shiftY: true } };

export default class Date extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    needLineLimit: PropTypes.bool,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: this.props.cell.value,
        });
      }
    }
  }

  editIcon = React.createRef();

  handleTableKeyDown = e => {
    const { updateEditingStatus } = this.props;

    switch (e.key) {
      case 'Escape':
        updateEditingStatus(false);
        break;
      default:
        break;
    }
  };

  handleChange = value => {
    const { ignoreErrorMessage, updateCell, updateEditingStatus, onValidate } = this.props;
    const validateResult = onValidate(value);
    const error = validateResult.errorType;

    if (error && !ignoreErrorMessage) {
      return;
    }

    updateCell({
      value,
    });
    this.setState({
      value,
    });
    updateEditingStatus(false);
  };

  handleClear = () => {
    this.handleChange('');
  };

  render() {
    const {
      className,
      style,
      tableFromModule,
      needLineLimit,
      cell,
      rowFormData,
      popupContainer,
      editable,
      isediting,
      rowIndex,
      error,
      updateEditingStatus,
      onClick,
      fromEmbed,
      ignoreErrorMessage,
    } = this.props;
    const { value } = this.state;
    let cellPopupContainer = popupContainer;

    if (
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD ||
      fromEmbed
    ) {
      cellPopupContainer = () => document.body;
    }

    return (
      <React.Fragment>
        <EditableCellCon
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          hideOutline
          style={style}
          iconRef={this.editIcon}
          iconName="access_time"
          iconClassName="dateEditIcon"
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          <Popover
            align={rowIndex === 0 ? FIRST_ROW_ERROR_ALIGN : ERROR_ALIGN}
            content={
              <CellErrorTips
                color={ignoreErrorMessage ? 'var(--color-warning)' : undefined}
                error={error}
                pos={rowIndex === 0 ? 'bottom' : 'top'}
              />
            }
            getPopupContainer={cellPopupContainer}
            open={isediting && !!error}
            placement={rowIndex === 0 ? 'bottomLeft' : 'topLeft'}
            noPadding
            styles={ERROR_POPOVER_STYLES}
            trigger={[]}
          >
            {value ? (
              <div
                className={cx('worksheetCellPureString userSelectNone ellipsis', { linelimit: needLineLimit })}
                title={renderText({ ...cell, value })}
              >
                {renderText({ ...cell, value })}
              </div>
            ) : (
              <div className="w100 h100" />
            )}
          </Popover>
          {isediting && error && <CellErrorTips error={error} pos={rowIndex === 0 ? 'bottom' : 'top'} />}
        </EditableCellCon>
        {isediting && (
          <ClickAwayable
            onClickAwayExceptions={[
              this.editIcon && this.editIcon.current,
              '.hap-picker-dropdown',
              '.cellControlDatePicker',
            ]}
            onClickAway={() => updateEditingStatus(false)}
          >
            <div className={cx('cellControlDatePicker', className)} style={style}>
              <div className="cellControlDatePickerCon">
                <TimePicker
                  {...cell}
                  formData={!rowFormData ? null : _.isFunction(rowFormData) ? rowFormData() : rowFormData}
                  value={value}
                  dropdownClassName="scrollInTable"
                  onChange={this.handleChange}
                  compProps={{
                    autoFocus: true,
                    open: isediting,
                    isCell: true,
                    getPopupContainer: getBodyPopupContainer,
                    popupAlign: PICKER_POPUP_ALIGN,
                  }}
                />
              </div>
            </div>
          </ClickAwayable>
        )}
      </React.Fragment>
    );
  }
}
