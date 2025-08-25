import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { func, number, shape } from 'prop-types';
import { MdAntTimePicker, MdAntTimeRangePicker } from 'ming-ui';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap, WrapMaxOrMin } from '../styled';

export default class TimeInput extends Component {
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
    this.state = {
      defValue: '',
      isDynamic: false,
    };
  }

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

  handleTimeChange = (date, formatMode) => {
    if (_.isNull(date)) {
      this.setState({ defValue: '', isDynamic: false });
      this.props.onDynamicValueChange([]);
      return;
    }

    const formatDate = value => moment(value).format(formatMode);

    const time = _.isArray(date) ? `${formatDate(date[0])}-${formatDate(date[1])}` : formatDate(date);
    this.setState({ defValue: time });
    const newValue = [{ rcid: '', cid: '', staticValue: time }];
    this.props.onDynamicValueChange(newValue);
  };

  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };

  renderContent() {
    const { data, withMaxOrMin, from } = this.props;
    const { isDynamic, defValue = '' } = this.state;
    const formatMode = data.unit === '6' ? 'HH:mm:ss' : 'HH:mm';

    if (isDynamic) {
      return <OtherFieldList {...this.props} onClick={this.handleClick} formatMode={formatMode} />;
    }
    if (withMaxOrMin && from === DYNAMIC_FROM_MODE.FAST_FILTER) {
      const [minValue, maxValue] = defValue.split('-');
      return (
        <WrapMaxOrMin className="flexRow alignItemsCenter">
          <MdAntTimeRangePicker
            showNow
            className="timeMaxOrMinCon"
            placeholder={[_l('开始时间'), _l('结束时间')]}
            value={minValue && maxValue ? [moment(minValue, formatMode), moment(maxValue, formatMode)] : []}
            format={formatMode}
            onChange={time => this.handleTimeChange(time, formatMode)}
          />
        </WrapMaxOrMin>
      );
    }

    return (
      <MdAntTimePicker
        className="datePicker"
        format={formatMode}
        value={defValue ? moment(defValue, formatMode) : ''}
        onChange={time => this.handleTimeChange(time, formatMode)}
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
