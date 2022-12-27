import React, { Component, Fragment } from 'react';
import { Icon, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import appManagement from 'src/api/appManagement';
import projectAjax from 'src/api/project';
import processVersionAjax from 'src/pages/workflow/api/processVersion';
import { selectDateList, dateDimension, formatter } from '../../util';
import { formatValue } from 'src/pages/Admin/homePage/config.js';
import DialogSelectDept from 'src/components/dialogSelectDept';
import LineChart from '../LineChart';
import loadingSvg from '../loading.svg';
import axios from 'axios';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';

const { Option } = Select;
const Summary = styled.div`
  height: 230px;
  background-color: #fff;
  padding: 20px 24px 0;
  .summaryItem {
    flex: 1;
    height: 133px;
    flex-direction: column;
    display: flex;
    background: #fafafa;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    &.linkHover:hover {
      background-color: #f5f5f5;
    }
  }
`;

const ChartWrap = styled.div`
  background-color: #fff;
  padding: 20px 24px;
  .conditions {
    justify-content: space-between;
    margin: 20px 0 32px;
    .selectCondition {
      .width200 {
        width: 200px;
      }
      .ant-select {
        height: 36px;
        border-radius: 3px;
        .ant-select-selector {
          height: 36px;
          border: 1px solid #eaeaea;
          border-radius: 3px;
          .ant-select-selection-item {
            line-height: 34px;
          }
          .ant-select-selection-placeholder {
            line-height: 34px;
          }
        }
        .ant-select-arrow {
          margin-top: -9px;
          top: 50%;
          width: 18px;
          height: 18px;
        }
      }
    }
    .dateDimension {
      background-color: #f5f5f5;
      height: 36px;
      border-radius: 3px;
      .dimensionItem {
        width: 50px;
        height: 32px;
        display: inline-block;
        text-align: center;
        line-height: 32px;
        cursor: pointer;
        margin: 2px;
        &.currentDimension {
          color: #2196f3;
          background-color: #fff;
          border-radius: 3px;
        }
      }
    }
  }
  .charContainer {
    margin-bottom: 48px;
    .chartCon {
      height: 364px;
      .totalTxt {
        top: 12px;
        left: 0px;
      }
    }
    .mBotto8 {
      margin-bottom: 8px;
    }
    .lengendTag {
      display: inline-block;
      width: 12px;
      height: 2px;
      margin-right: 8px;
      margin-bottom: 2px;
      vertical-align: middle;
    }
    .colorBlue {
      background: #2196f3;
    }
    .colorGreen {
      background: #61ddaa;
    }
    .FontW500 {
      font-weight: 500;
    }
  }
  .loadingChart {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
  }
`;

export default class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDimension: '1d',
      appList: [{ label: _l('全部应用'), value: '' }],
      appId: '',
      selectedDate: 1,
      loading: false,
      departmentInfo: {},
      depFlag: false,
    };
  }
  componentDidMount() {
    this.props.appId ? this.getAppOverviewData() : this.getOverviewData();
    this.getChartData();
  }
  getAppOverviewData = () => {
    const { projectId, appId } = this.props;
    appManagement
      .appUsageOverviewStatistics({
        projectId,
        appId,
        pageIndex: 1,
        pageSize: 50,
        sortFiled: 'status',
        sorted: false,
      })
      .then(({ list = [] }) => {
        let overviewData = _.isEmpty(list) ? {} : list[0];
        const { workSheetCount, rowCount, workFlowCount, userCount } = overviewData;
        this.setState({ workSheetCount, rowCount, workFlowCount, userCount });
      });
  };
  getOverviewData = () => {
    const { projectId } = this.props;
    axios
      .all([projectAjax.getProjectLicenseSupportInfo({ projectId }), processVersionAjax.getProcessUseCount({ companyId: projectId })])
      .then(([data1, data2]) => {
        const { effectiveApkCount = 0, effectiveWorksheetCount = 0, effectiveWorksheetRowCount = 0 } = data1;
        const { useProcessCount: effectiveWorkflowCount } = data2;
        this.setState({
          effectiveApkCount,
          effectiveWorksheetCount,
          effectiveWorksheetRowCount,
          effectiveWorkflowCount,
        });
      });
  };
  formatStastics = value => {
    let result =
      value >= 10000 ? (
        <span>
          {parseFloat(value / 10000)}
          <span className="Gray_9e Font16">{_l(' 万')}</span>
        </span>
      ) : (
        formatValue(value)
      );
    return result === 'undefined' ? '-' : result;
  };
  getChartData = () => {
    const { projectId } = this.props;
    const { departmentInfo = {}, selectedDate, appId = '', currentDimension, depFlag } = this.state;
    let extra =
      departmentInfo.departmentId && departmentInfo.departmentId.indexOf('org') > -1
        ? {}
        : { departmentId: departmentInfo.departmentId };
    this.setState({ loading: true });
    appManagement
      .allUsageOverviewStatistics({
        projectId,
        appId: this.props.appId ? this.props.appId : appId,
        dayRange: selectedDate,
        dateDemension: selectedDate === 0 ? '1d' : currentDimension,
        depFlag,
        ...extra,
      })
      .then(({ workflow = {}, record = {}, app = {}, attachment = {} }) => {
        const { totalNumberOfexecute = 0, statisticsResult: workflowStatisticsResult } = workflow;
        const {
          totalNumberOfRow = 0,
          totalNumberOfPerson: recordTotal,
          personStatisticsResult = [],
          rowStatisticsResult = [],
        } = record;
        const { totalDegree = 0, totalNumberOfPerson: appTotal, degreeStatisticsResult = [] } = app;
        const { totalCapacityUsage, statisticsResult: attachmentStatisticsResult } = attachment;
        const apppersonStatisticsResult = app.personStatisticsResult || [];
        let maxSize = Math.max(...attachmentStatisticsResult.map(item => item.value));
        let maxValue = (maxSize / Math.pow(1024, 2)).toFixed(2) * 1;
        this.setState({
          totalNumberOfexecute: formatter(totalNumberOfexecute) + _l(' 次'),
          workflowStatisticsResult: workflowStatisticsResult.map(item => ({ ...item, category: _l('工作流执行数') })),
          totalCapacityUsage:
            maxValue > 1024
              ? formatter((totalCapacityUsage / Math.pow(1024, 3)).toFixed(2) * 1) + ' GB'
              : formatter((totalCapacityUsage / Math.pow(1024, 2)).toFixed(2) * 1) + ' MB',
          attachmentStatisticsResult: attachmentStatisticsResult.map(item => ({
            ...item,
            category: _l('附件上传量'),
            value:
              maxValue > 1024
                ? (item.value / Math.pow(1024, 3)).toFixed(2) * 1
                : (item.value / Math.pow(1024, 2)).toFixed(2) * 1,
          })),
          totalNumberOfRow: formatter(totalNumberOfRow) + _l(' 条'),
          recordTotal: formatter(recordTotal) + _l(' 人'),
          recordStatisticsResult: [
            _.isEmpty(rowStatisticsResult)
              ? [{ value1: 10000, value: 10000, category: _l('行记录数') }]
              : rowStatisticsResult.map(item => ({
                  ...item,
                  value1: item.value,
                  category: _l('行记录数'),
                })),
            _.isEmpty(personStatisticsResult)
              ? [{ value1: 10000, value: 10000, category: _l('人数') }]
              : personStatisticsResult.map(item => ({
                  ...item,
                  value2: item.value,
                  category: _l('人数'),
                })),
          ],
          totalDegree: formatter(totalDegree) + _l(' 次'),
          appTotal: formatter(appTotal) + _l(' 人'),
          appStatisticsResult: [
            _.isEmpty(degreeStatisticsResult)
              ? [{ value1: 10000, value: 10000, category: _l('次数') }]
              : degreeStatisticsResult.map(item => ({
                  ...item,
                  value1: item.value,
                  category: _l('次数'),
                })),
            _.isEmpty(apppersonStatisticsResult)
              ? [{ value2: 10000, value: 10000, category: _l('人数') }]
              : apppersonStatisticsResult.map(item => ({
                  ...item,
                  value2: item.value,
                  category: _l('人数'),
                })),
          ],
          loading: false,
        });
      })
      .fail(err => {
        this.setState({ loading: false });
      });
  };

  renderChart = (data = [], isDualAxes, chartInfo) => {
    const { selectedDate, currentDimension, loading } = this.state;
    let showEveryXaxis =
      ((selectedDate === 2 || selectedDate === 3 || selectedDate === 4) && currentDimension === '1d') ||
      (selectedDate === 4 && currentDimension === '1w');
    let isEmpty = _.isArray(data[0]) ? _.isEmpty(data[0]) && _.isEmpty(data[1]) : _.isEmpty(data);

    return (
      <div className="w100 chartCon Relative">
        {!loading && !isEmpty && <span className="Absolute totalTxt">{_l('总计：')}</span>}

        {loading ? (
          this.renderLoading()
        ) : (
          <LineChart
            data={data}
            isDualAxes={isDualAxes}
            chartInfo={chartInfo}
            currentDimension={currentDimension}
            configObj={
              !showEveryXaxis
                ? {
                    xAxis: {
                      label: {
                        formatter: text => {
                          return moment(text).date() === 1
                            ? moment(text).format('MM月DD日')
                            : moment(text).format('DD');
                        },
                        autoHide: false,
                      },
                      tickInterval: 1,
                    },
                  }
                : {}
            }
          />
        )}
      </div>
    );
  };

  /**
   * 获得应用列表
   */
  getAppList(projectId) {
    const { appList } = this.state;

    appManagement
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: 1,
        pageSize: 100000,
        keyword: '',
      })
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({ appList: appList.concat(newAppList) });
      });
  }
  handleSelectDepartment = () => {
    const { projectId } = this.props;
    new DialogSelectDept({
      projectId,
      unique: true,
      fromAdmin: true,
      showCreateBtn: false,
      checkIncludeChilren: true,
      allProject: true,
      isAnalysis: true,
      selectFn: (departments, departmentTrees) => {
        this.setState(
          {
            departmentInfo: !_.isEmpty(departments)
              ? departments[0]
              : !_.isEmpty(departmentTrees)
              ? departmentTrees[0]
              : {},
            depFlag: !_.isEmpty(departments) ? true : false,
          },
          () => {
            this.getChartData();
          },
        );
      },
    });
  };
  linkHref = type => {
    const { projectId } = this.props;
    location.assign(`/admin/${type}/${projectId}`);
  };
  renderLoading = () => {
    return (
      <div className="loadingChart h100 GrayBGFA">
        <img src={loadingSvg} />
      </div>
    );
  };
  render() {
    const { projectId } = this.props;
    let {
      currentDimension,
      appList = [],
      appId,
      selectedDate,
      effectiveApkCount,
      effectiveWorksheetCount,
      effectiveWorksheetRowCount,
      effectiveWorkflowCount,
      workSheetCount,
      rowCount,
      workFlowCount,
      userCount,
      departmentInfo = {},
      totalNumberOfexecute,
      totalCapacityUsage,
      workflowStatisticsResult,
      attachmentStatisticsResult = [],
      totalNumberOfRow,
      recordTotal,
      recordStatisticsResult,
      totalDegree,
      appTotal,
      appStatisticsResult,
    } = this.state;
    return (
      <Fragment>
        <Summary>
          <div className="Font17 fontWeight600 mBottom20 Black">{_l('汇总概览')}</div>
          {this.props.appId ? (
            <div className="flexRow">
              <div className="summaryItem mRight24">
                <div className="Gray_75 fontWeight600">{_l('工作表总数')}</div>
                <div className="Font30 ">{this.formatStastics(workSheetCount)}</div>
              </div>
              <div className="summaryItem mRight24">
                <div className="Gray_75 fontWeight600">{_l('行记录总数')}</div>
                <div className="Font30 ">{this.formatStastics(rowCount)}</div>
              </div>
              <div className="summaryItem mRight24">
                <div className="Gray_75 fontWeight600">{_l('工作流总数')}</div>
                <div className="Font30 ">{this.formatStastics(workFlowCount)}</div>
              </div>
              {/* <div className="summaryItem">
                <div className="Gray_75 fontWeight600">
                  {_l('用户数')}
                  <Tooltip text={<span>{_l('统计仅包含组织内用户，不包含外部用户')}</span>}>
                    <Icon icon="info" className="Font16 Gray_9e mLeft15 hover_f3" />
                  </Tooltip>
                </div>
                <div className="Font30 ">{this.formatStastics(userCount)}</div>
              </div> */}
            </div>
          ) : (
            <div className="flexRow">
              <div className="summaryItem mRight24 Hand linkHover" onClick={() => this.linkHref('app')}>
                <div className="Gray_75 fontWeight600 ">{_l('应用数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveApkCount) || '-'}</div>
              </div>
              <div className="summaryItem mRight24">
                <div className="Gray_75 fontWeight600">{_l('工作表总数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveWorksheetCount) || '-'}</div>
              </div>
              <div className="summaryItem mRight24">
                <div className="Gray_75 fontWeight600">{_l('行记录总数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveWorksheetRowCount) || '-'}</div>
              </div>
              <div className="summaryItem Hand linkHover" onClick={() => this.linkHref('workflows')}>
                <div className="Gray_75 fontWeight600 ">{_l('工作流总数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveWorkflowCount) || '-'}</div>
              </div>
            </div>
          )}
        </Summary>
        <ChartWrap>
          <div className="Font17 fontWeight600 Black">{_l('使用情况')}</div>
          <div className="conditions flexRow">
            <div className="selectCondition flexRow flex">
              <Select
                className="width200 mRight15"
                placeholder={_l('按部门')}
                value={departmentInfo.departmentName}
                dropdownRender={null}
                open={false}
                onFocus={this.handleSelectDepartment}
                suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
                onChange={() => {
                  this.setState({ departmentInfo: {} });
                }}
              />
              {!this.props.appId && (
                <Select
                  className="width200 mRight15"
                  showSearch
                  defaultValue={appId}
                  options={appList}
                  onFocus={() => appList.length === 1 && this.getAppList(projectId)}
                  filterOption={(inputValue, option) =>
                    appList
                      .find(item => item.value === option.value)
                      .label.toLowerCase()
                      .indexOf(inputValue.toLowerCase()) > -1
                  }
                  suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
                  notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
                  onChange={value =>
                    this.setState({ appId: value }, () => {
                      this.getChartData();
                    })
                  }
                />
              )}
              <Select
                className="width200 mRight15"
                placeholder={_l('最近30天')}
                value={selectedDate}
                suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
                onChange={value => {
                  this.setState(
                    { selectedDate: value, currentDimension: value === 2 || value === 3 || value === 4 ? '1M' : '1d' },
                    () => {
                      this.getChartData();
                    },
                  );
                }}
              >
                {selectDateList.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="dateDimension">
              {selectedDate !== 0 &&
                dateDimension.map(item => (
                  <span
                    key={item.value}
                    className={cx('dimensionItem', {
                      currentDimension: currentDimension === item.value,
                    })}
                    onClick={() => {
                      this.setState({ currentDimension: item.value }, () => {
                        this.getChartData();
                      });
                    }}
                  >
                    {item.label}
                  </span>
                ))}
            </div>
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">
              {_l('应用访问量')}
              <Tooltip text={<span>{_l('应用访问量统计仅包含组织内用户，不包含外部门户')}</span>}>
                <Icon icon="info" className="Font16 Gray_9e mLeft12 hover_f3" />
              </Tooltip>
            </div>
            {this.renderChart(appStatisticsResult, true, { type: 'app', total1: totalDegree, total2: appTotal })}
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">{_l('记录创建量')}</div>
            {this.renderChart(recordStatisticsResult, true, {
              type: 'record',
              total1: totalNumberOfRow,
              total2: recordTotal,
            })}
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">
              {_l('工作流执行数')}
              <Tooltip text={<span>{_l('筛选条件“按部门”不生效')}</span>}>
                <Icon icon="info" className="Font16 Gray_9e mLeft12 hover_f3" />
              </Tooltip>
            </div>
            {this.renderChart(workflowStatisticsResult, false, { type: 'workflow', total: totalNumberOfexecute })}
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">{_l('附件上传量')}</div>
            {this.renderChart(attachmentStatisticsResult, false, {
              type: 'attachment',
              total: totalCapacityUsage,
            })}
          </div>
        </ChartWrap>
      </Fragment>
    );
  }
}
