import React, { Component, Fragment, useMemo, useImperativeHandle, forwardRef } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import ChartDialog from '../ChartDialog';
import login from 'src/api/login';
import reportApi from '../api/report';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { fillValueMap } from '../common';
import { reportTypes } from '../Charts/common';
import { Loading, WithoutData, Abnormal } from '../components/ChartStatus';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import MoreOverlay from './MoreOverlay';
import charts from '../Charts';
import { browserIsMobile, getAppFeaturesPath } from 'src/util';
import './Card.less';

const isMobile = browserIsMobile();

let isCheckLogin = true;

@errorBoundary
class Card extends Component {
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
    this.isPublicShare = location.href.includes('public/page') || window.shareAuthor;
  }
  componentDidMount() {
    this.getData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.needUpdate !== this.props.needUpdate || !_.isEqual(nextProps.filtersGroup, this.props.filtersGroup)) {
      this.getData(nextProps);
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
      this.getData(this.props);
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
  getData = (props, reload = false) => {
    const { report, filters, filtersGroup } = props;
    const shareAuthor = window.shareAuthor;
    const headersConfig = {
      shareAuthor,
    };
    this.setState({ loading: true });
    this.abortRequest();
    this.request = reportApi.getData(
      {
        reportId: report.id,
        version: '6.5',
        reload,
        filters: [filters, filtersGroup].filter(_ => _)
      },
      {
        fireImmediately: true,
        headersConfig: shareAuthor ? headersConfig : undefined
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
    if (viewDataType === 2 && filter.viewId && [VIEW_DISPLAY_TYPE.sheet].includes(filter.viewType.toString())) {
      reportApi.getReportSingleCacheId({
        ...data,
        ...filter,
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
        isViewOriginalData={!this.isPublicShare}
        onOpenChartDialog={this.handleOpenChartDialog}
        reportData={{
          ...reportData,
          reportId: id
        }}
      />
    );
  }
  renderContent() {
    const { reportType, map, contrastMap, data } = this.state.reportData;

    if ([reportTypes.BarChart, reportTypes.LineChart, reportTypes.RadarChart, reportTypes.FunnelChart, reportTypes.DualAxes, reportTypes.CountryLayer].includes(reportType)) {
      return (map.length || contrastMap.length) ? this.renderChart() : <WithoutData />;
    }
    if ([reportTypes.PieChart].includes(reportType)) {
      return map.length ? this.renderChart() : <WithoutData />;
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
    const { report, appId, ownerId, roleType, sourceType, needEnlarge, needRefresh = true, worksheetId, filters, filtersGroup, className, onRemove, isCharge } = this.props;
    const permissions = ownerId || _.includes([1, 2], roleType);
    const isSheetView = ![reportTypes.PivotTable, reportTypes.NumberChart].includes(reportData.reportType);
    return (
      <div className={cx(`statisticsCard statisticsCard-${report.id} statisticsCard-${reportData.reportType}`, className)}>
        <div className="header">
          {permissions && (
            <span data-tip={_l('拖拽')} className="iconItem dragWrap Gray_9e">
              <Icon icon="drag" />
            </span>
          )}
          <div className="flex valignWrapper ellipsis">
            <div className="pointer ellipsis bold pLeft5">{reportData.name}</div>
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
            {needEnlarge && isSheetView && !!reportData.status && (
              <span
                className="iconItem Gray_9e"
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
                <Icon icon="table" />
              </span>
            )}
            {needRefresh && !!reportData.status && (
              <span onClick={() => this.getData(this.props, true)} data-tip={_l('刷新')} className="iconItem Gray_9e freshDataIconWrap">
                <Icon className="Font20" icon="refresh1" />
              </span>
            )}
            {needEnlarge && !!reportData.status && (
              <span
                className="iconItem Gray_9e"
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
            {needEnlarge && !this.isPublicShare && (sourceType ? !!reportData.status : true) && (
              <MoreOverlay
                className="iconItem Gray_9e Font20"
                permissions={sourceType ? null : permissions}
                isCharge={isCharge}
                reportStatus={reportData.reportType}
                reportType={reportData.reportType}
                filter={reportData.filter}
                isMove={permissions}
                onRemove={permissions && sourceType !== 1 ? onRemove : null}
                exportData={{
                  filters,
                  filtersGroup
                }}
                report={{
                  id: report.id,
                  name: reportData.name,
                  desc: reportData.desc
                }}
                ownerId={ownerId}
                appId={appId}
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
          </div>
        </div>
        {this.renderBody()}
        {dialogVisible && (
          <ChartDialog
            {...this.props}
            report={{
              ...report,
              name: reportData.name,
              desc: reportData.desc
            }}
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
                this.getData({
                  ...this.props,
                  report: { id: reportId },
                });
              }
            }}
            onRemove={onRemove}
          />
        )}
      </div>
    );
  }
}

function SingleCard(props, ref) {
  const store = useMemo(configureStore, []);

  useImperativeHandle(ref, () => ({
    dispatch: store.dispatch,
    getState: store.getState,
  }));

  return (
    <Provider store={store}>
      <Card {...props}/>
    </Provider>
  );
}

export default forwardRef(SingleCard);

