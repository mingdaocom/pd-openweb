import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import './style.less';
import { FREQUENCY, RECURTYPE, MEMBER_STATUS } from './constant';

import { Config } from './index';
import * as Common from './common';
import { inviteCalendar } from '../comm/comm';
import { default as postMessageDialog } from './lib/postMessage';
import { addToken } from 'src/util';

import CalendarAction from './container/CalendarAction';
import CalendarHeader from './container/CalendarHeader';
import CalendarMain from './container/CalendarMain';
import CalendarComments from './container/CalendarComments';
import CalendarCommenter from './container/CalendarCommenter';
import ScrollView from 'ming-ui/components/ScrollView';
import 'createTask';

const getStateIsRecurChange = (oldState, state) => {
  // 重复日程改变
  if (oldState.isRecur !== state.isRecur) {
    return true;
  }
  // 重复频率改变
  if (oldState.frequency !== state.frequency) {
    return true;
  } else if (state.frequency !== FREQUENCY.NONE && oldState.interval !== state.interval) {
    return true;
  } else if (state.frequency === FREQUENCY.WEEK && oldState.weekDay !== state.weekDay) {
    return true;
  }
  // 重复日程结束方式改变
  if (oldState.recurType !== state.recurType || (oldState.recurType === undefined && state.recurType === RECURTYPE.NONE)) {
    return true;
  } else if (state.recurType === RECURTYPE.COUNT && oldState.recurCount !== state.recurCount) {
    return true;
  } else if (state.recurType === RECURTYPE.DATE && oldState.untilDate !== state.untilDate) {
    return true;
  }
  return false;
};

const getStateIsRemindChange = (oldState, state) => {
  if (oldState.remindType !== state.remindType) {
    return true;
  }
  if (oldState.remindType !== state.remindType) {
    return true;
  } else if (oldState.remindTime !== state.remindTime) {
    return true;
  }
  return false;
};

const getStateIsShowUpdateBar = (oldState, state) => {
  if (!Common.formatAuth(state).showEdit) return false;
  const isRecurChange = getStateIsRecurChange(oldState, state);
  if (isRecurChange) return true;
  const keys = ['title', 'address', 'start', 'end', 'allDay', 'description'];
  const stateA = _(oldState).pick(keys);
  const stateB = _(state).pick(keys);
  return !_(stateA).isEqual(stateB);
};

