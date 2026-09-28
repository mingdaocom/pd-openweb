import React, { useState } from 'react';
import moment from 'moment';
import { DatePicker, Dropdown, Tooltip } from 'ming-ui/antd-components';
import Config from '../config';

const DROPDOWN_MENU_STYLE = { minWidth: 120 };
const RANGE_PICKER_STYLES = {
  root: {
    pointerEvents: 'none',
    opacity: 0,
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
  },
};
const formatDate = date => moment(date).format('YYYY-MM-DD');

const getDateFilter = (id, pastDays) => {
  const today = formatDate(moment());
  const yesterday = formatDate(moment().subtract(1, 'day'));
  const beginOfCurrentMonth = moment().startOf('M');

  switch (id) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'yesterday':
    case 'pastSevenDays':
    case 'pastThirtyDays':
      return {
        startDate: formatDate(moment().subtract(pastDays, 'day')),
        endDate: id === 'yesterday' ? yesterday : today,
      };
    case 'currentWeek':
      return { startDate: formatDate(moment().subtract(7, 'd')), endDate: today };
    case 'currentMonth':
      return { startDate: formatDate(beginOfCurrentMonth), endDate: today };
    case 'prevMonth':
      return {
        startDate: formatDate(moment(beginOfCurrentMonth).subtract(1, 'M')),
        endDate: formatDate(moment(beginOfCurrentMonth).subtract(1, 'day')),
      };
  }
};

export default function DatePickerFilter(props) {
  const { updateData, dataConfig, placement = 'bottomRight', tooltipProps, children } = props;
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const dateFilterConfig = dataConfig || Config.DATE_FILTER;

  const closeDropdown = () => {
    setOpen(false);
    setPanelVisible(false);
  };

  const handleClick = (id, pastDays) => {
    const data = getDateFilter(id, pastDays);
    closeDropdown();
    updateData({ ...data, dateItem: id });
  };

  const handleCustomChange = (id, value) => {
    if (value && (value.length !== 2 || value.some(date => !date))) {
      return;
    }

    closeDropdown();
    updateData(
      value
        ? { startDate: formatDate(value[0]), endDate: formatDate(value[1]), dateItem: id }
        : { startDate: '', endDate: '' },
    );
  };

  const menuItems = dateFilterConfig.map(({ id, text, pastDays }) => {
    if (id !== 'custom') {
      return {
        key: id,
        label: text,
        onClick: () => handleClick(id, pastDays),
      };
    }

    return {
      key: id,
      label: (
        <div
          onClick={event => {
            event.stopPropagation();
            setPanelVisible(true);
          }}
        >
          <span>{text}</span>
          <div onClick={event => event.stopPropagation()}>
            <DatePicker.RangePicker
              open={panelVisible}
              format="YYYY-MM-DD"
              placement="bottomRight"
              styles={RANGE_PICKER_STYLES}
              onOpenChange={nextOpen => {
                if (!nextOpen) {
                  setPanelVisible(false);
                }
              }}
              onChange={value => handleCustomChange(id, value)}
            />
          </div>
        </div>
      ),
    };
  });

  const dropdown = (
    <Dropdown
      open={open}
      trigger={['click']}
      placement={placement}
      onOpenChange={nextOpen => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setPanelVisible(false);
        }
      }}
      menu={{ items: menuItems, style: DROPDOWN_MENU_STYLE }}
    >
      {tooltipProps ? (
        <span>
          <Tooltip {...tooltipProps}>{children}</Tooltip>
        </span>
      ) : (
        children
      )}
    </Dropdown>
  );

  return dropdown;
}
