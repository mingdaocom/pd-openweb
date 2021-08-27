import React, { Component, Fragment } from 'react';
import DatePicker from 'ming-ui/components/DatePicker/Calendar';
import { arrayOf, shape, string, number, func } from 'prop-types';
import moment from 'moment';
import { OtherFieldList, SelectOtherField } from '../../components';
import { DynamicValueInputWrap } from '../../styled';
import { getDateType } from '../../util';
import ClickAwayMenu from './ClickAwayMenu';

export default class DateInput extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    data: shape({ enumDefault: number }),
    clearOldDefault: func,
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    clearOldDefault: _.noop,
  };
  constructor(props) {
    super(props);
    const { data, onDynamicValueChange, clearOldDefault } = props;
    const { default: defaultValue } = data;
    if (defaultValue) {
      onDynamicValueChange([{ cid: '', rcid: '', staticValue: defaultValue }]);
      clearOldDefault({ default: '', enumDefault: 0 });
    }
  }
  state = {
    selectTimeVisible: false,
    datePickerVisible: false,
  };

  handleClick = () => {
    this.setState({ selectTimeVisible: true });
  };
  handleTimeSelect = type => {
    const { value, id } = type;
    if (id === 'assignTime') {
      this.setState({ datePickerVisible: true, selectTimeVisible: false });
      return;
    }
    if (id === 'clear') {
      this.setState({ selectTimeVisible: false });
      this.props.onDynamicValueChange([]);
      return;
    }
    const newValue = [{ rcid: '', cid: '', staticValue: value, time: id }];
    this.setState({ selectTimeVisible: false });
    this.props.onDynamicValueChange(newValue);
  };
  handleAssignTimeChange = date => {
    const { data } = this.props;
    const time = data.type === 16 ? moment(date).format('YYYY-MM-DD HH:mm') : moment(date).format('YYYY-MM-DD');
    const newValue = [{ rcid: '', cid: '', staticValue: time, time }];
    this.props.onDynamicValueChange(newValue);
  };

  clearTime = () => {
    this.setState({ datePickerVisible: false });
    this.props.onDynamicValueChange([]);
  };

  render() {
    const { data, dynamicValue } = this.props;
    const { selectTimeVisible, datePickerVisible } = this.state;
    return (
      <Fragment>
        <DynamicValueInputWrap>
          <OtherFieldList {...this.props} onClick={this.handleClick} />
          {selectTimeVisible && (
            <ClickAwayMenu
              dynamicValue={dynamicValue}
              types={getDateType(data)}
              handleTimeSelect={this.handleTimeSelect}
              onClickAway={() => this.setState({ selectTimeVisible: false })}
            />
          )}
          <SelectOtherField {...this.props} />
        </DynamicValueInputWrap>
        {datePickerVisible && (
          <DatePicker
            className="datePicker"
            onClickAwayExceptions={['.TimePicker-panel']}
            onClickAway={() => this.setState({ datePickerVisible: false })}
            style={{ margin: '0' }}
            mode={data.type === 16 ? 'datetime' : 'date'}
            onChange={this.handleAssignTimeChange}
            onSelect={this.handleAssignTimeChange}
            onClear={this.clearTime}
            onOk={time => {
              this.handleAssignTimeChange(time);
              this.setState({ datePickerVisible: false });
            }}
          />
        )}
      </Fragment>
    );
  }
}
