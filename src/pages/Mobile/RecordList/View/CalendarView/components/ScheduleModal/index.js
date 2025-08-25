import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import moment from 'moment';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'src/pages/worksheet/redux/actions/calendarview';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import './index.less';

let tabList = [
  { key: 'eventAll', txt: _l('全部') },
  { key: 'eventScheduled', txt: _l('已排期') },
  { key: 'eventNoScheduled', txt: _l('未排期') },
];
const eventStr = {
  0: 'eventAll', //全部
  1: 'eventScheduled', //已排期
  2: 'eventNoScheduled', //未排期
};

class ScheduleModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewRecordId: undefined,
      wsid: undefined,
    };
  }
  componentDidMount() {
    safeLocalStorageSetItem('CalendarShowExternalTypeEvent', 'eventAll');
    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }

  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => {
      this.setState({ previewRecordId: undefined, wsid: undefined });
    });
  };

  renderListEvent = () => {
    const { calendarview, getInitType } = this.props;
    const { calenderEventList } = calendarview;
    const typeEvent = getInitType();
    const eventData =
      (typeEvent === eventStr[1] ? calenderEventList[`${typeEvent}DtResort`] : calenderEventList[typeEvent]) || [];
    if (typeEvent === eventStr[1]) {
      return (
        <React.Fragment>
          {!calenderEventList[`${typeEvent}UpIsAll`] && calenderEventList[`${typeEvent}UpIndex`] < 1 && (
            <div
              className="pTop16 pBottom4 forPassEvent Hand"
              onClick={() => {
                let pageIndx = calenderEventList[`${typeEvent}UpIndex`]
                  ? calenderEventList[`${typeEvent}UpIndex`] + 1
                  : 1;
                this.setState(
                  {
                    eventConH: $('.eventListBox .mcm').height(),
                  },
                  () => {
                    this.props.updateEventList(pageIndx, true);
                    this.setState({
                      loadUp: true,
                    });
                  },
                );
              }}
            >
              {_l('点击查看过去的日程')}
            </div>
          )}
          <div className="listContainer">
            {eventData.map(it => {
              let timeStr = '';
              if (moment(it.date).format('ll') === moment().format('ll')) {
                timeStr = _l('今天');
              } else {
                timeStr = moment(it.date).format('ll');
              }

              return (
                <div key={it.date}>
                  <div className="timeStr">
                    {timeStr} <span>{moment(it.date).format('dddd')}</span>
                  </div>
                  {this.renderEventData(it.res)}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      );
    } else {
      return <div className="listContainer">{this.renderEventData(eventData)}</div>;
    }
  };
  renderEventData = (eventData = []) => {
    return (
      <React.Fragment>
        {eventData.map(it => {
          const { extendedProps = {} } = it;
          const { rowid, wsid, recordColor } = extendedProps;

          return (
            <div
              className="listItem"
              rowid={rowid}
              key={`${rowid}-${it.begin}`}
              enddate={it.enddate}
              style={{
                backgroundColor: recordColor && recordColor.showBg ? recordColor.lightColor : undefined,
                border: `1px solid ${recordColor && recordColor.showBg ? recordColor.lightColor : '#fff'}`,
              }}
              onClick={() => {
                if (window.isMingDaoApp && !window.shareState.shareId) {
                  const { base } = this.props;
                  window.location.href = `/mobile/record/${base.appId}/${wsid}/${base.viewId}/${rowid}`;
                  return;
                }
                handlePushState('page', 'recordDetail');
                this.setState({ previewRecordId: rowid, wsid });
              }}
            >
              {recordColor && recordColor.showLine && (
                <div className="colorLeft" style={{ backgroundColor: recordColor.color }}></div>
              )}
              <div className="title Font14 Bold ellipsis" title={it.title} style={{ WebkitBoxOrient: 'vertical' }}>
                {it.title}
              </div>
              {it.timeList.map(o => {
                if (o.start)
                  return (
                    <div className="Gray_9e Font13 mTop2">
                      {o.start}
                      <span className="mLeft10">{o.info.mark}</span>
                    </div>
                  );
              })}
            </div>
          );
        })}
      </React.Fragment>
    );
  };
  renderSearchData = searchData => {
    const { getInitType } = this.props;
    const typeEvent = getInitType();
    if (searchData.length <= 0) {
      return <div className="noData">{_l('没有搜索结果')}</div>;
    }
    return (
      <div className="searchData">
        <div className="text">
          {_l('%0条%1', searchData.length, (tabList.find(o => o.key === typeEvent) || {}).txt)}
        </div>
        {this.renderEventData(searchData)}
      </div>
    );
  };
  handleScroll = ({ direction }) => {
    const { calendarview, getInitType } = this.props;
    const { calenderEventList } = calendarview;
    const { keyWords } = calenderEventList;
    const typeEvent = getInitType();
    if (direction === 'down' && !calenderEventList[`${typeEvent}IsAll`]) {
      this.setState({
        scrollType: 1,
        scrollLoading: true,
      });
      let pageIndx = calenderEventList[`${typeEvent}Index`] ? calenderEventList[`${typeEvent}Index`] + 1 : 2;
      this.props.updateEventList(pageIndx, false);
    } else if (
      direction === 'up' &&
      typeEvent === eventStr[1] &&
      !calenderEventList[`${typeEvent}UpIsAll`] &&
      !keyWords
    ) {
      let pageIndx = calenderEventList[`${typeEvent}UpIndex`] ? calenderEventList[`${typeEvent}UpIndex`] + 1 : 2;
      this.setState(
        {
          eventConH: $('.eventListBox .mcm').height(),
        },
        () => {
          this.props.updateEventList(pageIndx, true);
          this.setState({
            loadUp: true,
            scrollType: 0,
            scrollLoading: true,
          });
        },
      );
    } else {
      this.setState({
        scrollType: null,
        scrollLoading: false,
      });
    }
  };
  render() {
    let { isSearch, previewRecordId, wsid } = this.state;
    const { base, visible, showschedule, calendarview = {}, getInitType, worksheetInfo = {} } = this.props;
    const { calenderEventList = {}, calendarLoading = false } = calendarview;
    const { keyWords, searchData = [] } = calenderEventList;
    const typeEvent = getInitType();
    const eventData = calenderEventList[typeEvent];
    return (
      <Fragment>
        <Popup visible={visible} onClose={showschedule} className="mobileSchedulekModal mobileModal minFull topRadius">
          <div className="header">
            {_l('排期')}
            <div className="closeIcon">
              <Icon icon="close" onClick={showschedule} />
            </div>
          </div>
          <div className="content pTop5">
            <ul className="tab">
              {tabList.map(it => {
                return (
                  <li
                    key={it.key}
                    className={cx('Hand', { current: it.key === typeEvent })}
                    onClick={() => {
                      this.props.getEventScheduledData(it.key);
                      safeLocalStorageSetItem('CalendarShowExternalTypeEvent', it.key);
                    }}
                  >
                    {it.txt}
                  </li>
                );
              })}
            </ul>
            {eventData.length || searchData.length ? (
              <div className="searchWrapper">
                <Icon icon="search" className="searchIcon Font20" />
                <input
                  type="text"
                  className="cursorText"
                  placeholder={_l('搜索%0', (tabList.find(o => o.key === typeEvent) || {}).txt)}
                  onChange={event => {
                    const searchValue = event.target.value;
                    this.props.searchKeys(searchValue);
                    if (!searchValue) {
                      this.setState({ isSearch: false });
                    }
                  }}
                  onKeyUp={e => {
                    if (e.keyCode === 13) {
                      const searchValue = e.target.value;
                      this.props.searchEventArgs(searchValue, 1);
                      $('.eventListBox .scroll-viewport').scrollTop(0);
                      this.setState({ isSearch: !!searchValue });
                    }
                  }}
                  value={keyWords}
                />
              </div>
            ) : null}
            {calendarLoading && <LoadDiv />}
            {!isSearch && !calendarLoading && eventData && eventData.length > 0 && (
              <ScrollView className="recordListBox" onReachVerticalEdge={this.handleScroll}>
                {this.renderListEvent()}
              </ScrollView>
            )}
            {this.state.isSearch && !calendarLoading && (
              <ScrollView className="recordListBox">
                <div className="listContainer">{this.renderSearchData(searchData)}</div>
              </ScrollView>
            )}
            {!isSearch && !calendarLoading && (!eventData || eventData.length <= 0) && (
              <div className="noData">{_l('没有%0', (tabList.find(o => o.key === typeEvent) || {}).txt)}</div>
            )}
          </div>
        </Popup>
        <RecordInfoModal
          className="full"
          visible={!!previewRecordId}
          enablePayment={worksheetInfo.enablePayment}
          appId={base.appId}
          worksheetId={wsid}
          viewId={base.viewId}
          rowId={previewRecordId}
          onClose={() => {
            this.setState({
              previewRecordId: undefined,
              wsid: undefined,
            });
          }}
        />
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    calendarview: state.sheet.calendarview,
    base: state.sheet.base,
    worksheetInfo: state.mobile.worksheetInfo,
  }),
  dispatch => bindActionCreators({ ...actions }, dispatch),
)(ScheduleModal);
