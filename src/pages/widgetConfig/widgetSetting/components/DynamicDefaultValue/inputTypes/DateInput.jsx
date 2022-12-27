import React, { Component, Fragment } from 'react';
import DatePicker from 'ming-ui/components/DatePicker/Calendar';
import { shape, number, func } from 'prop-types';
import moment from 'moment';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { getDatePickerConfigs, getAdvanceSetting } from '../../../../util/setting';
import _ from 'lodash';

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
    defValue: '',
  };

  componentDidMount() {
    const { data } = this.props;
    const defSource = getAdvanceSetting(data, 'defsource');
    const { staticValue, cid = '' } = defSource[0] || {};
    if (!cid && staticValue && staticValue !== '2') {
      this.setState({
        defValue: moment(staticValue),
      });
    }
  }

  handleClick = () => {
    this.setState({ datePickerVisible: true });
  };
  handleAssignTimeChange = (date, formatMode) => {
    const { data } = this.props;
    const time = moment(date.format(formatMode)).format(data.type === 16 ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
    this.setState({ defValue: moment(time) });
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
    const { datePickerVisible, defValue } = this.state;
    const dateProps = getDatePickerConfigs(data);
    const formatMode = dateProps.formatMode;
    return (
      <Fragment>
        <DynamicValueInputWrap>
          {defaultType ? (
            <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
          ) : (
            <OtherFieldList {...this.props} onClick={this.handleClick} formatMode={formatMode} />
          )}
          <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
        </DynamicValueInputWrap>
        {datePickerVisible && (
          <DatePicker
            value={defValue || moment()}
            className="datePicker"
            onClickAwayExceptions={['.TimePicker-panel']}
            onClickAway={() => this.setState({ datePickerVisible: false })}
            style={{ margin: '0', width: '100%' }}
            {..._.pick(dateProps, ['mode', 'showMinute', 'showSecond'])}
            onChange={time => this.handleAssignTimeChange(time, formatMode)}
            onSelect={time => this.handleAssignTimeChange(time, formatMode)}
            onClear={this.clearTime}
            onOk={time => {
              this.handleAssignTimeChange(time, formatMode);
              this.setState({ datePickerVisible: false });
            }}
          />
        )}
      </Fragment>
    );
  }
}
