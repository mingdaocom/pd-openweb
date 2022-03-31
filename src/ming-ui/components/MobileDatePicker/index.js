import React, { useState } from 'react';
import DatePicker from 'react-mobile-datepicker';
import PropTypes from 'prop-types';
import './index.less';

export default function MobileDatePicker(props) {
  const { isOpen, customHeader, value, onSelect, onCancel, precision = 'time', ...rest } = props;
  const date = {
    year: {
      format: _l('YYYY年'),
      caption: 'Year',
      step: 1,
    },
    month: {
      format: _l('M月'),
      caption: 'Mon',
      step: 1,
    },
    date: {
      format: _l('D日'),
      caption: 'Day',
      step: 1,
    },
  };
  const hour = {
    year: {
      format: _l('YYYY年'),
      caption: 'Year',
      step: 1,
    },
    month: {
      format: _l('M月'),
      caption: 'Mon',
      step: 1,
    },
    date: {
      format: _l('D日'),
      caption: 'Day',
      step: 1,
    },
    hour: {
      format: _l('hh时'),
      caption: 'Hour',
      step: 1,
    },
  };
  const minite = {
    year: {
      format: _l('YYYY年'),
      caption: 'Year',
      step: 1,
    },
    month: {
      format: _l('M月'),
      caption: 'Mon',
      step: 1,
    },
    date: {
      format: _l('D日'),
      caption: 'Day',
      step: 1,
    },
    hour: {
      format: _l('hh时'),
      caption: 'Hour',
      step: 1,
    },
    minute: {
      format: _l('mm分'),
      caption: 'Min',
      step: 1,
    },
  };
  const second = {
    year: {
      format: _l('YYYY年'),
      caption: 'Year',
      step: 1,
    },
    month: {
      format: _l('M月'),
      caption: 'Mon',
      step: 1,
    },
    date: {
      format: _l('D日'),
      caption: 'Day',
      step: 1,
    },
    hour: {
      format: _l('hh时'),
      caption: 'Hour',
      step: 1,
    },
    minute: {
      format: _l('mm分'),
      caption: 'Min',
      step: 1,
    },
    second: {
      format: _l('ss秒'),
      caption: 'Second',
      step: 1,
    },
  };

  const getDateConfig = precision => {
    switch (precision) {
      case 'date':
        return date;
      case 'hour':
        return hour;
      case 'minite':
        return minite;
      case 'second':
        return second;
      default:
        return second;
    }
  };
  return (
    <DatePicker
      customHeader={customHeader}
      isOpen={isOpen}
      dateConfig={getDateConfig(precision)}
      theme={'ios'}
      value={value}
      onSelect={onSelect}
      onCancel={onCancel}
      {...rest}
    ></DatePicker>
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
  customHeader: PropTypes.element,
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
};
