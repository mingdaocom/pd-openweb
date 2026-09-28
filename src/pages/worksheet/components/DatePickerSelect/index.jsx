import React, { useState } from 'react';
import moment from 'moment';
import { DatePicker, Dropdown } from 'ming-ui/antd-components';

const TODAY = new Date();
const CUSTOM_TIME_FORMAT = {
  hour: 'YYYY-MM-DD HH',
  minute: 'YYYY-MM-DD HH:mm',
  second: 'YYYY-MM-DD HH:mm:ss',
};
const CUSTOM_TIME_PICKER_FORMAT = {
  hour: 'HH',
  minute: 'HH:mm',
  second: 'HH:mm:ss',
};
const DROPDOWN_MENU_STYLE = { width: 239 };
const RANGE_PICKER_STYLES = {
  root: {
    pointerEvents: 'none',
    opacity: 0,
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
  },
};

const DEFAULT_OPTIONS = [
  {
    label: _l('今天'),
    key: 'today',
    value: [moment(TODAY).startOf('day').format(), moment(TODAY).endOf('day').format()],
  },
  {
    label: _l('昨天'),
    key: 'yesterday',
    value: [
      moment(TODAY).subtract(1, 'days').startOf('day').format(),
      moment(TODAY).subtract(1, 'days').endOf('day').format(),
    ],
  },
  {
    label: _l('前天'),
    key: 'beforeYesterday',
    value: [
      moment(TODAY).subtract(2, 'days').startOf('day').format(),
      moment(TODAY).subtract(2, 'days').endOf('day').format(),
    ],
  },
  {
    label: _l('本周'),
    key: 'tswk',
    value: [moment(TODAY).startOf('week').format(), moment(TODAY).endOf('day').format()],
  },
  {
    label: _l('上周'),
    key: 'lswk',
    value: [
      moment(TODAY).subtract(1, 'w').startOf('week').format(),
      moment(TODAY).subtract(1, 'w').endOf('week').endOf('day').format(),
    ],
  },
  {
    label: _l('本月'),
    key: 'month',
    value: [moment(TODAY).startOf('month').format(), moment(TODAY).endOf('day').format()],
  },
  {
    label: _l('上月'),
    key: 'lastmonth',
    value: [
      moment(TODAY).subtract(1, 'months').startOf('month').format(),
      moment(TODAY).subtract(1, 'months').endOf('month').endOf('day').format(),
    ],
  },
  {
    label: _l('自定义'),
    key: 'custom',
    value: undefined,
  },
];

function getCustomRangeLabel(value, timeMode) {
  const format = CUSTOM_TIME_FORMAT[timeMode] || CUSTOM_TIME_FORMAT.minute;

  return value.map(time => moment(time).format(format)).join(' ~ ');
}

export default function DatePickSelect(props) {
  const {
    options = DEFAULT_OPTIONS,
    onChange,
    onOpenChange,
    open,
    selectedValue,
    timePicker = false,
    timeMode = 'minute',
    align,
    children,
  } = props;
  const [innerOpen, setInnerOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const dropdownOpen = open ?? innerOpen;
  const dateTimeFormat = CUSTOM_TIME_FORMAT[timeMode] || CUSTOM_TIME_FORMAT.minute;
  const timeFormat = CUSTOM_TIME_PICKER_FORMAT[timeMode] || CUSTOM_TIME_PICKER_FORMAT.minute;

  const updateOpen = (nextOpen, info) => {
    setInnerOpen(nextOpen);
    if (!nextOpen) {
      setPanelVisible(false);
    }

    if (info?.source !== 'menu') {
      onOpenChange?.(nextOpen);
    }
  };

  const handleOptionChange = item => {
    updateOpen(false);
    onChange(item);
  };

  const handleCustomChange = (item, value) => {
    if (value && (value.length !== 2 || value.some(time => !time))) {
      return;
    }

    handleOptionChange({
      ...item,
      label: timePicker && value ? getCustomRangeLabel(value, timeMode) : item.label,
      value: value?.map(time => moment(time).format()),
    });
  };

  const menuItems = options.map(item => {
    if (item.key !== 'custom') {
      return {
        key: item.key,
        label: item.label,
        onClick: () => handleOptionChange(item),
      };
    }

    return {
      key: item.key,
      label: (
        <div
          onClick={event => {
            event.stopPropagation();
            setPanelVisible(true);
          }}
        >
          <span>{_l('自定义日期')}</span>
          <div onClick={event => event.stopPropagation()}>
            <DatePicker.RangePicker
              open={panelVisible}
              value={selectedValue}
              format={timePicker ? dateTimeFormat : 'YYYY-MM-DD'}
              showTime={timePicker ? { format: timeFormat } : false}
              needConfirm={timePicker}
              placement="bottomRight"
              styles={RANGE_PICKER_STYLES}
              onOpenChange={nextOpen => {
                if (!nextOpen) {
                  setPanelVisible(false);
                }
              }}
              onChange={value => handleCustomChange(item, value)}
            />
          </div>
        </div>
      ),
    };
  });

  return (
    <Dropdown
      open={dropdownOpen}
      trigger={['click']}
      placement="bottomRight"
      align={align}
      onOpenChange={updateOpen}
      menu={{ items: menuItems, style: DROPDOWN_MENU_STYLE }}
    >
      {children}
    </Dropdown>
  );
}
