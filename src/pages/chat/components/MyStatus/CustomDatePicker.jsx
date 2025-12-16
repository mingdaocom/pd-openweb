import React, { useRef, useState } from 'react';
import { DatePicker, Select } from 'antd';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { dateOptions } from './config';
import { formatDateShow } from './util';

const { RangePicker } = DatePicker;
const { Option } = Select;

const RangePickerWrap = styled.div`
  height: 36px;
  line-height: 36px;
  padding: 0 12px;
  border-radius: 3px;
  border: 1px solid #dddddd;
`;
const PopupWrap = styled.div`
  width: 100%;
  min-width: 434px;
  height: 365px;
  background: #ffffff;
  border-radius: 8px 0 0 8px;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
  .ant-picker-dropdown-range,
  .ant-picker-panel-container,
  .ant-picker-panels,
  .ant-picker-panel {
    width: 100%;
    box-shadow: unset !important;
  }
  .ant-picker-time-panel {
    flex: 1;
    min-width: 0;
  }
`;

// 自定义RangePicker包装器，确保样式只作用于当前组件
const StyledRangePicker = styled(RangePicker)`
  &.ant-picker {
    width: 100%;
  }
`;

const range = (start, end) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export default function CustomDatePicker(props) {
  const { beginTime, endTime, changeDate = () => {} } = props;
  const [fixedValue, setFixedValue] = useState(props.durationOption || 10);
  const [popupVisible, setPopupVisible] = useState(false);
  const [rangePickerVisible, setRangePickerVisible] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [{ startDate, endDate }, setDateInfo] = useState({
    startDate: beginTime ? moment(beginTime) : null,
    endDate: endTime ? moment(endTime) : null,
  });
  const lang = getCurrentLangCode();
  const $ref = useRef(null);

  const onOk = date => {
    if (date && date.length && date[0] && date[1]) {
      // 验证结束时间必须大于开始时间
      if (date[1].isAfter(date[0])) {
        setPopupVisible(false);
        setRangePickerVisible(false);
        setShowDatePicker(false);
        setDateInfo({
          startDate: date[0],
          endDate: date[1],
        });
        changeDate({ startDate: date[0], endDate: date[1] });
      }
    }
  };

  // 处理时间选择
  const handleTimeSelect = value => {
    if (value === 1000) {
      // 选择"自定义时间"时，显示自定义时间选择器
      setFixedValue(value);
      setShowDatePicker(true);
      changeDate({ fixedValue: value });
      setPopupVisible(true);
      setRangePickerVisible(true);
      setDateInfo({ startDate: null, endDate: null });
    } else {
      // 选择固定时间时，切换到固定时间模式
      setFixedValue(value);
      setShowDatePicker(false);
      setDateInfo({ startDate: null, endDate: null });
      changeDate({ fixedValue: value });
    }
  };

  // 如果选择的是自定义时间，显示自定义时间选择器
  if (fixedValue === 1000 && showDatePicker) {
    return (
      <Trigger
        action={['click']}
        popupVisible={popupVisible}
        onPopupVisibleChange={visible => {
          setPopupVisible(visible);
          setRangePickerVisible(visible);
          !visible && setShowDatePicker(false);
        }}
        popup={
          <PopupWrap ref={$ref}>
            <StyledRangePicker
              locale={lang === 1 ? en_US : lang === 2 ? ja_JP : lang === 3 ? zh_TW : zh_CN}
              disabledDate={date => moment().isAfter(date, 'day')}
              disabledTime={(date, type) => {
                if (!date) return {};
                const isToday = date && moment().isSame(date, 'day');

                if (type === 'start') {
                  return {
                    disabledHours: () => (isToday ? range(0, moment().get('hour')) : []),
                    disabledMinutes: () => (isToday ? range(0, moment().get('minute')) : []),
                  };
                }
                return { disabledHours: () => [], disabledMinutes: () => [] };
              }}
              value={[startDate, endDate]}
              open={rangePickerVisible}
              showTime={{
                hideDisabledOptions: true,
                format: 'HH:mm',
                defaultValue: [moment('00:00:00', 'HH:mm'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm"
              getPopupContainer={() => $ref.current}
              onChange={([start, end]) => {
                // 验证结束时间不能小于开始时间
                if (start && end && end.isBefore(start)) {
                  // 如果结束时间小于开始时间，清空结束时间
                  setDateInfo({ startDate: start, endDate: null });
                } else {
                  setDateInfo({ startDate: start, endDate: end });
                }
              }}
              onOk={onOk}
              onOpenChange={open => {
                setRangePickerVisible(open);
                if (!open) {
                  setPopupVisible(false);
                }
              }}
            />
          </PopupWrap>
        }
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 2],
          overflow: { adjustX: true, adjustY: true },
        }}
        stretch="width"
      >
        <RangePickerWrap className="w100 flexRow alignItemsCenter Hand">
          <div className="flex">
            {startDate && endDate
              ? `${formatDateShow(startDate)} - ${formatDateShow(endDate)}`
              : _l('请选择自定义时间')}
          </div>
          <Icon icon="arrowDown" />
        </RangePickerWrap>
      </Trigger>
    );
  }

  // 固定时间模式
  return (
    <Select
      className="w100"
      value={
        fixedValue === 1000 && startDate && endDate
          ? `${formatDateShow(startDate)} - ${formatDateShow(endDate)}`
          : fixedValue
      }
      onSelect={handleTimeSelect}
    >
      {dateOptions.map(item => (
        <Option key={item.value} value={item.value}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
}
