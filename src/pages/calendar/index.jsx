import React, { Component, Fragment } from 'react';
import LoadDiv from 'ming-ui/components/LoadDiv';
import TaskDetail from 'src/pages/task/containers/taskDetail/taskDetail';
import fullCalendar from './modules/calendarControl/javascript/fullcalendar';
import toolBar from './modules/toolbar/toolbar';
import './modules/calendarControl/css/fullcalendar.less';
import './modules/css/share.less';

export default class CalendarEntrypoint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTaskDetail: false,
      taskId: '',
    };

    fullCalendar();
  }
  componentDidMount() {
    $('html').addClass('AppCalendar');
    toolBar.bindEvent();

    let promise;
    const lang = getCookie('i18n_langtag') || window.getDefaultLangKey();

    if (lang === 'zh-Hant') {
      promise = import('./modules/calendarControl/lang/zh-tw');
    } else if (lang === 'ja') {
      promise = import('./modules/calendarControl/lang/ja');
    } else if (lang === 'th') {
      promise = import('./modules/calendarControl/lang/th');
    } else if (lang === 'ms') {
      promise = import('./modules/calendarControl/lang/ms');
    } else if (lang !== 'en') {
      promise = import('./modules/calendarControl/lang/zh-cn');
    } else {
      promise = Promise.resolve();
    }

    if (promise) {
      promise.then(() => toolBar.init());
    }

    const _this = this;
    $('#calendar').on('openTask', function (event, taskId) {
      _this.setState({ openTaskDetail: true, taskId });
    });
  }
  componentWillUnmount() {
    $('html').removeClass('AppCalendar');
    if ($.fn.fullCalendar) {
      $('#calendar').fullCalendar('exit');
    }
  }
  render() {
    const { openTaskDetail, taskId } = this.state;

    return (
      <Fragment>
        <div id="calendarMenu" className="calendarMenu bgPrimary flexColumn">
          <ul className="calendarMenuTop liThemeHover0">
            <li className="boxSizing relative hoverBgTertiary" id="calInvite">
              <i className="icon-calendar-confirmed textSecondary" />
              <span className="textPrimary">{_l('待确认日程')}</span>
              <span className="calendarNumber" id="calendarNumber" />
            </li>
            <li className="boxSizing hoverBgTertiary" id="synchronous">
              <i className="icon-calendar-synchro textSecondary" />
              <span className="textPrimary">{_l('同步日程到其他应用')}</span>
            </li>
          </ul>
          <div className="calendarType flex" id="calendarType">
            <div className="calendarTypeTitle boxSizing relative">
              <span className="textSecondary">{_l('分类日程')}</span>
              <i className="icon-edit pointer textSecondary addCalendarType" id="addCalendarType" />
            </div>
            <div className="calendarTypeList" id="calendarTypeList" />
            <div id="hideOneself" className="borderTertiary textSecondary">
              <span className="cbComplete icon-calendar-nocheck textTertiary" title={_l('隐藏自己')} />
              {_l('隐藏我的日程')}
              <span id="allOtherUserDel" className="textSecondary">
                {_l('清空全部')}
              </span>
            </div>
            <div id="tb_OtherUserCalendar" className="textSecondary" />
          </div>
          <div className="selectOther" id="others" title={_l('查看同事日程')}>
            <i className="icon-charger iconSelectOther textTertiary" />
            <span className="textSecondary">{_l('查看同事日程')}</span>
          </div>
        </div>
        <div className="calendarMain boxSizing">
          <div id="invitedMain">
            <span id="exitInvited" className="exitInvited bgColorPrimary">
              &lt; {_l('返回我的日程')}
            </span>
            <ul id="invitedCalendars" className="calendarInvite boxSizing" />
          </div>
          <div id="calendar" />
          <div id="calendarList" />
        </div>
        <div id="calendarLoading" className="boxSizing relative">
          <LoadDiv />
        </div>
        <TaskDetail
          visible={openTaskDetail}
          taskId={taskId}
          openType={3}
          closeCallback={() => this.setState({ openTaskDetail: false })}
        />
      </Fragment>
    );
  }
}
