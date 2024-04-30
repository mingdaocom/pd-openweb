import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CalendarView from 'src/pages/worksheet/views/CalendarView';
import { isIllegalFormat } from 'src/pages/worksheet/views/CalendarView/util';
import ScheduleModal from './components/ScheduleModal';
import ViewErrorPage from '../components/ViewErrorPage';
import * as calendarActions from 'src/pages/worksheet/redux/actions/calendarview';
import * as actions from 'mobile/RecordList/redux/actions';
import { RecordInfoModal } from 'mobile/Record';
import { getAdvanceSetting } from 'src/util';
import { Icon } from 'ming-ui';
import './index.less';
import _ from 'lodash';
import moment from 'moment';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
class MobileCalendarView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduleVisible: false,
      previewRecordId: undefined,
    };
  }
  componentDidMount() {}
  showschedule = () => {
    safeLocalStorageSetItem('CalendarShowExternalTypeEvent', 'eventAll');
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
    let { scheduleVisible, previewRecordId } = this.state;
    const { view, currentSheetRows, calendarview = {}, base = {}, sheetSwitchPermit } = this.props;
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
    let isDelete =
      calendarcids[0].begin &&
      calendarInfo.length > 0 &&
      (!calendarInfo[0].startData || !calendarInfo[0].startData.controlId);
    if (
      !isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit) &&
      SYS_CONTROLS_WORKFLOW.includes(_.get(calendarInfo[0], 'startData.controlId'))
    ) {
      isDelete = true;
    }
    let isHaveSelectControl = !calendarcids[0].begin || isDelete; // 是否选中了开始时间 //开始时间字段已删除
    const mobileCalendarSetting = {
      // views: {},
      // headerToolbar:{
      //   left: '',
      //   center: 'prev,title next',
      //   right: 'today',
      // },
      buttonText: {
        today: <i className="icon icon-restore2 Font26 Gray_9e" />,
      },
      dateClick: info => {
        this.getMoreClickData(info.date);
        this.props.mobileIsShowMoreClick(true);
      },
      eventClick: eventInfo => {
        if (calendarType === '2') {
          const { extendedProps } = eventInfo.event._def;

          if (window.isMingDaoApp) {
            const { base } = this.props;
            window.location.href = `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId}/${extendedProps.rowid}`;
            return;
          }
          this.setState({ previewRecordId: extendedProps.rowid });
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
    if (isHaveSelectControl || isIllegalFormat(calendarInfo)) {
      return <ViewErrorPage icon="event" viewName={view.name + _l('视图')} color="#f64082" />;
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
        <RecordInfoModal
          className="full"
          visible={!!previewRecordId}
          appId={base.appId}
          worksheetId={base.worksheetId}
          viewId={base.viewId}
          rowId={previewRecordId}
          onClose={() => {
            this.setState({
              previewRecordId: undefined,
            });
          }}
        />
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
