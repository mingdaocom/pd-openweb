import React, { Component, Fragment } from 'react';
import DatePicker from 'ming-ui/components/DatePicker/Calendar';
import { shape, number, func } from 'prop-types';
import moment from 'moment';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';

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
    datePickerVisible: false,
  };

  handleClick = () => {
    this.setState({ datePickerVisible: true });
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

  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };

  render() {
    const { data, defaultType } = this.props;
    const { datePickerVisible } = this.state;
    return (
      <Fragment>
        <DynamicValueInputWrap>
          {defaultType ? (
            <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
          ) : (
            <OtherFieldList {...this.props} onClick={this.handleClick} />
          )}
          <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
        </DynamicValueInputWrap>
        {datePickerVisible && (
          <DatePicker
            className="datePicker"
            onClickAwayExceptions={['.TimePicker-panel']}
            onClickAway={() => this.setState({ datePickerVisible: false })}
            style={{ margin: '0', width: '100%' }}
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
