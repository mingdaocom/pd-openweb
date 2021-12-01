import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon, Input, Dialog, ScrollView, LoadDiv } from 'ming-ui';
import { DndProvider } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import reportConfig from '../api/reportConfig';
import reportRequest from '../api/report';
import { Tabs, Button, ConfigProvider, Dropdown, Menu, Tooltip, Divider } from 'antd';
import DataSource from '../components/DataSource';
import ChartSetting from '../components/ChartSetting';
import ChartStyle from '../components/ChartStyle';
import Sort from '../components/Sort';
import FilterScope from '../components/FilterScope';
import { Loading, WithoutData, Abnormal } from '../components/ChartStatus';
import HeaderDisplaySetup from '../components/HeaderDisplaySetup';
import charts from '../Charts';
import worksheetAjax from 'src/api/worksheet';
import {
  formatValuesOfOriginConditions,
  redefineComplexControl,
} from 'src/pages/worksheet/common/WorkSheetFilter/util';
import {
  chartNav,
  isTimeControl,
  fillValueMap,
  mergeReportData,
  initConfigDetail,
  exportPivotTable,
  normTypes,
} from '../common';
import { reportTypes } from '../Charts/common';
import './index.less';

export default class ChartDialog extends Component {
  static propTypes = {
    type: PropTypes.string,
    appId: PropTypes.string,
    projectId: PropTypes.string,
    activeSheetId: PropTypes.string,
    settingVisible: PropTypes.bool,
    isPublic: PropTypes.bool,
    permissions: PropTypes.bool,
    report: PropTypes.shape({}),
    onBlur: PropTypes.func,
    updateDialogVisible: PropTypes.func,
    onGetReportConfigList: PropTypes.func,
  };
  static defaultProps = {
    settingVisible: true,
    isPublic: true,
    permissions: true,
  };
  constructor(props) {
    super(props);
    const { settingVisible, report, activeSheetId, chartType } = props;
    this.state = {
      reportId: report.id,
      chartType,
      axisControls: [],
      activeSheetId,
      settingVisible,
      scopeVisible: false,
      isEdit: false,
      currentReport: {},
      reportData: {},
      detailLoading: false,
      saveLoading: false,
      loading: false,
      filterItem: [],
      worksheetInfo: {},
      chartIsUnfold: true,
      dataIsUnfold: true,
      saveData: null,
    };
  }
  componentDidMount() {
    this.getReportConfigDetail();
  }
  getReportConfigDetail(reportType) {
    const { report, permissions, settingVisible, sourceType } = this.props;
    const { reportId, activeSheetId, chartType } = this.state;

    if (reportType) {
      this.setState({ loading: true });
    } else {
      this.setState({ detailLoading: true });
    }

    reportConfig
      .getReportConfigDetail({
        reportId,
        appId: activeSheetId,
        reportType: reportType || chartType,
      })
      .then(result => {
        const { currentReport, axisControls } = initConfigDetail(reportId, result, this.state.currentReport);

        this.setState({
          currentReport,
          axisControls,
        });

        if (reportType) {
          this.getReportData();
        } else {
          this.getWorksheetInfo(activeSheetId || result.appId);
        }
      });
  }
  getWorksheetInfo(worksheetId) {
    const { currentReport } = this.state;
    const { filter } = currentReport;
    Promise.all([
      worksheetAjax.getWorksheetInfo({
        worksheetId,
        getTemplate: true,
        getViews: true,
      }),
      filter.filterId
        ? worksheetAjax.getWorksheetFilterById({
            filterId: filter.filterId,
          })
        : null,
    ]).then(result => {
      const [worksheetResult, filterResult] = result;
      const param = {
        detailLoading: false,
        worksheetInfo: {
          worksheetId,
          name: worksheetResult.name,
          views: worksheetResult.views,
          columns: worksheetResult.template.controls.map(item => {
            return redefineComplexControl(item);
          }),
        },
      }
      if (filterResult) {
        param.currentReport = {
          ...currentReport,
          filter: {
            ...filter,
            filterControls: formatValuesOfOriginConditions(filterResult.items),
          },
        }
        param.filterItem = filterResult.items;
      }
      this.setState(param);
      this.getReportData();
    });
  }
  getReportData() {
    const { report, permissions } = this.props;
    const { reportData, loading, settingVisible } = this.state;
    const { id } = report;
    const data = this.getCurrentNewReport();
    this.setState({
      loading: true,
    });
    if (settingVisible) {
      // 管理员
      if (this.reportConfigRequest && this.reportConfigRequest.state() === 'pending') {
        this.reportConfigRequest.abort();
      }
      data.filter.filterId = null;
      this.reportConfigRequest = reportConfig.getData(data, { fireImmediately: false });
      this.reportConfigRequest
        .then(result => {
          const { currentReport } = this.state;
          const param = mergeReportData(currentReport, result, id);
          this.setState({
            reportData: fillValueMap(result),
            loading: false,
            currentReport: {
              ...currentReport,
              ...param,
            }
          });
        })
        .fail(result => {
          this.setState({ loading: false });
        });
    } else {
      // 成员 || 管理员放大
      const { filter, sorts, version } = data;
      if (this.reportRequest && this.reportRequest.state() === 'pending') {
        this.reportRequest.abort();
      }
      const params = _.isEmpty(reportData)
        ? { reportId: id }
        : {
            reportId: id,
            particleSizeType: data.particleSizeType,
            filterRangeId: filter.filterRangeId,
            rangeType: filter.rangeType,
            rangeValue: filter.rangeValue,
            filterControls: filter.filterControls,
            sorts,
          };
      params.version = version;
      this.reportRequest = reportRequest.getData(params, { fireImmediately: false });
      this.reportRequest
        .then(result => {
          const { currentReport } = this.state;
          const param = mergeReportData(currentReport, result, id);
          this.setState({
            reportData: fillValueMap(result),
            loading: false,
            currentReport: {
              ...currentReport,
              ...param,
            }
          });
        })
        .fail(result => {
          this.setState({ loading: false });
        });
    }
  }
  getCurrentNewReport() {
    const { currentReport, worksheetInfo, axisControls, reportId } = this.state;
    const { report, isPublic, sourceType } = this.props;
    const newCurrentReport = _.cloneDeep(currentReport);
    const { yaxisList, displaySetup, rightY, xaxes, pivotTable } = newCurrentReport;

    if (pivotTable) {
      const { columnSummary, lineSummary } = pivotTable;
      if (_.isEmpty(columnSummary.name)) {
        columnSummary.name = _.find(normTypes, { value: columnSummary.type }).text;
      }
      if (_.isEmpty(lineSummary.name)) {
        lineSummary.name = _.find(normTypes, { value: lineSummary.type }).text;
      }
    }

    if (newCurrentReport.summary && _.isEmpty(newCurrentReport.summary.name)) {
      newCurrentReport.summary.name = _.find(normTypes, { value: newCurrentReport.summary.type }).text;
    }

    if (rightY) {
      if (rightY.summary && _.isEmpty(rightY.summary.name)) {
        rightY.summary.name = _.find(normTypes, { value: rightY.summary.type }).text;
      }
    }

    // 来自自定义页面
    if (sourceType) {
      newCurrentReport.sourceType = sourceType;
    }

    return Object.assign(newCurrentReport, {
      isPublic,
      appId: worksheetInfo.worksheetId,
      name: newCurrentReport.name || _l('未命名图表'),
      id: reportId || '',
      version: '6.5'
    });
  }
  handleUpdateOwnerId() {
    const { report } = this.props;
    this.props.onUpdateOwnerId(report);
  }
  handleBlur = (event) => {
    const { currentReport } = this.state;
    this.props.onBlur(event);
    this.setState({
      isEdit: false,
      currentReport: Object.assign(currentReport, { name: event.target.value }),
    });
  }
  handleCancel = () => {
    const { saveData } = this.state;
    if (saveData) {
      this.handleSaveCallBack();
    } else {
      this.props.updateDialogVisible({
        dialogVisible: false,
        isRequest: false,
      });
    }
  };
  handleSave = () => {
    const data = this.getCurrentNewReport();
    delete data.filter.filterControls;
    reportConfig.saveReportConfig(data).then(result => {
      this.setState({
        saveLoading: false,
        reportId: result.reportId,
        saveData: {
          reportId: result.reportId,
          reportName: data.name,
        },
      }, () => {
        this.handleCancel();
      });
    });
  };
  handleSaveCallBack = () => {
    const { saveData } = this.state;
    const { onGetReportConfigList, updateDialogVisible } = this.props;
    updateDialogVisible({
      dialogVisible: false,
      isRequest: true,
      ...saveData,
    });
    this.setState({ saveData: null });
    onGetReportConfigList && onGetReportConfigList();
  };
  handleVerifySave = () => {
    const { xaxes, yaxisList, reportType } = this.state.currentReport;
    if (reportType == reportTypes.NumberChart) {
      if (_.isEmpty(yaxisList)) {
        alert(_l('请配置维度后再保存图表'), 2);
      } else {
        this.handleSaveFilter();
      }
      return;
    }
    if (reportType !== reportTypes.PivotTable) {
      if (_.isEmpty(yaxisList) || _.isEmpty(xaxes.controlId)) {
        alert(_l('请配置维度和数值后再保存图表'), 2);
      } else {
        this.handleSaveFilter();
      }
      return;
    } else {
      this.handleSaveFilter();
    }
  };
  handleSaveFilter = () => {
    const { filterItem, currentReport, worksheetInfo } = this.state;
    const { filter } = currentReport;
    const { appId } = this.props;

    this.setState({ saveLoading: true });

    if (_.isEmpty(filter.filterId) && _.isEmpty(filterItem)) {
      this.handleSave();
      return;
    }

    worksheetAjax
      .saveWorksheetFilter({
        name: '',
        type: '',
        worksheetId: worksheetInfo.worksheetId,
        items: formatValuesOfOriginConditions(filterItem),
        filterId: filter.filterId,
        appId,
        module: 2,
      })
      .then(result => {
        this.setState(
          {
            currentReport: {
              ...currentReport,
              filter: {
                ...filter,
                filterId: result.filterId,
              },
            },
          },
          this.handleSave,
        );
      });
  };
  handleUpdateReportType(type) {
    const { currentReport, loading } = this.state;
    if (loading || type === currentReport.reportType) return;
    this.getReportConfigDetail(type);
  }
  handleDisplaySetup = (data, isRequest = false) => {
    const { currentReport } = this.state;
    this.setState(
      {
        currentReport: {
          ...currentReport,
          displaySetup: data,
        },
      },
      () => {
        isRequest && this.getReportData();
      },
    );
  };
  handleChangeCurrentReport = (data, isRequest = false) => {
    const { currentReport } = this.state;
    this.setState(
      {
        currentReport: {
          ...currentReport,
          ...data,
        },
      },
      () => {
        isRequest && this.getReportData();
      },
    );
  };
  handleChangeFilterItem = (filterItem, conditions) => {
    const { currentReport } = this.state;
    this.setState({ filterItem });
    this.handleChangeCurrentReport(
      {
        filter: {
          ...currentReport.filter,
          filterControls: conditions,
        },
      },
      true,
    );
  };
  renderMore() {
    const { ownerId, report, onUpdateOwnerId, onCopyCustomPage, onDelete } = this.props;
    return (
      <Menu className="chartMenu">
        <Menu.Item
          className="pLeft10"
          onClick={() => {
            onUpdateOwnerId(report);
          }}
        >
          <div className="flexRow valignWrapper">
            <Icon className="Gray_9e Font18 mLeft5 mRight5" icon={ownerId ? 'worksheet_public' : 'minus-square'} />
            <span>{ownerId ? _l('转为公共图表') : _l('从公共中移出')}</span>
          </div>
        </Menu.Item>
        <Menu.Item
          className="pLeft10"
          onClick={() => {
            onCopyCustomPage(report);
          }}
        >
          <div className="flexRow valignWrapper">
            <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="content-copy" />
            <span>{_l('复制到自定义页面')}</span>
          </div>
        </Menu.Item>
        <Divider className="mTop5 mBottom5" />
        <Menu.Item className="pLeft10" onClick={onDelete}>
          <div className="flexRow valignWrapper">
            <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="task-new-delete" />
            <span>{_l('删除')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  renderHeader() {
    const { report, permissions, sourceType } = this.props;
    const { saveLoading, settingVisible, isEdit, currentReport } = this.state;
    const { id } = report;
    return (
      <div className="header">
        {isEdit ? (
          <Input
            autoFocus
            placeholder=""
            className="flex mRight20"
            defaultValue={currentReport.name}
            onBlur={this.handleBlur}
            onKeyDown={event => {
              event.which === 13 && this.handleBlur(event);
            }}
          />
        ) : (
          <div className="ellipsis pointer">
            <span
              className="bold Font16"
              onDoubleClick={() => {
                if (permissions) {
                  this.setState({
                    isEdit: true,
                  });
                }
              }}
            >
              {currentReport.name}
            </span>
            {permissions && (
              <Icon
                className="Font18 pointer Gray_9e mLeft7"
                icon="workflow_write"
                onClick={() => {
                  this.setState({
                    isEdit: true,
                  });
                }}
              />
            )}
          </div>
        )}
        <div className="flexRow valignWrapper">
          {
            settingVisible && (
              <ConfigProvider autoInsertSpaceInButton={false}>
                <Button className="buttonSave" block shape="round" type="primary" onClick={this.handleVerifySave}>
                  {saveLoading ? <LoadDiv size="small" /> : _l('保存')}
                </Button>
              </ConfigProvider>
            )
          }
          {!settingVisible && id && sourceType !== 1 && (
            <span data-tip={_l('设置')}>
              <Icon
                icon="settings"
                className={cx('Font20 pointer Gray_9e', { active: settingVisible })}
                onClick={() => {
                  const newFilter = {
                    ...currentReport.filter,
                    filterControls: [],
                  };
                  this.setState({
                    settingVisible: !settingVisible,
                    scopeVisible: false,
                    currentReport: {
                      ...currentReport,
                      filter: newFilter,
                    }
                  }, () => {
                    this.getReportData();
                  });
                }}
              />
            </span>
          )}
          {permissions && id && sourceType !== 1 && (
            <Dropdown overlay={this.renderMore()} trigger={['click']}>
              <Icon className="Font24 pointer Gray_9e mLeft16" icon="more_horiz" />
            </Dropdown>
          )}
          <span data-tip={_l('关闭')} className="mLeft16">
            <Icon icon="close" className="Font24 pointer Gray_9e" onClick={this.handleCancel} />
          </span>
        </div>
      </div>
    );
  }
  renderChart() {
    const { reportData, currentReport, reportId } = this.state;
    const { reportType } = reportData;
    const Chart = charts[reportType];

    if ([reportTypes.PivotTable].includes(reportType)) {
      const { data, columns, ylist, lines, valueMap } = reportData;
      return _.isEmpty(data.data) ? (
        <WithoutData />
      ) : (
        <Chart
          reportData={{
            ...currentReport,
            data,
            columns,
            ylist,
            lines: currentReport.pivotTable ? _.merge(lines, currentReport.pivotTable.lines) : lines,
            valueMap,
          }}
        />
      );
    }
    if (reportTypes.CountryLayer === reportType) {
      const { map, country } = reportData;
      return map.length ? (
        <Chart
          reportData={{
            ...currentReport,
            map,
            country,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if (
      [
        reportTypes.BarChart,
        reportTypes.LineChart,
        reportTypes.RadarChart,
        reportTypes.FunnelChart,
        reportTypes.DualAxes,
      ].includes(reportType)
    ) {
      const { map, contrastMap } = reportData;
      return map.length || contrastMap.length ? (
        <Chart
          reportData={{
            ...currentReport,
            map,
            contrastMap,
            reportId
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.PieChart].includes(reportType)) {
      const { aggregations } = reportData;
      return aggregations.length && aggregations.filter(item => item.v).length ? (
        <Chart
          reportData={{
            ...currentReport,
            aggregations,
            reportId
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.NumberChart].includes(reportType)) {
      const params = {
        ...reportData,
        yaxisList: currentReport.yaxisList,
      };
      return <Chart reportData={params} />;
    }
  }
  renderCharts() {
    const { currentReport } = this.state;
    const { reportType } = currentReport;
    return (
      <div className="charts flexRow pLeft20 pRight20">
        {chartNav.map((item, index) => (
          <div
            key={index}
            data-tip={item.name}
            onClick={() => {
              this.handleUpdateReportType(item.type);
            }}
            className={cx('chartItem', { active: reportType === item.type })}
          >
            <Icon icon={item.icon} />
          </div>
        ))}
      </div>
    );
  }
  renderSetting() {
    const { projectId, sourceType } = this.props;
    const {
      currentReport,
      reportData,
      axisControls,
      worksheetInfo,
      filterItem,
      chartIsUnfold,
    } = this.state;
    const xAxisisTime = isTimeControl(currentReport.xaxes.controlId, axisControls);

    if (!chartIsUnfold) {
      return (
        <div className="setting flexColumn small">
          <div className="pAll20">
            <div className="flexColumn valignWrapper mTop9 mBottom20">
              <Icon
                className="Gray_9e Font18 pointer"
                icon="arrow-left-border"
                onClick={() => {
                  this.setState({ chartIsUnfold: !chartIsUnfold });
                }}
              />
              <div className="Font18 Bold flex AllBreak mTop15">{_l('图表')}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="setting flexColumn">
        <div className="flexColumn pTop20 pBottom20 h100">
          <div className="flexRow valignWrapper mTop4 mBottom20 pLeft20 pRight20">
            <div className="Font18 Bold flex">{_l('图表')}</div>
            <Icon
              className="Gray_9e Font18 pointer"
              icon="arrow-right-border"
              onClick={() => {
                this.setState({ chartIsUnfold: !chartIsUnfold });
              }}
            />
          </div>
          <ScrollView className="flex">
            {this.renderCharts()}
            <Tabs className="chartTabs pLeft20 pRight20" defaultActiveKey="setting">
              <Tabs.TabPane tab={_l('配置')} key="setting">
                <ChartSetting
                  sourceType={sourceType}
                  projectId={projectId}
                  filterItem={filterItem}
                  currentReport={currentReport}
                  axisControls={axisControls}
                  worksheetInfo={worksheetInfo}
                  onUpdateDisplaySetup={this.handleDisplaySetup}
                  onChangeCurrentReport={this.handleChangeCurrentReport}
                  onChangeFilterItem={this.handleChangeFilterItem}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={_l('样式')} key="style">
                <ChartStyle
                  xAxisisTime={xAxisisTime}
                  currentReport={currentReport}
                  reportData={reportData}
                  worksheetInfo={worksheetInfo}
                  onUpdateDisplaySetup={this.handleDisplaySetup}
                  onChangeCurrentReport={this.handleChangeCurrentReport}
                />
              </Tabs.TabPane>
            </Tabs>
          </ScrollView>
        </div>
      </div>
    );
  }
  renderHeaderDisplaySetup() {
    const { currentReport, reportData, axisControls, settingVisible } = this.state;
    const isDualAxes = reportTypes.DualAxes === currentReport.reportType;
    const { xaxes, displaySetup, yreportType, sorts } = currentReport;
    const xAxisisTime = isTimeControl(xaxes.controlId, axisControls);
    return (
      <div className="flexRow valignWrapper Font13 Gray_75">
        {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.FunnelChart, reportTypes.DualAxes].includes(
          currentReport.reportType,
        ) && settingVisible && (
          <Fragment>
            <HeaderDisplaySetup
              title={isDualAxes ? _l('左Y轴(%0)', _.find(chartNav, { type: yreportType || 1 }).name) : null}
              displaySetup={displaySetup}
              mapKeys={Object.keys(reportData.map || [])}
              reportType={isDualAxes ? yreportType : reportData.reportType}
              xAxisisTime={xAxisisTime}
              onUpdateDisplaySetup={(data, name) => {
                if (name === 'default') {
                  this.handleChangeCurrentReport(
                    {
                      displaySetup: data,
                      sorts: [],
                    },
                    true,
                  );
                } else if (name === 'isPile' && !isDualAxes && _.find(sorts, xaxes.controlId)) {
                  this.handleChangeCurrentReport({
                    displaySetup: data,
                    sorts: sorts.filter(item => _.findKey(item) !== xaxes.controlId),
                  });
                } else {
                  this.handleDisplaySetup(data);
                }
              }}
              chartType={reportData.reportType}
            />
            {currentReport.rightY && currentReport.rightY.display && (
              <HeaderDisplaySetup
                title={_l('右Y轴(折线图)')}
                displaySetup={currentReport.rightY.display}
                mapKeys={Object.keys(reportData.contrastMap || [])}
                reportType={currentReport.rightY.reportType}
                xAxisisTime={xAxisisTime}
                onUpdateDisplaySetup={data => {
                  this.setState({
                    currentReport: {
                      ...currentReport,
                      rightY: {
                        ...currentReport.rightY,
                        display: data,
                      },
                    },
                  });
                }}
              />
            )}
          </Fragment>
        )}
      </div>
    );
  }
  renderChartHeader() {
    const { sourceType, permissions } = this.props;
    const { settingVisible, scopeVisible, currentReport, reportData, reportId, worksheetInfo, axisControls } = this.state;
    const xAxisisTime = isTimeControl(currentReport.xaxes.controlId, axisControls);
    return (
      <div className="chartHeader mBottom10">
        {this.renderHeaderDisplaySetup()}
        <div className="flexRow valignWrapper">
          {reportTypes.PivotTable == reportData.reportType && !settingVisible && (
            <Tooltip title={_l('导出')} placement="bottom">
              <div
                className="displaySetup flexRow valignWrapper"
                onClick={() => {
                  exportPivotTable(reportId, sourceType ? worksheetInfo.worksheetId : null);
                }}
              >
                <div className="item h100 pAll5">
                  <Icon className="Font20 Gray_9e" icon="file_download" />
                </div>
              </div>
            </Tooltip>
          )}
          {!settingVisible && (
            <div
              className="displaySetup flexRow valignWrapper"
              onClick={() => {
                this.setState({
                  scopeVisible: !scopeVisible
                });
              }}
            >
              <div className="item h100 pAll5">
                <Icon className={cx('Font20 Gray_9e', { active: scopeVisible })} icon="filter" />
              </div>
            </div>
          )}
          <Sort
            controls={axisControls}
            xAxisisTime={xAxisisTime}
            currentReport={currentReport}
            reportType={reportData.reportType}
            map={reportData.map}
            valueMap={reportData.valueMap}
            onChangeCurrentReport={data => {
              this.handleChangeCurrentReport(data, true);
            }}
          />
        </div>
      </div>
    );
  }
  renderContent() {
    const {
      settingVisible,
      currentReport,
      reportData,
      loading,
      worksheetInfo,
      axisControls,
      dataIsUnfold,
      reportId,
      filterItem,
      scopeVisible
    } = this.state;
    const { permissions, appId, projectId, sourceType } = this.props;
    const { viewId } = currentReport.filter;
    const view = _.find(worksheetInfo.views, { viewId });
    const xAxisisTime = isTimeControl(currentReport.xaxes.controlId, axisControls);
    return (
      <Fragment>
        <div className="chart flexColumn">
          {reportData.status ? this.renderChartHeader() : null}
          {loading ? <Loading /> : reportData.status ? this.renderChart() : <Abnormal isEdit={settingVisible ? !(viewId && _.isEmpty(view)) : false} />}
        </div>
        {settingVisible && permissions ? (
          <div className="ChartDialogSetting flexRow h100">
            <DndProvider key="statistics" context={window} backend={HTML5Backend}>
              <DataSource
                dataIsUnfold={dataIsUnfold}
                appId={appId}
                projectId={projectId}
                sourceType={sourceType}
                worksheetInfo={worksheetInfo}
                axisControls={axisControls}
                currentReport={currentReport}
                onChangeCurrentReport={this.handleChangeCurrentReport}
                onChangeDataIsUnfold={() => {
                  this.setState({
                    dataIsUnfold: !dataIsUnfold,
                  });
                }}
                onChangeSheetId={activeSheetId => {
                  const { reportType } = this.state.reportData;
                  this.setState(
                    {
                      chartType: reportType,
                      reportData: {},
                      currentReport: {
                        ...currentReport,
                        xaxes: {},
                        yaxisList: [],
                      },
                      activeSheetId,
                      reportId: null,
                    },
                    () => {
                      this.getReportConfigDetail();
                    },
                  );
                }}
              />
              {this.renderSetting()}
            </DndProvider>
          </div>
        ) : null}
        {scopeVisible && (
          <div className="ChartDialogSetting flexRow h100">
          <FilterScope
            worksheetInfo={worksheetInfo}
            id={reportId}
            projectId={projectId}
            xAxisisTime={xAxisisTime}
            currentReport={currentReport}
            filterItem={filterItem}
            controls={axisControls.filter(item => isTimeControl(item.type))}
            onChangeCurrentReport={this.handleChangeCurrentReport}
            onUpdateFilter={filter => {
              this.setState({
                currentReport: {
                  ...currentReport,
                  filter
                }
              }, this.getReportData);
            }}
          />
          </div>
        )}
      </Fragment>
    );
  }
  render() {
    const { reportData, detailLoading } = this.state;

    const dialogProps = {
      className: 'ChartDialog',
      okText: _l('确认'),
      width: document.body.clientWidth - 128,
      type: 'fixed',
      visible: true,
      overlayClosable: false,
      onCancel: this.handleCancel,
      closable: false,
      title: this.renderHeader(),
    };

    return (
      <Dialog {...dialogProps}>{detailLoading || _.isEmpty(reportData) ? <Loading /> : this.renderContent()}</Dialog>
    );
  }
}
