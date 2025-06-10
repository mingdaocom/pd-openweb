import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { calculateTimePercentage } from 'src/pages/worksheet/views/ResourceView/util.js';
import { browserIsMobile } from 'src/utils/common';
import { dayTimeByPart, lineBottomHeight, timeWidth, timeWidthHalf, types, weekObj } from '../config';
import RecordWrap from './RecordWrap';

const Wrap = styled.div`
  .showGroup {
    position: absolute;
    left: 0;
    top: 50%;
    z-index: 1;
    width: 16px;
    height: 32px;
    border: 1px solid #e0e0e0;
    border-left: none;
    border-radius: 0 4px 4px 0;
    background-color: #fff;
    .icon {
      color: #9e9e9e;
    }
    &:hover {
      border: 1px solid #2196f3;
      .icon {
        color: #2195f3;
      }
    }
  }
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  flex: 1;
  overflow: hidden;
  .conForCanvasTime {
    overflow-x: auto;
    overflow-y: hidden;
  }
  .isBg {
    background: rgba(0, 0, 0, 0.02);
  }
  .headCon {
    height: 44px;
    line-height: 44px;
    .today {
      color: #fff;
      padding: 0 8px;
      height: 28px;
      line-height: 28px;
      &:hover {
        color: #2196f3;
        background: #f5f5f5;
        border-radius: 3px 3px 3px 3px;
      }
    }
    .pre,
    .next {
      color: #9e9e9e;
      width: 28px;
      height: 28px;
      text-align: center;
      line-height: 28px;
      font-size: 18px;
      i {
        margin: 0 auto;
      }
      &:hover {
        color: #2196f3;
        background: #f5f5f5;
        border-radius: 3px 3px 3px 3px;
      }
    }
  }
`;
const ScrollWrap = styled.div`
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  right: 0;
  width: ${props => props.width || 10}px;
  top: ${props => props.top}px;
  height: ${props => `calc(100% - ${props.top}px)`};
  z-index: 10;
`;
const GridCon = styled.div`
  width: ${props => props.width}px;
  min-width: ${props => props.width}px;
  max-width: ${props => props.width}px;
  .con {
    .gridOne {
      height: 28px;
      line-height: 28px;
      width: ${timeWidth}px;
      min-width: ${timeWidth}px;
      max-width: ${timeWidth}px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    }
    .gridWeek {
      line-height: 28px;
      height: 28px;
      border-bottom: 1px solid #ddd;
      box-sizing: border-box;
      width: ${props => props.weekWidth}px;
      min-width: ${props => props.weekWidth}px;
      max-width: ${props => props.weekWidth}px;
    }
  }
  .gridYear {
    width: ${timeWidth * 2 * 12}px;
  }
  .gridYearOne {
    width: ${timeWidth * 2}px;
    line-height: 28px;
    height: 28px;
    border-bottom: 1px solid #ddd;
    box-sizing: border-box;
  }
  .gridWeekCon {
    & > div.weekG {
      overflow: hidden;
      &:last-child {
      }
    }
  }
  .gridDayCon {
    overflow-y: hidden;
    border-top: 1px solid rgba(0, 0, 0, 0.09);
    & > div.timeG {
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      width: ${timeWidthHalf * dayTimeByPart}px;
      max-width: ${timeWidthHalf * dayTimeByPart}px;
      min-width: ${timeWidthHalf * dayTimeByPart}px;
      flex: 1;
      &:last-child {
        // border-right: none;
      }
      .timeGTxt {
        border-bottom: 1px solid rgba(0, 0, 0, 0.09);
      }
      .timeGH {
        .gridOneHalf {
          width: ${timeWidthHalf}px;
          min-width: ${timeWidthHalf}px;
          max-width: ${timeWidthHalf}px;
          border-right: 1px solid rgba(0, 0, 0, 0.09);
          &:last-child {
            border-right: none;
          }
        }
      }
    }
  }
  .timeCanvasLines {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
  }
  .timeCanvas,
  .headGridCon {
    flex-shrink: 0;
    min-height: 0;
  }
`;
const GridOne = styled.div`
  width: ${props => props.gridWidth}px;
  min-width: ${props => props.gridWidth}px;
  max-width: ${props => props.gridWidth}px;
  border-right: ${props => (props.isBorder2 ? 2 : 1)}px solid rgba(0, 0, 0, 0.06);
  .todayLine {
    position: absolute;
    left: 0;
    top: -5px;
    height: calc(100% + 5px);
    width: 1px;
    z-index: 1;
    background-color: #f44336;
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      margin-left: -3px;
      position: absolute;
      bottom: 0;
      top: -3px;
      background-color: #f44336;
    }
  }
`;

