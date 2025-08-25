import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { checkIsAppAdmin } from 'ming-ui/functions';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import { navigateTo } from 'src/router/navigateTo';
import ExecutionDetails from './ExecutionDetails';
import HistoryChart from './HistoryChart';
import RealTimeData from './RealTimeData';
import './index.less';

const MonitorWrap = styled.div`
  border-radius: 4px;
  background: #fff;
  padding: 20px 16px 16px;
  box-sizing: border-box;
  overflow-y: auto;
  flex: 1;
  position: relative;
`;
export default class WorkflowMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailList: [],
      historyDetailList: [],
      sorter: {},
      pageIndex: 1,
      count: 0,
      loading: false,
      showHistoryDetail: false,
      historyIds: [],
    };
    this.lineChart = null;
  }
  componentDidMount() {
    this.getFlowList();
  }

  // 刷新
  refreshWorkflowMonitor = () => {
    this.setState({ pageIndex: 1, sorter: {} }, () => {
      this.getFlowList();
      this.realTimeDataRef && this.realTimeDataRef.getRealTimeData();
      this.historyChartRef && this.historyChartRef.getChartData();
    });
  };

  //  获取流程列表
  getFlowList = isRefresh => {
    this.setState({ loading: true });
    let { pageIndex, keyword = undefined, sorter, showHistoryDetail, historyIds = [] } = this.state;
    const { projectId } = this.props.match.params;
    let { fields, isDesc } = sorter;
    let extraParams =
      (fields && {
        sorter: {
          [fields]: isDesc ? 'descend' : 'ascend',
        },
      }) ||
      {};
    if (showHistoryDetail) {
      flowMonitor
        .getDifferenceProcessListByIds({
          companyId: projectId,
          ids: historyIds,
          pageIndex: 1,
          pageSize: 1000,
          keyword,
          ...extraParams,
        })
        .then(res => {
          this.setState({
            loading: false,
            historyDetailList: res,
          });
        });
      return;
    }
    const params = {
      companyId: projectId,
      pageIndex: isRefresh ? 1 : pageIndex,
      pageSize: 50,
      keyword,
      ...extraParams,
    };
    if (pageIndex === 1) {
      Promise.all([flowMonitor.getDifferenceProcessCount(params), flowMonitor.getDifferenceProcessList(params)]).then(
        ([count, res]) => {
          this.setState({
            loading: false,
            detailList: res ? res : this.state.detailList,
            count: count || 0,
          });
        },
      );
    } else {
      flowMonitor
        .getDifferenceProcessList({
          companyId: projectId,
          pageIndex: isRefresh ? 1 : pageIndex,
          pageSize: 50,
          keyword,
          ...extraParams,
        })
        .then(res => {
          this.setState({
            loading: false,
            detailList: res,
          });
        });
    }
  };

  // 排序
  changeSorter = fields => {
    let { isDesc } = this.state.sorter;
    this.setState(
      {
        sorter: {
          fields,
          isDesc: fields === _.get(this.state, 'sorter.fields') ? !isDesc : true,
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

  // 查看历史详情
  updateHistoryDetail = ({ showHistoryDetail, dateStr = '', historyIds = [] }) => {
    this.setState({ showHistoryDetail, dateStr, historyIds }, () => {
      this.getFlowList(true);
    });
  };

  changePage = pageIndex => {
    this.setState({ pageIndex }, this.getFlowList);
  };

  updateDetailList = detailList => {
    this.setState({ detailList });
  };

  render() {
    let { pageIndex, count, loading, detailList = [], showHistoryDetail, dateStr, historyDetailList } = this.state;
    const { projectId } = this.props.match.params;

    return (
      <MonitorWrap className="monitorContainer flex Relative" ref={node => (this.monitorContainer = node)}>
        {/* 实时 */}
        <RealTimeData projectId={projectId} ref={ele => (this.realTimeDataRef = ele)} />
        {/* 历史 */}
        <HistoryChart
          projectId={projectId}
          updateHistoryDetail={this.updateHistoryDetail}
          ref={ele => (this.historyChartRef = ele)}
        />
        {/* 执行详情 */}
        <ExecutionDetails
          loading={loading}
          pageIndex={pageIndex}
          detailList={showHistoryDetail ? historyDetailList : detailList}
          projectId={projectId}
          sorter={this.state.sorter}
          showHistoryDetail={showHistoryDetail}
          dateStr={dateStr}
          count={count}
          monitorContainer={this.monitorContainer}
          changeSorter={this.changeSorter}
          updateDetailList={this.updateDetailList}
          checkIsAppAdmin={(appId, id, name) =>
            checkIsAppAdmin({
              appId,
              title: _l('管理工作流“%0”', name),
              description: _l('如果你不是工作流所在应用的管理员，需要将自己加为管理员以获得权限'),
              callback: () => {
                navigateTo(`/workflowedit/${id}`);
              },
            })
          }
          changeFlowName={this.changeFlowName}
          updateHistoryDetail={this.updateHistoryDetail}
          getFlowList={this.getFlowList}
          changePage={this.changePage}
        />
      </MonitorWrap>
    );
  }
}
