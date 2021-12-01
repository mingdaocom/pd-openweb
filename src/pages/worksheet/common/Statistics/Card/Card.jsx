import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Dialog } from 'ming-ui';
import ChartDialog from '../ChartDialog';
import login from 'src/api/login';
import report from '../api/report';
import reportConfig from '../api/reportConfig';
import { fillValueMap, exportPivotTable } from '../common';
import { reportTypes } from '../Charts/common';
import { Loading, WithoutData, Abnormal } from '../components/ChartStatus';
import charts from '../Charts';
import './Card.less';

const confirm = Dialog.confirm;

let isCheckLogin = true;

export default class Card extends Component {
  static defaultProps = {
    needEnlarge: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      dropdownValue: 0,
      reportData: {},
      loading: true,
      settingVisible: true,
    };
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
  };

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
  };

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
  };
  handleDropdownChange(value) {
    this.setState({
      dropdownValue: value,
    });
  }
  handleDelete() {
    const { id, name } = this.props.report;
    confirm({
      title: <span className="Red">{_l('您确定要删除表“%0” ?', name)}</span>,
      onOk: () => {
        this.props.onDelete(id);
      },
    });
  }
  handleBlur(event) {
    const { id, name: oldName } = this.props.report;
    const value = event.target.value.trim();
    if (value) {
      reportConfig
        .updateReportName({
          reportId: id,
          name: value,
        })
        .then(
          result => {
            this.props.onUpdateName(id, value);
          },
          error => {}
        );
    } else {
      this.props.onUpdateName(id, oldName);
    }
  }
  handleUpdateOwnerId() {
    const { report } = this.props;
    this.props.onUpdateOwnerId(report);
  }
  handleCopyCustomPage() {
    const { report } = this.props;
    this.props.onCopyCustomPage(report);
  }
  handleOperateClick = (settingVisible) => {
    this.setState({
      dialogVisible: true,
      settingVisible,
    });
  };
  renderChart() {
    const { id } = this.props.report;
    const { loading, reportData } = this.state;
    const { reportType } = reportData;
    const Chart = charts[reportType];
    return (
      <div className="content flexColumn">
        <Chart loading={loading} reportData={{
          ...reportData,
          reportId: id
        }} />
      </div>
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
        loading ? <Loading /> : reportData.status ? this.renderContent() : <Abnormal />
      );
    }
  }
  render() {
    const { dialogVisible, reportData, settingVisible } = this.state;
    const { report, ownerId, roleType, sourceType, needEnlarge, needRefresh = true, worksheetId } = this.props;
    const permissions = ownerId || _.includes([1, 2], roleType);
    return (
      <div className={cx(`statisticsCard statisticsCard-${report.id}`, { card: !sourceType, padding: !sourceType })}>
        <div className="header">
          <div className="flex ellipsis pointer">
            <span className="bold">{report.name || reportData.name}</span>
          </div>
          <div className="operateIconWrap">
            {permissions && (
              <span data-tip={_l('设置')} className="iconItem" onClick={() => { this.handleOperateClick(true) }}>
                <Icon icon="settings" />
              </span>
            )}
            {
              reportData.reportType === reportTypes.PivotTable && needEnlarge && (
                <span data-tip={_l('导出')} className="iconItem" onClick={() => { exportPivotTable(report.id, sourceType ? worksheetId : null) }}>
                  <Icon icon="file_download" />
                </span>
              )
            }
            {needRefresh && (
              <span onClick={() => this.getData(report.id, true)} data-tip={_l('刷新')} className="iconItem freshDataIconWrap">
                <Icon icon="rotate" />
              </span>
            )}
            {needEnlarge && (
              <span className="iconItem" data-tip={_l('放大')} onClick={() => { this.handleOperateClick(false) }}>
                <Icon icon="task-new-fullscreen" />
              </span>
            )}
            {permissions && (
              <span data-tip={_l('拖拽')} className="iconItem">
                <Icon icon="drag" />
              </span>
            )}
          </div>
        </div>
        {this.renderBody()}
        {dialogVisible ? (
          <ChartDialog
            {...this.props}
            settingVisible={settingVisible}
            permissions={permissions}
            onBlur={this.handleBlur.bind(this)}
            onDelete={this.handleDelete.bind(this)}
            dialogVisible={dialogVisible}
            updateDialogVisible={({ dialogVisible }) => {
              this.setState({ dialogVisible });
            }}
          />
        ) : null}
      </div>
    );
  }
}
