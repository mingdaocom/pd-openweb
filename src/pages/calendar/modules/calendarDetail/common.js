import AjaxRequest from 'src/api/calendar';
import { RECURTYPE, FREQUENCY, REMINDTYPE, WEEKDAYS, RECURLAYERS, MEMBER_STATUS } from './constant';
import recurCalendarUpdate from './lib/recurCalendarUpdateDialog';
import afterRefreshOp from './lib/afterRefreshOp';
import createShare from 'src/components/createShare/createShare';
import { Config } from './index';
import _ from 'lodash';
import moment from 'moment';

export function getParamsFromUrl() {
  const result = /detail_([^_?]+)_?([^_?]+)?/.exec(location.href);
  const calendarId = result[1];
  let recurTime = '';

  if (result[2]) {
    // 后端过来东8区时间
    if (result[2].indexOf('Z') >= 0) {
      recurTime =
        moment(result[2], 'YYYYMMDDHHmmss')
          .add(-8, 'h')
          .format('YYYY-MM-DD HH:mm:ss') + '.000Z';
    } else {
      // 本地时间
      recurTime = moment(result[2], 'YYYYMMDDHHmmss').toISOString();
    }
  }

  return recurTime ? { calendarId, recurTime } : { calendarId };
}

export function getCalendarDetail(calnedarId, recurTime) {
  return AjaxRequest.getCalendarDetail2({
    calendarID: calnedarId,
    recurTime: recurTime || '',
  }).then(resource => {
    const { code, data } = resource;
    const dfd = $.Deferred();
    if (code === 1 && data.calendar) {
      if (data.calendar.recurTime) {
        data.calendar.recurTime = moment(data.calendar.recurTime).toISOString();
      }

      const bjDay = moment(data.calendar.start)
        .utcOffset(8)
        .format('YYYY-MM-DD');
      const currentDay = moment(data.calendar.start)
        .utcOffset(moment().utcOffset() / 60)
        .format('YYYY-MM-DD');
      const diffDay = (moment(bjDay) - moment(currentDay)) / 24 / 60 / 60 / 1000;

      if (diffDay !== 0 && data.calendar.frequency === FREQUENCY.WEEK) {
        data.calendar.weekDay = data.calendar.weekDay
          .split(',')
          .map(o => {
            const day = parseInt(o) - diffDay;
            return day < 0 ? day + 7 : day % 7;
          })
          .join(',');
      }

      dfd.resolve({
        type: 'SUCCESS',
        data,
      });
    } else if (code === 1) {
      dfd.reject({
        type: 'DENIED',
        message: '无权限查看该日程',
      });
    } else {
      dfd.reject({
        type: 'DELETED',
        message: '该日程已被删除',
      });
    }
    return dfd.promise();
  });
}

export function getUserAllCalCategories() {
  return AjaxRequest.getUserAllCalCategories().then(function (source) {
    var dfd = $.Deferred();
    if (source.code === 1) {
      dfd.resolve(
        (source.data || []).concat({
          catID: '1',
          catName: _l('工作日程'),
        })
      );
    } else {
      dfd.reject();
    }
    return dfd.promise();
  });
}

/**
 * format 重复日程的显示
 * @param {any} | calendar data
 * @return {string} text
 */
export const formatRecur = function (calendar) {
  const { isRecur, recurCount, recurType } = calendar;
  // 重复方式，重复频率，重复结束方式
  const frequency = parseInt(calendar.frequency, 10);
  const interval = parseInt(calendar.interval, 10);

  if (!isRecur || frequency === FREQUENCY.NONE) return false;

  let weekDay = '';
  let header = '';
  let detail = '';
  let until = '';
  let layer = RECURLAYERS[frequency - 1];
  // 重复频率
  // 每月 每周 每年
  // 每2月
  if (interval === 1) {
    header = `${_l('每')}${layer} `;
  } else {
    header = `${_l('每')}${interval}${layer} `;
  }

  if (frequency === FREQUENCY.WEEK) {
    const weekDays = calendar.weekDay ? calendar.weekDay.split(',') : [];
    if (weekDays.length === 5 && (parseInt(weekDays[0], 10) === 1 && parseInt(weekDays[4], 10) === 5)) {
      weekDay = _l('在 工作日');
    } else {
      weekDay = _.map(weekDays, day => {
        return WEEKDAYS[day];
      }).join('、');
    }
    detail = weekDay + ' ';
  } else if (frequency === FREQUENCY.MONTH) {
    detail = _l('在第 %0 天', moment(calendar.start).format('D'));
  } else if (frequency === FREQUENCY.YEAR) {
    detail = _l('在 %0', moment(calendar.start).format('MM月DD日'));
  }

  if (recurType === RECURTYPE.COUNT) {
    until = _l('，共 %0 次', recurCount);
  } else if (recurType === RECURTYPE.DATE) {
    // 重复日程到某日期结束
    const untilDate = moment(calendar.untilDate);
    until = _l('，截止到 %0', untilDate.format('YYYY年MM月DD日'));
  }

  return header + detail + until;
};

