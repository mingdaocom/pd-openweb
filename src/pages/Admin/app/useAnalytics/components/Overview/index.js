import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { dialogSelectDept } from 'ming-ui/functions';
import appManagement from 'src/api/appManagement';
import attachmentAjax from 'src/api/attachment';
import projectAjax from 'src/api/project';
import processVersionAjax from 'src/pages/workflow/api/processVersion';
import { formatValue } from 'src/pages/Admin/homePage/config.js';
import { formatFileSize } from 'src/utils/common';
import { dateDimension, formatChartData, formatter, selectDateList } from '../../util';
import LineChart from '../LineChart';
import loadingSvg from '../loading.svg';

const { Option } = Select;
const Summary = styled.div`
  background-color: #fff;
  padding: 20px 32px 0;
  margin-bottom: 32px;
  .summaryItem {
    height: 133px;
    flex-direction: column;
    display: flex;
    background: #fafafa;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    min-width: 220px;
    width: calc((100% - 72px) / 4);
    &.summaryCol3 {
      width: calc((100% - 48px) / 3);
    }
    @media screen and (max-width: 1351px) {
      width: calc((100% - 48px) / 3) !important;
    }
    @media screen and (max-width: 1107px) {
      width: calc(50% - 12px) !important;
    }
    &.linkHover:hover {
      background-color: #f5f5f5;
    }
  }
  .summaryWrap {
    gap: 24px;
    flex-wrap: wrap;
  }
`;

