import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import TimePicker from 'src/components/newCustomFields/widgets/Time';
import { renderText } from 'src/utils/control';
import EditableCellCon from '../EditableCellCon';
import CellErrorTips from './comps/CellErrorTip';

const ClickAwayable = createDecoratedComponent(withClickAway);

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value });
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
        <Trigger
          getPopupContainer={cellPopupContainer}
          popupVisible={isediting && !!error}
          popup={
            <CellErrorTips
              color={ignoreErrorMessage ? '#ff933e' : undefined}
              error={error}
              pos={rowIndex === 0 ? 'bottom' : 'top'}
            />
          }
          destroyPopupOnHide
          zIndex="1051"
          popupAlign={{
            points: rowIndex === 0 ? ['tl', 'bl'] : ['bl', 'tl'],
            offset: rowIndex === 0 ? [0, -3] : [0, 0],
          }}
        >
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
            {!!value && (
              <div
                className={cx('worksheetCellPureString userSelectNone ellipsis', { linelimit: needLineLimit })}
                title={renderText({ ...cell, value })}
              >
                {renderText({ ...cell, value })}
              </div>
            )}
            {isediting && error && <CellErrorTips error={error} pos={rowIndex === 0 ? 'bottom' : 'top'} />}
          </EditableCellCon>
        </Trigger>
        {isediting && (
          <ClickAwayable
            onClickAwayExceptions={[
              this.editIcon && this.editIcon.current,
              '.ant-picker-dropdown',
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
                  onChange={this.handleChange}
                  compProps={{
                    autoFocus: true,
                    open: isediting,
                    getPopupContainer: cellPopupContainer,
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