export default function Timegrid(props) {
  const [{ todayVisible }, setState] = useSetState({
    todayVisible: false,
  });
  useEffect(() => {
    setTimeout(() => {
      setTodayBtn();
    }, 1000);
  }, [props.canvasType]);
  const setTodayBtn = () => {
    if ($('.ant-modal-mask').length > 0 || $('.todayLine').length <= 0) {
      return;
    }
    let lineLeft = $('.todayLine').offset().left;
    let w = $('.conForCanvasTime').width();
    let offsetLeft = $('.conForCanvasTime').offset().left;
    let left = offsetLeft;
    let right = offsetLeft + w;
    if (lineLeft < left || lineLeft > right) {
      setState({
        todayVisible: true,
      });
    } else {
      setState({
        todayVisible: false,
      });
    }
  };
  const goTodayLine = () => {
    let lineLeft = $('.todayLine').attr('leftData');
    $('.conForCanvasTime').scrollLeft(lineLeft - 100);
  };
  const scrollDiv = useRef(null);
  const isM = browserIsMobile();
  const renderContent = () => {
    const { resourceview, updateCurrnetTime, view, mx, viewId } = props;
    const { timeList, currentTime, resourceDataByKey, gridTimes } = resourceview;
    const { title, list } = timeList;
    const type =
      localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
    const timeGridCount = gridTimes.length;
    const widthCon =
      type !== 'Day'
        ? type === 'Week'
          ? timeWidth * 2 * timeGridCount
          : timeGridCount * timeWidth
        : timeGridCount * timeWidthHalf;
    const allW = widthCon; // widthCon >= mx ? widthCon : mx;
    const onScroll = () => {
      const { view, viewId } = props;
      const scrollTop = scrollDiv.current && scrollDiv.current.scrollTop;
      document.getElementById(`leftCon_${viewId}`).scrollTop = scrollTop;
      document.getElementById(`rightCon_${viewId}`).scrollTop = scrollTop;
      if (
        Math.floor(props.mx) < Math.floor(props.allW) &&
        Math.floor($(`#resourceGroup_${viewId}_${0}`).width()) <= Math.floor(props.directoryWidth)
      ) {
        $(`#leftCon_${viewId}`).css({
          paddingBottom: 10,
        });
      }
    };
    const isNotToday =
      !!currentTime &&
      !(
        moment().isSameOrAfter(moment(gridTimes[0].date), 'day') &&
        moment().isSameOrBefore(moment(gridTimes[gridTimes.length - 1].date), 'day')
      );
    return (
      <div className="flexColumn h100 Relative">
        <div className="headCon flexRow alignItemsCenter">
          <div className="flex Bold TxtCenter Font17">{title}</div>
          <div className="flexRow alignItemsCenter mRight15">
            {(isNotToday || (!isNotToday && todayVisible)) && (
              <div
                className={cx('Hand today Gray_75 ThemeHoverColor3 Bold mRight8')}
                onClick={() => {
                  if (!isNotToday) {
                    setState({ todayVisible: false });
                    goTodayLine();
                  } else {
                    updateCurrnetTime(null);
                    setTimeout(() => {
                      goTodayLine();
                    }, 500);
                  }
                }}
              >
                {type === 'Day' && !isNotToday ? _l('此刻') : _l('今天')}
              </div>
            )}
            <Tooltip
              disable={isM}
              text={
                <span>
                  {type === 'Month'
                    ? _l('上个月')
                    : type === 'Week'
                      ? _l('上一周')
                      : type === 'Year'
                        ? _l('上一年')
                        : _l('上一天')}
                </span>
              }
            >
              <div
                className="pre Hand flexRow alignItemsCenter TxtCenter"
                onClick={() => {
                  updateCurrnetTime(
                    moment(
                      (!!currentTime ? moment(currentTime) : moment()).subtract(
                        type === 'Week' ? 7 : 1,
                        type === 'Month' ? 'months' : type === 'Year' ? 'years' : 'days',
                      ),
                    ).format('YYYY-MM-DD'),
                  );
                }}
              >
                <Icon icon="arrow-left-border" className="Gray_9e ThemeHoverColor3" />
              </div>
            </Tooltip>
            <Tooltip
              disable={isM}
              text={
                <span>
                  {type === 'Month'
                    ? _l('下个月')
                    : type === 'Week'
                      ? _l('下一周')
                      : type === 'Year'
                        ? _l('下一年')
                        : _l('下一天')}
                </span>
              }
            >
              <div
                className="next Hand flexRow alignItemsCenter TxtCenter"
                onClick={() => {
                  updateCurrnetTime(
                    moment(
                      (!!currentTime ? moment(currentTime) : moment()).add(
                        type === 'Week' ? 7 : 1,
                        type === 'Month' ? 'months' : type === 'Year' ? 'years' : 'days',
                      ),
                    ).format('YYYY-MM-DD'),
                  );
                }}
              >
                <Icon icon="arrow-right-border" className="Gray_9e ThemeHoverColor3" />
              </div>
            </Tooltip>
          </div>
        </div>
        <div
          className="conForCanvasTime flex"
          onMouseEnter={() => {
            window.isCanvasTime = true;
          }}
          onMouseLeave={() => {
            window.isCanvasTime = false;
          }}
          onScroll={() => {
            setTodayBtn();
          }}
        >
          <GridCon
            className="gridCon flexColumn h100"
            width={allW}
            weekWidth={!['Month'].includes(type) && (list[0].times || []).length * timeWidth * 2}
          >
            <div className="headGridCon">
              {type === 'Month'
                ? renderMonth()
                : type === 'Week'
                  ? renderWeek()
                  : type === 'Year'
                    ? renderYear()
                    : renderDay()}
            </div>
            <div className="timeCanvas flex flexRow Relative h100">
              <div className="flex h100 flexRow timeCanvasLines" style={{ width: widthCon }}>
                {gridTimes.map((o, i) => {
                  const percentage = calculateTimePercentage(
                    moment(o.date),
                    !gridTimes[i + 1]
                      ? 'Day' === type
                        ? moment(o.date).add(0.5, 'h')
                        : moment(o.date).add(1, 'Month' === type ? 'd' : 'h')
                      : moment(gridTimes[i + 1].date),
                    type,
                  );
                  return (
                    <GridOne
                      className={cx('gridOneCon h100 Relative', {
                        isBg: ['Month'].includes(type) && [6, 7].includes(o.dayOfWeek),
                      })}
                      gridWidth={
                        ['Week'].includes(type)
                          ? timeWidth * 2
                          : ['Month', 'Year'].includes(type)
                            ? timeWidth
                            : timeWidthHalf
                      }
                      isBorder2={
                        (['Week'].includes(type) && (i + 1) % (list[0].times || []).length === 0) ||
                        (['Year'].includes(type) && (i + 1) % 2 === 0)
                      }
                    >
                      {percentage >= 0 && (
                        <div
                          className="todayLine"
                          style={{
                            left: `${Math.floor(
                              (Math.floor(percentage) * ('Day' === type ? timeWidthHalf : timeWidth)) / 100,
                            )}px`,
                          }}
                          leftData={
                            Math.floor((Math.floor(percentage) * ('Day' === type ? timeWidthHalf : timeWidth)) / 100) +
                            ('Day' === type ? timeWidthHalf : timeWidth) * i
                          }
                        >
                          <div className="dot"></div>
                        </div>
                      )}
                    </GridOne>
                  );
                })}
              </div>
              <RecordWrap
                {...props}
                width={allW}
                gridWidth={
                  ['Year'].includes(type)
                    ? timeWidth * 2
                    : ['Week'].includes(type)
                      ? timeWidth * 4
                      : ['Month'].includes(type)
                        ? timeWidth
                        : timeWidthHalf
                }
                style={{ width: allW }}
                listHeight={_.sum(resourceDataByKey.map(o => o.height))}
              />
            </div>
          </GridCon>
        </div>
        <ScrollWrap
          id={`scrollDiv_${view.viewId}`}
          top={(type === 'Day' ? 28 + 2 : 28) + 44}
          onScroll={onScroll}
          ref={scrollDiv}
          width={Math.floor(props.mx - allW) > 0 ? Math.floor(props.mx - allW) : 10}
        >
          <div
            className="c"
            style={{
              height: _.sum(resourceDataByKey.map(o => o.height + lineBottomHeight)),
              width: 1,
            }}
          ></div>
        </ScrollWrap>
        {/* <div
          className={cx('showGroup Hand')}
          onClick={() => {
            props.hideGroup();
          }}
        >
          <Icon className="" icon={props.showGroup?"a-arrowback":} />
        </div> */}
      </div>
    );
  };
  const renderMonth = () => {
    const { resourceview } = props;
    const { timeList } = resourceview;
    const { list = [] } = timeList;
    return (
      <div className="flexRow con h100">
        {list.map(o => {
          return (
            <div className="flexColumn">
              <div className="gridOne TxtCenter Font12">
                {o.dateStr}
                {weekObj[o.dayOfWeek - 1]}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const renderDay = () => {
    const { resourceview } = props;
    const { timeList } = resourceview;
    const { list = [] } = timeList;
    return (
      <div className="flexRow con h100">
        {list.map(o => {
          return (
            <div className="flexRow flex gridDayCon">
              {(o.times || []).map(it => {
                return (
                  <div className="timeG">
                    <div className="TxtCenter LineHeight28 timeGTxt Font12">
                      {it.time}
                      {it.amOrPm}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderYear = () => {
    const { resourceview } = props;
    const { timeList } = resourceview;
    const { list = [] } = timeList;
    return (
      <div className="flexRow con h100 Relative">
        {list.map(o => {
          return (
            <div className="flexColumn">
              <div className="gridYear TxtCenter flexColumn h100">
                <div className="flexRow flex gridWeekCon">
                  {(o.times || []).map(it => {
                    return (
                      <div className="timeG">
                        <div className="gridYearOne TxtCenter Font12">
                          {it.time}
                          {_l('月')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeek = () => {
    const { resourceview } = props;
    const { timeList } = resourceview;
    const { list = [] } = timeList;
    return (
      <div className="flexRow con h100 Relative">
        {list.map(o => {
          return (
            <div className="flexColumn">
              <div className="gridWeek TxtCenter flexColumn h100">
                <div className="">
                  <span className="weekTxt TxtCenter">
                    {moment(o.date).format('M/D')}
                    {weekObj[o.dayOfWeek - 1]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Wrap className={props.className}>
      {_.get(props, 'resourceview.loading') && props.renderLoading ? props.renderLoading() : renderContent()}
    </Wrap>
  );
}
