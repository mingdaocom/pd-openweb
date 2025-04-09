import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon, Tooltip } from 'ming-ui';
import LogAjax from 'src/pages/integration/api/log.js';
import MonitorAjax from 'src/pages/integration/api/monitor.js';

const Wrap = styled.div`
  flex: 1;
  overflow: auto;
`;
const Con = styled.div`
  width: 800px;
  margin: 22px auto;
  background: #ffffff;
  padding: 32px 24px;
  border-radius: 4px;
`;
const WrapCon = styled.div`
  .pTop80 {
    padding-top: 80px;
  }
  .pBottom140 {
    padding-bottom: 140px;
  }
  .line {
    margin: 32px 0;
    width: 100%;
    border-top: 1px solid #eaeaea;
  }
  .timeNum {
    justify-content: space-between;
    li {
      width: 224px;
      height: 120px;
      background: #fafafa;
      border-radius: 4px;
      text-align: center;
      .des {
        font-weight: 600;
        color: #757575;
        padding-top: 18px;
      }
      .txt {
        font-size: 32px;
        font-weight: 400;
        color: #151515;
      }
      .txtTime {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  .timeDrop {
    width: 224px;
  }
  .tableCon {
    width: 100%;
    height: 207px;
    .chartBox {
      height: 207px;
    }
  }
  .listTable {
    .trCon {
      border-bottom: 1px solid #eaeaea;
      font-weight: 400;
      color: #757575;
      &.isErr {
        color: #f44336;
      }
      &.isGreen {
        color: #4caf50;
      }
      .item {
        flex-shrink: 0;
        padding: 8px 6px;
        &.width100 {
          width: 100px;
        }
      }
    }
    .flex2 {
      flex: 2;
    }
  }
  .pageCon {
    .pre,
    .next {
      display: inline-block;
      margin: 0 32px;
      cursor: pointer;
      color: #151515;
      &.disable {
        cursor: not-allowed;
        color: #aaaaaa;
      }
    }
  }
`;
//配置
let lineChart = null;
function Monitor(props) {
  const g2plotComponent = useRef({});
  const { currentProjectId: projectId } = props;
  const [
    {
      keywords,
      showDate,
      pageSize,
      pageIndex,
      loading,
      list,
      runningTime,
      readRecord,
      writeRecord,
      totalPages,
      history,
      jobId,
      errorDetail,
      showErr,
    },
    setState,
  ] = useSetState({
    keywords: '',
    showDate: 1, // 最近1小时
    pageIndex: 0,
    pageSize: 10,
    loading: true,
    jobId: props.jobId,
    taskId: props.taskId,
    list: [],
    runningTime: 0,
    readRecord: 0,
    writeRecord: 0,
    totalPages: 0,
    history: [],
    errorDetail: '',
    showErr: false,
  });
  const chantRef = useRef();

  useEffect(() => {
    getG2plotComponent();
    () => {
      g2plotComponent.current.value = null;
      lineChart && lineChart.destroy();
    };
  }, []);

  useEffect(() => {
    getInfo();
    getHistory();
  }, [jobId]);

  useEffect(() => {
    chantRef.current && g2plotComponent.current.value && renderChart(history);
  }, [chantRef.current, g2plotComponent.current.value, history]);

  useEffect(() => {
    getLog();
  }, [pageIndex]);

  const getG2plotComponent = (initChartData = history) => {
    import('@antv/g2plot').then(data => {
      g2plotComponent.current.value = data;
    });
  };

  //获取单个同步任务的统计信息
  const getInfo = async () => {
    //运行时长
    const runningDt = await MonitorAjax.getRunTime({
      jobId: jobId,
    });
    const dayTotalDt = await MonitorAjax.getTasksTotal({
      jobIds: [jobId],
    });
    const tasksTotal = _.get(dayTotalDt, ['tasksTotal', jobId]) || {};
    setState({
      loading: false,
      runningTime: runningDt.runningTime,
      readRecord: _.get(tasksTotal, 'readTotal'),
      writeRecord: _.get(tasksTotal, 'writeTotal'),
    });
  };
  //获取同步任务历史流量数据
  const getHistory = (showDate = 1) => {
    MonitorAjax.getHistoricalData({
      jobId: jobId,
      dataType: showDate, //1 是代表当前小时  2 是代表对应今天
    }).then(res => {
      let initChartData = [];
      _.mapKeys(res.historicalData.readHistoricalData, (value, key) => {
        let date = moment(Number(key)).format('YYYY-MM-DD HH:mm');
        initChartData.push(
          { category: _l('读取'), date, value },
          {
            category: _l('写入'),
            date,
            value: res.historicalData.writeHistoricalData[key],
          },
        );
      });
      !g2plotComponent.current.value ? getG2plotComponent(initChartData) : renderChart(initChartData);
      setState({
        history: initChartData,
      });
    });
  };
  //获取同步任务日志列表
  const getLog = () => {
    LogAjax.getLog({
      jobId: jobId,
      projectId,
      pageNo: pageIndex,
      pageSize: pageSize,
    }).then(res => {
      const { pageLogs = {} } = res;
      const { content = [], totalPages } = pageLogs;
      setState({
        totalPages,
        list: content,
      });
    });
  };
  const dateArr = [
    { text: _l('最近1小时'), value: 1 },
    { text: _l('最近1天'), value: 2 },
    { text: _l('最近1个月'), value: 3 },
    { text: _l('最近6个月'), value: 4 },
  ];
  const renderChart = (initChartData = []) => {
    const { Line } = g2plotComponent.current.value;
    lineChart && lineChart.destroy();
    lineChart = new Line(chantRef.current, {
      data: initChartData,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      smooth: true,
      color: ['#61DDAA', '#2196F3'],
      xAxis: {
        label: {
          style: {
            fill: '#2C3542',
            opacity: 0.45,
          },
          formatter: date => moment(date).format(3 === showDate ? 'MM-DD' : 4 === showDate ? 'YYYY-MM' : 'HH:mm'),
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
        title: v => `${moment(v).format([3, 4].includes(showDate) ? 'MMMDo' : 'MMMDo HH:mm')}`,
        showContent: true,
        domStyles: {
          'g2-tooltip-list-item': { textAlign: 'left', color: '#151515' },
          'g2-tooltip-title': { color: '#757575' },
        },
      },
    });
    lineChart.render();
  };
  return (
    <Wrap className="">
      <Con className="">
        <WrapCon>
          <div className="title Bold Font16">{_l('实时')}</div>
          <ul className="timeNum flexRow mTop24">
            <li>
              <div className="des">{_l('累计运行时长')}</div>
              <div className="txt">{_l('%0天', Math.floor(runningTime / 86400000))}</div>
              <div className="txtTime Gray_9e">
                {_l(
                  '%0小时%1分钟',
                  Math.floor((runningTime % 86400000) / 3600000),
                  Math.floor(((runningTime % 86400000) % 3600000) / 60000),
                )}
              </div>
            </li>
            <li>
              <div className="des">{_l('累计读取记录数')}</div>
              <div className="txt">{_l('%0行', readRecord)}</div>
            </li>
            <li>
              <div className="des">{_l('累计写入记录数')}</div>
              <div className="txt">{_l('%0行', writeRecord)}</div>
            </li>
          </ul>
          <div className="line"></div>
          <div className="title flexRow">
            <span className="flex Bold Font16">
              {_l('历史')}
              <Tooltip text={<span>{_l('仅保留最近6个月的读写历史')}</span>} popupPlacement={'top'}>
                <Icon className="mLeft5 Gray_bd" type="info1" />
              </Tooltip>
            </span>
            <Dropdown
              className="timeDrop mLeft20"
              menuStyle={{ width: '100%' }}
              data={dateArr}
              value={showDate}
              border
              onChange={value => {
                setState({ showDate: value });
                getHistory(value);
              }}
            />
          </div>
          <div className="tableCon mTop24">
            <div className="chartBox" ref={chantRef} />
          </div>
          <div className="line"></div>
          <div className="title Bold Font16">
            {_l('日志')}
            <Tooltip text={<span>{_l('仅保留最近6个月的日志')}</span>} popupPlacement={'top'}>
              <Icon className="mLeft5 Gray_bd" type="info1" />
            </Tooltip>
          </div>
          <div className="listTable">
            <div className="header trCon flexRow alignItemsCenter mTop16">
              <div className="item flex">{_l('时间')}</div>
              <div className="item flex">{_l('操作人/来源')}</div>
              <div className="item flex2">{_l('内容')}</div>
              <div className="item width100"></div>
            </div>
            {list.length <= 0 && <div className="TxtCenter pTop80 pBottom140 Font17 Gray_9e">{_l('暂无相关数据')}</div>}
            {list.map(o => {
              return (
                <div className={cx('trCon flexRow alignItemsCenter')}>
                  <div className="item flex">{moment(Number(o.createTime)).format('YYYY-MM-DD HH:mm')}</div>
                  <div className="item flex">{!o.ip ? o.operator : `${o.operator}（${o.ip}）`}</div>
                  <div className="item flex2 WordBreak">{o.center}</div>
                  <div
                    className={cx('item width100 ThemeColor3', { Hand: !!o.errorDetail })}
                    onClick={() => {
                      if (!o.errorDetail) {
                        return;
                      }
                      setState({
                        showErr: true,
                        errorDetail: o.errorDetail,
                      });
                    }}
                  >
                    {!!o.errorDetail && _l('查看')}
                  </div>
                </div>
              );
            })}
            <div className="pageCon TxtCenter mTop24">
              <span
                className={cx('pre', { disable: pageIndex <= 0 })}
                onClick={() => {
                  if (pageIndex <= 0) {
                    return;
                  }
                  setState({
                    pageIndex: pageIndex - 1,
                  });
                }}
              >
                {_l('上一页')}
              </span>
              {pageIndex + 1}
              <span
                className={cx('next', {
                  disable: pageIndex + 1 >= totalPages,
                  // count / pageSize
                })}
                onClick={() => {
                  if (
                    pageIndex + 1 >=
                    totalPages //count / pageSize
                  ) {
                    return;
                  }
                  setState({
                    pageIndex: pageIndex + 1,
                  });
                }}
              >
                {_l('下一页')}
              </span>
            </div>
          </div>
          {showErr && (
            <Dialog
              visible
              title={
                <span>
                  {_l('报错信息')}
                  <Icon
                    type="copy"
                    className="Gray_9e Font18 Hand mLeft10 ThemeHoverColor3"
                    onClick={() => {
                      copy(errorDetail);
                      alert(_l('复制成功'));
                    }}
                  />
                </span>
              }
              width={680}
              className="connectorErrorDialog"
              showCancel={false}
              okText={_l('关闭')}
              onOk={() => {
                setState({ showErr: false });
              }}
              onCancel={() => {
                setState({ showErr: false });
              }}
            >
              {!!errorDetail && <div className="errorInfo">{errorDetail}</div>}
            </Dialog>
          )}
        </WrapCon>
      </Con>
    </Wrap>
  );
}

export default Monitor;