const ChartWrap = styled.div`
  background-color: #fff;
  padding: 20px 32px;
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
      wrapWidth: undefined,
    };
    this.summaryRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.appId) {
      return;
    }
    this.getOverviewData();
    this.getChartData();
  }

  getOverviewData = () => {
    const { projectId } = this.props;

    Promise.all([
      projectAjax.getProjectLicenseSupportInfo({ projectId, onlyNormal: true, onlyUsage: true }),
      processVersionAjax.getProcessUseCount({ companyId: projectId }),
      attachmentAjax.getAttachmentTotal({ projectId, noCache: true }),
    ]).then(([data1, data2, data3]) => {
      const { effectiveApkCount = 0, effectiveWorksheetCount = 0, effectiveWorksheetRowCount = 0 } = data1;
      const { useProcessCount: effectiveWorkflowCount } = data2;
      const { code, total } = data3;
      this.setState({
        effectiveApkCount,
        effectiveWorksheetCount,
        effectiveWorksheetRowCount,
        effectiveWorkflowCount,
        effectiveAttachmentTotal: total,
        effectiveAttachmentCode: code,
      });
    });
  };

  formatStastics = value => {
    const isEnLang = md.global.Account.lang === 'en';
    let result = undefined;

    result =
      value >= 10000 && !isEnLang ? (
        <span>
          {value >= 100000000 ? _.floor(parseFloat(value / 100000000), 4) : parseFloat(value / 10000)}
          <span className="Gray_9e Font16 mLeft3">{value >= 100000000 ? _l('亿+') : _l('万')}</span>
        </span>
      ) : (
        formatValue(value)
      );

    return result === 'undefined' ? '-' : result;
  };

  formatFileSize = value => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (value === undefined) return '-';

    let num = 0;
    let suffix = units[0];

    if (value) {
      const i = Math.floor(Math.log(value) / Math.log(1024));
      num = (value / Math.pow(1024, i)).toFixed(2) * 1;
      suffix = units[i];
    }

    return (
      <Fragment>
        {num}
        <span className="Font16 Gray_9e mLeft3">{suffix}</span>
      </Fragment>
    );
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
        isApp: this.props.appId ? true : false,
        ...extra,
      })
      .then(({ workflow = {}, record = {}, app = {}, attachment = {} }) => {
        this.updateChartData({ workflow, record, app, attachment, isFilterByDepartment: !!extra.departmentId });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };

  getUserTotalCapacityUsage = (attachmentStatisticsResult = []) => {
    const total = _.reduce(
      attachmentStatisticsResult || [],
      (sum, item) => {
        const currentValue = _.find(item.value || [], v => v.subType === 1);
        return sum + (currentValue ? currentValue.size : 0);
      },
      0,
    );
    return formatFileSize(total, 2);
  };

  updateChartData = ({ workflow = {}, record = {}, app = {}, attachment = {}, isFilterByDepartment }) => {
    const { totalNumberOfexecute = 0, statisticsResult: workflowStatisticsResult } = workflow;
    const {
      totalNumberOfRow = 0,
      totalNumberOfPerson: recordTotal,
      personStatisticsResult = [],
      rowStatisticsResult = [],
    } = record;
    const { totalDegree = 0, totalNumberOfPerson: appTotal, degreeStatisticsResult = [] } = app;
    const { totalCapacityUsage, statisticsResult: attachmentStatisticsResult, subTypeTotal } = attachment;
    const apppersonStatisticsResult = app.personStatisticsResult || [];

    this.setState({
      totalNumberOfexecute: formatter(totalNumberOfexecute) + ' ' + _l('次'),
      workflowStatisticsResult: (workflowStatisticsResult || []).map(item => ({
        ...item,
        category: _l('工作流执行数'),
      })),
      totalCapacityUsage: isFilterByDepartment
        ? this.getUserTotalCapacityUsage(attachmentStatisticsResult)
        : formatFileSize(totalCapacityUsage, 2),
      attachmentStatisticsResult: formatChartData('attachment', attachmentStatisticsResult, isFilterByDepartment),
      subTypeTotal,
      totalNumberOfRow: formatter(totalNumberOfRow) + ' ' + _l('条'),
      recordTotal: formatter(recordTotal) + ' ' + _l('人'),
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
      totalDegree: formatter(totalDegree) + ' ' + _l('次'),
      appTotal: formatter(appTotal) + ' ' + _l('人'),
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
  };
  updateAppOverviewData = ({ list = [] }) => {
    let overviewData = _.isEmpty(list) ? {} : list[0];
    const { workSheetCount, rowCount, workFlowCount, userCount } = overviewData;
    this.setState({ workSheetCount, rowCount, workFlowCount, userCount, loading: false });
  };

  getAuthor = () => {
    this.setState({ loading: true });
    const { projectId, appId } = this.props;
    const { departmentInfo = {}, selectedDate, currentDimension, depFlag } = this.state;
    let extra =
      departmentInfo.departmentId && departmentInfo.departmentId.indexOf('org') > -1
        ? {}
        : { departmentId: departmentInfo.departmentId };
    const promise1 = appManagement.appUsageOverviewStatistics({
      projectId,
      appId,
      pageIndex: 1,
      pageSize: 50,
      sortFiled: 'status',
      sorted: false,
    });
    const promise2 = appManagement.allUsageOverviewStatistics({
      projectId,
      appId,
      dayRange: selectedDate,
      dateDemension: selectedDate === 0 ? '1d' : currentDimension,
      depFlag,
      isApp: appId ? true : false,
      ...extra,
    });
    return Promise.all([promise1, promise2]);
  };

  renderChart = (data = [], isDualAxes, chartInfo) => {
    const { selectedDate, currentDimension, loading } = this.state;
    const { total, type } = chartInfo;
    let showEveryXaxis =
      ((selectedDate === 2 || selectedDate === 3 || selectedDate === 4) && currentDimension === '1d') ||
      (selectedDate === 4 && currentDimension === '1w');
    let isEmpty = _.isArray(data[0]) ? _.isEmpty(data[0]) && _.isEmpty(data[1]) : _.isEmpty(data);

    return (
      <div className="w100 chartCon Relative">
        {!loading && (!isEmpty || _.includes(['attachment', 'workflow'], type)) && (
          <span className="Absolute totalTxt">{_l('总计：%0', type === 'attachment' ? total : '')}</span>
        )}

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
    const { appPageIndex = 1, isMoreApp, loadingApp, keyword = '' } = this.state;
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    this.setState({ loadingApp: true });

    appManagement
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: appPageIndex,
        pageSize: 50,
        keyword,
      })
      .then(({ apps }) => {
        const newAppList = apps.map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({ appList: appList.concat(newAppList) });
        this.setState({
          appList: appPageIndex === 1 ? [].concat(newAppList) : this.state.appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .catch(err => {
        this.setState({ loadingApp: false });
      });
  }

  handleSelectDepartment = () => {
    const { projectId } = this.props;

    dialogSelectDept({
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
      isMoreApp,
      subTypeTotal,
      effectiveAttachmentTotal,
      effectiveAttachmentCode,
    } = this.state;
    const showEffectiveAttachment = effectiveAttachmentCode === 1;

    return (
      <Fragment>
        <Summary ref={this.summaryRef}>
          <div className="Font17 fontWeight600 mBottom20 Black">{_l('汇总概览')}</div>
          {this.props.appId ? (
            <div className="flexRow summaryWrap">
              <div className="summaryItem summaryCol3">
                <div className="Gray_75 fontWeight600">{_l('工作表总数')}</div>
                <div className="Font30 ">{this.formatStastics(workSheetCount)}</div>
              </div>
              <div className="summaryItem summaryCol3">
                <div className="Gray_75 fontWeight600">{_l('行记录总数')}</div>
                <div className="Font30 ">{this.formatStastics(rowCount)}</div>
              </div>
              <div className="summaryItem summaryCol3">
                <div className="Gray_75 fontWeight600">{_l('工作流总数')}</div>
                <div className="Font30 ">{this.formatStastics(workFlowCount)}</div>
              </div>
            </div>
          ) : (
            <div className="flexRow summaryWrap">
              <div className="summaryItem Hand linkHover" onClick={() => this.linkHref('app')}>
                <div className="Gray_75 fontWeight600 ">{_l('应用数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveApkCount) || '-'}</div>
              </div>
              <div className="summaryItem">
                <div className="Gray_75 fontWeight600">{_l('工作表总数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveWorksheetCount) || '-'}</div>
              </div>
              <div className="summaryItem">
                <div className="Gray_75 fontWeight600">{_l('行记录总数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveWorksheetRowCount) || '-'}</div>
              </div>
              <div className="summaryItem Hand linkHover" onClick={() => this.linkHref('workflows')}>
                <div className="Gray_75 fontWeight600 ">{_l('工作流总数')}</div>
                <div className="Font30 ">{this.formatStastics(effectiveWorkflowCount) || '-'}</div>
              </div>
              <div className="summaryItem Hand linkHover">
                <div className="Gray_75 fontWeight600 ">
                  {_l('附件累计存储量')}
                  <Tooltip text={_l('指应用下字段、讨论等附件，此数据每天统计一次，第二天自动重新计算')}>
                    <Icon icon="info" className="Gray_9e mLeft4 Hand" />
                  </Tooltip>
                </div>
                <div className={showEffectiveAttachment ? 'Font30' : 'Font14 Gray_9e mTop6'}>
                  {showEffectiveAttachment
                    ? this.formatFileSize(effectiveAttachmentTotal)
                    : _l('数据计算中，请稍候...')}
                </div>
              </div>
            </div>
          )}
        </Summary>
        <ChartWrap>
          <div className="Font17 fontWeight600 Black">{_l('使用情况')}</div>
          <div className="conditions flexRow">
            <div className="selectCondition flexRow flex">
              <Select
                className="width200 mRight15 mdAntSelect"
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
                  className="width200 mRight15 mdAntSelect"
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
                  onSearch={_.debounce(
                    val => this.setState({ keyword: val, appPageIndex: 1 }, () => this.getAppList(projectId)),
                    500,
                  )}
                  onChange={value =>
                    this.setState({ appId: value }, () => {
                      this.getChartData();
                    })
                  }
                  onPopupScroll={e => {
                    e.persist();
                    const { scrollTop, offsetHeight, scrollHeight } = e.target;
                    if (scrollTop + offsetHeight === scrollHeight) {
                      if (isMoreApp) {
                        this.getAppList(projectId);
                      }
                    }
                  }}
                />
              )}
              <Select
                className="width200 mRight15 mdAntSelect"
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
              <Tooltip
                popupPlacement="bottom"
                text={
                  <span>
                    {_l('应用访问次数计数说明：')}
                    <br />
                    {_l('· 通过应用图标点击进入应用')}
                    <br />
                    {_l('· 通过系统消息打开了应用')}
                    <br />
                    {_l('· 通过超链接访问应用')}
                  </span>
                }
              >
                <Icon icon="info" className="Font16 Gray_9e mLeft12 hover_f3" />
              </Tooltip>
            </div>
            {this.renderChart(appStatisticsResult, true, { type: 'app', total1: totalDegree, total2: appTotal })}
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">
              {_l('记录创建量')}
              <Tooltip
                popupPlacement="bottom"
                text={
                  <span>
                    {_l('记录创建次数计数说明：')}
                    <br />
                    {_l('通过工作表表单页面创建的记录、不包含Excel导入、工作流创建、API调用的方式')}
                  </span>
                }
              >
                <Icon icon="info" className="Font16 Gray_9e mLeft12 hover_f3" />
              </Tooltip>
            </div>
            {this.renderChart(recordStatisticsResult, true, {
              type: 'record',
              total1: totalNumberOfRow,
              total2: recordTotal,
            })}
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">
              {_l('工作流执行数')}
              <Tooltip text={<span>{_l('筛选条件“按部门”不生效')}</span>} popupPlacement="bottom">
                <Icon icon="info" className="Font16 Gray_9e mLeft12 hover_f3" />
              </Tooltip>
            </div>
            {this.renderChart(workflowStatisticsResult, false, { type: 'workflow', total: totalNumberOfexecute })}
          </div>
          <div className="charContainer">
            <div className="Font15 fontWeight600 mBotto8 Black">
              {_l('附件上传量')}
              <Tooltip text={_l('公开表单仅统计非平台登录用户上传的附件')}>
                <Icon icon="info" className="Font16 Gray_9e mLeft12 hover_f3" />
              </Tooltip>
            </div>
            {this.renderChart(attachmentStatisticsResult, false, {
              type: 'attachment',
              total: totalCapacityUsage,
              subTypeTotal,
            })}
          </div>
        </ChartWrap>
      </Fragment>
    );
  }
}
