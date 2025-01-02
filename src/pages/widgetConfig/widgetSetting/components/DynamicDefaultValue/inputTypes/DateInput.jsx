import React, { Component } from 'react';
import { shape, number, func } from 'prop-types';
import moment from 'moment';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap, WrapMaxOrMin } from '../styled';
import { getDatePickerConfigs } from '../../../../util/setting';
import _ from 'lodash';
import { MdAntDateRangePicker, MdAntDatePicker } from 'ming-ui';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';

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
    defValue: '',
    isDynamic: false,
  };

  componentDidMount() {
    this.updateValue();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.dynamicValue, this.props.dynamicValue)) {
      this.updateValue(nextProps);
    }
  }

  updateValue(nextProps) {
    const { dynamicValue = [] } = nextProps || this.props;
    const { staticValue, cid = '' } = _.get(dynamicValue, '0') || {};
    const tempValue = !cid && staticValue && staticValue !== '2' ? staticValue : '';
    this.setState({
      defValue: tempValue || '',
      isDynamic: !!cid || _.includes(['2'], staticValue),
    });
  }

  handleClick = () => {
    this.updateValue();
  };

  handleDateChange = (date, formatMode) => {
    const { data, withMaxOrMin } = this.props;

    if (_.isNull(date)) {
      this.setState({ defValue: '', isDynamic: false });
      this.props.onDynamicValueChange([]);
      return;
    }

    const formatDate = value => {
      let formatText = data.type === 16 ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
      if (withMaxOrMin) {
        formatText = formatText.replace(/-/g, '/');
      }
      return moment(value.format(formatMode)).format(formatText);
    };

    const time = _.isArray(date) ? `${formatDate(date[0])}-${formatDate(date[1])}` : formatDate(date);
    this.setState({ defValue: time });
    const newValue = [{ rcid: '', cid: '', staticValue: time, ...(time.includes('-') ? {} : { time }) }];
    this.props.onDynamicValueChange(newValue);
  };

  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };

  renderContent() {
    const { data, withMaxOrMin, from } = this.props;
    const { isDynamic, defValue = '' } = this.state;
    const dateProps = getDatePickerConfigs(data);
    const formatMode = dateProps.formatMode;

    if (isDynamic) {
      return <OtherFieldList {...this.props} onClick={this.handleClick} formatMode={formatMode} />;
    }
    if (withMaxOrMin && from === DYNAMIC_FROM_MODE.FAST_FILTER) {
      const [minValue, maxValue] = defValue.split('-');
      return (
        <WrapMaxOrMin className="flexRow alignItemsCenter">
          <MdAntDateRangePicker
            className="customAntPicker timeMaxOrMinCon"
            key={defValue}
            value={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
            showTime={dateProps.mode === 'datetime'}
            picker={dateProps.mode === 'datetime' ? 'date' : dateProps.mode}
            format={dateProps.formatMode}
            onChange={time => this.handleDateChange(time, formatMode)}
          />
        </WrapMaxOrMin>
      );
    }

    return (
      <MdAntDatePicker
        value={defValue ? moment(defValue) : ''}
        className="datePicker"
        format={dateProps.formatMode}
        showTime={dateProps.mode === 'datetime'}
        picker={dateProps.mode === 'datetime' ? 'date' : dateProps.mode}
        onChange={time => this.handleDateChange(time, formatMode)}
        onOk={time => this.handleDateChange(time, formatMode)}
      />
    );
  }

  render() {
    const { defaultType } = this.props;

    return (
      <DynamicValueInputWrap>
        {defaultType ? <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} /> : this.renderContent()}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
