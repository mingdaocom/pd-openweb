import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CalendarView from 'src/pages/worksheet/views/CalendarView';
import ScheduleModal from './components/ScheduleModal';
import ViewErrorPage from '../components/ViewErrorPage';
import * as calendarActions from 'src/pages/worksheet/redux/actions/calendarview';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import { getAdvanceSetting } from 'src/util';
import { Icon } from 'ming-ui';
import './index.less';

class MobileCalendarView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduleVisible: false,
    };
  }
  componentDidMount() {}
  showschedule = () => {
    window.localStorage.setItem('CalendarShowExternalTypeEvent', 'eventAll');
    this.setState({ scheduleVisible: !this.state.scheduleVisible });
    this.props.fetchExternal();
  };
  // 获取点击日期当天数据
  getMoreClickData = date => {
    const { calendarview = {} } = this.props;
    const { calendarFormatData = [] } = calendarview;

    let tempData = [];
    calendarFormatData.forEach(item => {
      const { start, end } = item;
      if (moment(date).isBetween(moment(start), moment(end).startOf('day').format('YYYY-MM-DD HH:mm:ss'))) {
        tempData.push(item);
      } else if (
        start &&
        moment(moment(date).format('YYYY-MM-DD')).isSame(moment(moment(start).format('YYYY-MM-DD')))
      ) {
        tempData.push(item);
      }
    });
    let currentDate = moment(date).format('YYYY.MM.DD');
    this.props.changeMobileCurrentDate(currentDate);
    this.props.changeMobileCurrentData(tempData);
  };

  render() {
    let { scheduleVisible } = this.state;
    const { view, currentSheetRows, calendarview = {}, base = {} } = this.props;
    const { calendarData = {} } = calendarview;
    const { calendarInfo = [] } = calendarData;
    let { begindate = '', enddate = '', calendarType = '0', calendarcids = '[]' } = getAdvanceSetting(view);
    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      calendarcids = [];
    }
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate, end: enddate }]; //兼容老数据
    }
    const isDelete =
      calendarcids[0].begin &&
      calendarInfo.length > 0 &&
      (!calendarInfo[0].startData || !calendarInfo[0].startData.controlId);
    let isHaveSelectControl = !calendarcids[0].begin || isDelete; // 是否选中了开始时间 //开始时间字段已删除
    const mobileCalendarSetting = {
      // views: {},
      // headerToolbar:{
      //   left: '',
      //   center: 'prev,title next',
      //   right: 'today',
      // },
      buttonText: {
        today: _l('今'),
      },
      dateClick: info => {
        this.getMoreClickData(info.date);
        this.props.mobileIsShowMoreClick(true);
      },
      eventClick: eventInfo => {
        if (calendarType === '2') {
          let { appId, worksheetId, viewId } = base;
          const { extendedProps } = eventInfo.event._def;
          let url = `/mobile/record/${appId}/${worksheetId}/${viewId}/${extendedProps.rowid}`;
          window.mobileNavigateTo(url);
        } else {
          const { range = {} } = eventInfo.event._instance;
          range.start && this.getMoreClickData(range.start);
          this.props.mobileIsShowMoreClick(true);
        }
      },
      eventMouseEnter: () => {},
      eventMouseLeave: () => {},
    };
    // 视图配置错误
    if (isHaveSelectControl) {
      return <ViewErrorPage icon="event" viewName={_l('日历视图')} color="#f64082" />;
    }
    return (
      <div className="mobileBoxCalendar">
        <CalendarView {...this.props} mobileCalendarSetting={mobileCalendarSetting} />
        {(!isHaveSelectControl && (
          <div className="expandIcon" onClick={this.showschedule}>
            <Icon className="schedule" icon="abstract" />
            {currentSheetRows && currentSheetRows.length ? (
              <div className="totalNum">{currentSheetRows.length}</div>
            ) : null}
          </div>
        )) ||
          null}
        {scheduleVisible && <ScheduleModal visible={scheduleVisible} showschedule={this.showschedule} />}
      </div>
    );
  }
}

export default connect(
  state => ({
    currentSheetRows: state.mobile.currentSheetRows,
    calendarview: state.sheet.calendarview,
    viewId: state.sheet.base.viewId,
    base: state.sheet.base,
    views: state.sheet.views,
  }),
  dispatch =>
    bindActionCreators(
      _.pick({ ...actions, ...calendarActions }, [
        'fetchExternal',
        'changeMobileCurrentDate',
        'changeMobileCurrentData',
        'mobileIsShowMoreClick',
        'getCalendarData',
      ]),
      dispatch,
    ),
)(MobileCalendarView);
