import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { TimePicker as AntTimePicker } from 'ming-ui/antd-components';
import TimePicker from 'src/components/Form/DesktopForm/widgets/Time';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

export default class Date extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
    dateRange: PropTypes.number,
    minValue: PropTypes.string,
    maxValue: PropTypes.string,
    type: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { control = {}, type, value, minValue, maxValue, onChange } = this.props;
    const unit = String(control.unit);
    const timeFormat = _.includes(['1', '8'], unit) ? 'HH:mm' : 'HH:mm:ss';
    return (
      <div className="worksheetFilterDateCondition">
        {type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN ? (
          <div className="dateRangeInputCon">
            <AntTimePicker.RangePicker
              format={timeFormat}
              defaultValue={minValue && maxValue ? [moment(minValue, timeFormat), moment(maxValue, timeFormat)] : []}
              classNames={{ popup: { root: 'filterDateRangeInputPopup' } }}
              onOpenChange={isOpen => {
                // 手动修复激活面板定位问题，官方有问题
                if (isOpen) {
                  const $arrow = $('.filterDateRangeInputPopup .hap-picker-range-arrow');

                  if ($arrow) {
                    const arrowLeft = $arrow.css('left');
                    $('.filterDateRangeInputPopup .hap-picker-panel-container').css({
                      marginLeft: parseInt(arrowLeft),
                    });
                  }
                }
              }}
              onChange={moments => {
                if (!moments || !_.isArray(moments)) {
                  moments = [];
                }

                onChange({
                  minValue: moments[0] && moments[0].format(timeFormat),
                  maxValue: moments[1] && moments[1].format(timeFormat),
                });
              }}
            />
          </div>
        ) : (
          <div className="customDate">
            <TimePicker
              {...control}
              value={value && moment(value, timeFormat)}
              onChange={timeValue => {
                onChange({
                  dateRange: 18,
                  value: timeValue ? moment(timeValue, timeFormat).format(timeFormat) : undefined,
                });
              }}
              compProps={{
                inheritFieldStyle: false,
                placeholder: _l('请选择'),
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