/**
 * format 日程时间的显示
 * @param {any} | calendar data
 * @returns {string}
 */
export const formatShowTime = function (calendar) {
  const { start, end, allDay } = calendar;
  const startTime = moment(start);
  const endTime = moment(end);

  const isSameDay = startTime.isSame(endTime, 'day');
  /**
   * 显示时间foramt
   * @desc 同一年的时间格式: MM月DD日 非同一年显示年份 全天日程不显示 HH:mm
   * @returns { String } formatString
   */
  const timeFormat = (time, isEndTime) => {
    const isCurrYear = moment(time).isSame(moment(), 'year');
    let TIMEFORMAT = isCurrYear ? _l('MM月DD日 (ddd)') : _l('YYYY年MM月DD日 (ddd)');
    if (!allDay) {
      TIMEFORMAT += ' HH:mm';
      if (isSameDay && isEndTime) {
        TIMEFORMAT = 'HH:mm';
      }
    }
    return time.format(TIMEFORMAT);
  };
  if (allDay) {
    return `${timeFormat(startTime)}${isSameDay ? '' : ' ' + _l('至') + ' ' + timeFormat(endTime, true)}${_l('全天')}`;
  } else {
    return `${_l('%0 至 %1', timeFormat(startTime), timeFormat(endTime, true))}`;
  }
};

/**
 * format 日程权限
 * @param {any} | calendar data
 * @return {object} Auth
 */
export const formatAuth = function (calendar) {
  const currentAccountId = md.global.Account.accountId;
  const createUser = calendar.createUser;
  const members = calendar.members;
  const member = _.find(members, m => currentAccountId === m.accountID) || {};
  return {
    showExit: member.status === 1 && createUser !== currentAccountId,
    showConfirm: member.status === 0,
    showRefuse: member.status === 2,
    showDelete: calendar.editable && createUser === currentAccountId,
    showEdit: calendar.editable,
    showShare: calendar.editable,
  };
};

export const formatRemindTime = function (calendar) {
  let remindType = parseInt(calendar.remindType, 10);
  let remindTime = calendar.remindTime; // 时间 单位 分钟
  let MINUTES = [0, 1, 60, 1440];
  if (remindType === REMINDTYPE.NONE) return false;
  return _l('提前 %0', remindTime / MINUTES[remindType]);
};

export const getCalendarColor = function (color) {
  // 分类className
  switch (color) {
    case 0:
      return 'calendarColorRed'; // 红色
    case 1:
      return 'calendarColorViolet'; // 紫色
    case 2:
      return 'calendarColorBrown'; // 褐色
    case 3:
      return 'calendarColorOrange'; // 橙色
    case 4:
      return 'calendarColorBlue'; // 蓝色
    case 5:
      return 'calendarColorGreen'; // 绿色
    case 6:
      return 'calendarColorYellow'; // 黄色
    case 99:
      return 'calendarColorBlue'; // 蓝色
    case 100:
      return 'calendarColorYellow'; // 黄色
    case 103:
      return 'calendarColorHide';
    default:
      return 'calendarColorBlue'; // 蓝色
  }
};

/**
 * 日程操作
 */

export const changeCategory = ({ id, catID }, callback) => {
  AjaxRequest.updateCalendarCatId({
    calendarID: id,
    catID,
  }).then(function (resource) {
    if (resource.code === 1) {
      callback();
      alert(_l('修改成功'));
    } else {
      alert(_l('修改失败'), 2);
    }
  });
};

/**
 * 分享日程
 * @param { object } params
 * @param { function } callback
 */
