import React, { Component, Fragment } from 'react';
import { Select, Input, Dropdown, Button } from 'antd';
import { Icon, LoadDiv, Checkbox, Tooltip, Dialog } from 'ming-ui';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import appManagement from 'src/api/appManagement';
import { navigateTo } from 'src/router/navigateTo';
import { START_APP_TYPE } from '../../config';
import CountDown from './CountDown';
import PauseTimeList from '../PauseTimeList';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';
import moment from 'moment';

const { Option } = Select;

const formatter = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const runDateList = [
  { value: 0, label: _l('直到手动恢复') },
  { value: 1, label: _l('暂停1小时') },
  { value: 2, label: _l('暂停2小时') },
  { value: 3, label: _l('暂停3小时') },
  { value: 4, label: _l('暂停4小时') },
  { value: 5, label: _l('暂停5小时') },
  { value: 6, label: _l('暂停6小时') },
];
const dateList = [
  { value: 1, label: _l('最近1小时') },
  { value: 3, label: _l('最近3小时') },
  { value: 12, label: _l('最近12小时') },
  { value: 24, label: _l('最近24小时') },
];

const justifyInfoData = [
  { type: 'producer', name: _l('新增'), tableHeaderName: _l('本月新增') },
  { type: 'consumer', name: _l('消费'), tableHeaderName: _l('本月消费') },
  { type: 'difference', name: _l('当前累计排队'), tableHeaderName: _l('当前排队') },
  { type: 'routerIndex', name: '', tableHeaderName: _l('通道') },
  { type: 'waiting', name: '', tableHeaderName: _l('状态') },
];