export default class CalendarDetail extends Component {
  static propTypes = {
    data: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { data: { calendar, keyStatus, token, thirdUser } } = this.props;
    this.omitKeys = ['keyStatus', 'token', 'isShowUpdateBar'];
    this.EVENT_KEY = +new Date();
    // store calendar data
    this.state = {
      ...calendar,
      originStartTime: calendar.start,
      originEndTime: calendar.end,
      originRecur: calendar.isRecur,
      thirdUser,
      keyStatus,
      token,
      // child states
      discussions: [],
      topicCount: 0,
      // private state
      isShowUpdateBar: false,
      isRecurChange: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { data: { calendar, keyStatus, token, thirdUser } } = nextProps;
    this.setState({
      ...calendar,
      keyStatus,
      token,
      thirdUser,
    });
  }

  changeDialogHeight() {
    if (!Config.isDetailPage) {
      $(this.calendarDetail).css({
        height: $(window).height() - 64,
      });
    }

    if (Config.dialogCenter) {
      Config.dialogCenter();
    }
  }

  scrollToListTop() {
    if (this.scrollView && this.scrollView.nanoScroller && this.commentList) {
      var $nano = $(this.scrollView.nanoScroller);
      var $nanoContent = $nano.find('.nano-content');
      var $commentList = $nano.find('.calendarComments');
      require(['nanoScroller'], () => {
        if (
          $nanoContent.get(0).scrollTop > $commentList.get(0).offsetTop ||
          $nanoContent.get(0).scrollTop + $nanoContent.height() < $commentList.get(0).offsetTop
        ) {
          $(this.scrollView.nanoScroller).nanoScroller({
            scrollTo: $commentList,
          });
        }
      });
    }
  }

  componentDidUpdate() {
    // setTimeout(() => {
    //   this.changeDialogHeight();
    // }, 300);
  }

  componentDidMount() {
    this.changeDialogHeight();

    if (Config.isDetailPage) {
      this.throttled = _.throttle(this.changeDialogHeight.bind(this), 100);

      $(window).on('resize.' + this.EVENT_KEY, this.throttled);
    }
  }

  componentWillUnmount() {
    if (Config.isDetailPage) {
      $(window).off('resize.' + this.EVENT_KEY);
      this.throttled.cancel();
    }
  }

  mapNewState(diff) {
    const oldState = this.state;
    const state = Object.assign({}, oldState, diff);
    const { data: { calendar } } = this.props;

    if (oldState.start !== state.start || oldState.end !== state.end) {
      const { start, end } = state;
      const startDate = moment(start);
      const endDate = moment(end);
      const oldStartDate = moment(oldState.start);
      const changeFlag = oldStartDate.isSame(startDate, 'minute') ? 1 : 0; // 1 结束时间 0 开始时间

      // 修改时间后 结束时间早于开始时间
      // 逻辑：
      // 更改原开始时间，若改为同一天但是 HH:mm时间比结束时间晚 则结束时间设为开始时间加一小时
      // 更改原结束时间，若改为同一天但是 HH:mm时间比开始时间早 则结束时间设为开始时间加一天
      if (changeFlag === 0 && !startDate.isSameOrBefore(endDate, 'minute')) {
        diff.end = startDate.add(1, 'hour').format('YYYY-MM-DD HH:mm');
      } else if (changeFlag === 1 && endDate.isSame(startDate, 'day') && endDate.isSameOrBefore(startDate, 'minute')) {
        diff.end = startDate.add(1, 'day').format('YYYY-MM-DD HH:mm');
      }
    }

    // 开启重复日程
    if (state.frequency !== FREQUENCY.NONE) {
      if (!state.interval) {
        diff.interval = 1;
      }
      if (typeof state.recurType === 'undefined') {
        diff.recurType = RECURTYPE.NONE;
      }
      if (state.frequency === FREQUENCY.WEEK) {
        if (!state.weekDay) {
          const startDay = moment(state.start).get('day');
          const arr = state.weekDay ? state.weekDay.split(',') : [];
          arr.push('' + startDay);
          diff.weekDay = _.uniq(arr)
            .sort((a, b) => a - b)
            .join(',');
        }
      }
    }

    if (state.recurType !== RECURTYPE.NONE) {
      if (state.recurType === RECURTYPE.DATE && (state.untilDate === '0' || moment(state.end).isAfter(moment(state.untilDate), 'day'))) {
        diff.untilDate = moment(state.end)
          .add(1, 'd')
          .format('YYYY-MM-DD');
      }
      if (state.recurType === RECURTYPE.COUNT && !state.recurCount) {
        diff.recurCount = 1;
      }
    } else {
      diff.untilDate = '0';
      diff.recurCount = 0;
    }

    this.setState({
      ...diff,
      isRecurChange: getStateIsRecurChange(calendar, state),
      isShowUpdateBar: getStateIsShowUpdateBar(calendar, state),
      isRemindChange: getStateIsRemindChange(calendar, state),
    });
  }

  renderActionBar() {
    const { showConfirm, showRefuse } = Common.formatAuth(this.state);
    const isShowBar = showConfirm || this.state.isShowUpdateBar;
    const type = showConfirm ? 'confirm' : showRefuse ? 'refused' : 'update';
    const save = () => {
      Common.editCalendar(_.omit(this.state, this.omitKeys), true, {
        originStartTime: this.state.originStartTime,
        originEndTime: this.state.originEndTime,
      }).then(({ isAllCalendar, oldStartTime, oldEndTime, reInvite }) => {
        this.setState({
          isShowUpdateBar: false,
          isRecurChange: false,
          isChildCalendar: !isAllCalendar,
          originStartTime: oldStartTime,
          originEndTime: oldEndTime,
          oldStartTime,
          oldEndTime,
          originRecur: this.state.isRecur,
        });
        // 重新邀请 members status 重置
        if (reInvite) {
          this.setState({
            members: _.each(this.state.members, member => {
              if (member.accountID !== md.global.Account.accountId) {
                member.remark = '';
                member.status = MEMBER_STATUS.UNCONFIRMED;
              }
            }),
          });
        }
      });
    };
    const cancel = () => {
      this.setState({
        isShowUpdateBar: false,
        isRecurChange: false,
      });
      this.props.reFetchData(false);
    };
    const confirm = () => {
      const { id, recurTime, catID } = this.state;
      inviteCalendar.confirm(id, recurTime, catID);
    };
    const refuse = () => {
      const { id, recurTime, catID } = this.state;
      inviteCalendar.refuse(id, recurTime, catID);
    };
    const actionProps = {
      // variable
      type,
      // methods
      save,
      cancel,
      confirm,
      refuse,
    };
    return isShowBar ? <CalendarAction {...actionProps} key={'action-bar'} /> : null;
  }

  renderHeader() {
    const changeTitle = v => {
      const value = v.replace(/\n/g, '');
      if (value === '') {
        return alert(_l('标题不可为空'), 2);
      }
      this.mapNewState({
        title: value,
      });
    };
    const changeCategory = item => {
      const { id, catID } = this.state;
      if (catID === item.catID) return;
      Common.changeCategory({ id, catID: item.catID }, () => {
        this.mapNewState({
          catID: item.catID,
          catName: item.catName,
          color: item.color,
        });
        if ($.isFunction(Config.saveCallback)) {
          Config.saveCallback();
        }
      });
    };
    const openDetailPage = () => {
      const { id, recurTime } = this.state;
      window.open('/apps/calendar/detail_' + id + (recurTime ? '_' + moment(recurTime).format('YYYYMMDDHHmmss') : ''));
    };
    const joinOutLook = () => {
      const { id, recurTime } = this.state;
      window.open(addToken(`${md.global.Config.AjaxApiUrl}download/exportCalendarByCalendarId?op=OutputFile&calendarID=${id}&RecurTime=${recurTime}`));
    };
    const postMessage = () => {
      const { members } = this.state;
      if (members && members.length > 1) {
        postMessageDialog(this.state);
      } else {
        alert(_l('请先添加成员'), 3);
      }
    };
    const shareCalendar = () => {
      const { createUser, id, title, start, end, recurTime, address, keyStatus, token } = this.state;
      Common.shareCalendar(
        {
          createUser,
          keyStatus,
          token,
          id,
          title,
          start,
          end,
          recurTime,
          address,
        },
        (...args) => {
          const [newKeyStatus, newToken] = args;
          this.setState({
            keyStatus: newKeyStatus,
            token: newToken,
          });
        }
      );
    };
    const exitCalendar = () => {
      const { id, recurTime, originRecur, isChildCalendar } = this.state;
      Common.removeMember(md.global.Account.accountId, { id, recurTime, originRecur, isChildCalendar });
    };
    const deleteCalendar = () => {
      const { id, recurTime, originRecur, isChildCalendar } = this.state;
      Common.deleteCalendar({ id, recurTime, originRecur, isChildCalendar });
    };
    const createTask = () => {
      const { id, recurTime, title, members, description } = this.state;
      let memberArray = [];
      members.forEach(item => {
        if (item.status === 1) {
          memberArray.push({
            accountId: item.accountID,
            fullname: item.memberName,
            avatar: item.head,
          });
        }
      });

      $.CreateTask({
        CalenderID: id,
        recurTime,
        TaskName: title,
        MemberArray: memberArray,
        Description: description,
      });
    };

    const { title, color, canLook } = this.state;
    const headerProps = {
      // variables
      auth: Common.formatAuth(this.state),
      title,
      color,
      canLook,
      // methods
      changeTitle,
      changeCategory,
      openDetailPage,
      joinOutLook,
      postMessage,
      shareCalendar,
      exitCalendar,
      deleteCalendar,
      createTask,
    };

    return <CalendarHeader {...headerProps}>{this.renderActionBar()}</CalendarHeader>;
  }

  renderMain() {
    const addCalendarMember = () => {
      const { id, originRecur, isChildCalendar, recurTime, members } = this.state;
      const addMemberCallback = ({ source, isAllCalendar }) => {
        const { data: { successMember } } = source;
        this.setState({
          members: members.concat(successMember || []),
          isChildCalendar: !isAllCalendar,
        });
      };

      require(['dialogSelectUser'], function () {
        $({}).dialogSelectUser({
          sourceId: originRecur && isChildCalendar ? id + '|' + recurTime : id,
          fromType: 5,
          SelectUserSettings: {
            filterAccountIds: members.map(user => user.accountID),
            callback: function (users) {
              Common.addMember(
                {
                  members,
                  users,
                },
                {
                  recurTime,
                  originRecur,
                  id,
                  isChildCalendar,
                }
              ).then(addMemberCallback);
            },
          },
          ChooseInviteSettings: {
            callback: function (users, callback) {
              Common.addMember(
                {
                  members,
                  users,
                },
                {
                  recurTime,
                  originRecur,
                  id,
                  isChildCalendar,
                }
              ).then(args => {
                addMemberCallback(args);
                const { source: { code } } = args;
                // 外部用户回调
                callback({
                  status: code,
                });
              });
            },
          },
        });
      });
    };

    const removeMember = accountId => {
      const { members, id, recurTime, isChildCalendar, originRecur } = this.state;
      const argsProps = { id, recurTime, isChildCalendar, originRecur };
      Common.removeMember(accountId, argsProps).then(({ isAllCalendar }) => {
        _.remove(members, m => m.accountID === accountId);
        this.setState({
          members,
          isChildCalendar: !isAllCalendar,
        });
        if ($.isFunction(Config.saveCallback)) {
          Config.saveCallback();
        }
      });
    };

    const removeWxMember = thirdID => {
      const { thirdUser, id, recurTime, isChildCalendar, originRecur } = this.state;
      const argsProps = { id, recurTime, isChildCalendar, originRecur };
      Common.removeWxMember(thirdID, argsProps).then(({ isAllCalendar }) => {
        _.remove(thirdUser, m => m.thirdID === thirdID);
        this.setState({
          thirdUser,
          isChildCalendar: !isAllCalendar,
        });
        if ($.isFunction(Config.saveCallback)) {
          Config.saveCallback();
        }
      });
    };

    const reInvite = accountId => {
      const { members, id, recurTime, isChildCalendar, originRecur } = this.state;
      const argsProps = { id, recurTime, isChildCalendar, originRecur };
      Common.reInvite(accountId, argsProps).then(({ isAllCalendar }) => {
        _.some(members, function (member) {
          if (member.accountID === accountId) {
            member.status = MEMBER_STATUS.UNCONFIRMED;
            member.remark = '';
            return true;
          }
          return false;
        });
        this.setState({
          members,
          isChildCalendar: !isAllCalendar,
        });
        if ($.isFunction(Config.saveCallback)) {
          Config.saveCallback();
        }
      });
    };

    const bindBusinessCard = ($member, member, isCreateUser) => {
      const { id, recurTime, isChildCalendar, isRecur, editable } = this.state;
      Common.bindCard(
        $member,
        member,
        isCreateUser,
        { id, recurTime, isChildCalendar, isRecur, editable },
        {
          removeMember,
          removeWxMember,
          reInvite,
        }
      );
    };

    const changePrivacy = () => {
      const { isPrivate, id } = this.state;
      Common.updatePrivate(id, !isPrivate).then(() => {
        this.setState({
          isPrivate: !isPrivate,
        });
      });
    };

    const changeRemind = ({ remindType, remindTime }) => {
      const { id } = this.state;
      return Common.updateRemind({ id, remindType, remindTime });
    };

    const props = {
      calendar: this.state,
      change: this.mapNewState.bind(this),
      addCalendarMember,
      bindBusinessCard,
      changePrivacy,
      changeRemind,
    };

    return <CalendarMain {...props} />;
  }

  renderComments() {
    if (!this.state.canLook) return null;
    const props = {
      calendar: this.state,
      listRef: el => {
        this.commentList = el;
      },
      change: payload => {
        this.setState(payload);
      },
    };
    return <CalendarComments {...props} />;
  }

  renderCommenter() {
    if (!this.state.canLook) return null;
    const props = {
      calendar: this.state,
      scrollToListTop: this.scrollToListTop.bind(this),
      change: payload => {
        this.setState(payload);
      },
    };
    return <CalendarCommenter {...props} />;
  }

  render() {
    return (
      <div
        className={cx('calendarDetail', { noPadding: !this.state.canLook })}
        ref={el => {
          this.calendarDetail = el;
        }}
      >
        {this.renderHeader()}
        <div className="calendarMainContent Relative">
          <ScrollView
            className="Absolute"
            updateEvent={this.handleScroll.bind(this)}
            preserveScrollTop={true}
            ref={el => {
              this.scrollView = el;
            }}
          >
            {this.renderMain()}
            {this.renderComments()}
          </ScrollView>
        </div>
        {this.renderCommenter()}
      </div>
    );
  }

  handleScroll(event, values) {
    const { direction, maximum, position } = values;
    // filelist ignore event
    if (direction === 'down' && maximum - position < 20 && this.commentList) {
      // method of child component
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  }
}
