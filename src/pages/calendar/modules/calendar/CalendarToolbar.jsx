import React, { useMemo } from 'react';
import { Icon } from 'ming-ui';
import { Button, Tabs, Tooltip } from 'ming-ui/antd-components';
import { getViewItems } from './viewConfig';

export default function CalendarToolbar({ calendarRef, title, view, onCreate, onViewChange, onOpenSettings }) {
  const viewItems = useMemo(() => getViewItems(), []);

  const runCalendarAction = action => {
    const api = calendarRef.current?.getApi();
    if (api && typeof api[action] === 'function') api[action]();
  };

  return (
    <div className="reactCalendarToolbar">
      <div className="reactCalendarToolbarLeft">
        {view !== 'list' && (
          <>
            <Button style={{ '--hap-control-height': '32px' }} onClick={() => runCalendarAction('today')}>
              {_l('今天')}
            </Button>
            <Button.Group>
              <Button
                aria-label={_l('上一个')}
                style={{ '--hap-control-height': '32px' }}
                icon={<Icon icon="arrow-left-border" />}
                onClick={() => runCalendarAction('prev')}
              />
              <Button
                aria-label={_l('下一个')}
                style={{ '--hap-control-height': '32px' }}
                icon={<Icon icon="arrow-right-border" />}
                onClick={() => runCalendarAction('next')}
              />
            </Button.Group>
          </>
        )}
        <span className="reactCalendarTitle">{title}</span>
      </div>
      <div className="reactCalendarToolbarCenter">
        <Tabs className="reactCalendarViewTabs" activeKey={view} items={viewItems} onChange={onViewChange} />
      </div>
      <div className="reactCalendarToolbarRight">
        {(view === 'agendaWeek' || view === 'month') && (
          <Tooltip title={_l('日历设置')}>
            <Icon
              icon="settings"
              className="Font20 textTertiary pointer hoverColorPrimary"
              role="button"
              tabIndex={0}
              aria-label={_l('日历设置')}
              onClick={onOpenSettings}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenSettings();
                }
              }}
            />
          </Tooltip>
        )}
        <Button
          style={{ '--hap-control-height': '32px' }}
          className="reactCalendarCreateButton"
          type="primary"
          shape="round"
          icon={<Icon icon="plus" />}
          onClick={onCreate}
        >
          {_l('新日程')}
        </Button>
      </div>
    </div>
  );
}
