import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import DatePicker from 'src/components/newCustomFields/widgets/Date';
// import DateTimePicker from 'ming-ui/components/NewDateTimePicker/date-time-picker';
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
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

  @autobind
  handleChange(value) {
    const { cell, updateCell, updateEditingStatus } = this.props;
    updateCell({
      value,
    });
    this.setState({
      value,
    });
    updateEditingStatus(false);
  }

  @autobind
  handleClear() {
    this.handleChange('');
  }

  render() {
    const {
      className,
      style,
      tableFromModule,
      needLineLimit,
      cell,
      popupContainer,
      editable,
      isediting,
      updateEditingStatus,
      onClick,
    } = this.props;
    const { value } = this.state;
    let cellPopupContainer = popupContainer;
    if (
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD
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
          {!!value && (
            <div className={cx('worksheetCellPureString userSelectNone ellipsis', { linelimit: needLineLimit })}>
              {renderText({ ...cell, value })}
            </div>
          )}
        </EditableCellCon>
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
                <DatePicker
                  {...cell}
                  dropdownClassName="scrollInTable"
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
