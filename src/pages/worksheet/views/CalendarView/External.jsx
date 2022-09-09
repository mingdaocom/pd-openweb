import React, { Component } from 'react';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import { connect } from 'react-redux';
import moment from 'moment';
import { Draggable } from '@fullcalendar/interaction';
import { eventStr } from './util';
let isChangeing = false;
import { bindActionCreators } from 'redux';
import * as Actions from 'src/pages/worksheet/redux/actions/calendarview';
@connect(
  state => ({
    ...state.sheet,
  }),
  dispatch => bindActionCreators(Actions, dispatch),
)
class External extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollType: null,
      eventConH: 0,
      loadUp: false,
      isSearch: false,
      random: parseInt(Math.random() * 1000000000000),
    };
  }

  componentDidMount() {
    new Draggable(document.getElementById(`externalEvents-${this.state.random}`), {
      itemSelector: '.fcEvent',
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    const { calendarview = {}, getInitType, fetchExternal, refreshEventList, updateCalendarEventIsAdd } = nextProps;
    const { calendarEventIsAdd, calendarData = {} } = calendarview;
    const { calendarInfo } = calendarData;
    if (!_.isEqual(calendarInfo, _.get(this.props, ['calendarview', 'calendarData', 'calendarInfo']))) {
      this.setState({
        isSearch: false,
      });
    }
    const typeEvent = getInitType();
    if (calendarEventIsAdd) {
      refreshEventList();
      //有新增数据
      fetchExternal();
      updateCalendarEventIsAdd(false); //更改新增状态
    }
    if (typeEvent === 'eventScheduled' && this.state.loadUp) {
      //向上更新排期事件 不滚动
      if (this.state.loadUp) {
        setTimeout(() => {
          $('.eventListBox .nano-content').scrollTop($('.eventListBox .mcm').height() - this.state.eventConH);
          this.setState({
            loadUp: false,
          });
        }, 500);
      }
    }
  }

  renderSearchData = seachData => {
    const { getInitType } = this.props;
    const typeEvent = getInitType();
    if (seachData.length <= 0) {
      return <div className="noData">{_l('没有搜索结果')}</div>;
    }
    return (
      <div className="seachData">
        <div className="text">
          {_l('%0条%1', seachData.length, (this.props.tabList.find(o => o.key === typeEvent) || {}).txt)}
        </div>
        {this.renderEventData(seachData)}
      </div>
    );
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
          <div className="mcm">
            {eventData.map(it => {
              let timeStr;
              if (moment(it.date).format('ll') === moment().format('ll')) {
                timeStr = _l('今天');
              } else {
                timeStr = moment(it.date).format('ll');
              }
              return (
                <div className="">
                  <div className={cx('timeStr', {})}>{timeStr}</div>
                  {this.renderEventData(it.res)}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      );
    } else {
      return <div className="mcm">{this.renderEventData(eventData)}</div>;
    }
  };

  renderEventData = (eventData = []) => {
    return (
      <React.Fragment>
        {eventData.map(it => {
          const { extendedProps = {}, timeList = [] } = it;
          const { editable, rowid, stringColor = '' } = extendedProps;
          let begin = timeList.length === 1 ? timeList[0].start : '';
          return (
            <div
              className={cx('clearfix fcEventCon', { fcEvent: editable })}
              rowid={rowid}
              key={`${rowid}-${it.begin}`}
              keyId={`${rowid}-${it.begin}`}
              enddate={it.enddate}
              onClick={() => {
                this.props.showRecordInfo(rowid, it, eventData);
              }}
            >
              {<div className="colorLeft" style={{ backgroundColor: stringColor }}></div>}
              <div className="title Font14 Bold" title={it.title} style={{ WebkitBoxOrient: 'vertical' }}>
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

  handleScroll = (event, values) => {
    const { calendarview, getInitType } = this.props;
    const { calenderEventList } = calendarview;
    const { keyWords } = calenderEventList;
    const typeEvent = getInitType();
    const { direction, maximum, position } = values;
    if (direction === 'down' && maximum - position < 20 && !calenderEventList[`${typeEvent}IsAll`]) {
      this.setState({
        scrollType: 1,
        scrollLoading: true,
      });
      let pageIndx = calenderEventList[`${typeEvent}Index`] ? calenderEventList[`${typeEvent}Index`] + 1 : 2;
      this.props.updateEventList(pageIndx, false);
    } else if (
      direction === 'up' &&
      position < 20 &&
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
    const { calendarview, getInitType } = this.props;
    const { calenderEventList = {}, calendarLoading = false } = calendarview;
    const { keyWords, seachData = [] } = calenderEventList;
    const typeEvent = getInitType();
    const eventData = calenderEventList[typeEvent];
    return (
      <div id={`externalEvents-${this.state.random}`} className="externalEvents">
        {this.props.showExternal ? (
          <div className="listBox">
            <div className="searchWrapper">
              <Icon icon="search" className="Font18" />
              <input
                type="text"
                className="cursorText"
                placeholder={_l('搜索%0', (this.props.tabList.find(o => o.key === typeEvent) || {}).txt)}
                onChange={event => {
                  isChangeing = false;
                  const searchValue = event.target.value;
                  this.props.searchKeys(searchValue);
                  if (!searchValue) {
                    this.setState({ isSearch: false });
                  }
                }}
                onKeyUp={e => {
                  if (e.keyCode === 13) {
                    isChangeing = true;
                    const searchValue = e.target.value;
                    this.props.searchEventArgs(searchValue, 1);
                    $('.eventListBox .nano-content').scrollTop(0);
                    this.setState({ isSearch: !!searchValue });
                  }
                }}
                value={keyWords}
              />
              {keyWords && (
                <Icon
                  icon="cancel"
                  className="Font18 Hand"
                  onClick={() => {
                    this.props.searchEventArgs('', 1);
                    $('.eventListBox .nano-content').scrollTop(0);
                    this.setState({ isSearch: false });
                  }}
                />
              )}
            </div>
            {!this.state.isSearch && (
              <div className="tab">
                <ul>
                  {this.props.tabList.map((it, i) => {
                    return (
                      <li
                        className={cx('Hand', { current: it.key === typeEvent })}
                        onClick={() => {
                          this.props.getEventScheduledData(it.key);
                          $('.eventListBox .nano-content').scrollTop(0);
                          safeLocalStorageSetItem('CalendarShowExternalTypeEvent', it.key);
                        }}
                      >
                        {it.txt}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {calendarLoading && <LoadDiv />}
            {this.state.isSearch && !calendarLoading && (
              <ScrollView
                className="eventListBox"
                style={{
                  maxHeight: document.documentElement.clientHeight - 190,
                }}
              >
                <div className="mcm">{this.renderSearchData(seachData)}</div>
              </ScrollView>
            )}
            {!this.state.isSearch && !calendarLoading && eventData && eventData.length > 0 && (
              <ScrollView
                className="eventListBox"
                style={{ maxHeight: document.documentElement.clientHeight - 220 }}
                updateEvent={this.handleScroll}
              >
                {this.renderListEvent()}
              </ScrollView>
            )}
            {!this.state.isSearch && !calendarLoading && (!eventData || eventData.length <= 0) && (
              <div className="noData noDataTop">
                {_l('没有%0', (this.props.tabList.find(o => o.key === typeEvent) || {}).txt)}
              </div>
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default External;
