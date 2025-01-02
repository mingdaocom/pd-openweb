import React, { setState, useState } from 'react';
import styled from 'styled-components';
import { TimePicker } from 'antd';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import cx from 'classnames';
import { func, shape, string } from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

function getPicker(type) {
  return {
    4: 'month',
    5: 'year',
  }[type];
}
const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  .ant-picker {
    width: 100%;
    box-shadow: none;
    border: none;
    border-radius: 4px;
    .ant-picker-clear {
      display: none;
    }
    .ant-picker-input input {
      font-size: 13px;
    }
  }
  &:hover:not(.active) {
    border-color: #ccc;
  }
  &.active {
    border-color: #2196f3;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  width: 0;
  .Dropdown {
    width: 100%;
    .Dropdown--input {
      padding: 0 10px !important;
    }
    .Icon.ming {
      position: absolute;
      right: 10px;
      line-height: 32px;
    }
  }
  &.isEmpty {
    .Dropdown--input .value,
    .mui-datetime-picker {
      color: #bdbdbd;
    }
  }
`;

const RangePickerCon = styled.div`
  .ant-picker-input > input {
    font-size: 13px !important;
  }
  .ant-picker-suffix {
    display: none;
  }
`;

const Icon = styled.i`
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
  &.icon-cancel {
    cursor: pointer;
    &:hover {
      color: #777;
    }
  }
  &.clearIcon {
    display: none;
    position: absolute;
    right: 0;
    background: #fff;
  }
`;

export default function Time(props) {
  const { control, dateRange, minValue, maxValue, onChange = () => {} } = props;
  const [active, setActive] = useState();
  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
  const unit = String(control.unit);
  const timeFormat = unit === '1' ? 'HH:mm' : 'HH:mm:ss';
  const isEmpty = dateRange === 18 ? !(minValue && maxValue) : !dateRange;
  return (
    <Con className={cx({ active })}>
      <Content className={cx({ isEmpty })}>
        <RangePickerCon>
          <TimePicker.RangePicker
            format={timeFormat}
            locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
            value={minValue && maxValue ? [moment(minValue, timeFormat), moment(maxValue, timeFormat)] : []}
            onChange={moments => {
              if (!moments || !_.isArray(moments)) {
                moments = [];
              }
              onChange({
                dateRange: 18,
                filterType: 31,
                minValue: moments[0] && moments[0].format(timeFormat),
                maxValue: moments[1] && moments[1].format(timeFormat),
              });
            }}
          />
        </RangePickerCon>
      </Content>
      <Icon
        className={cx('icon', minValue || maxValue ? 'icon-cancel' : 'icon-event')}
        onClick={() => {
          onChange({ dateRange: 0, minValue: undefined, maxValue: undefined });
        }}
      />
    </Con>
  );
}

Time.propTypes = {
  dateRange: string,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
