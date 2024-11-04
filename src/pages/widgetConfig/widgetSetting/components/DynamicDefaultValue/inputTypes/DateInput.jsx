import React, { Component } from 'react';
import DatePicker from 'ming-ui/components/DatePicker/Calendar';
import { shape, number, func } from 'prop-types';
import moment from 'moment';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap, WrapMaxOrMin } from '../styled';
import { getDatePickerConfigs, getAdvanceSetting } from '../../../../util/setting';
import _ from 'lodash';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import { MdAntDateRangePicker } from 'ming-ui';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';

function getPicker(type) {
  return {
    4: 'month',
    5: 'year',
  }[type];
}
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
    maxOrmin: '',
  };

  componentDidMount() {
    this.updateValue();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.updateValue(nextProps);
    }
  }

  updateValue = nextProps => {
    const { data } = nextProps || this.props;
    const defSource = getAdvanceSetting(data, 'defsource');
    const { staticValue, cid = '' } = _.get(defSource, '0') || {};
    if (!cid && staticValue && staticValue !== '2') {
      this.setState({
        defValue: moment(staticValue),
        maxOrmin: staticValue,
      });
    } else {
      this.setState({
        defValue: moment(),
        maxOrmin: staticValue,
      });
    }
  };

  handleClick = () => {
    this.setState({ datePickerVisible: true });
  };
  handleAssignTimeChange = (date, formatMode) => {
    if (_.isNull(date)) {
      this.clearTime();
      return;
    }
    const { data } = this.props;
    const time = moment(date.format(formatMode)).format(data.type === 16 ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
    this.setState({ defValue: moment(time) });
    const newValue = [{ rcid: '', cid: '', staticValue: time, time }];
    this.props.onDynamicValueChange(newValue);
  };

  onChangeMaxOrMin = result => {
    const { onDynamicValueChange = () => {} } = this.props;
    if (!result.minValue && !result.maxValue) {
      this.setState({ maxOrmin: `` });
      return onDynamicValueChange([]);
    }
    this.setState({ maxOrmin: `${result.minValue}-${result.maxValue}` });
    return onDynamicValueChange([
      {
        cid: '',
        rcid: '',
        staticValue: `${result.minValue}-${result.maxValue}`,
      },
    ]);
  };

  clearTime = () => {
    this.setState({ datePickerVisible: false });
    this.props.onDynamicValueChange([]);
  };

  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };

  renderWrapMaxOrMin = () => {
    const { data, withMaxOrMin, from } = this.props;
    const { maxOrmin = '' } = this.state;
    if (!withMaxOrMin || from !== DYNAMIC_FROM_MODE.FAST_FILTER) {
      return;
    }
    const showValueFormat = getShowFormat(data);
    const timeFormat = showValueFormat.split(' ')[1];

    const minValue = maxOrmin ? maxOrmin.split('-')[0] : '';
    const maxValue = maxOrmin ? maxOrmin.split('-')[1] : '';
    const showType = _.get(data, 'advancedSetting.showtype');
    return (
      <WrapMaxOrMin className="flexRow alignItemsCenter">
        <MdAntDateRangePicker
          className="customAntPicker timeMaxOrMinCon"
          key={maxOrmin}
          value={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
          showTime={timeFormat ? { format: timeFormat } : false}
          picker={getPicker(showType)}
          format={showValueFormat}
          onChange={moments => {
            if (!moments || !_.isArray(moments)) {
              moments = [];
            }
            this.onChangeMaxOrMin({
              minValue: moments[0] && moments[0].format('YYYY/MM/DD HH:mm:ss'),
              maxValue: moments[1] && moments[1].format('YYYY/MM/DD HH:mm:ss'),
            });
          }}
        />
      </WrapMaxOrMin>
    );
  };

  render() {
    const { data, defaultType, withMaxOrMin, from } = this.props;
    const { datePickerVisible, defValue } = this.state;
    const dateProps = getDatePickerConfigs(data);
    const formatMode = dateProps.formatMode;
    return (
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : withMaxOrMin && from === DYNAMIC_FROM_MODE.FAST_FILTER ? (
          this.renderWrapMaxOrMin()
        ) : (
          <OtherFieldList {...this.props} onClick={this.handleClick} formatMode={formatMode} />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />

        {datePickerVisible && (
          <DatePicker
            value={defValue || moment()}
            className="datePicker"
            onClickAwayExceptions={['.TimePicker-panel']}
            onClickAway={() => this.setState({ datePickerVisible: false })}
            style={{ margin: '0', top: '100%', width: '100%', position: 'absolute', zIndex: '1050' }}
            {..._.pick(dateProps, ['mode', 'showMinute', 'showSecond'])}
            onChange={time => this.handleAssignTimeChange(time, formatMode)}
            onSelect={time => this.handleAssignTimeChange(time, formatMode)}
            onClear={() => this.clearTime()}
            onOk={time => {
              this.handleAssignTimeChange(time, formatMode);
              this.setState({ datePickerVisible: false });
            }}
          />
        )}
      </DynamicValueInputWrap>
    );
  }
}
