import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import ajaxRequest from 'src/api/calendar';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import createShare from 'src/components/createShare/createShare';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { CreateCalendarDialog } from './CreateCalendarContent';
import './css/createCalendar.less';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const WEEK_DAY_BITS = [64, 1, 2, 4, 8, 16, 32];

const addDay = days => moment().add(days, 'day').format('MM/DD/YYYY');

const getWeekDay = value => {
  const weekDays = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7 };
  return weekDays[value];
};

const getDateFromMessage = message => {
  if (!message) return null;

  const dateReg =
    /(今天)|(明天)|(后天)|下周([一二三四五六日])|周([一二三四五六日])|(([0-9]{2,4})年)?([0-9]{1,2})月([0-9]{1,2})[日,号]|([0-9]{1,2})[日,号]|([0-9]{1,2}[号,日])|([0-9]{1,2})[.]([0-9]{1,2})/g;
  const dateResult = dateReg.exec(message);
  let date = null;

  if (dateResult?.[1]) {
    date = addDay(0);
  } else if (dateResult?.[2]) {
    date = addDay(1);
  } else if (dateResult?.[3]) {
    date = addDay(2);
  } else if (dateResult?.[4]) {
    const targetDay = getWeekDay(dateResult[4]);
    date = addDay(-moment().day() + 7 + targetDay);
  } else if (dateResult?.[5]) {
    date = addDay(getWeekDay(dateResult[5]) - moment().day());
  } else if (dateResult?.[8] && dateResult?.[9]) {
    date = `${dateResult[8]}/${dateResult[9]}/${dateResult[7] || moment().year()}`;
  } else if (dateResult?.[10]) {
    date = `${moment().month() + 1}/${dateResult[10]}/${moment().year()}`;
  } else if (dateResult?.[12] && dateResult?.[13]) {
    date = `${dateResult[12]}/${dateResult[13]}/${moment().year()}`;
  }

  if (!date) return null;

  const timeReg = /(([上下])午)?([0-9]{1,2})点([0-9]{1,2})?|([0-9]{1,2}):([0-9]{1,2})/;
  const timeResult = timeReg.exec(message);
  let hour = 0;
  let minute = 0;

  if (timeResult?.[3]) {
    hour = Number(timeResult[3]);
    minute = Number(timeResult[4] || 0);
    if (timeResult[2] === '下' && hour < 12) hour += 12;
    if (timeResult[2] === '上' && hour === 12) hour = 0;
  } else if (timeResult?.[5]) {
    hour = Number(timeResult[5]);
    minute = Number(timeResult[6]);
  }

  const dateTime = moment(date, 'MM/DD/YYYY').hour(hour).minute(minute).second(0).millisecond(0);
  return dateTime.isValid() ? dateTime : null;
};

const getDefaultStart = () => {
  const now = moment().second(0).millisecond(0);
  return now.minute() < 30 ? now.minute(30) : now.add(1, 'hour').startOf('hour');
};

const getInitialDateRange = settings => {
  const start = moment(settings.Start);
  const end = moment(settings.End);

  if (start.isValid() && end.isValid()) return [start, end];
  if (start.isValid()) return [start, start.clone().add(1, 'hour')];
  if (end.isValid()) return [end.clone().subtract(1, 'hour'), end];

  const messageStart = getDateFromMessage(settings.Message);
  const defaultStart = messageStart || getDefaultStart();
  return [defaultStart, defaultStart.clone().add(1, 'hour')];
};

const getRepeatWeekDay = (repeatConfig, start) => {
  const weekDays = repeatConfig.weekDays.length ? repeatConfig.weekDays : [WEEK_DAY_BITS[moment(start).day()]];
  return weekDays.reduce((result, value) => result + Number(value), 0);
};

