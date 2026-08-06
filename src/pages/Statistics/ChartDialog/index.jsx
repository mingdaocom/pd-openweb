import React, { Component, Fragment, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import { Button, ConfigProvider } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import reportConfig from '../api/reportConfig';
import projectController from 'src/api/project';
import worksheetApi from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import store from 'src/redux/configureStore';
import MoreOverlay from '../Card/MoreOverlay';
import { reportTypes } from '../Charts/common';
import { getNewReport } from '../common/reportConfigUtils';
import { Loading } from '../components/ChartStatus';
import * as actions from '../redux/actions.js';
import Chart from './Chart';
import DisplaySetup from './DisplaySetup';
import Header from './Header';
import Operation from './Operation';
import './index.less';

const LoadableEditorPanel = lazy(() => import('./EditorPanel'));
const LoadableFilterScope = lazy(() => import('../components/FilterScope'));
let ChartDialog = class ChartDialog extends Component {
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
  };
  static defaultProps = {
    nodialog: false,
    settingVisible: true,
    scopeVisible: false,
    sheetVisible: false,
    permissions: true,
  };

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
      activeData,
    };
  }

  componentDidMount() {
    this.getReportConfigDetail();

    if (!window.shareState.shareId) {
      this.getProjectInfo();
    }
  }

  componentWillUnmount() {
    this.props.destroy();
    delete window[`filterReportId-${this.state.reportId}`];
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { activeData } = this.state;

      if (!this.props.loading && prevProps.loading && !_.isEmpty(activeData)) {
        prevProps.requestOriginalData(activeData);
        this.setState({
          activeData: null,
        });
      }
    }
  }

  getReportConfigDetail(reportType) {
    const {
      base,
      report = {},
      permissions,
      pageId,
      ownerId,
      sourceType,
      filters,
      filtersGroup,
      linkageFiltersGroup,
      customPageConfig = {},
      appType,
    } = this.props;
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
      linkageFiltersGroup,
    });
    this.props.getReportConfigDetail({
      reportId,
      appId: worksheetId,
      reportType,
      customPageConfig,
    });
  }

  getProjectInfo() {
    projectController
      .getProjectInfo(
        {
          projectId: this.props.projectId,
        },
        {
          silent: true,
        },
      )
      .then(res => {
        this.setState({
          geoCountryRegionCode: res.geoCountryRegionCode,
        });
      });
  }

  handleCancel = () => {
    const { currentReport } = this.props;
    this.props.updateDialogVisible({
      dialogVisible: false,
      isRequest: false,
      reportName: currentReport.name,
      reportDesc: currentReport.desc,
    });
    this.props.closeCurrentReport();
  };
  handleSave = () => {
    const { appType } = this.props.base;
    const data = getNewReport(this.props);
    delete data.filter.filterControls;
    reportConfig.saveReportConfig({ ...data, appType }).then(result => {
      const { updateDialogVisible } = this.props;
      updateDialogVisible({
        dialogVisible: false,
        isRequest: true,
        reportId: result.reportId,
        reportName: data.name,
        reportType: data.reportType,
        worksheetId: data.appId,
      });
    });
  };
  handleVerifySave = () => {
    const { loading, currentReport, reportData } = this.props;
    const { yaxisList, reportType } = currentReport;
    const { status } = reportData;

    if (!reportType) {
      alert(_l('请选择图表类型'), 2);
      return;
    }

    if (status !== 1 && !loading) {
      if (status === -1) {
        alert(_l('无权限'), 2);
        return;
      } else if (status === -2) {
        // alert(_l('数据量过大，请添加时间范围或添加筛选条件减少数据量'), 2);
        // return;
      } else {
        alert(_l('选择或将字段拖拽到右侧维度、数值栏添加数据'), 2);
        return;
      }
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
  };
  handleSaveFilter = () => {
    const { filterItem, currentReport, worksheetInfo } = this.props;
    const { filter } = currentReport;
    const { appId } = this.props;
    this.setState({
      saveLoading: true,
    });

    if (_.isEmpty(filter.filterId) && _.isEmpty(filterItem)) {
      this.handleSave();
      return;
    }

    worksheetApi
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
  };
  handleChangeSheetVisible = value => {
    this.props.changeBase({
      sheetVisible: value,
    });
  };
  handleUpdateReportType = type => {
    const { currentReport, loading } = this.props;
    if (loading || type === currentReport.reportType) return;
    this.getReportConfigDetail(type);
  };

  renderHeader() {
    const {
      report,
      permissions,
      isCharge,
      isLock,
      permissionType,
      sourceType = 0,
      currentReport,
      customPageConfig,
      reportData,
      worksheetInfo,
      base,
      onRemove,
      ownerId,
      projectId,
      onCancelFavorite,
    } = this.props;
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
                className={cx('Font20 pointer textTertiary', {
                  active: settingVisible,
                })}
                onClick={() => {
                  this.setState(
                    {
                      settingVisible: !settingVisible,
                      scopeVisible: false,
                      sheetVisible: false,
                    },
                    () => {
                      this.props.changeBase({
                        settingVisible: !settingVisible,
                        sheetVisible: false,
                        reportSingleCacheId: null,
                        apkId: null,
                        match: null,
                      });
                      this.props.getReportData();
                    },
                  );
                }}
              />
            </Tooltip>
          )}
          {!settingVisible && this.renderChartOperation()}
          {!settingVisible && !isPublicShareChart && !isPublicSharePage && (
            <MoreOverlay
              className="textTertiary pointer mLeft16 Font24"
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
                ...currentReport.filter,
              }}
              customPageConfig={customPageConfig}
              sheetVisible={base.sheetVisible}
              projectId={projectId}
              appId={worksheetInfo.appId}
              worksheetId={reportData.appId}
              onRemove={sourceType ? false : permissions && report.id && onRemove}
              ownerId={ownerId}
            />
          )}
          {!isPublicShareChart && (
            <Tooltip title={_l('关闭')} placement="bottom">
              <Icon icon="close" className="Font24 pointer mLeft16 textTertiary" onClick={this.handleCancel} />
            </Tooltip>
          )}
        </div>
        {isPublicShareChart && <DocumentTitle title={currentReport.name} />}
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
        onChangeSheetVisible={visible => {
          this.handleChangeSheetVisible(visible);
        }}
      />
    );
  }

  renderHeaderDisplaySetup = () => {
    const { settingVisible } = this.state;
    return <DisplaySetup settingVisible={settingVisible}>{settingVisible && this.renderChartOperation()}</DisplaySetup>;
  };
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
          appId={this.props.appId}
          projectId={this.props.projectId}
          onChangeScopeVisible={scopeVisible => {
            this.setState({
              scopeVisible,
            });
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
  };

  renderContent() {
    const { settingVisible, dataIsUnfold, reportId, scopeVisible, chartIsUnfold, geoCountryRegionCode } = this.state;
    const {
      permissions,
      permissionType,
      appId,
      projectId,
      sourceType,
      ownerId,
      currentReport,
      reportData,
      loading,
      themeColor,
      customPageConfig = {},
    } = this.props;
    return (
      <ErrorBoundary>
        {this.renderChart()}
        {settingVisible && permissions && (
          <Suspense fallback={<LoadDiv className="mTop10" />}>
            <LoadableEditorPanel
              appId={appId}
              projectId={projectId}
              sourceType={sourceType}
              permissionType={permissionType}
              ownerId={ownerId}
              currentReport={currentReport}
              reportData={reportData}
              loading={loading}
              themeColor={themeColor}
              customPageConfig={customPageConfig}
              reportId={reportId}
              dataIsUnfold={dataIsUnfold}
              chartIsUnfold={chartIsUnfold}
              geoCountryRegionCode={geoCountryRegionCode}
              changeCurrentReport={this.props.changeCurrentReport}
              onUpdateReportType={this.handleUpdateReportType}
              onToggleChartUnfold={() => {
                this.setState({
                  chartIsUnfold: !chartIsUnfold,
                });
              }}
              onChangeDataIsUnfold={() => {
                this.setState({
                  dataIsUnfold: !dataIsUnfold,
                });
              }}
              onChangeSheetId={worksheetId => {
                this.props.changeSheetId(worksheetId);
                this.props.changeBase({
                  sheetId: worksheetId,
                });
                this.setState({
                  worksheetId,
                  reportId: null,
                });
              }}
            />
          </Suspense>
        )}
        {scopeVisible && !_.isEmpty(currentReport) && (
          <div className="ChartDialogSetting flexRow h100">
            <Suspense fallback={<LoadDiv className="mTop10" />}>
              <LoadableFilterScope id={reportId} projectId={projectId} />
            </Suspense>
          </div>
        )}
      </ErrorBoundary>
    );
  }

  render() {
    const { nodialog, detailLoading, className } = this.props;
    const content = detailLoading ? <Loading /> : this.renderContent();

    if (nodialog) {
      return (
        <div className={cx('ChartDialog', className)}>
          {this.renderHeader()}
          <div className="flexRow flex overflowHidden">{content}</div>
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
    };
    return <Dialog {...dialogProps}>{content}</Dialog>;
  }
};
ChartDialog = connect(
  state => ({
    ..._.pick(state.statistics, [
      'currentReport',
      'axisControls',
      'worksheetInfo',
      'reportData',
      'filterItem',
      'detailLoading',
      'loading',
      'base',
      'direction',
    ]),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(ChartDialog);
export default ChartDialog;
