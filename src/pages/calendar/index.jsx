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
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    if (lang === 'zh-Hant') {
      promise = import('./modules/calendarControl/lang/zh-tw');
    } else if (lang === 'ja') {
      promise = import('./modules/calendarControl/lang/ja');
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
    $('#calendar').fullCalendar('exit');
  }
  render() {
    const { openTaskDetail, taskId } = this.state;

    return (
      <Fragment>
        <div id="calendarMenu" className="calendarMenu ThemeBGColor9 flexColumn">
          <ul className="calendarMenuTop liThemeHover0 ThemeBorderColor7">
            <li className="boxSizing relative ThemeHoverBGColor7" id="calInvite">
              <i className="icon-calendar-confirmed ThemeColor9" />
              <span className="ThemeColor10">{_l('待确认日程')}</span>
              <span className="calendarNumber" id="calendarNumber" />
            </li>
            <li className="boxSizing ThemeHoverBGColor7" id="synchronous">
              <i className="icon-calendar-synchro ThemeColor9" />
              <span className="ThemeColor10">{_l('同步日程到其他应用')}</span>
            </li>
          </ul>
          <div className="calendarType flex" id="calendarType">
            <div className="calendarTypeTitle boxSizing relative">
              <span className="ThemeColor9">{_l('分类日程')}</span>
              <i className="icon-edit pointer ThemeColor9 ThemeHoverColor10 addCalendarType" id="addCalendarType" />
            </div>
            <div className="calendarTypeList" id="calendarTypeList" />
            <div id="hideOneself" className="ThemeBorderColor7 ThemeColor9">
              <span className="cbComplete icon-calendar-nocheck ThemeColor8" title={_l('隐藏自己')} />
              {_l('隐藏我的日程')}
              <span id="allOtherUserDel" className="ThemeColor9">
                {_l('清空全部')}
              </span>
            </div>
            <div id="tb_OtherUserCalendar" className="ThemeColor9" />
          </div>
          <div className="selectOther ThemeBorderColor8" id="others" title={_l('查看同事日程')}>
            <i className="icon-charger iconSelectOther ThemeColor8" />
            <span className="ThemeColor9">{_l('查看同事日程')}</span>
          </div>
        </div>
        <div className="calendarMain boxSizing">
          <div id="invitedMain">
            <span id="exitInvited" className="exitInvited ThemeBGColor3">
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
