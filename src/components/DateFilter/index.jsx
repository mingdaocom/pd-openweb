import React, { useState, useEffect, Fragment } from 'react';
import { Dropdown, DatePicker } from 'antd';
import Trigger from 'rc-trigger';
import locale from 'antd/es/date-picker/locale/zh_CN';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';

const { RangePicker } = DatePicker;

const Menu = styled.div`
  width: 180px;
  padding: 10px 0;
  border-radius: 4px;

  .item {
    padding: 5px 10px;
  }
  .clearDate {
    color: red;
  }
  .active:not(.clearDate), .item:not(.clearDate):hover {
    color: #fff;
    background-color: #1890ff;
  }
`;

const dateMenu = [{
  id: 1,
  name: _l('今天'),
  getDate: () => [moment(), moment()]
}, {
  id: 2,
  name: _l('本月'),
  getDate: () => [moment().startOf('month'), moment().endOf('month')]
}, {
  id: 3,
  name: _l('上月'),
  getDate: () => [
    moment().subtract(1, 'month').startOf('month'),
    moment().subtract(1, 'month').endOf('month')
  ]
}, {
  id: 4,
  name: _l('最近七天'),
  getDate: () => [moment().subtract(6, 'days'), moment()]
}, {
  id: 'custom',
  name: _l('自定义时间'),
}, {
  id: 'clear',
  name: _l('清除')
}];

let lastSelectId = null;

const DateFilter = (props) => {
  const { noClear, onChange, popupContainer } = props;
  const [visible, setVisible] = useState(false);
  const [selectId, setSelectId] = useState(window.feedSelectDate || null);
  const [customDate, setCustomDate] = useState(window.feedCustomDate || []);

  useEffect(() => {
    const { getDate } = _.find(dateMenu, { id: selectId }) || {};
    if (selectId !== 'custom') {
      setVisible(false);
    }
    if (lastSelectId === selectId) {
      return;
    }
    if (selectId === 'clear') {
      onChange(null, null);
    }
    if (getDate) {
      const result = getDate();
      onChange(...result);
    }
    lastSelectId = selectId;
  }, [selectId]);

  const menu = (
    <Menu className="card dateFilterMenuWrap">
      {dateMenu.filter(data => noClear ? data.id !== 'clear' : true).map(item => (
        <Fragment key={item.id}>
          <div
            className={cx('item pointer', { active: selectId == item.id, clearDate: item.id === 'clear' })}
            onClick={() => {
              setSelectId(item.id);
              window.feedSelectDate = item.id;
            }}
          >
            {item.name}
          </div>
          {selectId === 'custom' && item.id === 'custom' && (
            <RangePicker
              autoFocus={true}
              allowClear={false}
              suffixIcon={null}
              bordered={false}
              locale={locale}
              format="YYYY/MM/DD"
              value={customDate}
              onChange={date => {
                window.feedCustomDate = date;
                onChange(...date);
                setCustomDate(date);
                setVisible(false);
              }}
            />
          )}
        </Fragment>
      ))}
    </Menu>
  );

  return (
    <Trigger
      popup={menu}
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [0, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
      getPopupContainer={() => popupContainer || document.body}
    >
      {props.children}
    </Trigger>
  );
}

export default DateFilter;
