import React, { useState } from 'react';
import { Button, Modal, Radio, Select } from 'ming-ui/antd-components';
import { DEFAULT_CALENDAR_SETTINGS } from './calendarPreferences';

const LABEL_STYLE = { width: 96, flexShrink: 0 };
const SELECT_STYLE = { width: '100%' };
const BODY_STYLE = { body: { paddingTop: 20, paddingBottom: 40 } };
const RESET_BUTTON_STYLE = { padding: 0 };

export default function CalendarSettings({ settings, showWeekDays = true, onSave, onClose }) {
  const [draft, setDraft] = useState(settings);
  const weekdays = [_l('星期日'), _l('星期一'), _l('星期二'), _l('星期三'), _l('星期四'), _l('星期五'), _l('星期六')];

  return (
    <Modal
      open
      title={_l('日历设置')}
      width={560}
      styles={BODY_STYLE}
      okText={_l('确定')}
      cancelText={_l('取消')}
      onOk={() => onSave(draft)}
      onCancel={onClose}
      footerLeftElement={
        <Button type="link" style={RESET_BUTTON_STYLE} onClick={() => setDraft({ ...DEFAULT_CALENDAR_SETTINGS })}>
          {_l('恢复默认')}
        </Button>
      }
    >
      {showWeekDays && (
        <div className="flexRow alignItemsCenter mBottom32">
          <span className="textTertiary" style={LABEL_STYLE} id="calendarWeekDaysLabel">
            {_l('每周天数')}
          </span>
          <Radio.Group
            aria-labelledby="calendarWeekDaysLabel"
            value={draft.weekDays}
            onChange={event => setDraft({ ...draft, weekDays: event.target.value })}
          >
            <Radio value={7}>{_l('7天')}</Radio>
            <Radio value={5}>{_l('5天')}</Radio>
          </Radio.Group>
        </div>
      )}
      <div className="flexRow alignItemsCenter">
        <label className="textTertiary" style={LABEL_STYLE} htmlFor="calendarFirstDay">
          {_l('星期开始于')}
        </label>
        <Select
          id="calendarFirstDay"
          style={SELECT_STYLE}
          value={draft.firstDay}
          options={weekdays.map((label, value) => ({ label, value }))}
          onChange={firstDay => setDraft({ ...draft, firstDay })}
        />
      </div>
    </Modal>
  );
}