export const shareCalendar = function (params, callback) {
  const { keyStatus, token, id, title, start, end, recurTime, address, createUser } = params;
  createShare({
    isCreate: false,
    calendarOpt: {
      title: _l('分享日程'),
      openURL: md.global.Config.WebUrl + 'm/detail/calendar/',
      isAdmin: createUser === md.global.Account.accountId,
      keyStatus,
      name: title,
      startTime: start,
      endTime: end,
      address: address,
      shareID: id,
      recurTime: recurTime,
      token: token,
      ajaxRequest: AjaxRequest,
      shareCallback: callback,
    },
  });
};

export const addMember = ({ members, users }, { id, recurTime, originRecur, isChildCalendar }) => {
  const dfd = $.Deferred();
  var existsIds = [];
  var addMembers = [];
  var existsAccounts = [];
  var specialAccounts = {};

  _.forEach(members, member => {
    if (member.accountID) {
      existsIds.push(member.accountID);
    } else {
      existsAccounts.push(member.account);
    }
  });

  _.forEach(users, function (user) {
    if (user.accountId && existsIds.indexOf(user.accountId) < 0) {
      addMembers.push(user.accountId);
    } else if (user.account && existsAccounts.indexOf(user.account) < 0) {
      specialAccounts[user.account] = user.fullname;
    }
  });

  if (!addMembers.length && !Object.keys(specialAccounts).length) {
    alert(_l('成员已经在日程中'), 2);
    return;
  }

  if (addMembers.length === 1 && addMembers[0] === md.global.Account.accountId) {
    alert(_l('不能邀请自己'), 2);
    return;
  }

  var addMembersFun = function (isAllCalendar) {
    AjaxRequest.addMembers({
      calendarID: id,
      memberIDs: addMembers.join(','),
      specialAccounts: specialAccounts,
      isAllCalendar: isAllCalendar,
      recurTime: recurTime || '',
    }).then(function (source) {
      if (source.code === 1) {
        var data = source.data;
        if (data.limitedCount) {
          alert(_l('邀请成功，但有%0位用户邀请失败，外部用户短信邀请用量达到上限', data.limitedCount), 3);
        }
        dfd.resolve({ source, isAllCalendar });
      } else if (source.code === 9) {
        alert(_l('邀请短信发送数量已达最大限制。'), 3);
      }
    });
  };

  recurCalendarUpdate(
    {
      operatorTitle: _l('您确定邀请日程成员吗?'),
      recurTitle: _l('您确定邀请重复日程成员吗?'),
      recurCalendarUpdateFun: addMembersFun,
    },
    {
      isChildCalendar,
      originRecur,
    }
  );

  return dfd.promise();
};

/**
 * 移除日程成员
 * @param { string} accountID
 * @param { object } calendar
 */
export const removeMember = function (accountID, { id, recurTime, originRecur, isChildCalendar }) {
  const isMe = accountID === md.global.Account.accountId;
  const operatorTitle = isMe ? _l('您确定退出该日程吗？') : _l('您确定移出日程成员吗？');
  const recurTitle = isMe ? _l('您确定退出重复日程吗？') : _l('您确定移出重复日程成员吗？');

  const dfd = $.Deferred();

  const removeMemberFunc = function (isAllCalendar) {
    AjaxRequest.removeMember({
      calendarID: id,
      accountID,
      recurTime,
      isAllCalendar,
    }).then(function (resource) {
      if (resource.code === 1) {
        var data = resource.data;
        if (isMe) {
          alert(_l('操作成功'));
        } else {
          alert(_l('删除成功'));
        }

        dfd.resolve({ accountID, isAllCalendar });

        if (isMe && typeof Config.exitCallback === 'function') {
          Config.exitCallback();
        }
      } else {
        dfd.reject();
        alert(_l('删除失败'), 3);
      }
    });

    return dfd.promise();
  };

  recurCalendarUpdate(
    {
      operatorTitle,
      recurTitle,
      recurCalendarUpdateFun: removeMemberFunc,
    },
    {
      originRecur,
      isChildCalendar,
    }
  );

  return dfd.promise();
};

/**
 * 编辑日程
 * @param { object } calendar
 */
