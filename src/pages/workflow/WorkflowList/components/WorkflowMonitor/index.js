import React, { Component, Fragment } from 'react';
import { Select, Input, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import { Icon, LoadDiv } from 'ming-ui';
import { Line } from '@antv/g2plot';
import flowMonitor from '../../../api/flowMonitor';
import { START_APP_TYPE } from '../../config';
import CountDown from './CountDown';
import cx from 'classnames';
import './index.less';

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
  { type: 'difference', name: _l('当前累计排队'), tableHeaderName: _l('排队') },
  { type: 'producer', name: _l('新增'), tableHeaderName: _l('新增') },
  { type: 'consumer', name: _l('消费'), tableHeaderName: _l('消费') },
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
      isMore: true,
    };
    this.lineChart = null;
  }
  componentDidMount() {
    this.renderChart();
    this.getChartData();
    this.getRealTimeData();
    this.getFlowList();
  }

  // 获取实时数据
  getRealTimeData = () => {
    const { projectId } = this.props.match.params;
    flowMonitor
      .getDifferenceByCompanyId({
        companyId: projectId,
      })
      .then(res => {
        this.setState({ realTimeData: res });
      });
  };

  //  获取流程列表
  getFlowList = () => {
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
        pageIndex,
        pageSize: 50,
        keyword,
        ...extraParams,
      })
      .then(res => {
        let detailList = pageIndex == 1 ? res : this.state.detailList.concat(res);
        this.setState({
          loading: false,
          detailList,
          isMore: res.length >= 50,
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
    flowMonitor
      .getHistoryDifferenceByCompanyId({
        companyId: projectId,
        startDate: moment().subtract(24, 'h').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      })
      .then(res => {
        this.dealChartData(res);
      });
  };

  renderChart = () => {
    let initChartData = [];
    let diffMinite = Math.floor(moment().subtract(5, 'm').format('mm') % 5);
    let currentDate = moment().minute(moment().add(5, 'm').format('mm') - diffMinite);
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
  clickWaitConsume = item => {
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

  renderChangeDate = (item, fields) => {
    return (
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        overlay={
          <div className="runoOperateBox">
            {runDateList.map(v => (
              <div
                className="runDateItem Font13"
                key={v.value}
                onClick={() => {
                  this.changeOperation(item, v.value);
                }}
              >
                {v.label}
              </div>
            ))}
          </div>
        }
      >
        {fields === 'changeDate' ? <Icon icon="access_time" className="timeIcon" /> : <a>{_l('暂停消费')}</a>}
      </Dropdown>
    );
  };

  renderListContent = () => {
    let { detailList, loading, pageIndex } = this.state;
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
          const { id, name, difference, producer, consumer, hours, waiting, child, startAppType, enabled, dueDate } =
            item;
          return (
            <div className="row flexRow" key={`${id}-${index}`}>
              <div className="cloumnItem flex flexRow pLeft10">
                <div
                  className={cx('iconWrap mRight7', { unable: !enabled })}
                  style={{ backgroundColor: (START_APP_TYPE[child ? 'subprocess' : startAppType] || {}).iconColor }}
                >
                  <Icon icon={(START_APP_TYPE[item.child ? 'subprocess' : startAppType] || {}).iconName} />
                </div>
                <Link to={`/workflowedit/${item.id}`} className="flowName Hand">
                  {name}
                </Link>
              </div>
              <div className="cloumnItem columnWidth170 textalignR pRight25">{formatter(difference)}</div>
              <div className="cloumnItem columnWidth170 textalignR pRight25">{formatter(producer)}</div>
              <div className="cloumnItem columnWidth170 textalignR pRight25">
                {waiting ? (
                  <span className="waitText textalignR pRight25">{_l('暂停')}</span>
                ) : (
                  <span className="waitText textalignR pRight25">{formatter(consumer)}</span>
                )}
              </div>
              <div className="cloumnItem flex">
                {waiting && (
                  <div>
                    {(hours && (
                      <span className="runWaitInfo">
                        <CountDown endDate={dueDate} />{' '}
                      </span>
                    )) ||
                      ''}
                    {(hours && this.renderChangeDate(item, 'changeDate')) || ''}
                  </div>
                )}
              </div>
              <div className="cloumnItem columnWidth80">
                {waiting ? (
                  <a
                    onClick={() => {
                      this.clickWaitConsume(item);
                    }}
                    style={{ color: '#43bd34' }}
                  >
                    {_l('恢复')}
                  </a>
                ) : (
                  this.renderChangeDate(item)
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
      this.getFlowList,
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
    let { realTimeData = {} } = this.state;
    return (
      <div className="infoBox flex">
        <div className="description">{name}</div>
        <div className="countValue">{formatter(realTimeData[type]) || '-'}</div>
        {type !== 'difference' && <div className="inTime">{_l('5分钟内')}</div>}
      </div>
    );
  };
  renderTableSorterHeader = ({ type, tableHeaderName }) => {
    let { sorter } = this.state;
    const { fields, isDesc } = sorter;
    return (
      <div
        className="headerItem columnWidth170 flexRow Hand orderTitleHover flexDirection"
        onClick={() => {
          this.changeSorter(type);
        }}
      >
        <div className="flexColumn manageListOrder">
          <Icon icon="arrow-up" className={cx({ ThemeColor3: fields === type && !isDesc })} />
          <Icon icon="arrow-down" className={cx({ ThemeColor3: fields === type && isDesc })} />
        </div>
        {tableHeaderName}
      </div>
    );
  };
  render() {
    let { showDate } = this.state;

    return (
      <div
        className="monitorContainer flex"
        ref={node => (this.monitorContainer = node)}
        onScroll={this.scrollLoadData}
      >
        <div className="subTitle">{_l('实时')}</div>
        <div className="justifyInfo flexRow">{justifyInfoData.map(item => this.renderJustifyInfo(item))}</div>
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
          <div className="subTitle">{_l('执行详情')}</div>
          <Input
            allowClear
            placeholder={_l('流程名称')}
            className="searchFlow"
            prefix={<Icon icon="search" className="searchIcon" />}
            onPressEnter={this.changeFlowName}
            onChange={this.changeFlowName}
          />
        </div>
        <div className="listContent flex">
          <div className="detailListHeader flexRow">
            <div className="headerItem flex">{_l('流程')}</div>
            {justifyInfoData.map(item => this.renderTableSorterHeader(item))}
            <div className="headerItem flex"></div>
            <div className="headerItem columnWidth80" />
          </div>
          <div className="detailListBody">{this.renderListContent()}</div>
        </div>
      </div>
    );
  }
}
