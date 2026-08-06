import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-mobile-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import './index.less';

const getDate = (date, minuteStep) => {
  if (date) {
    date = new Date(moment(date));
  } else if (minuteStep) {
    date = new Date(moment().set({ m: 0, s: 0 }));
  } else {
    date = new Date();
  }

  return date;
};

const getWeekdayText = day => [_l('日'), _l('一'), _l('二'), _l('三'), _l('四'), _l('五'), _l('六')][day];
const PRECISION_UNIT = {
  year: 'year',
  month: 'month',
  date: 'day',
  hour: 'hour',
  minite: 'minute',
  second: 'second',
};

const getPrecisionRangeDate = (date, precision, type) => {
  if (!date) return date;

  const momentDate = moment(date);

  if (!momentDate.isValid()) return date;

  const unit = PRECISION_UNIT[precision] || 'second';

  return momentDate[type === 'max' ? 'endOf' : 'startOf'](unit).toDate();
};

const getDateInRange = (date, min, max) => {
  if (min && moment(date).isBefore(min)) return min;
  if (max && moment(date).isAfter(max)) return max;

  return date;
};

export default function MobileDatePicker(props) {
  const {
    isOpen,
    customHeader,
    value,
    onSelect,
    onCancel,
    onClose,
    precision = 'second',
    confirmText,
    cancelText,
    minuteStep,
    min,
    max,
    ...rest
  } = props;

  const clearDisable =
    !value || /^[A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(.+\)$/.test(value);
  const pickerMin = useMemo(() => getPrecisionRangeDate(min, precision, 'min'), [min, precision]);
  const pickerMax = useMemo(() => getPrecisionRangeDate(max, precision, 'max'), [max, precision]);
  const [dateTime, setDateTime] = useState(getDateInRange(getDate(value, minuteStep), pickerMin, pickerMax));

  useEffect(() => {
    setDateTime(getDateInRange(getDate(value, minuteStep), pickerMin, pickerMax));
  }, [value, minuteStep, pickerMin, pickerMax]);

  const year = {
    format: 'YYYY',
    caption: _l('年'),
    step: 1,
  };
  const month = {
    format: 'MM',
    caption: _l('月'),
    step: 1,
  };
  const date = {
    format: currentDate => `${moment(currentDate).format('DD')} ${getWeekdayText(currentDate.getDay())}`,
    caption: _l('日/周'),
    step: 1,
  };
  const hour = {
    format: 'hh',
    caption: _l('时'),
    step: 1,
  };
  const minute = {
    format: 'mm',
    caption: _l('分'),
    step: minuteStep || 1,
  };
  const second = {
    format: 'ss',
    caption: _l('秒'),
    step: 1,
  };
  const dateConfig = {
    year: { year },
    month: { year, month },
    date: { year, month, date },
    hour: { year, month, date, hour },
    minite: { year, month, date, hour, minute },
    second: { year, month, date, hour, minute, second },
  };

  const handleClear = () => {
    if (clearDisable) return;
    onCancel();
  };

  const renderHeader = customHeader => {
    return (
      <div className="customHeaderBox">
        <span className="headerText">{customHeader}</span>
        <span className={`btnClear ${clearDisable ? 'btnDisable' : ''}`} onClick={handleClear}>
          {_l('清除')}
        </span>
      </div>
    );
  };

  return (
    <DatePicker
      customHeader={renderHeader(customHeader)}
      isOpen={isOpen}
      dateConfig={dateConfig[precision]}
      showCaption={true}
      theme={'ios'}
      value={dateTime}
      min={pickerMin}
      max={pickerMax}
      onSelect={onSelect}
      onCancel={onClose}
      confirmText={confirmText || _l('确认')}
      cancelText={cancelText || _l('取消')}
      onChange={date => {
        if (minuteStep === 1) {
          setDateTime(date);
          return;
        }

        const currentMinute = moment(date).minute();

        if (moment(date).isBefore(moment(dateTime)) && currentMinute % minuteStep) {
          setDateTime(
            new Date(
              moment(date).set({
                m: currentMinute - (currentMinute % minuteStep),
              }),
            ),
          );
        } else if (moment(dateTime).isBefore(moment(date)) && currentMinute % minuteStep) {
          setDateTime(
            new Date(
              moment(date).set({
                m: currentMinute - (currentMinute % minuteStep) + minuteStep,
              }),
            ),
          );
        } else {
          setDateTime(date);
        }
      }}
      {...rest}
    />
  );
}

MobileDatePicker.propTypes = {
  /**
   * 是否显示日期组件
   */
  isOpen: PropTypes.bool,
  /**
   * 头部显示信息
   */
  customHeader: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  /**
   * 值为date类型
   */
  value: PropTypes.any,
  /**
   * 确认选中日期回调，参数date为选中时间
   */
  onSelect: PropTypes.func,
  /**
   * 取消回调
   */
  onCancel: PropTypes.func,
  /**
   * 日期显示精准度
   * time:精确时间YYYY-MM-DD HH:mm:ss
   * date:精确时间YYYY-MM-DD
   */
  showType: PropTypes.string,
  /**
   *  日期显示精确度
   *  year: YYYY
   *  month: YYYY-MM
   *  date: YYYY-MM-DD
   *  hour:  YYYY-MM-DD HH
   *  minite: YYYY-MM-DD HH:mm
   *  second: YYYY-MM-DD HH:mm:ss
   */
  precision: PropTypes.string,
  /**
   * 确认文本
   */
  confirmText: PropTypes.element,
  /**
   * 取消文本
   */
  cancelText: PropTypes.element,
};