export default class WorkflowMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDate: 1, // 最近1小时
      detailList: [],
      realTimeData: {
        consumer: '', // 消费量
        difference: '', // 在队列中的数量
        producer: '', // 生产量
      },
      pageIndex: 1,
      sorter: {},
      loading: false,
      isMore: false,
      checkAdmin: {
        appId: '',
        post: false,
        visible: false,
        title: '',
        workflowId: '',
      },
      routerList: {},
    };
    this.lineChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderChart();
    });
    this.getChartData();
    this.getRealTimeData();
    this.getFlowList();
    this.getRouterList();
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.dateNow, nextProps.dateNow)) {
      this.getChartData();
      this.getRealTimeData();
      this.getFlowList(true);
    }
  }

  // 获取实时数据
  getRealTimeData = () => {
    const { projectId } = this.props.match.params;
    this.setState({ loading: true });
    flowMonitor
      .getDifferenceByCompanyId({
        companyId: projectId,
      })
      .then(res => {
        this.setState({ realTimeData: res, loading: false });
      });
  };

  //  获取流程列表
  getFlowList = isRefresh => {
    this.setState({ loading: true });
    let { pageIndex, keyword = undefined, sorter } = this.state;
    const { projectId } = this.props.match.params;
    let { fields, isDesc } = sorter;
    let extraParams =
      (fields && {
        sorter: {
          [fields]: isDesc ? 'descend' : 'ascend',
        },
      }) ||
      {};
    flowMonitor
      .getDifferenceProcessList({
        companyId: projectId,
        pageIndex: isRefresh ? 1 : pageIndex,
        pageSize: isRefresh ? pageIndex * 50 : 50,
        keyword,
        ...extraParams,
      })
      .then(res => {
        let detailList = pageIndex == 1 || isRefresh ? res : this.state.detailList.concat(res);
        this.setState({
          loading: false,
          detailList,
          isMore: res.length,
        });
      });
  };

  changeSelectDate = value => {
    this.setState({ showDate: value });
    this.lineChart.update({
      slider: {
        start: (24 - value) / 24,
      },
    });
  };

  // 整理chart数据
  dealChartData = data => {
    // 当前时间的整5分钟数（向下取整）
    let diffMinite = Math.floor(moment().subtract(5, 'm').format('mm') % 5);
    let currentDate = moment().minute(moment().add(5, 'm').format('mm') - diffMinite);
    let result = [];
    let emptyChartData = [];

    for (let i = (24 * 60) / 5; i > 0; i--) {
      let startDate = moment(currentDate).subtract(i * 5, 'm');
      let endDate = moment(currentDate).subtract((i - 1) * 5, 'm');
      let date = moment(currentDate)
        .subtract(i * 5, 'm')
        .format('YYYY-MM-DD HH:mm');
      let currentGroupData = data.filter(
        item => startDate <= moment(item.lastModifiedDate) && moment(item.lastModifiedDate) < endDate,
      );
      if (_.isEmpty(data)) {
        emptyChartData.push(
          { category: _l('新增'), value: 0, date },
          { category: _l('消费'), value: 0, date },
          { category: _l('排队'), value: 0, date },
        );
      } else {
        result.push(
          {
            category: _l('排队'),
            date,
            value: currentGroupData.reduce((total, curent) => total + curent.difference, 0),
          },
          {
            category: _l('新增'),
            date,
            value: currentGroupData.reduce((total, curent) => total + curent.producer, 0),
          },
          {
            category: _l('消费'),
            date,
            value: currentGroupData.reduce((total, curent) => total + curent.consumer, 0),
          },
        );
      }
    }
    if (!_.isEmpty(emptyChartData)) {
      emptyChartData.push({ value: 50 });
    }
    !_.isEmpty(result) ? this.lineChart.changeData(result) : this.lineChart.changeData(emptyChartData);
  };

  getChartData = () => {
    const { projectId } = this.props.match.params;
    this.setState({ loading: true });
    flowMonitor
      .getHistoryDifferenceByCompanyId({
        companyId: projectId,
        startDate: moment().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      })
      .then(res => {
        this.dealChartData(res);
        this.setState({ loading: false });
      });
  };

  renderChart = () => {
    let initChartData = [];
    let diffMinite = Math.floor(moment().subtract(5, 'm').format('mm') % 5);
    let currentDate = moment().minute(moment().add(5, 'm').format('mm') - diffMinite);
    const { Line } = this.g2plotComponent;
    for (let i = 12; i > 0; i--) {
      let date = moment(currentDate)
        .subtract(i * 5, 'm')
        .format('YYYY-MM-DD HH:mm');
      initChartData.push(
        { category: _l('排队'), value: 0, date },
        { category: _l('新增'), value: 0, date },
        { category: _l('消费'), value: 0, date },
      );
    }
    initChartData.push({ value: 50 });
    this.lineChart = new Line(this.chantRef, {
      data: initChartData,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      smooth: true,
      color: ['#F51744', '#2196F3', '#61DDAA'],
      xAxis: {
        label: {
          style: {
            fill: '#2C3542',
            opacity: 0.45,
          },
          formatter: date => moment(date).format('HH:mm'),
        },
        line: {
          style: {
            stroke: '#416180',
            opacity: 0.45,
            lineWidth: 0.5,
          },
        },
        tickLine: {
          style: {
            fill: '#BDBDBD',
            opacity: 1,
          },
        },
      },
      yAxis: {
        label: {
          type: 'inner',
          offsetY: -3,
          // 数值格式化为千分位
          formatter: v => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
          style: {
            fill: '#2C3542',
            opacity: 0.45,
          },
          grid: {
            line: {
              style: {
                stroke: 'rgba(65, 97, 128, 0.15)',
                lineWidth: 0.5,
              },
            },
          },
        },
      },
      legend: {
        position: 'bottom',
        offsetY: 10,
      },
      tooltip: {
        fields: ['category', 'value'],
        formatter: datum => {
          return { name: datum.category, value: datum.value };
        },
        showTitle: true,
        title: v => `${moment(v).format('MMMDo HH:mm')}`,
        showContent: true,
        domStyles: {
          'g2-tooltip-list-item': { textAlign: 'left', color: '#333' },
          'g2-tooltip-title': { color: '#757575' },
        },
      },
      slider: {
        height: 16,
        start: 23 / 24,
        end: 1,
        foregroundStyle: {
          fill: '#2196F3',
          opacity: 0.11,
        },
        TrendCfg: {
          backgroundStyle: {
            fill: '#F5F7F9',
            opacity: 1,
          },
          lineStyle: {
            fill: '#DBDBDB',
            opacity: 1,
          },
        },
      },
    });
    this.lineChart.on('slider:click', e => {
      this.setState({ showDate: undefined });
    });
    this.lineChart.render();
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
          let copyDetailList = this.state.detailList.map((it, i) => {
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
          this.setState({ detailList: copyDetailList });
        } else {
          alert(_l('请先开启工作流'), 3);
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
          let copyDetailList = this.state.detailList.map((it, i) => {
            if (item.id === it.id) {
              return { ...it, waiting: false };
            } else {
              return it;
            }
          });
          this.setState({ detailList: copyDetailList });
        } else {
          alert(_l('请先开启工作流'), 3);
        }
      });
  };

  scrollLoadData = _.throttle(() => {
    let { loading, isMore, pageIndex } = this.state;
    if (
      this.monitorContainer &&
      this.monitorContainer.clientHeight + this.monitorContainer.scrollTop + 50 >= this.monitorContainer.scrollHeight &&
      !loading &&
      isMore
    ) {
      this.setState({ pageIndex: pageIndex + 1 }, this.getFlowList);
    }
  }, 200);

  renderListContent = () => {
    let { detailList, loading, pageIndex, checkedIds = [], routerList = {} } = this.state;
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
                    onClick={() => this.checkIsAppAdmin(app.id, item.id, item.name)}
                  >
                    {name}
                  </div>
                  <div className="Gray_9e Font12 ellipsis">{app.name}</div>
                </div>
              </div>
              <div className="cloumnItem columnWidth170 textalignR pRight25">{formatter(producer)}</div>
              <div className="cloumnItem columnWidth170 textalignR pRight25">
                {waiting ? (
                  <span className="waitText textalignR">{_l('暂停')}</span>
                ) : (
                  <span className="waitText textalignR">{formatter(consumer)}</span>
                )}
              </div>
              <div className="cloumnItem columnWidth170 textalignR pRight25">{formatter(difference)}</div>
              {md.global.Config.IsLocal && (
                <div className="cloumnItem columnWidth170 textalignR pRight20">
                  <span
                    className="dot"
                    style={_.isUndefined(routerIndex) ? {} : { background: routerIndex === -1 ? '#2196F3' : '#FFC37C' }}
                  ></span>
                  <span className="mLeft5">{routerName || ''}</span>
                  {!_.isUndefined(routerIndex) && Object.keys(routerList).length > 1 ? (
                    <div
                      className="flexColumn manageListOrder Right mLeft6"
                      onClick={() => {
                        this.updateRouterIndex(item);
                      }}
                    >
                      <Icon icon="arrow-up" />
                      <Icon icon="arrow-down" />
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )}
              <div className="cloumnItem columnWidth170 textalignR">
                <span style={{ color: waiting ? '#F44336' : '#333' }}>{!waiting ? _l('正常') : _l('暂停')}</span>
                <PauseTimeList
                  item={item}
                  changeOperation={this.changeOperation}
                  clickRecover={this.clickRecover}
                  getPopupContainer={() => this.monitorContainer}
                >
                  <Icon icon="arrow-down" className="Gray_9e mLeft5 Hand" />
                </PauseTimeList>
              </div>
              <div className="cloumnItem columnWidth150 textalignR">
                {waiting && (
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

  // 排序
  changeSorter = fields => {
    let { isDesc } = this.state.sorter;
    this.setState(
      {
        sorter: {
          fields,
          isDesc: !isDesc,
        },
        pageIndex: 1,
      },
      this.getFlowList(),
    );
  };

  // 流程名称模糊搜索
  changeFlowName = e => {
    let value = e.target.value.trim();
    if (!value || (e.keyCode && e.keyCode === 13)) {
      this.setState({ keyword: value, pageIndex: 1 }, this.getFlowList);
    }
  };

  renderJustifyInfo = ({ type, name }) => {
    let { realTimeData = {}, loading } = this.state;
    return (
      <div className="infoBox flex">
        <div className="description">{name}</div>
        <div className="countValue">{(!loading && formatter(realTimeData[type])) || '-'}</div>
        {type !== 'difference' && <div className="inTime">{_l('5分钟内')}</div>}
      </div>
    );
  };
  renderTableSorterHeader = ({ type, tableHeaderName }) => {
    let { sorter } = this.state;
    const { fields, isDesc } = sorter;
    return (
      <div
        className={cx('headerItem columnWidth170 flexRow Hand orderTitleHover flexDirection', {
          pRight16: type === 'waiting',
        })}
        onClick={() => {
          this.changeSorter(type);
        }}
      >
        {type !== 'waiting' && (
          <div className="flexColumn manageListOrder">
            <Icon icon="arrow-up" className={cx({ ThemeColor3: fields === type && !isDesc })} />
            <Icon icon="arrow-down" className={cx({ ThemeColor3: fields === type && isDesc })} />
          </div>
        )}
        {type === 'routerIndex' && (
          <Tooltip
            popupClassName="passageTooltip Tooltip-black"
            popupAlign={{
              points: ['tc', 'bc'],
              offset: [0, -20],
            }}
            text={
              <div>
                <div>{_l('主要：用于处理需要及时响应的流程。')}</div>
                <div>
                  {_l(
                    '备用：限流通道。用于临时处理主要通道中发生堆积的流程执行。或处理响应时效要求低的流程，使用此通道更稳定。',
                  )}
                </div>
                <div>
                  {_l(
                    '说明：当主要通道的流程排队数超出阈值（默认3000，私有部署可配置）时，此流程的超出部分和继续新增的执行会进入备用通道并优先于备用通道流程开始消费。',
                  )}
                </div>
              </div>
            }
          >
            <Icon icon="info_outline" className="Gray_9e mLeft6 LineHeight54 " />
          </Tooltip>
        )}
        {tableHeaderName}
      </div>
    );
  };
  // 批量设置（暂停、恢复）流程
  batchPauseRecover = (isPause, hours) => {
    const { checkedIds = [], detailList } = this.state;
    const { projectId } = this.props.match.params;
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
    const { projectId } = this.props.match.params;
    flowMonitor
      .reset({
        processIds: checkedIds,
        companyId: projectId,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          this.setState({ checkedIds: [] });
          this.getFlowList(true);
        } else {
          alert(_l('操作失败'));
        }
      });
  };
  checkIsAppAdmin(appId, id, name) {
    const opts = post => {
      return {
        appId,
        post,
        visible: true,
        title: name,
        workflowId: id,
      };
    };
    this.setState({ checkAdmin: opts(true) }, () => {
      appManagement
        .checkAppAdminForUser({
          appId,
        })
        .then(result => {
          if (result) {
            navigateTo(`/workflowedit/${id}`);
          } else {
            this.setState({ checkAdmin: opts(false) });
          }
        });
    });
  }
  addRoleMemberForAppAdmin = () => {
    const {
      checkAdmin: { appId, workflowId },
    } = this.state;

    appManagement
      .addRoleMemberForAppAdmin({
        appId,
      })
      .then(result => {
        if (result) {
          navigateTo(`/workflowedit/${workflowId}`);
        }
      });
  };
  // 获取已有通道
  getRouterList = () => {
    const { projectId } = this.props.match.params;
    flowMonitor.getRouterList({ companyId: projectId }).then(res => {
      this.setState({ routerList: res });
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
        let copyDetailList = this.state.detailList.map((it, i) => {
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
        this.setState({ detailList: copyDetailList });
      } else {
        alert(_l('修改失败'), 2);
      }
    });
  };
  render() {
    let { showDate, checkedIds = [], loading, checkAdmin, routerList = {} } = this.state;
    return (
      <div
        className="monitorContainer flex Relative"
        ref={node => (this.monitorContainer = node)}
        onScroll={this.scrollLoadData}
      >
        <div className="subTitle">{_l('实时')}</div>
        <div className="justifyInfo flexRow">
          {justifyInfoData
            .filter(it => !_.includes(['routerIndex', 'waiting'], it.type))
            .map(item => this.renderJustifyInfo(item))}
        </div>
        <div className="flexRow spaceBetween pBottom25">
          <div className="subTitle">{_l('历史')}</div>
          <Select className="selectDate" placeholder={_l('自定义')} value={showDate} onChange={this.changeSelectDate}>
            {dateList.map(item => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className="chartBox" ref={node => (this.chantRef = node)} />
        <div className="flexRow spaceBetween">
          {_.isEmpty(checkedIds) ? (
            <div className="subTitle">{_l('执行详情')}</div>
          ) : (
            <div>
              <span className="Gray Bold mRight16">{_l('已选择%0条流程', checkedIds.length)}</span>
              <Dropdown
                trigger={['click']}
                placement="bottomLeft"
                getPopupContainer={() => this.monitorContainer}
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
                  text={
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
                    {_l('通道：%0', routerList[v])}
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
              onPressEnter={this.changeFlowName}
              onChange={this.changeFlowName}
            />
          </div>
        </div>
        <div className="listContent flex">
          <div className="detailListHeader flexRow">
            <div className="headerItem flex">{_l('流程')}</div>
            {justifyInfoData
              .filter(it => (md.global.Config.IsLocal ? true : it.type !== 'routerIndex'))
              .map(item => this.renderTableSorterHeader(item))}
            <div className="headerItem columnWidth150"></div>
          </div>
          <div className="detailListBody">{this.renderListContent()}</div>
        </div>

        <Dialog
          visible={checkAdmin.visible}
          className={cx({ checkAdminDialog: checkAdmin.post })}
          title={_l('管理工作流“%0”', checkAdmin.title)}
          description={_l('如果你不是工作流所在应用的管理员，需要将自己加为管理员以获得权限')}
          cancelText=""
          okText={checkAdmin.post ? _l('验证权限...') : _l('加为此应用管理员')}
          onOk={checkAdmin.post ? () => {} : this.addRoleMemberForAppAdmin}
          onCancel={() => this.setState({ checkAdmin: Object.assign({}, this.state.checkAdmin, { visible: false }) })}
        />
      </div>
    );
  }
}
