import React, { useState } from 'react';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { DatePicker, Dropdown } from 'ming-ui/antd-components';
import './index.less';

const DATE_FILTER_MENU_STYLE = { minWidth: 180 };
const RANGE_PICKER_TRIGGER_STYLE = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
};

const DATE_PICK_OPTIONS = [
  {
    label: _l('不限时间'),
    key: 'clear',
    value: undefined,
  },
  {
    label: _l('今天'),
    key: 'today',
    value: [moment(new Date()).startOf('day').format(), moment(new Date()).endOf('day').format()],
  },
  {
    label: _l('最近7天'),
    key: 'last7',
    value: [moment(new Date()).subtract(6, 'days').startOf('day').format(), moment(new Date()).format()],
  },
  {
    label: _l('本月'),
    key: 'month',
    value: [moment(new Date()).startOf('month').format(), moment(new Date()).format()],
  },
  {
    label: _l('上月'),
    key: 'lastmonth',
    value: [
      moment(new Date()).subtract(1, 'months').startOf('month').format(),
      moment(new Date()).subtract(1, 'months').endOf('month').endOf('day').format(),
    ],
  },
  {
    label: _l('自定义'),
    key: 'custom',
    value: undefined,
  },
];

export default function DateFilter(props) {
  const { options = DATE_PICK_OPTIONS, value = DATE_PICK_OPTIONS[0], onChange } = props;
  const [visible, setVisible] = useState(false);
  const [rangePickerVisible, setRangePickerVisible] = useState(false);
  const menuItems = options.map(item => ({
    key: item.key,
    label:
      item.key === 'custom' ? (
        <div
          className="Relative"
          onClick={event => {
            event.stopPropagation();
            setRangePickerVisible(true);
          }}
        >
          {_l('自定义日期')}
          {rangePickerVisible && (
            <DatePicker.RangePicker
              allowClear={false}
              format="YYYY-MM-DD"
              open
              placement="bottomRight"
              style={RANGE_PICKER_TRIGGER_STYLE}
              value={value?.key === 'custom' && value.value ? value.value.map(date => moment(date)) : null}
              onChange={range => {
                if (!range || !range[0] || !range[1]) return;

                onChange({ ...item, value: range.map(date => date.format()) });
                setRangePickerVisible(false);
                setVisible(false);
              }}
              onOpenChange={open => {
                if (!open) {
                  setRangePickerVisible(false);
                }
              }}
            />
          )}
        </div>
      ) : (
        item.label
      ),
  }));

  return (
    <Dropdown
      destroyOnHidden
      open={visible}
      onOpenChange={open => {
        setVisible(open);
        if (!open) {
          setRangePickerVisible(false);
        }
      }}
      placement="bottomRight"
      trigger={['click']}
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: [value?.key || 'clear'],
        style: DATE_FILTER_MENU_STYLE,
        onClick: ({ key }) => {
          if (key === 'custom') return;

          onChange(options.find(item => item.key === key));
          setVisible(false);
        },
      }}
    >
      <span className="globalSearchDateFilter textTertiary valignWrapper">
        <Icon icon="event" className="mRight5 Font14" />
        {value.key === 'clear'
          ? _l('按更新时间')
          : value.key === 'custom'
            ? value.value
              ? `${moment(value.value[0]).format('YYYY-MM-DD')}${_l('至')}${moment(value.value[1]).format('YYYY-MM-DD')}`
              : _l('自定义日期')
            : value.label}
      </span>
    </Dropdown>
  );
}