export const editCalendar = (calendar, isEdit, { originStartTime, originEndTime }) => {
  const { members } = calendar;
  const dfd = $.Deferred();
  const updateFunc = reInvite => {
    return function (isAllCalendar) {
      let {
        id,
        recurTime,
        title,
        description,
        address,
        start,
        end,
        oldStartTime,
        oldEndTime,
        allDay,
        isRecur,
        frequency,
        interval,
        weekDay,
        recurType,
        untilDate,
        recurCount,
      } = calendar;
      // 修改重复日程的开始和结束时间，传重复日程的新oldStartTime oldEndTime
      if (isAllCalendar) {
        if (start !== originStartTime) {
          const diff = moment(start).diff(moment(originStartTime));
          start = moment(oldStartTime)
            .add(diff)
            .format(allDay ? 'YYYY-MM-DD 23:59' : 'YYYY-MM-DD HH:mm');
        } else {
          start = moment(oldStartTime).format(allDay ? 'YYYY-MM-DD 23:59' : 'YYYY-MM-DD HH:mm');
        }

        if (end !== originEndTime) {
          const diff = moment(end).diff(moment(originEndTime));
          end = moment(oldEndTime)
            .add(diff)
            .format(allDay ? 'YYYY-MM-DD 23:59' : 'YYYY-MM-DD HH:mm');
        } else {
          end = moment(oldEndTime).format(allDay ? 'YYYY-MM-DD 23:59' : 'YYYY-MM-DD HH:mm');
        }
      }

      if (isRecur && recurType !== RECURTYPE.NONE) {
        if (recurType === RECURTYPE.COUNT) {
          untilDate = '';
        } else if (recurType === RECURTYPE.DATE) {
          recurCount = 0;
        }
      } else {
        untilDate = '';
      }

      if (frequency === FREQUENCY.WEEK) {
        const _arr = weekDay.split(',');

        const bjDay = moment(start)
          .utcOffset(8)
          .format('YYYY-MM-DD');
        const currentDay = moment(start)
          .utcOffset(moment().utcOffset() / 60)
          .format('YYYY-MM-DD');
        const diffDay = (moment(bjDay) - moment(currentDay)) / 24 / 60 / 60 / 1000;

        weekDay = _.reduce(
          _arr,
          (sum, value) => {
            let num = parseInt(value, 10) + diffDay;

            if (num > 6) {
              num = num - 7;
            } else if (num < 0) {
              num = num + 7;
            }

            if (num === 0) {
              return sum + Math.pow(2, 6);
            } else {
              return sum + Math.pow(2, num - 1);
            }
          },
          0
        );
      } else {
        weekDay = 0;
      }

      AjaxRequest.editCalendar({
        calendarId: id,
        name: title.replace(/\n/g, ''),
        address,
        startDate: moment(start).toISOString(),
        endDate: moment(end).toISOString(),
        isAll: allDay,
        desc: description,
        isRecur: !isAllCalendar && isRecur ? false : isRecur,
        frequency,
        interval,
        weekDay: weekDay,
        recurCount,
        recurtime: recurTime,
        untilDate: untilDate ? moment(untilDate).toISOString() : '',
        isAllCalendar,
        reConfirm: reInvite,
      }).then(({ code }) => {
        if (code === 1) {
          dfd.resolve({
            isAllCalendar,
            oldStartTime: start,
            oldEndTime: end,
            reInvite,
          });

          if ($('#calendarList').is(':visible') && Config.saveCallback) {
            // 日程列表
            Config.saveCallback({
              start: moment().format('YYYY-MM-DD HH:mm'),
              end: $('#calendarListMoreData').html(),
              isFirst: true,
              scrollTop: $('.calendarList').scrollTop(),
            });
          } else if ($.isFunction(Config.saveCallback)) {
            Config.saveCallback(); // 刷新日历
          }
          alert(_l('修改成功'));
        } else if (code === 3) {
          alert(_l('无权限或日程已删除'), 3);
        } else {
          alert(_l('操作失败'), 3);
        }
      });
    };
  };
  if (members.length > 1) {
    afterRefreshOp(function (reInvite, directRun) {
      recurCalendarUpdate(
        {
          operatorTitle: _l('您确定编辑日程吗'),
          recurTitle: _l('您确定编辑重复日程吗?'),
          recurCalendarUpdateFun: updateFunc(reInvite),
        },
        calendar,
        {
          directRun,
          isEdit,
        }
      );
    });
  } else {
    recurCalendarUpdate(
      {
        operatorTitle: _l('您确定编辑日程吗'),
        recurTitle: _l('您确定编辑重复日程吗?'),
        recurCalendarUpdateFun: updateFunc(),
      },
      calendar,
      {
        directRun: false,
        isEdit,
      }
    );
  }

  return dfd.promise();
};

