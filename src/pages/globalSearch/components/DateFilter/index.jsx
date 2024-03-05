import React, { useState, useRef, useEffect } from 'react';
import Trigger from 'rc-trigger';
import moment from 'moment';
import cx from 'classnames';
import { Icon, DatePicker } from 'ming-ui';
import './index.less';

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

  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  return (
    <Trigger
      className="dateFilterTrigger"
      popupVisible={visible}
      onPopupVisibleChange={visible => setVisible(visible)}
      action={['click']}
      popupAlign={{ points: ['tr', 'br'] }}
      popup={
        <ul className="globalSearch-data-filter-select">
          {options.map(item => {
            return item.key !== 'custom' ? (
              <li className={cx('selectItem', {active: value && value.key===item.key})} key={`data-filter-select-${item.key}`} onClick={() => {
                onChange(item);
                setVisible(false);
              }}>
                {item.label}
              </li>
            ) : (
              <div key={`data-filter-select-${item.key}`} ref={ref}>
                <DatePicker.RangePicker
                  offset={{ left: -533, top: 0 }}
                  popupParentNode={() => ref.current}
                  onOk={([start, end]) => {
                    onChange({ ...item, value: [moment(start).format(), moment(end).format()] });
                    setVisible(false);
                  }}
                  onClear={() => onChange({ ...item, value: undefined })}
                  onSelect={() => {}}
                >
                  <li className={cx('selectItem', {active: value && value.key===item.key})}>{_l('自定义日期')}</li>
                </DatePicker.RangePicker>
              </div>
            );
          })}
        </ul>
      }
    >
      <span className="globalSearchDateFilter Gray_9e valignWrapper">
        <Icon icon="event" className="mRight5 Font14"/>
        {value.key==='clear' ? _l('按更新时间') : value.key==='custom' ? `${moment(value.value[0]).format('YYYY-MM-DD')}${_l('至')}${moment(value.value[1]).format('YYYY-MM-DD')}` : value.label}
      </span>
    </Trigger>
  );
}
