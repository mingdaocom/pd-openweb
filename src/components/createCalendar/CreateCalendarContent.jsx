import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { UserCard } from 'ming-ui';
import { Checkbox, DatePicker, Input, InputNumber, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import ajaxRequest from 'src/api/calendar';
import UploadFiles from 'src/components/UploadFiles';
import { htmlDecodeReg } from 'src/utils/core/string';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import timezoneOptions from './timezone';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATE_TIME_CONFIG = { format: 'HH:mm' };
const DEFAULT_CATEGORY = {
  value: '1',
  name: _l('工作日程'),
  colorClass: 'calendarColorBlue',
};
const REMIND_OPTIONS = [
  { label: _l('分钟'), value: '1' },
  { label: _l('小时'), value: '2' },
  { label: _l('天'), value: '3' },
  { label: _l('无'), value: '0' },
];
const REPEAT_TYPE_OPTIONS = [
  { label: _l('每天'), value: '0' },
  { label: _l('每周'), value: '1' },
  { label: _l('每月'), value: '2' },
  { label: _l('每年'), value: '3' },
];
const REPEAT_END_OPTIONS = [
  { label: _l('永不'), value: '0' },
  { label: _l('次数'), value: '1' },
  { label: _l('日期'), value: '2' },
];
const WEEK_DAY_BITS = [64, 1, 2, 4, 8, 16, 32];

const getWeekDayOptions = () =>
  WEEK_DAY_BITS.map((value, day) => ({
    label: moment().day(day).format('dd'),
    value,
  }));

const getWeekDayBit = date => WEEK_DAY_BITS[moment(date).day()];

const getDefaultRepeatConfig = start => ({
  type: '1',
  interval: 1,
  weekDays: [getWeekDayBit(start)],
  endType: '0',
  count: 1,
  untilDate: moment(start).startOf('day'),
});

const getRepeatUnit = type => {
  switch (type) {
    case '0':
      return _l('天');
    case '1':
      return _l('周');
    case '2':
      return _l('月');
    case '3':
      return _l('年');
    default:
      return '';
  }
};

const getRepeatSummary = (config, start) => {
  const intervalText = config.interval === 1 ? '' : ` ${config.interval} `;
  let message = '';

  if (config.type === '0') {
    message = `${_l('每')}${intervalText}${_l('天')}`;
  } else if (config.type === '1') {
    const selectedWeekDays = (config.weekDays.length ? config.weekDays : [getWeekDayBit(start)])
      .map(value => WEEK_DAY_BITS.indexOf(value))
      .filter(day => day >= 0)
      .sort((a, b) => a - b);

    message = `${_l('每')}${intervalText}${_l('周')} `;
    if (
      selectedWeekDays.length === 5 &&
      selectedWeekDays[0] === 1 &&
      selectedWeekDays[selectedWeekDays.length - 1] === 5
    ) {
      message += _l('在 工作日');
    } else {
      message += `${_l('星期')}${selectedWeekDays.map(day => moment().day(day).format('dd')).join('、')}`;
    }
  } else if (config.type === '2') {
    message = _l('每%0月 在第 %1 天', intervalText, moment(start).format('DD'));
  } else {
    message = _l('每%0年 在 %1', intervalText, moment(start).format(_l('MM月DD日')));
  }

  if (config.endType === '1') {
    message += `，${_l('共 %0 次', config.count)}`;
  } else if (config.endType === '2') {
    message += `，${_l('截止到 %0', moment(config.untilDate).format(_l('YYYY年MM月DD日')))}`;
  }

  return message;
};

const getCalendarUser = user => {
  if (!user) return null;

  const accountId = user.accountId || user.accountID || '';
  const account = user.account || '';
  if (!accountId && !account) return null;

  return {
    accountId,
    account,
    avatar: user.avatar || user.userHead,
    fullname: user.fullname || user.fullName || user.name,
  };
};

const getCalendarUserKey = user => user.accountId || `special-${user.account}`;

const getUniqueCalendarUsers = users =>
  _.uniqBy((Array.isArray(users) ? users : []).map(getCalendarUser).filter(Boolean), getCalendarUserKey).filter(
    user => user.accountId !== md.global.Account.accountId,
  );

const getCategoryLabel = category => (
  <span className="calendarCategoryOption flexRow alignItemsCenter minWidth0">
    <i className={`calendarCategoryColor ${category.colorClass}`} />
    <span className="ellipsis">{category.name}</span>
  </span>
);

function RepeatCalendarDialog({ initialValue, start, onCancel, onSubmit }) {
  const [value, setValue] = React.useState(() => ({
    ...initialValue,
    weekDays: [...initialValue.weekDays],
    untilDate: moment(initialValue.untilDate),
  }));
  const weekDayOptions = getWeekDayOptions();

  const updateValue = nextValue => setValue(current => ({ ...current, ...nextValue }));

  return (
    <Modal
      open
      okText={_l('确定')}
      title={_l('重复')}
      width={570}
      className="repeatDialogConfirm createCalendar_container"
      onCancel={onCancel}
      onOk={() => onSubmit(value)}
    >
      <div className="repeatCalendarForm">
        <div className="repeatCalendarRow">
          <div className="repeatCalendarLabel">{_l('重复类型')}</div>
          <Select
            className="w100"
            options={REPEAT_TYPE_OPTIONS}
            value={value.type}
            onChange={type => updateValue({ type })}
          />
        </div>
        <div className="repeatCalendarRow">
          <div className="repeatCalendarLabel">{_l('重复频率')}</div>
          <div className="flexRow alignItemsCenter gap8">
            <span>{_l('每')}</span>
            <InputNumber
              controls={false}
              max={30}
              min={1}
              value={value.interval}
              onChange={interval => updateValue({ interval: interval || 1 })}
            />
            <span>{getRepeatUnit(value.type)}</span>
          </div>
        </div>
        {value.type === '1' && (
          <div className="repeatCalendarRow">
            <div className="repeatCalendarLabel">{_l('重复日期')}</div>
            <Checkbox.Group
              className="repeatWeekDays"
              options={weekDayOptions}
              value={value.weekDays}
              onChange={weekDays => updateValue({ weekDays })}
            />
          </div>
        )}
        <div className="repeatCalendarRow">
          <div className="repeatCalendarLabel">{_l('结束日期')}</div>
          <div className="flexRow alignItemsCenter gap12">
            <Select
              className="repeatEndType"
              options={REPEAT_END_OPTIONS}
              value={value.endType}
              onChange={endType => updateValue({ endType })}
            />
            {value.endType === '1' && (
              <div className="flexRow alignItemsCenter gap8">
                <span>{_l('发生')}</span>
                <InputNumber
                  controls={false}
                  max={30}
                  min={1}
                  value={value.count}
                  onChange={count => updateValue({ count: count || 1 })}
                />
                <span>{_l('次后')}</span>
              </div>
            )}
            {value.endType === '2' && (
              <DatePicker
                allowClear={false}
                disabledDate={current => current && current.isBefore(moment(start).startOf('day'), 'day')}
                format={DATE_FORMAT}
                inputReadOnly
                value={value.untilDate}
                onChange={untilDate => untilDate && updateValue({ untilDate })}
              />
            )}
          </div>
        </div>
        <div className="repeatCalendarRow">
          <div className="repeatCalendarLabel">{_l('结果')}</div>
          <div className="repeatCalendarResult">{getRepeatSummary(value, start)}</div>
        </div>
      </div>
    </Modal>
  );
}

export default class CreateCalendarContent extends React.PureComponent {
  constructor(props) {
    super(props);

    const { settings } = props;
    const start = moment(settings.Start);
    const end = moment(settings.End);
    const members = getUniqueCalendarUsers(settings.MemberArray);
    const repeatConfig = settings.repeatConfig || getDefaultRepeatConfig(start);

    this.state = {
      title: settings.CalendarName || '',
      categoryId: String(settings.CategoryID || DEFAULT_CATEGORY.value),
      categoryOptions: [DEFAULT_CATEGORY],
      categoryLoading: false,
      categoryLoaded: false,
      dateRange: [start, end],
      allDay: !!settings.allDay,
      showTimezone: false,
      timezone: settings.timezone,
      remindType: settings.RemindType || (settings.allDay ? '2' : '1'),
      remindTime: settings.RemindTime || (settings.allDay ? 1 : 15),
      telRemind: !!settings.telRemind,
      repeatEnabled: !!settings.repeatEnabled,
      repeatConfig,
      repeatDialogOpen: false,
      members,
      busyMembers: {},
      showAddress: !!settings.Address,
      address: settings.Address || '',
      description: htmlDecodeReg(settings.Message || settings.Description || ''),
      calendarPrivate: !!settings.calendarPrivate,
    };
    this.busyRequestId = 0;
  }

  componentDidMount() {
    this.syncSettings();
    this.props.settings.isAttachComplete = true;
    this.refreshBusyMembers(this.state.members, this.state.dateRange, this.state.allDay);
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.busyRequestId += 1;
  }

  syncSettings = nextState => {
    const state = nextState || this.state;
    const { settings } = this.props;

    settings.CalendarName = state.title;
    settings.CategoryID = state.categoryId;
    settings.Start = state.dateRange[0].format(DATE_TIME_FORMAT);
    settings.End = state.dateRange[1].format(DATE_TIME_FORMAT);
    settings.allDay = state.allDay;
    settings.timezone = state.timezone;
    settings.RemindType = state.remindType;
    settings.RemindTime = state.remindTime;
    settings.telRemind = state.telRemind;
    settings.repeatEnabled = state.repeatEnabled;
    settings.repeatConfig = state.repeatConfig;
    settings.MemberArray = state.members;
    settings.Address = state.address;
    settings.Description = state.description;
    settings.calendarPrivate = state.calendarPrivate;
  };

  updateState = (nextState, callback) => {
    this.setState(nextState, () => {
      this.syncSettings();
      callback?.();
    });
  };

  loadCategories = open => {
    if (!open || this.state.categoryLoaded || this.state.categoryLoading) return;

    this.setState({ categoryLoading: true });
    ajaxRequest
      .getUserAllCalCategories()
      .then(source => {
        if (this.unmounted) return;
        if (source.code !== 1) throw new Error();

        const categoryOptions = [DEFAULT_CATEGORY].concat(
          (source.data || []).map(category => ({
            value: String(category.catID),
            name: category.catName,
            colorClass: this.props.settings.ColorClass[category.color] || 'calendarColorBlue',
          })),
        );
        this.setState({ categoryOptions, categoryLoaded: true, categoryLoading: false });
      })
      .catch(_requestError => {
        if (this.unmounted) return;
        this.setState({ categoryLoading: false });
        alertIfNotUnauthorized(_requestError, _l('操作失败，请稍后再试'), 3);
      });
  };

  handleDateChange = nextValue => {
    if (!Array.isArray(nextValue) || nextValue.length !== 2 || !nextValue.every(value => value?.isValid())) return;

    const [currentStart, currentEnd] = this.state.dateRange;
    const [nextStart, nextEnd] = nextValue;
    const shouldAutoFillEndTime =
      !this.state.allDay &&
      nextStart.isSame(currentStart, 'day') &&
      !nextStart.isSame(currentStart, 'minute') &&
      nextEnd.isSame(currentEnd, 'minute') &&
      nextStart.isSame(nextEnd, 'day');
    const dateRange = shouldAutoFillEndTime ? [nextStart, nextStart.clone().add(1, 'hour')] : nextValue;

    this.updateState({ dateRange }, () => {
      this.refreshBusyMembers(this.state.members, dateRange, this.state.allDay);
    });
  };

  handleAllDayChange = event => {
    const allDay = event.target.checked;

    this.updateState({ allDay, showTimezone: allDay ? false : this.state.showTimezone }, () => {
      this.refreshBusyMembers(this.state.members, this.state.dateRange, allDay);
    });
  };

  handleRemindTypeChange = remindType => {
    this.updateState({
      remindType,
      remindTime: remindType === '1' ? 15 : 1,
      telRemind: remindType === '0' ? false : this.state.telRemind,
    });
  };

  handleMemberSelect = (users, isCancel = false) => {
    const sourceUsers = Array.isArray(users) ? users : [];
    const selectedUsers = getUniqueCalendarUsers(users);

    if (isCancel) {
      selectedUsers[0] && this.handleRemoveMember(getCalendarUserKey(selectedUsers[0]));
      return;
    }

    if (sourceUsers.some(user => (user.accountId || user.accountID) === md.global.Account.accountId)) {
      alert(_l('不能添加自己'));
    }

    const members = _.uniqBy(this.state.members.concat(selectedUsers), getCalendarUserKey);
    this.updateState({ members }, () => {
      this.refreshBusyMembers(members, this.state.dateRange, this.state.allDay);
    });
  };

  handleRemoveMember = accountKey => {
    const members = this.state.members.filter(member => getCalendarUserKey(member) !== accountKey);
    const busyMembers = { ...this.state.busyMembers };

    delete busyMembers[accountKey];
    this.updateState({ members, busyMembers });
  };

  getBusyDateRange = (dateRange, allDay) => ({
    start: allDay ? dateRange[0].format(`${DATE_FORMAT} 00:00`) : dateRange[0].format(DATE_TIME_FORMAT),
    end: allDay ? dateRange[1].format(`${DATE_FORMAT} 23:59`) : dateRange[1].format(DATE_TIME_FORMAT),
  });

  refreshBusyMembers = (members, dateRange, allDay) => {
    if (!md.global.Account.projects.length) return;

    const requestId = ++this.busyRequestId;
    const { start, end } = this.getBusyDateRange(dateRange, allDay);
    const accountMembers = members.filter(member => member.accountId);

    Promise.all(
      accountMembers.map(member =>
        ajaxRequest
          .getUserBusyStatus({
            accountID: member.accountId,
            startDate: moment(start).toISOString(),
            endDate: moment(end).toISOString(),
          })
          .then(source => [getCalendarUserKey(member), source.code === 1 ? source.data : null])
          .catch(() => [getCalendarUserKey(member), null]),
      ),
    ).then(entries => {
      if (this.unmounted || requestId !== this.busyRequestId) return;
      this.setState({
        busyMembers: entries.reduce((result, [key, value]) => (value ? { ...result, [key]: value } : result), {}),
      });
    });
  };

  getMemberSelectProps = () => {
    const selectedAccountIds = this.state.members.map(member => member.accountId).filter(Boolean);

    return {
      sourceId: '',
      projectId: '',
      fromType: 5,
      isDynamic: true,
      selectedAccountIds,
      SelectUserSettings: {
        callback: this.handleMemberSelect,
        projectId: this.props.settings.ProjectID,
        selectedAccountIds,
      },
      onSelect: this.handleMemberSelect,
    };
  };

  getBusyTooltipTitle = (member, busyInfo) => {
    const { start } = this.getBusyDateRange(this.state.dateRange, this.state.allDay);
    const currentYear = moment().year();
    const getFormat = (date, format) => (moment(date).year() === currentYear ? format.replace('YYYY-', '') : format);

    return (
      <div className="memberBusyCalendarsWrap">
        <div className="mBottom5 colorError">{_l('他的日程与您创建的日程有冲突')}</div>
        <div className="memberCalendars mBottom20">
          {(busyInfo.calendars || []).map(calendar => {
            const allDay = calendar.allDay === 'true';
            const format = allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
            const calendarTime = `${moment(calendar.startTime).format(getFormat(calendar.startTime, format))} - ${moment(
              calendar.endTime,
            ).format(getFormat(calendar.endTime, format))}${allDay ? _l('(全天)') : ''}`;

            return (
              <div className="memberCalendarItem" key={calendar.calendarID}>
                <div className="memberCalendarTime textTertiary">{calendarTime}</div>
                <div className="memberCalendarName overflow_ellipsis">
                  <a
                    className="overflow_ellipsis"
                    href={pathCompletion(`/apps/calendar/detail_${calendar.calendarID}`)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {calendar.calendarName}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <a
          href={pathCompletion(`/apps/calendar/home?userID=${member.accountId}&date=${start}&view=agendaWeek`)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {_l('查看他的空闲时间 >')}
        </a>
      </div>
    );
  };

  renderMember = member => {
    const accountKey = getCalendarUserKey(member);
    const busyInfo = this.state.busyMembers[accountKey];
    const avatar = (
      <span className="calendarMemberAvatarWrap">
        <span className="removeMember circle" onClick={() => this.handleRemoveMember(accountKey)}>
          <i className="icon-delete Icon" />
        </span>
        <img alt={member.fullname || _l('出席者头像')} className="createMember circle" src={member.avatar} />
      </span>
    );

    return (
      <span className="calendarMember" key={accountKey}>
        {member.accountId ? <UserCard sourceId={member.accountId}>{avatar}</UserCard> : avatar}
        {busyInfo?.isBusy && (
          <Tooltip placement="bottom" title={this.getBusyTooltipTitle(member, busyInfo)}>
            <span className="busyIcon pointer" />
          </Tooltip>
        )}
      </span>
    );
  };

  render() {
    const { settings } = this.props;
    const {
      address,
      allDay,
      calendarPrivate,
      categoryId,
      categoryLoading,
      categoryOptions,
      dateRange,
      description,
      members,
      remindTime,
      remindType,
      repeatConfig,
      repeatDialogOpen,
      repeatEnabled,
      showAddress,
      showTimezone,
      telRemind,
      timezone,
      title,
    } = this.state;
    const selectCategoryOptions = categoryOptions.map(category => ({
      value: category.value,
      label: getCategoryLabel(category),
    }));

    return (
      <div className="createCalendarForm">
        <div className="createCalendarFormRow mTop0">
          <div className="createCalendarLabel">{_l('日程标题')}</div>
          <div className="createCalendarTitleControl flexRow gap12">
            <Input
              autoFocus
              className="flex"
              id="txtCalendarName"
              placeholder={_l('请输入日程标题…')}
              spellCheck={false}
              value={title}
              onChange={event => this.updateState({ title: event.target.value })}
            />
            <Select
              className="calendarCategorySelect"
              loading={categoryLoading}
              options={selectCategoryOptions}
              value={categoryId}
              onChange={value => this.updateState({ categoryId: value })}
              onOpenChange={this.loadCategories}
            />
          </div>
        </div>
        <div className="createCalendarFormRow">
          <div className="createCalendarLabel">{_l('起止时间')}</div>
          <div className="flexRow alignItemsCenter gap12 minWidth0">
            <DatePicker.RangePicker
              allowClear={false}
              className="flex minWidth0"
              format={allDay ? DATE_FORMAT : DATE_TIME_FORMAT}
              inputReadOnly
              needConfirm
              showTime={allDay ? false : DATE_TIME_CONFIG}
              value={dateRange}
              onChange={this.handleDateChange}
            />
            {!allDay && !showTimezone && (
              <span className="calendarTextAction colorPrimary" onClick={() => this.setState({ showTimezone: true })}>
                {_l('时区')}
              </span>
            )}
          </div>
        </div>
        {showTimezone && !allDay && (
          <div className="createCalendarFormRow">
            <div className="createCalendarLabel">{_l('时区')}</div>
            <Select
              className="calendarTimezoneSelect"
              optionFilterProp="label"
              options={timezoneOptions}
              showSearch
              value={timezone}
              onChange={value => this.updateState({ timezone: value })}
            />
          </div>
        )}
        <div className="createCalendarFormRow compactRow">
          <div className="createCalendarLabel" />
          <Checkbox checked={allDay} onChange={this.handleAllDayChange}>
            {_l('全天日程')}
          </Checkbox>
        </div>
        <div className="createCalendarFormRow">
          <div className="createCalendarLabel">{_l('提醒%19000')}</div>
          <div className="calendarRemindControl flexRow alignItemsCenter gap8">
            {remindType !== '0' && (
              <React.Fragment>
                <span>{_l('提前%19001')}</span>
                <InputNumber
                  className="calendarRemindNumber"
                  controls={false}
                  max={99}
                  min={1}
                  value={remindTime}
                  onChange={value => this.updateState({ remindTime: value || 1 })}
                />
              </React.Fragment>
            )}
            <Select
              className="calendarRemindType"
              options={REMIND_OPTIONS}
              value={remindType}
              onChange={this.handleRemindTypeChange}
            />
            {remindType !== '0' && (
              <Checkbox checked={telRemind} onChange={event => this.updateState({ telRemind: event.target.checked })}>
                {_l('电话提醒')}
              </Checkbox>
            )}
          </div>
        </div>
        {repeatEnabled && (
          <div className="createCalendarFormRow compactRow">
            <div className="createCalendarLabel">{_l('重复')}</div>
            <div className="flexRow alignItemsCenter gap12">
              <Checkbox checked onChange={event => this.updateState({ repeatEnabled: event.target.checked })}>
                {getRepeatSummary(repeatConfig, dateRange[0])}
              </Checkbox>
              <span
                className="calendarTextAction colorPrimary"
                onClick={() => this.setState({ repeatDialogOpen: true })}
              >
                {_l('修改')}
              </span>
            </div>
          </div>
        )}
        <div className="createCalendarFormRow attendeeRow">
          <div className="createCalendarLabel">{_l('出席者')}</div>
          <div className="createAddMemberBox">
            {members.map(this.renderMember)}
            <UserSelectPopover {...this.getMemberSelectProps()}>
              <i className="icon-task-add-member-circle createAddMember colorPrimary" />
            </UserSelectPopover>
          </div>
        </div>
        {showAddress && (
          <div className="createCalendarFormRow">
            <div className="createCalendarLabel">{_l('会议地点')}</div>
            <Input
              placeholder={_l('添加会议地点…')}
              value={address}
              onChange={event => this.updateState({ address: event.target.value })}
            />
          </div>
        )}
        <div className="createCalendarFormRow">
          <div className="createCalendarLabel">{_l('描述和附件')}</div>
          <div className="createCalendarControl">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder={_l('填写描述')}
              spellCheck={false}
              value={description}
              onChange={event => this.updateState({ description: event.target.value })}
            />
            <UploadFiles
              isInitCall
              kcAttachmentData={settings.createCalendarAttachments.kcAttachmentData}
              maxWidth={220}
              temporaryData={settings.createCalendarAttachments.attachmentData}
              onKcAttachmentDataUpdate={value => {
                settings.createCalendarAttachments.kcAttachmentData = value;
              }}
              onTemporaryDataUpdate={value => {
                settings.createCalendarAttachments.attachmentData = value;
              }}
              onUploadComplete={isComplete => {
                settings.isAttachComplete = isComplete;
              }}
            />
          </div>
        </div>
        <div className="calendarTabs flexRow gap28">
          {!showAddress && (
            <span className="calendarTextAction colorPrimary" onClick={() => this.setState({ showAddress: true })}>
              {_l('会议地点')}
            </span>
          )}
          {!repeatEnabled && (
            <span className="calendarTextAction colorPrimary" onClick={() => this.setState({ repeatDialogOpen: true })}>
              {_l('重复')}
            </span>
          )}
        </div>
        {!!md.global.Account.projects.length && (
          <div className="createCalendarFormRow compactRow">
            <div className="createCalendarLabel" />
            <Checkbox
              checked={calendarPrivate}
              onChange={event => this.updateState({ calendarPrivate: event.target.checked })}
            >
              {_l('私密日程')}
            </Checkbox>
          </div>
        )}
        {repeatDialogOpen && (
          <RepeatCalendarDialog
            initialValue={repeatConfig}
            start={dateRange[0]}
            onCancel={() => this.setState({ repeatDialogOpen: false })}
            onSubmit={value => this.updateState({ repeatConfig: value, repeatEnabled: true, repeatDialogOpen: false })}
          />
        )}
      </div>
    );
  }
}

export class CreateCalendarDialog extends React.PureComponent {
  state = { confirmLoading: false };

  componentWillUnmount() {
    this.unmounted = true;
  }

  handleSubmit = async () => {
    if (this.submitting) return false;

    this.submitting = true;
    this.setState({ confirmLoading: true });
    let success = false;

    try {
      success = await this.props.onSubmit();
      return success;
    } finally {
      if (!success && !this.unmounted) {
        this.submitting = false;
        this.setState({ confirmLoading: false });
      }
    }
  };

  render() {
    const { open, onAfterClose, onClose, settings } = this.props;

    return (
      <Modal
        open={open}
        afterOpenChange={nextOpen => {
          if (!nextOpen) onAfterClose?.();
        }}
        cancelText={_l('取消')}
        confirmLoading={this.state.confirmLoading}
        okText={_l('创建')}
        title={_l('创建日程')}
        width={680}
        className={`${settings.frameid} createCalendar_container`}
        onCancel={onClose}
        onOk={this.handleSubmit}
      >
        <CreateCalendarContent settings={settings} />
      </Modal>
    );
  }
}
