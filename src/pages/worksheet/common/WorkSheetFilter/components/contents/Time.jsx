import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { TimePicker as AntTimePicker } from 'antd';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import TimePicker from 'src/components/newCustomFields/widgets/Time';
import { FILTER_CONDITION_TYPE } from '../../enum';
import _ from 'lodash';

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
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    const unit = String(control.unit);
    const timeFormat = _.includes(['1', '8'], unit) ? 'HH:mm' : 'HH:mm:ss';
    return (
      <div className="worksheetFilterDateCondition">
        {type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN ? (
          <div className="dateRangeInputCon">
            <AntTimePicker.RangePicker
              format={timeFormat}
              locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
              defaultValue={minValue && maxValue ? [moment(minValue, timeFormat), moment(maxValue, timeFormat)] : []}
              popupClassName="filterDateRangeInputPopup"
              onOpenChange={isOpen => {
                // 手动修复激活面板定位问题，官方有问题
                if (isOpen) {
                  const $arrow = $('.filterDateRangeInputPopup .ant-picker-range-arrow');
                  if ($arrow) {
                    const arrowLeft = $arrow.css('left');
                    $('.filterDateRangeInputPopup .ant-picker-panel-container').css({
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
          <div className="customDate dateInputCon">
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
                placeholder: _l('请选择'),
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
