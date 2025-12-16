import React, { Component, Fragment } from 'react';
import { Button, Dropdown, Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Checkbox, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { START_APP_TYPE } from 'src/pages/workflow/WorkflowList/utils';
import PauseTimeList from '../PauseTimeList';
import CountDown from './CountDown';
import { formatter, justifyInfoData, runDateList } from './enum';

export default class ExecutionDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sorter: {},
      routerList: {},
    };
  }

  componentDidMount() {
    this.getRouterList();
  }

  // 批量设置（暂停、恢复）流程
  batchPauseRecover = (isPause, hours) => {
    const { checkedIds = [] } = this.state;
    const { detailList, projectId } = this.props;

    flowMonitor
      .batch({
        hours,
        processIds: checkedIds,
        waiting: isPause ? true : false,
        companyId: projectId,
      })
      .then(res => {
        if (res) {
          let copyDetailList = [];
          if (isPause) {
            copyDetailList = detailList.map(item => {
              if (_.includes(checkedIds, item.id)) {
                return {
                  ...item,
                  hours,
                  waiting: true,
                  dueDate: moment()
                    .add(hours * 60 + 1, 'm')
                    .format('YYYY-MM-DD HH:mm:ss'),
                };
              }
              return item;
            });
          } else {
            copyDetailList = detailList.map(item => {
              if (_.includes(checkedIds, item.id)) {
                return { ...item, waiting: false };
              }
              return item;
            });
          }
          alert(_l('操作成功'));
          this.setState({ checkedIds: [], detailList: copyDetailList });
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  // 批量重新排队计数
  resetQueue = () => {
    const { checkedIds = [] } = this.state;
    const { projectId } = this.props;
    flowMonitor
      .reset({
        processIds: checkedIds,
        companyId: projectId,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          this.setState({ checkedIds: [] });
          this.props.getFlowList(true);
        } else {
          alert(_l('操作失败'));
        }
      });
  };

  // 点击暂停消费
  clickRecover = item => {
    flowMonitor
      .updateWaiting({
        processId: item.id,
        hours: !item.waiting ? 1 : undefined,
        waiting: !item.waiting,
      })
      .then(res => {
        if (res) {
          let copyDetailList = this.props.detailList.map(it => {
            if (item.id === it.id) {
              return { ...it, waiting: false };
            } else {
              return it;
            }
          });
          this.props.updateDetailList(copyDetailList);
        } else {
          alert(_l('请先开启工作流'), 3);
        }
      });
  };

  // 修改选择的通道
  updateRouterIndex = item => {
    const { routerList = {}, checkedIds } = this.state;
    const isSingle = typeof item === 'object';
    let params = {};
    const temp = Object.keys(routerList)
      .map(t => Number(t))
      .filter(v => v !== item.routerIndex);
    const routerIndex = isSingle ? (temp.length ? Number(temp[0]) : item.routerIndex) : Number(item);
    if (isSingle) {
      params = {
        hours: item.hours,
        processIds: [item.id],
        routerIndex,
        waiting: item.waiting,
      };
    } else {
      params = {
        processIds: this.state.checkedIds,
        routerIndex,
      };
    }
    flowMonitor.updateRouterIndex(params).then(res => {
      if (res) {
        let copyDetailList = this.props.detailList.map(it => {
          if ((isSingle && item.id === it.id) || (!isSingle && _.includes(checkedIds, it.id))) {
            return {
              ...it,
              routerIndex,
              routerName: routerList[routerIndex],
            };
          } else {
            return it;
          }
        });

        this.props.updateDetailList(copyDetailList);
      } else {
        alert(_l('修改失败'), 2);
      }
    });
  };

  // 改变执行操作
  changeOperation = (item, hours) => {
    flowMonitor
      .updateWaiting({
        processId: item.id,
        hours,
        waiting: true,
      })
      .then(res => {
        if (res) {
          let copyDetailList = this.props.detailList.map(it => {
            if (item.id === it.id) {
              return {
                ...it,
                hours,
                waiting: true,
                dueDate: moment()
                  .add(hours * 60 + 1, 'm')
                  .format('YYYY-MM-DD HH:mm:ss'),
              };
            } else {
              return it;
            }
          });
          this.props.updateDetailList(copyDetailList);
        } else {
          alert(_l('请先开启工作流'), 3);
        }
      });
  };

  // 获取已有通道
  getRouterList = () => {
    const { projectId } = this.props;
    flowMonitor.getRouterList({ companyId: projectId }).then(res => {
      this.setState({ routerList: res });
    });
  };

  renderTableSorterHeader = ({ type, tableHeaderName, name }) => {
    let { sorter = {}, showHistoryDetail } = this.props;
    const { fields, isDesc } = sorter;
    return (
      <div
        className={cx('headerItem columnWidth170 flexRow Hand orderTitleHover flexDirection', {
          pRight16: type === 'waiting',
        })}
        onClick={() => this.props.changeSorter(type)}
      >
        {type !== 'waiting' && (
          <div className="flexColumn manageListOrder">
            <Icon icon="arrow-up" className={cx({ ThemeColor3: fields === type && !isDesc })} />
            <Icon icon="arrow-down" className={cx({ ThemeColor3: fields === type && isDesc })} />
          </div>
        )}
        {type === 'routerIndex' && (
          <Tooltip
            align={{
              points: ['tc', 'bc'],
              offset: [0, -20],
            }}
            title={
              <div>
                <div>{_l('主要：用于处理需要及时响应的流程。')}</div>
                <div>
                  {_l(
                    '备用：限流通道。用于临时处理主要通道中发生堆积的流程执行。或处理响应时效要求低的流程，使用此通道更稳定。',
                  )}
                </div>
                <div>
                  {_l(
                    '说明：当主要通道的流程排队数超出阈值时，此流程的超出部分和继续新增的执行会进入备用通道并优先于备用通道流程开始消费。',
                  )}
                </div>
              </div>
            }
          >
            <Icon icon="info_outline" className="Gray_75 mLeft6 LineHeight54 " />
          </Tooltip>
        )}
        {showHistoryDetail ? name : tableHeaderName}
      </div>
    );
  };

  renderListContent = () => {
    let { checkedIds = [], routerList = {}, queueTime } = this.state;
    const { detailList, loading, pageIndex, showHistoryDetail } = this.props;
    if (loading && pageIndex === 1 && _.isEmpty(detailList)) {
      return <LoadDiv className="mTop15" size="small" />;
    }

    if (_.isEmpty(detailList)) {
      return (
        <div className="flexColumn emptyBox">
          <div className="emptyIcon">
            <Icon icon="verify" className="Font40" />
          </div>
          {_l('无数据')}
        </div>
      );
    }
    return (
      <Fragment>
        {detailList.map((item, index) => {
          const {
            id,
            name,
            difference,
            producer,
            consumer,
            hours,
            waiting,
            child,
            startAppType,
            enabled,
            dueDate,
            app,
            routerIndex,
            routerName,
          } = item;
          return (
            <div className={cx('row flexRow', { checked: _.includes(checkedIds, item.id) })} key={`${id}-${index}`}>
              <div className="cloumnItem flex flexRow pLeft10">
                <div
                  className={cx('iconWrap', { unable: !enabled })}
                  style={{ backgroundColor: (START_APP_TYPE[child ? 'subprocess' : startAppType] || {}).iconColor }}
                >
                  <Icon icon={(START_APP_TYPE[item.child ? 'subprocess' : startAppType] || {}).iconName} />
                </div>
                <Checkbox
                  className="checkFlow"
                  checked={_.includes(checkedIds, item.id)}
                  onClick={checked => {
                    if (!checked) {
                      let copyCheckedIds = [...checkedIds];
                      copyCheckedIds.push(item.id);
                      this.setState({ checkedIds: copyCheckedIds });
                    } else {
                      this.setState({ checkedIds: checkedIds.filter(it => it !== item.id) });
                    }
                  }}
                />
                <div className="flexColumn flowInfo">
                  <div
                    className="flowName Hand ellipsis"
                    onClick={() => this.props.checkIsAppAdmin(app.id, item.id, item.name)}
                  >
                    {name}
                  </div>
                  <div className="Gray_75 Font12 ellipsis">{app.name}</div>
                </div>
              </div>
              <div className="cloumnItem columnWidth170 textalignR pRight20">{formatter(producer)}</div>
              <div className="cloumnItem columnWidth170 textalignR pRight20">
                {waiting ? (
                  <span className="waitText textalignR">{_l('暂停')}</span>
                ) : (
                  <span className="waitText textalignR">{formatter(consumer)}</span>
                )}
              </div>
              <div className="cloumnItem columnWidth170 textalignR">
                <span>{formatter(difference)}</span>
                <span className="queueTimeInfo">
                  {Number(formatter(difference)) ? (
                    <Tooltip trigger={['click']} title={queueTime} placement="right" align={{ offset: [0, -2] }}>
                      <Icon
                        onClick={() => {
                          let totalMinutes = 0,
                            tempQueueTime = _l('排队时长：小于10分钟');
                          flowMonitor
                            .getHistoryDifferenceByProcessId({
                              processId: id,
                            })
                            .then(res => {
                              for (let i = 0; i < res.length - 1; i++) {
                                if (
                                  moment(res[i + 1]['lastModifiedDate']).isAfter(
                                    moment(res[i]['lastModifiedDate']).subtract(10, 'minute'),
                                  ) &&
                                  moment(res[i + 1]['lastModifiedDate']).isBefore(moment(res[i]['lastModifiedDate']))
                                ) {
                                  totalMinutes = moment(res[0]['lastModifiedDate']).diff(
                                    moment(res[i + 1]['lastModifiedDate']),
                                    'minute',
                                  );
                                  if (totalMinutes > 60 * 24) {
                                    tempQueueTime = _l('排队时长：24小时以上');
                                  } else if (totalMinutes > 60) {
                                    tempQueueTime = _l(
                                      '排队时长：%0时%1分钟',
                                      parseInt(totalMinutes / 60),
                                      totalMinutes - parseInt(totalMinutes / 60) * 60,
                                    );
                                  } else {
                                    tempQueueTime = _l('排队时长：%0分钟', totalMinutes);
                                  }
                                }
                              }
                              this.setState({ queueTime: tempQueueTime });
                            });
                        }}
                        icon="history_toggle_off"
                        className="Gray_75 Hover_21 Hand"
                      />
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </span>
              </div>
              {md.global.Config.IsLocal && !showHistoryDetail && (
                <div className="cloumnItem columnWidth170 textalignR">
                  <span className="Hand Hover_1f" onClick={() => this.updateRouterIndex(item)}>
                    <span
                      className="dot"
                      style={
                        _.isUndefined(routerIndex) ? {} : { background: routerIndex === -1 ? '#1677ff' : '#FFC37C' }
                      }
                    ></span>
                    <span className="mLeft5">{routerName || ''}</span>
                    {!_.isUndefined(routerIndex) && Object.keys(routerList).length > 1 ? (
                      <div className="flexColumn manageListOrder Right mLeft6">
                        <Icon icon="arrow-up" />
                        <Icon icon="arrow-down" />
                      </div>
                    ) : (
                      ''
                    )}
                  </span>
                </div>
              )}
              {!showHistoryDetail && (
                <div className="cloumnItem columnWidth170 textalignR">
                  <PauseTimeList
                    item={item}
                    changeOperation={this.changeOperation}
                    clickRecover={this.clickRecover}
                    getPopupContainer={() => this.props.monitorContainer}
                  >
                    <span className="Hand Hover_1f">
                      <span style={{ color: waiting ? '#F44336' : '#151515' }}>
                        {!waiting ? _l('正常') : _l('暂停')}
                      </span>
                      <Icon icon="arrow-down" className="Gray_75 mLeft5" />
                    </span>
                  </PauseTimeList>
                </div>
              )}
              <div className="cloumnItem columnWidth150 textalignR">
                {waiting && !showHistoryDetail && (
                  <div>
                    {hours ? (
                      <PauseTimeList
                        item={item}
                        changeOperation={this.changeOperation}
                        clickRecover={this.clickRecover}
                      >
                        <Icon icon="access_time" className="timeIcon" />
                      </PauseTimeList>
                    ) : (
                      ''
                    )}
                    {hours ? (
                      <span className="runWaitInfo">
                        <CountDown endDate={dueDate} />
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && pageIndex > 1 && <LoadDiv className="mTop15" size="small" />}
      </Fragment>
    );
  };

  renderHistoryDateInfo = () => {
    const { dateStr } = this.props;
    let dayStr = _l('昨天'),
      time = moment(dateStr).format('HH:mm');
    if (moment(dateStr).get('date') === moment().get('date')) {
      dayStr = _l('今天');
    }
    return (
      <span>{_l(`正在查看历史执行详情（${dayStr} ${time}），本月新增、本月排队指截止到 ${dayStr} ${time} 的值`)}</span>
    );
  };

  render() {
    let { checkedIds = [], routerList = {} } = this.state;
    const { showHistoryDetail, pageIndex, count = 0 } = this.props;

    return (
      <Fragment>
        <div className="flexRow spaceBetween">
          {_.isEmpty(checkedIds) ? (
            <div className="subTitle">{_l('执行详情')}</div>
          ) : (
            <div>
              <span className="Gray Bold mRight16">{_l('已选择%0条流程', checkedIds.length)}</span>
              <Dropdown
                trigger={['click']}
                placement="bottomLeft"
                getPopupContainer={() => this.props.monitorContainer}
                overlay={
                  <div className="runoOperateBox">
                    {runDateList.map(v => (
                      <div
                        className="runDateItem Font13"
                        key={v.value}
                        onClick={() => this.batchPauseRecover(true, v.value)}
                      >
                        {v.label}
                      </div>
                    ))}
                  </div>
                }
              >
                <Button type="ghostgray" className="mRight10">
                  {_l('暂停')}
                </Button>
              </Dropdown>
              <Button type="ghostgray" className="mRight10" onClick={() => this.batchPauseRecover(false)}>
                {_l('恢复')}
              </Button>
              <Button type="ghostgray" className="mRight10" onClick={this.resetQueue}>
                {_l('重置排队计数')}
                <Tooltip
                  title={
                    <span>
                      {_l('将所选流程的排队计数重置为0。长期运行监控时可能偶发计数不准的问题，可通过此操作将计数归0')}
                    </span>
                  }
                >
                  <Icon icon="info_outline" className="mLeft8 Gray_9d" />
                </Tooltip>
              </Button>
              {md.global.Config.IsLocal &&
                Object.keys(routerList).map(v => (
                  <Button type="ghostgray" className="mRight10" onClick={() => this.updateRouterIndex(v)}>
                    {_l(`通道：${routerList[v]}`)}
                  </Button>
                ))}
            </div>
          )}
          <div>
            <Input
              allowClear
              placeholder={_l('流程名称')}
              className="searchFlow"
              prefix={<Icon icon="search" className="searchIcon" />}
              onPressEnter={this.props.changeFlowName}
              onChange={this.props.changeFlowName}
            />
          </div>
        </div>
        {showHistoryDetail && (
          <div className="checkHistoryWrap">
            <span>{this.renderHistoryDateInfo()}</span>
            <span
              className="mLeft20 ThemeColor Hand"
              onClick={() => this.props.updateHistoryDetail({ showHistoryDetail: false })}
            >
              {_l('取消')}
            </span>
          </div>
        )}
        <div className="listContent flex">
          <div className="detailListHeader flexRow">
            <div className="headerItem flex">{_l('流程')}</div>
            {justifyInfoData
              .filter(it =>
                showHistoryDetail
                  ? !_.includes(['routerIndex', 'waiting'], it.type)
                  : md.global.Config.IsLocal
                    ? true
                    : it.type !== 'routerIndex',
              )
              .map(item => this.renderTableSorterHeader(item))}
            <div className="headerItem columnWidth150"></div>
          </div>
          <div className="detailListBody">{this.renderListContent()}</div>
          {!showHistoryDetail && (
            <PaginationWrap total={count} pageIndex={pageIndex} pageSize={50} onChange={this.props.changePage} />
          )}
        </div>
      </Fragment>
    );
  }
}