const adjustRepeatWeekDayByTimezone = (weekDay, start, timezone) => {
  const beijingDay = moment(start).utcOffset(8).format('YYYY-MM-DD');
  const currentDay = moment(start)
    .utcOffset((timezone / 60) * -1)
    .format('YYYY-MM-DD');
  const diffDay = moment(beijingDay).diff(moment(currentDay), 'day');

  if (!diffDay) return weekDay;

  return weekDay
    .toString(2)
    .split('')
    .reduce((result, value, index, values) => {
      if (value !== '1') return result;

      let square = values.length - index - 1 + diffDay;
      if (square > 6) square -= 7;
      if (square < 0) square += 7;
      return result + Math.pow(2, square);
    }, 0);
};

export class CreateCalendar {
  constructor(options, autoOpen = true) {
    const defaults = {
      frameid: 'createCalendar',
      Start: null,
      End: null,
      AllDay: false,
      MemberArray: [],
      Message: null,
      ColorClass: [
        'calendarColorRed',
        'calendarColorViolet',
        'calendarColorBrown',
        'calendarColorOrange',
        'calendarColorBlue',
        'calendarColorGreen',
        'calendarColorYellow',
      ],
      timezone: -moment().utcOffset(),
      isAttachComplete: true,
      defaultAttachmentData: [],
      defaultKcAttachmentData: [],
      callback: null,
      createShare: true,
      allDay: false,
      telRemind: false,
      calendarPrivate: false,
    };

    this.settings = { ...defaults, ...options };
    this.settings.ColorClass = [...this.settings.ColorClass];
    this.settings.ColorClass[99] = 'calendarColorYellow';
    this.settings.ColorClass[100] = 'calendarColorBlue';
    this.settings.allDay = !!(this.settings.AllDay || this.settings.allDay);

    const [start, end] = getInitialDateRange(this.settings);
    this.settings.Start = start.format(DATE_TIME_FORMAT);
    this.settings.End = end.format(DATE_TIME_FORMAT);
    this.settings.createCalendarAttachments = {
      attachmentData: [...(this.settings.defaultAttachmentData || [])],
      kcAttachmentData: [...(this.settings.defaultKcAttachmentData || [])],
    };

    if (autoOpen) {
      this.init();
    }
  }

  init = () => {
    if (CreateCalendar.activeInstance) return;

    CreateCalendar.activeInstance = this;
    this.modalContainer = document.createElement('div');
    document.body.appendChild(this.modalContainer);
    this.modalRoot = createRoot(this.modalContainer);
    this.settings.dialog = { destroy: this.closeDialog };
    this.renderDialog(true);
  };

  renderDialog = open => {
    if (!this.modalRoot || this.dialogDestroyed) return;

    this.dialogOpen = open;
    this.modalRoot.render(
      <CreateCalendarDialog
        open={open}
        settings={this.settings}
        onAfterClose={this.destroyDialog}
        onClose={this.closeDialog}
        onSubmit={this.send}
      />,
    );
  };

  closeDialog = () => {
    if (!this.dialogOpen || this.dialogDestroyed) return;

    this.dialogOpen = false;
    this.renderDialog(false);
  };

  destroyDialog = () => {
    if (this.dialogDestroyed) return;

    this.dialogDestroyed = true;
    if (CreateCalendar.activeInstance === this) {
      CreateCalendar.activeInstance = null;
    }

    window.setTimeout(() => {
      this.modalRoot?.unmount();
      this.modalContainer?.remove();
      this.modalRoot = null;
      this.modalContainer = null;
    });
  };