export const updateRemind = calendar => {
  const { id, remindTime, remindType } = calendar;
  return AjaxRequest.updateMemberRemind({
    remindTime,
    remindType,
    calendarID: id,
  }).then(({ code }) => {
    if (code === 1) {
      alert(_l('修改成功'));
    } else {
      alert(_l('修改失败'), 2);
    }
    return $.Deferred()
      .resolve()
      .promise();
  });
};

export const updateRemindVoice = calendar => {
  const { id, voiceRemind } = calendar;
  return AjaxRequest.updateVoiceRemind({
    voiceRemind,
    calendarID: id,
  }).then(({ code }) => {
    var dfd = $.Deferred();
    if (code === 1) {
      alert(_l('修改成功'));
      dfd.resolve();
    } else {
      alert(_l('修改失败'), 2);
    }
    return dfd.promise();
  });
};

/**
 * 删除日程
 * @param { object } calendar
 */
export const deleteCalendar = function ({ id, recurTime, originRecur, isChildCalendar }) {
  const dfd = $.Deferred();
  const deleteCalendarFun = function (isAllCalendar) {
    AjaxRequest.deleteCalendar({
      calendarID: id,
      recurTime: recurTime,
      isAllCalendar: isAllCalendar,
    }).then(function (resource) {
      if (resource.code === 1) {
        alert(_l('删除成功'));

        if (typeof Config.deleteCallback === 'function') {
          Config.deleteCallback();
        }
        dfd.resolve();
      } else {
        alert(_l('删除失败'), 3);
      }
    });
  };

  recurCalendarUpdate(
    {
      operatorTitle: _l('您确定删除日程吗？'),
      recurTitle: _l('您确定删除重复日程吗?'),
      recurCalendarUpdateFun: deleteCalendarFun,
    },
    {
      originRecur,
      isChildCalendar,
    }
  );

  return dfd.promise();
};

/**
 * 重新邀请成员
 * @param { string } accountID
 * @param { object } calendar
 * @param { object } memberFlag
 */
export const reInvite = function (accountID = '', { id, recurTime, originRecur, isChildCalendar }, { email, mobile } = {}) {
  const dfd = $.Deferred();
  const reInviteFun = function (isAllCalendar) {
    AjaxRequest.reInvite({
      accountID,
      calendarID: id,
      recurTime: isAllCalendar ? '' : recurTime,
      isAllCalendar: isAllCalendar,
      memberFlag: email || mobile || '',
    }).then(function (resource) {
      if (resource.code == 1) {
        alert(_l('重新发送成功'), 1);
        dfd.resolve({
          accountId: accountID,
          isAllCalendar,
        });
      } else {
        alert(_l('重新发送失败'), 3);
      }
    });
  };

  recurCalendarUpdate(
    {
      operatorTitle: _l('您确定重新邀请日程成员吗？'),
      recurTitle: _l('您确定重新邀请重复日程成员吗?'),
      recurCalendarUpdateFun: reInviteFun,
    },
    {
      originRecur,
      isChildCalendar,
    }
  );

  return dfd.promise();
};

export const removeWxMember = function (thirdId, { id, recurTime, originRecur, isChildCalendar }) {
  const dfd = $.Deferred();
  var removeWeChatMemberFun = function (isAllCalendar) {
    AjaxRequest.removeCalendarWeChatMember({
      calendarID: id,
      thirdID: thirdId,
      recurTime: recurTime,
      isAllCalendar: isAllCalendar,
    }).then(function (resource) {
      if (resource.code == 1) {
        alert(_l('删除成功'), 1);
        dfd.resolve({
          thirdId,
          isAllCalendar,
        });
      } else {
        alert(_l('删除失败'), 3);
      }
    });
  };
  recurCalendarUpdate(
    {
      operatorTitle: _l('您确定移出日程成员吗？'),
      recurTitle: _l('您确定移出重复日程成员吗？'),
      recurCalendarUpdateFun: removeWeChatMemberFun,
    },
    {
      originRecur,
      isChildCalendar,
    }
  );
  return dfd.promise();
};

