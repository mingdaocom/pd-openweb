import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Popover } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import DatePicker from 'src/components/Form/DesktopForm/widgets/Date';
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
// rc-picker 内置的浮层位置只有翻转（adjustX/adjustY），而翻转仅在「翻到另一侧可见面积更大」时生效，
// 上下都放不下（如屏幕高度不足）时面板会被截断。补上 shiftY 让它贴着可视区边缘完整显示。
// 只覆盖 overflow，points 和 offset 仍取 rc-picker 内置位置
const PICKER_POPUP_ALIGN = { overflow: { adjustX: 1, adjustY: 1, shiftY: true } };
const getBodyPopupContainer = () => document.body;

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
    const { ignoreErrorMessage, tableFromModule, updateCell, updateEditingStatus, onValidate } = this.props;
    const validateResult = onValidate(value);
    const error = validateResult.errorType;

    if (error && !ignoreErrorMessage) {
      if (tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
        this.setState({
          value,
        });
      }

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
      rowFormData = () => [],
      masterData = () => {},
      style,
      tableFromModule,
      needLineLimit,
      cell,
      popupContainer,
      editable,
      isediting,
      rowIndex,
      error,
      updateEditingStatus,
      updateCell,
      onClick,
      fromEmbed,
      ignoreErrorMessage,
      appId,
      masterAppId,
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
          iconName="bellSchedule"
          iconClassName="dateEditIcon"
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          <Popover
            getPopupContainer={cellPopupContainer}
            open={isediting && !!error}
            content={<CellErrorTips error={error} pos={rowIndex === 0 ? 'bottom' : 'top'} />}
            trigger={[]}
            placement={rowIndex === 0 ? 'bottomLeft' : 'topLeft'}
            align={rowIndex === 0 ? FIRST_ROW_ERROR_ALIGN : ERROR_ALIGN}
            noPadding
            styles={ERROR_POPOVER_STYLES}
          >
            {value ? (
              <div
                className={cx('worksheetCellPureString userSelectNone ellipsis', { linelimit: needLineLimit })}
                title={renderText({ ...cell, value }, { appId: masterAppId || appId })}
              >
                {renderText({ ...cell, value }, { appId: masterAppId || appId })}
              </div>
            ) : (
              <div className="w100 h100" />
            )}
            {isediting && error && (
              <CellErrorTips
                error={error}
                color={ignoreErrorMessage ? 'var(--color-warning)' : undefined}
                pos={rowIndex === 0 ? 'bottom' : 'top'}
              />
            )}
          </Popover>
        </EditableCellCon>
        {isediting && (
          <ClickAwayable
            onClickAwayExceptions={[
              this.editIcon && this.editIcon.current,
              '.hap-picker-dropdown',
              '.cellControlDatePicker',
            ]}
            onClickAway={() => {
              updateEditingStatus(false);
              if (tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST) {
                if (cell.value !== value) {
                  updateCell({
                    value,
                  });
                }
              }
            }}
          >
            <div className={cx('cellControlDatePicker', className)} style={style}>
              <div className="cellControlDatePickerCon">
                <DatePicker
                  {...cell}
                  {...(tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? { value } : {})}
                  formData={_.isFunction(rowFormData) ? rowFormData() : rowFormData}
                  appId={masterAppId || appId}
                  masterData={masterData()}
                  dropdownClassName="scrollInTable"
                  onChange={this.handleChange}
                  compProps={{
                    showDatePicker: isediting,
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
