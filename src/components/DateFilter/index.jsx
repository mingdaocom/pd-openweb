import React, { forwardRef, useState } from 'react';
import moment from 'moment';
import { DatePicker, Dropdown } from 'ming-ui/antd-components';

const { RangePicker } = DatePicker;
const DROPDOWN_MENU_STYLE = { width: 180 };
const RANGE_PICKER_STYLES = {
  root: {
    pointerEvents: 'none',
    opacity: 0,
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
  },
};

const dateMenu = [
  {
    id: 1,
    name: _l('今天'),
    getDate: () => [moment(), moment()],
  },
  {
    id: 2,
    name: _l('本月'),
    getDate: () => [moment().startOf('month'), moment().endOf('month')],
  },
  {
    id: 3,
    name: _l('上月'),
    getDate: () => [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
  },
  {
    id: 4,
    name: _l('最近七天'),
    getDate: () => [moment().subtract(6, 'days'), moment()],
  },
  {
    id: 'custom',
    name: _l('自定义时间'),
  },
  {
    id: 'clear',
    name: _l('清除'),
  },
];

const updateFeedDateCache = (selectId, customDate) => {
  window.feedSelectDate = selectId;
  if (customDate !== undefined) {
    window.feedCustomDate = customDate;
  }
};

const DateFilter = forwardRef((props, ref) => {
  const { children, noClear, onChange, ...triggerProps } = props;
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [selectId, setSelectId] = useState(window.feedSelectDate || null);
  const [customDate, setCustomDate] = useState(window.feedCustomDate || []);

  const updateOpen = nextOpen => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPanelVisible(false);
    }
  };

  const handlePresetChange = item => {
    const date = item.getDate ? item.getDate() : [null, null];

    updateFeedDateCache(item.id);
    setSelectId(item.id);
    onChange(...date);
    updateOpen(false);
  };

  const handleCustomChange = date => {
    if (!date || date.length !== 2 || date.some(value => !value)) return;

    updateFeedDateCache('custom', date);
    setSelectId('custom');
    setCustomDate(date);
    onChange(...date);
    updateOpen(false);
  };

  const menuItems = dateMenu
    .filter(item => !noClear || item.id !== 'clear')
    .map(item => {
      if (item.id !== 'custom') {
        return {
          key: String(item.id),
          label: item.name,
          danger: item.id === 'clear',
          onClick: () => handlePresetChange(item),
        };
      }

      return {
        key: item.id,
        label: (
          <div
            onClick={event => {
              event.stopPropagation();
              updateFeedDateCache(item.id);
              setSelectId(item.id);
              setPanelVisible(true);
            }}
          >
            <span>{item.name}</span>
            <div onClick={event => event.stopPropagation()}>
              <RangePicker
                open={panelVisible}
                allowClear={false}
                format="YYYY/MM/DD"
                placement="bottomRight"
                styles={RANGE_PICKER_STYLES}
                value={customDate}
                onOpenChange={nextOpen => {
                  if (!nextOpen) {
                    setPanelVisible(false);
                  }
                }}
                onChange={handleCustomChange}
              />
            </div>
          </div>
        ),
      };
    });

  return (
    <Dropdown
      {...triggerProps}
      ref={ref}
      open={open}
      onOpenChange={updateOpen}
      placement="bottomRight"
      trigger={['click']}
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: selectId === null || selectId === 'clear' ? [] : [String(selectId)],
        style: DROPDOWN_MENU_STYLE,
      }}
    >
      {children}
    </Dropdown>
  );
});

DateFilter.displayName = 'DateFilter';

export default DateFilter;