/**
 * 修改私密日程
 * @param { string } calendarId | 日程id
 * @param { bool } isPrivate | 是否是私密日程
 */
export const updatePrivate = function (calendarId, isPrivate) {
  const dfd = $.Deferred();
  AjaxRequest.updateCalendarIsPrivate({
    calendarID: calendarId,
    isPrivate,
  }).then(function (source) {
    if (source.code === 1) {
      alert(_l('修改成功'));
      dfd.resolve();
    } else {
      alert(_l('修改失败'), 2);
    }
  });

  return dfd.promise();
};

/**
 * 绑定用户
 * @param {any} $el
 * @param {any} member
 * @param {any} isCreateUser
 * @param {any} { id, recurTime, isChildCalendar, isRecur }
 */
export function bindCard($el, member, isCreateUser, { id, recurTime, isChildCalendar, isRecur, editable, members }, callbacks) {
  if (!$el.data('md.businesscard')) {
    const { head, face, accountID, thirdID, status, memberName, nickName } = member;
    const isWxMember = !!thirdID;
    var cardId = 'messageDiv';
    var opHtml;
    if (!isCreateUser && editable) {
      var messageDiv, messageDivRemove, messageDivPerson;
      messageDiv = '<div class="messageDivBtn clearfix">';
      messageDivRemove =
        accountID === md.global.Account.accountId
          ? '<span class="messageDivExit">' + _l('退出本日程') + '</span>'
          : '<span class="messageDivRemove">' + _l('移出本日程') + '</span>';
      messageDivPerson =
        status !== MEMBER_STATUS.CONFIRMED && !isWxMember && !isCreateUser
          ? '<span class="messageDivPerson">' + _l('重新发送邀请') + '</span></div>'
          : '</div>';
      opHtml = messageDiv + messageDivRemove + messageDivPerson;
    }
    if (isWxMember) {
      cardId = 'thirdMessageDiv';
    }
    $el.mdBusinessCard({
      id: cardId,
      className: 'calendarBusinessCard',
      noRequestData: !accountID,
      accountId: accountID || thirdID || new Date().getTime(),
      data: {
        avatar: head || face,
        fullname: memberName || nickName,
        accountId: md.global.Account.accountId,
        status: 3,
        companyName: _l('来自微信邀请'),
      },
      opHtml: opHtml,
      offset: {
        x: -25,
        y: 0,
      },
      readyFn: function (settings, $dialog) {
        var html = '';
        // 填充状态信息 非微信邀请的用户
        if (!isWxMember) {
          if (status === MEMBER_STATUS.REFUSED) {
            html = '<div class="messageDivContentState messageRefuse">' + _l('不能参加') + '</div>';
          } else if (status === MEMBER_STATUS.CONFIRMED) {
            html = '<div class="messageDivContentState messageSubmit">' + _l('已确认') + '</div>';
          } else if (status === MEMBER_STATUS.UNCONFIRMED) {
            html = '<div class="messageDivContentState messageNosubmit">' + _l('未确认') + '</div>';
          }
        }
        $dialog.find('.cardContentDesc').append(html);
        $dialog.find('.messageDivBtn span').on('click', function () {
          var calendarId = id;
          var accountId = typeof accountID === 'string' ? accountID : ''; // 如果为老用户则不传accountId
          var argProps = { calendarId, recurTime, isRecur, isChildCalendar };
          if (!$(this).hasClass('messageBtnDisabled')) {
            if ($(this).hasClass('messageDivRemove')) {
              // 移除用户
              if (settings.id === 'messageDiv') {
                callbacks.removeMember(accountId, argProps);
              } else {
                callbacks.removeWxMember(thirdID, argProps);
              }
            } else if ($(this).hasClass('messageDivPerson')) {
              // 重新邀请
              callbacks.reInvite(accountId, argProps);
            } else if ($(this).hasClass('messageDivExit')) {
              // 退出日程
              callbacks.removeMember(accountId, argProps);
            }
          }
          $dialog.removeClass('useFadeIn').addClass('useFadeOut');
        });
      },
    });
    $el.data('hasbusinesscard', true).mouseenter();
  }
}