  getSubmitData = () => {
    const settings = this.settings;
    const isAll = settings.allDay;
    const timezoneOffset = isAll ? 0 : settings.timezone + moment().utcOffset();
    const start = moment(isAll ? `${moment(settings.Start).format('YYYY-MM-DD')} 00:00` : settings.Start).add(
      timezoneOffset,
      'minute',
    );
    const end = moment(isAll ? `${moment(settings.End).format('YYYY-MM-DD')} 23:59:59` : settings.End).add(
      timezoneOffset,
      'minute',
    );
    const repeatConfig = settings.repeatConfig;
    const isRecur = !!settings.repeatEnabled;
    let frequency = 0;
    let interval = '';
    let recurCount = 0;
    let untilDate = '';
    let weekDay = 0;

    if (isRecur) {
      frequency = Number(repeatConfig.type) + 1;
      interval = String(repeatConfig.interval);
      recurCount = repeatConfig.endType === '1' ? Number(repeatConfig.count) : 0;
      untilDate = repeatConfig.endType === '2' ? moment(repeatConfig.untilDate).toISOString() : '';

      if (frequency === 2) {
        weekDay = adjustRepeatWeekDayByTimezone(getRepeatWeekDay(repeatConfig, start), start, settings.timezone);
      }
    }

    const members = [];
    const specialAccounts = {};
    settings.MemberArray.forEach(member => {
      if (member.accountId) {
        members.push(member.accountId);
      } else if (member.account) {
        specialAccounts[member.account] = member.fullname;
      }
    });

    return {
      name: settings.CalendarName.trim(),
      address: settings.Address.trim(),
      desc: settings.Description.trim(),
      start,
      end,
      isAll,
      membersIDs: members.join(','),
      specialAccounts,
      categoryID: settings.CategoryID,
      isRecur,
      remindTime: settings.RemindType === '0' ? 0 : settings.RemindTime,
      remindType: settings.RemindType,
      frequency,
      interval,
      recurCount,
      untilDate,
      weekDay,
      isPrivate: settings.calendarPrivate,
      voiceRemind: settings.RemindType !== '0' && settings.telRemind,
    };
  };

  send = async () => {
    const settings = this.settings;

    if (!settings.isAttachComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return false;
    }

    const submitData = this.getSubmitData();

    if (!submitData.name) {
      alert(_l('请输入日程标题'), 3);
      document.getElementById('txtCalendarName')?.focus();
      return false;
    }

    if (submitData.end.isBefore(submitData.start) || (!submitData.isAll && !submitData.end.isAfter(submitData.start))) {
      alert(_l('结束时间不能早于或等于开始时间'), 2);
      return false;
    }

    try {
      const source = await ajaxRequest.insertCalendar({
        ..._.omit(submitData, ['start', 'end']),
        startDate: submitData.start.toISOString(),
        endDate: submitData.end.toISOString(),
        attachments: JSON.stringify(settings.createCalendarAttachments.attachmentData),
        knowledgeAtt: JSON.stringify(settings.createCalendarAttachments.kcAttachmentData),
      });

      if (source.code === 9) {
        alert(_l('邀请短信发送数量已达最大限制，请移除外部用户创建日程'));
        return false;
      }

      if (source.code !== 1) {
        alert(_l('操作失败，请稍后再试'), 2);
        return false;
      }

      source.data.name = submitData.name;
      source.data.address = submitData.address;
      source.data.startDate = submitData.start;
      source.data.endDate = submitData.end;
      source.data.isRecur = submitData.isRecur;

      if (window.location.href.includes('calendar') && $('#calendar').length > 0) {
        const viewName = $('#calendar').fullCalendar('getView').name;

        if (viewName === 'list') {
          $('.fc-list-button').trigger('refreshList');
        } else {
          $('#calendar').fullCalendar('refetchEvents');
        }
      }

      settings.dialog.destroy();

      if (_.isFunction(settings.callback)) {
        settings.callback(source.data);
      }

      return true;
    } catch (_requestError) {
      alertIfNotUnauthorized(_requestError, _l('操作失败，请稍后再试'), 2);
      return false;
    }
  };

  openCreatedCalendar = data => {
    createShare({
      linkURL: pathCompletion(`/apps/calendar/detail_${data.calendarID}`),
      content: _l('日程创建成功'),
      isCalendar: true,
      calendarOpt: {
        title: _l('分享日程'),
        openURL: pathCompletion('/m/detail/calendar/'),
        isAdmin: true,
        keyStatus: true,
        name: data.name,
        startTime: data.startDate,
        endTime: data.endDate,
        address: data.address,
        shareID: data.calendarID,
        recurTime: '',
        token: data.token,
        ajaxRequest,
      },
    });
  };
}

export default function createCalendar(options) {
  return new CreateCalendar(options);
}
