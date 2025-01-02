import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon, Dialog, ScrollView, LoadDiv } from 'ming-ui';
import { DndProvider } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import reportConfig from '../api/reportConfig';
import { Tabs, Button, ConfigProvider, Tooltip } from 'antd';
import DataSource from '../components/DataSource';
import ChartSetting from '../components/ChartSetting';
import ChartStyle from '../components/ChartStyle';
import ChartAnalyse from '../components/ChartAnalyse';
import FilterScope from '../components/FilterScope';
import { Loading } from '../components/ChartStatus';
import MoreOverlay from '../Card/MoreOverlay';
import Chart from './Chart';
import Header from './Header';
import Operation from './Operation';
import DisplaySetup from './DisplaySetup';
import worksheetAjax from 'src/api/worksheet';
import DocumentTitle from 'react-document-title';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { chartNav, getNewReport } from '../common';
import { reportTypes } from '../Charts/common';
import './index.less';
import store from 'redux/configureStore';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions.js';
import _ from 'lodash';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'axisControls', 'worksheetInfo', 'reportData', 'filterItem', 'detailLoading', 'loading', 'base', 'direction'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartDialog extends Component {
  static propTypes = {
    appId: PropTypes.string,
    projectId: PropTypes.string,
    worksheetId: PropTypes.string,
    nodialog: PropTypes.bool,
    settingVisible: PropTypes.bool,
    scopeVisible: PropTypes.bool,
    permissions: PropTypes.bool,
    report: PropTypes.shape({}),
    updateDialogVisible: PropTypes.func,
    onGetReportConfigList: PropTypes.func,
  }
  static defaultProps = {
    nodialog: false,
    settingVisible: true,
    scopeVisible: false,
    sheetVisible: false,
    permissions: true,
  }
  constructor(props) {
    super(props);
    const { settingVisible, scopeVisible, sheetVisible, report, worksheetId, viewId, activeData } = props;
    this.state = {
      reportId: report.id,
      worksheetId,
      viewId,
      settingVisible,
      scopeVisible,
      sheetVisible,
      saveLoading: false,
      chartIsUnfold: true,
      dataIsUnfold: true,
      activeData
    }
  }
  componentDidMount() {
    this.getReportConfigDetail();
  }
  componentWillUnmount() {
    this.props.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { activeData } = this.state;
    if (!nextProps.loading && this.props.loading && !_.isEmpty(activeData)) {
      this.props.requestOriginalData(activeData);
      this.setState({ activeData: null });
    }
  }
  getReportConfigDetail(reportType) {
    const { base, report = {}, permissions, pageId, ownerId, sourceType, filters, filtersGroup, linkageFiltersGroup, customPageConfig = {}, appType } = this.props;
    const { reportId, worksheetId, viewId, settingVisible, sheetVisible } = this.state;
    this.props.changeBase({
      permissions,
      report,
      sourceType,
      appType: base.appType || appType,
      isPublic: !ownerId,
      sheetId: worksheetId,
      viewId,
      pageId,
      settingVisible,
      sheetVisible,
      filters,
      filtersGroup,
      linkageFiltersGroup
    });
    this.props.getReportConfigDetail({
      reportId,
      appId: worksheetId,
      reportType,
      customPageConfig
    });
  }
  handleCancel = () => {
    const { currentReport } = this.props;
    this.props.updateDialogVisible({
      dialogVisible: false,
      isRequest: false,
      reportName: currentReport.name,
      reportDesc: currentReport.desc
    });
  }
  handleSave = () => {
    const { appType } = this.props.base;
    const data = getNewReport(this.props);
    delete data.filter.filterControls;
    reportConfig.saveReportConfig({
      ...data,
      appType
    }).then(result => {
      const { updateDialogVisible } = this.props;
      updateDialogVisible({
        dialogVisible: false,
        isRequest: true,
        reportId: result.reportId,
        reportName: data.name,
        reportType: data.reportType,
        worksheetId: data.appId
      });
    });
  }
  handleVerifySave = () => {
    const { xaxes, yaxisList, reportType, pivotTable } = this.props.currentReport;
    if (!reportType) {
      alert(_l('请选择图表类型'), 2);
      return;
    }
    if (reportType == reportTypes.NumberChart) {
      if (_.isEmpty(yaxisList)) {
        alert(_l('请配置维度后再保存图表'), 2);
      } else {
        this.handleSaveFilter();
      }
      return;
    }
    if (reportType == reportTypes.PivotTable) {
      this.handleSaveFilter();
      return;
    } else {
      if (_.isEmpty(yaxisList)) {
        alert(_l('请配置维度和数值后再保存图表'), 2);
      } else {
        this.handleSaveFilter();
      }
      return;
    }
    this.handleSaveFilter();
  }
  handleSaveFilter = () => {
    const { filterItem, currentReport, worksheetInfo } = this.props;
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
        currentReport.filter.filterId = result.filterId;
        this.handleSave();
      });
  }
  handleChangeSheetVisible = (value) => {
    this.props.changeBase({
      sheetVisible: value
    });
  }
  handleUpdateReportType(type) {
    const { currentReport, loading } = this.props;
    if (loading || type === currentReport.reportType) return;
    this.getReportConfigDetail(type);
  }
  renderHeader() {
    const { report, permissions, isCharge, isLock, permissionType, sourceType = 0, currentReport, customPageConfig, reportData, worksheetInfo, base, onRemove, ownerId, projectId, onCancelFavorite } = this.props;
    const { saveLoading, settingVisible } = this.state;
    const isPublicShareChart = location.href.includes('public/chart');
    const isPublicSharePage = window.shareAuthor || _.get(window, 'shareState.shareId');
    return (
      <div className="header valignWrapper">
        <Header {...this.props} />
        <div className="flexRow valignWrapper settingWrapper">
          {settingVisible && (
            <ConfigProvider autoInsertSpaceInButton={false}>
              <Button className="buttonSave" block shape="round" type="primary" onClick={this.handleVerifySave}>
                {saveLoading ? <LoadDiv size="small" /> : _l('保存')}
              </Button>
            </ConfigProvider>
          )}
          {!settingVisible && report.id && (sourceType === 1 ? isCharge : permissions) && (
            <Tooltip title={_l('设置')} placement="bottom">
              <Icon
                icon="settings"
                className={cx('Font20 pointer Gray_9e', { active: settingVisible })}
                onClick={() => {
                  this.setState({
                    settingVisible: !settingVisible,
                    scopeVisible: false,
                    sheetVisible: false
                  }, () => {
                    this.props.changeBase({
                      settingVisible: !settingVisible,
                      sheetVisible: false,
                      reportSingleCacheId: null,
                      apkId: null,
                      match: null
                    });
                    this.props.getReportData();
                  });
                }}
              />
            </Tooltip>
          )}
          {!settingVisible && this.renderChartOperation()}
          {!settingVisible && !isPublicShareChart && !isPublicSharePage && (
            <MoreOverlay
              className="Gray_9e pointer mLeft16 Font24"
              reportType={currentReport.reportType}
              reportData={reportData}
              reportStatus={reportData.status}
              favorite={reportData.favorite}
              onCancelFavorite={onCancelFavorite}
              permissions={permissions}
              isCharge={isCharge}
              isLock={isLock}
              permissionType={permissionType}
              sourceType={sourceType}
              isMove={sourceType ? false : permissions && isCharge}
              report={report}
              filter={currentReport.filter}
              exportData={{
                filters: base.filters,
                filtersGroup: base.filtersGroup,
                linkageFiltersGroup: base.linkageFiltersGroup,
                sorts: currentReport.sorts,
                particleSizeType: currentReport.particleSizeType,
                ...currentReport.filter
              }}
              customPageConfig={customPageConfig}
              sheetVisible={base.sheetVisible}
              projectId={projectId}
              appId={worksheetInfo.appId}
              worksheetId={reportData.appId}
              onRemove={sourceType ? false : (permissions && report.id && onRemove)}
              ownerId={ownerId}
            />
          )}
          {!isPublicShareChart && (
            <Tooltip title={_l('关闭')} placement="bottom">
              <Icon icon="close" className="Font24 pointer mLeft16 Gray_9e" onClick={this.handleCancel} />
            </Tooltip>
          )}
        </div>
        {isPublicShareChart && <DocumentTitle title={currentReport.name}/>}
      </div>
    );
  }
  renderCharts() {
    const { currentReport } = this.props;
    const { reportType, displaySetup } = currentReport;
    return (
      <div className="charts flexRow pLeft20 pRight20">
        {chartNav.map((item, index) => (
          <Fragment key={index}>
            <div
              data-tip={item.name}
              onClick={() => {
                if (item.type === reportTypes.BarChart) {
                  this.props.changeCurrentReport({
                    displaySetup: {
                      ...displaySetup,
                      showChartType: 1,
                    }
                  });
                }
                this.handleUpdateReportType(item.type);
              }}
              className={cx('chartItem', { active: item.type === reportTypes.BarChart ? (reportType === reportTypes.BarChart && displaySetup.showChartType === 1) : reportType === item.type })}
            >
              <Icon icon={item.icon} />
            </div>
            {item.type === reportTypes.BarChart && (
              <div
                data-tip={_l('横向柱图')}
                onClick={() => {
                  this.props.changeCurrentReport({
                    displaySetup: {
                      ...displaySetup,
                      showChartType: 2,
                    }
                  });
                  if (reportType !== reportTypes.BarChart) {
                    this.handleUpdateReportType(item.type);
                  }
                }}
                className={cx('chartItem', { active: reportType === reportTypes.BarChart && displaySetup.showChartType === 2 })}
              >
                <Icon icon="stats_bar_chart1" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    );
  }
  renderChart() {
    const { projectId, base, isCharge, themeColor, customPageConfig = {} } = this.props;
    const { settingVisible, scopeVisible } = this.state;
    return (
      <Chart
        projectId={projectId}
        customPageConfig={customPageConfig}
        themeColor={themeColor || _.get(store.getState(), 'appPkg.iconColor')}
        sheetVisible={base.sheetVisible}
        settingVisible={settingVisible}
        scopeVisible={scopeVisible}
        isCharge={isCharge}
        renderHeaderDisplaySetup={this.renderHeaderDisplaySetup}
        onChangeSheetVisible={(visible) => {
          this.handleChangeSheetVisible(visible);
        }}
      />
    );
  }
  renderSetting() {
    const { projectId, reportData, currentReport, sourceType, themeColor, customPageConfig = {} } = this.props;
    const { chartIsUnfold } = this.state;

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
                  projectId={projectId}
                  sourceType={sourceType}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={_l('样式')} key="style" disabled={reportData.status <= 0}>
                <ChartStyle
                  projectId={projectId}
                  sourceType={sourceType}
                  themeColor={themeColor || _.get(store.getState(), 'appPkg.iconColor')}
                  customPageConfig={customPageConfig}
                />
              </Tabs.TabPane>
              {![reportTypes.GaugeChart, reportTypes.ProgressChart].includes(currentReport.reportType) && (
                <Tabs.TabPane tab={_l('分析')} key="analyse" disabled={reportData.status <= 0}>
                  <ChartAnalyse
                    sourceType={sourceType}
                    reportId={this.state.reportId}
                  />
                </Tabs.TabPane>
              )}
            </Tabs>
          </ScrollView>
        </div>
      </div>
    );
  }
  renderHeaderDisplaySetup = () => {
    const { settingVisible } = this.state;
    return (
      <DisplaySetup settingVisible={settingVisible}>
        {settingVisible && this.renderChartOperation()}
      </DisplaySetup>
    );
  }
  renderChartOperation = () => {
    const { sourceType, base, direction } = this.props;
    const { settingVisible, scopeVisible } = this.state;
    return (
      <Fragment>
        <Operation
          sheetVisible={base.sheetVisible}
          direction={direction}
          settingVisible={settingVisible}
          scopeVisible={scopeVisible}
          sourceType={sourceType}
          onChangeScopeVisible={( scopeVisible ) => {
            this.setState({ scopeVisible });
          }}
          onChangeSheetVisible={() => {
            if (settingVisible) {
              this.props.changeDirection('vertical');
            }
            this.handleChangeSheetVisible(!base.sheetVisible);
          }}
          onChangeDirection={() => {
            if (base.sheetVisible) {
              this.props.changeDirection();
            } else {
              this.handleChangeSheetVisible(!base.sheetVisible);
            }
          }}
        />
      </Fragment>
    );
  }
  renderContent() {
    const {
      settingVisible,
      dataIsUnfold,
      reportId,
      scopeVisible
    } = this.state;
    const {
      permissions,
      appId,
      projectId,
      sourceType,
      ownerId,
      currentReport
    } = this.props;

    return (
      <ErrorBoundary>
        {this.renderChart()}
        {settingVisible && permissions && (
          <div className="ChartDialogSetting flexRow h100">
            <DndProvider key="statistics" context={window} backend={HTML5Backend}>
              <DataSource
                dataIsUnfold={dataIsUnfold}
                ownerId={ownerId}
                appId={appId}
                projectId={projectId}
                sourceType={sourceType}
                onChangeDataIsUnfold={() => {
                  this.setState({
                    dataIsUnfold: !dataIsUnfold,
                  });
                }}
                onChangeSheetId={worksheetId => {
                  const { reportType } = this.props.reportData;
                  this.props.changeSheetId(worksheetId);
                  this.props.changeBase({ sheetId: worksheetId });
                  this.setState({ worksheetId, reportId: null });
                }}
              />
              {this.renderSetting()}
            </DndProvider>
          </div>
        )}
        {scopeVisible && !_.isEmpty(currentReport) && (
          <div className="ChartDialogSetting flexRow h100">
            <FilterScope id={reportId} projectId={projectId} />
          </div>
        )}
      </ErrorBoundary>
    );
  }
  render() {
    const { nodialog, reportData, detailLoading, className } = this.props;

    const content = detailLoading ? <Loading /> : this.renderContent();

    if (nodialog) {
      return (
        <div className={cx('ChartDialog', className)}>
          {this.renderHeader()}
          <div className="flexRow flex overflowHidden">
            {content}
          </div>
        </div>
      );
    }

    const dialogProps = {
      dialogClasses: 'ChartDialogContainer',
      className: cx('ChartDialog', className),
      okText: _l('确认'),
      width: document.body.clientWidth - 64,
      type: 'fixed',
      visible: true,
      overlayClosable: false,
      onCancel: this.handleCancel,
      closable: false,
      title: this.renderHeader(),
    }

    return (
      <Dialog {...dialogProps}>{content}</Dialog>
    );
  }
}
