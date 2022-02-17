import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import ChartDialog from '../ChartDialog';
import login from 'src/api/login';
import report from '../api/report';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { fillValueMap } from '../common';
import { reportTypes } from '../Charts/common';
import { Loading, WithoutData, Abnormal } from '../components/ChartStatus';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import MoreOverlay from './MoreOverlay';
import charts from '../Charts';
import { browserIsMobile, getAppFeaturesPath } from 'src/util';
import './Card.less';

const isMobile = browserIsMobile();
const isPublicShare = location.href.includes('public/page');

let isCheckLogin = true;

@errorBoundary
export default class Card extends Component {
  static defaultProps = {
    needEnlarge: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      reportData: {},
      loading: true,
      settingVisible: true,
      scopeVisible: false,
      sheetVisible: false,
      activeData: undefined
    }
  }
  componentDidMount() {
    const { id } = this.props.report;
    this.getData(id);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.needUpdate !== this.props.needUpdate) {
      this.getData(nextProps.report.id);
    }
  }
  componentWillUnmount = () => {
    clearInterval(this.timer);
    this.abortRequest();
  }
  initInterval = () => {
    clearInterval(this.timer);
    const { report, needRefresh = true } = this.props;
    const { refreshReportInterval } = md.global.SysSettings;
    if (!needRefresh) return;
    this.timer = setInterval(() => {
      this.getData(report.id);
      if (isCheckLogin) {
        isCheckLogin = false;
        login.checkLogin({}).then(data => {
          isCheckLogin = data;
        });
      }
    }, refreshReportInterval * 1000);
  };

  abortRequest = () => {
    if (this.request && this.request.state() === 'pending' && this.request.abort) {
      this.request.abort();
    }
  }
  getData = (reportId, reload = false) => {
    this.setState({ loading: true });
    this.abortRequest();
    this.request = report.getData(
      {
        reportId,
        version: '6.5',
        reload
      },
      {
        fireImmediately: true,
      }
    );
    this.request.then(result => {
      this.setState({
        reportData: fillValueMap(result),
        loading: false,
      });
    });
    this.initInterval();
  }
  handleOperateClick = ({ settingVisible, sheetVisible = false, activeData }) => {
    this.setState({
      dialogVisible: true,
      settingVisible,
      scopeVisible: false,
      sheetVisible,
      activeData
    });
  }
  handleOpenChartDialog = (data) => {
    const { id } = this.props.report;
    const { reportData } = this.state;
    const { appId, filter, style } = reportData;
    const viewDataType = style ? (style.viewDataType || 1) : 1;
    if (viewDataType === 2 && filter.viewId && ![VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.gunter].includes(filter.viewType.toString())) {
      report.getReportSingleCacheId({
        ...data,
        isPersonal: true,
        reportId: id
      }).then(result => {
        if (result.id) {
          window.open(`/worksheet/${appId}/view/${filter.viewId}?chartId=${result.id}&${getAppFeaturesPath()}`);
        }
      });
    } else {
      this.handleOperateClick({
        settingVisible: false,
        sheetVisible: true,
        activeData: data
      });
    }
  }
  renderChart() {
    const { id } = this.props.report;
    const { loading, reportData } = this.state;
    const { reportType } = reportData;
    const Chart = charts[reportType];
    return (
      <Chart
        loading={loading}
        isThumbnail={true}
        isViewOriginalData={!isMobile && !isPublicShare}
        onOpenChartDialog={this.handleOpenChartDialog}
        reportData={{
          ...reportData,
          reportId: id
        }}
      />
    );
  }
  renderContent() {
    const { reportType, map, contrastMap, aggregations, data } = this.state.reportData;

    if ([reportTypes.BarChart, reportTypes.LineChart, reportTypes.RadarChart, reportTypes.FunnelChart, reportTypes.DualAxes, reportTypes.CountryLayer].includes(reportType)) {
      return (map.length || contrastMap.length) ? this.renderChart() : <WithoutData />;
    }
    if ([reportTypes.PieChart].includes(reportType)) {
      return aggregations.length ? this.renderChart() : <WithoutData />;
    }
    if ([reportTypes.NumberChart].includes(reportType)) {
      return this.renderChart();
    }
    if ([reportTypes.PivotTable].includes(reportType)) {
      return _.isEmpty(data.data) ? <WithoutData /> : this.renderChart();
    }
  }
  renderBody() {
    const { needRefresh } = this.props;
    const { loading, reportData } = this.state;

    if (reportData.reportType === reportTypes.CountryLayer && needRefresh) {
      return (
        <Fragment>
          {loading && (
            <div className="fixedLoading">
              <Loading />
            </div>
          )}
          {reportData.status ? this.renderContent() : <Abnormal />}
        </Fragment>
      );
    } else {
      return (
        <div className="content flexColumn">
          {loading ? <Loading /> : reportData.status ? this.renderContent() : <Abnormal />}
        </div>
      );
    }
  }
  render() {
    const { dialogVisible, reportData, settingVisible, scopeVisible, sheetVisible, activeData } = this.state;
    const { report, ownerId, roleType, sourceType, needEnlarge, needRefresh = true, worksheetId } = this.props;
    const permissions = ownerId || _.includes([1, 2], roleType);
    const isSheetView = ![reportTypes.PivotTable, reportTypes.NumberChart].includes(reportData.reportType);
    return (
      <div className={cx(`statisticsCard statisticsCard-${report.id} statisticsCard-${reportData.reportType}`, { card: !sourceType, padding: !sourceType })}>
        <div className="header">
          <div className="flex valignWrapper ellipsis">
            <div className="pointer ellipsis bold">{reportData.name}</div>
            {reportData.desc && (
              <Tooltip title={reportData.desc} placement="bottom">
                <Icon
                  icon="info"
                  className="Font18 pointer Gray_9e mLeft7 mRight7"
                />
              </Tooltip>
            )}
          </div>
          <div className="operateIconWrap valignWrapper Relative">
            {needEnlarge && !isPublicShare && isSheetView && (
              <span
                className="iconItem"
                data-tip={_l('以表格显示')}
                onClick={() => {
                  this.setState({
                    dialogVisible: true,
                    sheetVisible: true,
                    settingVisible: false,
                    scopeVisible: false,
                    activeData: undefined
                  });
                }}
              >
                <Icon icon="stats_table_chart" />
              </span>
            )}
            {needRefresh && (
              <span onClick={() => this.getData(report.id, true)} data-tip={_l('刷新')} className="iconItem freshDataIconWrap">
                <Icon icon="rotate" />
              </span>
            )}
            {needEnlarge && (
              <span
                className="iconItem"
                data-tip={_l('放大')}
                onClick={() => {
                  this.handleOperateClick({
                    settingVisible: false,
                    activeData: undefined
                  });
                }}
              >
                <Icon icon="task-new-fullscreen" />
              </span>
            )}
            {needEnlarge && !isPublicShare && (
              <MoreOverlay
                className="iconItem Font20"
                permissions={sourceType ? null : permissions}
                reportType={reportData.reportType}
                report={{
                  ...report,
                  desc: reportData.desc
                }}
                getPopupContainer={() => document.querySelector(`.statisticsCard-${report.id} .header .ant-dropdown-open`)}
                worksheetId={sourceType ? worksheetId : null}
                onOpenSetting={permissions ? () => {
                  this.handleOperateClick({
                    settingVisible: true,
                    activeData: undefined
                  });
                } : null}
                onOpenFilter={() => {
                  this.setState({
                    dialogVisible: true,
                    sheetVisible: false,
                    settingVisible: false,
                    scopeVisible: true,
                    activeData: undefined
                  });
                }}
              />
            )}
            {permissions && (
              <span data-tip={_l('拖拽')} className="iconItem">
                <Icon icon="drag" />
              </span>
            )}
          </div>
        </div>
        {this.renderBody()}
        {dialogVisible && (
          <ChartDialog
            {...this.props}
            activeData={activeData}
            worksheetId={reportData.appId}
            settingVisible={settingVisible}
            scopeVisible={scopeVisible}
            sheetVisible={sheetVisible}
            permissions={permissions}
            dialogVisible={dialogVisible}
            updateDialogVisible={({ dialogVisible, isRequest, reportId, reportName, reportDesc }) => {
              this.setState({ dialogVisible });
              if (reportName !== reportData.name || reportDesc !== reportData.desc) {
                this.setState({
                  reportData: {
                    ...reportData,
                    name: reportName,
                    desc: reportDesc
                  }
                });
              }
              if (isRequest) {
                this.getData(reportId);
              }
            }}
            onRemove={this.props.onRemove}
          />
        )}
      </div>
    );
  }
}
