import React, { Component, Fragment } from 'react';
import { reportTypes } from '../Charts/common';
import cx from 'classnames';
import { WithoutData } from '../components/ChartStatus';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'antd';
import charts from '../Charts';
import styled from 'styled-components';
import SingleView from 'src/pages/worksheet/common/SingleView';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';

const Con = styled.div`
  padding: 17px 20px;
  .SingleViewHeader {
    .icon-task-later, .addRecord {
      display: none;
    }
  }
  .hoverHighlight {
    &:hover {
      color: #2196f3 !important;
      border-color: #2196f3;
    }
  }
  .chartSheetHeader + div {
    display: none;
  }
  .chartSheetHeader .dataTitle {
    border-bottom: 3px solid #2196f3;
  }
  .searchInputComp + div {
    display: flex;
    align-items: center;
    margin-left: 12px;
    span:first-child {
      margin-right: 12px;
    }
  }
  .actionDivider {
    height: 14px;
    width: 1px;
    margin-left: 5px;
    background-color: #bdbdbd;
  }
  &.small {
    .searchInputComp + div span:first-child {
      display: none;
    }
  }
`;

@connect(
  state => ({
    ..._.pick(state.statistics, [
      'base',
      'currentReport',
      'tableData',
      'reportData',
      'axisControls',
      'worksheetInfo',
      'reportSingleCacheLoading',
    ]),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reutrnVisible: false,
    };
  }
  get isRequestTableData() {
    const { currentReport } = this.props;
    return ![reportTypes.NumberChart, reportTypes.PivotTable].includes(currentReport.reportType);
  }
  componentDidMount() {
    const { base, getTableData, tableData } = this.props;
    if (this.isRequestTableData) {
      getTableData();
    }
    this.setState({
      reutrnVisible: base.match ? false : true,
    });
  }
  getTitle() {
    const { base, tableData, currentReport, reportData } = this.props;
    const isNumberChart = reportTypes.NumberChart === currentReport.reportType;
    const isPivotTable = reportTypes.PivotTable === currentReport.reportType;

    if (isNumberChart) {
      const { yaxisList } = currentReport;
      return yaxisList[0].controlName;
    }

    const { match } = base;
    const { lines = [], columns = [], valueMap = {} } = isPivotTable ? reportData : tableData;
    const linesNames = lines
      .map(item => {
        const map = valueMap[item.cid] || {};
        const key = match[item.cid];
        return map[key] || key;
      })
      .filter(_ => _);

    const columnsNames = columns
      .map(item => {
        const map = valueMap[item.cid] || {};
        const key = match[item.cid];
        return map[key] || key;
      })
      .filter(_ => _);

    return linesNames.concat(columnsNames).join('-');
  }
  handleCloseReportSingleCacheId = () => {
    this.props.changeBase({
      reportSingleCacheId: null,
      apkId: null,
      match: null,
    });
  };
  handleToView = () => {
    const { base, getReportSingleCacheId } = this.props;
    getReportSingleCacheId({
      isPersonal: true,
      match: base.match,
    });
  };
  renderHeaderName() {
    const { reutrnVisible } = this.state;
    const { base, currentReport } = this.props;
    const beforeVisible = ![reportTypes.PivotTable, reportTypes.NumberChart].includes(currentReport.reportType);
    if (base.reportSingleCacheId) {
      const title = this.getTitle();
      return (
        <div className="flex valignWrapper ellipsis chartSheetHeader">
          {beforeVisible && (
            <div
              className="valignWrapper hoverHighlight Font15 Gray bold pointer mRight20 mBottom3"
              onClick={this.handleCloseReportSingleCacheId}
            >
              {_l('以表格显示')}
            </div>
          )}
          <div className="Font15 Gray bold ellipsis dataTitle">
            {_l('原始数据')}：{title}
          </div>
        </div>
      );
    } else {
      return <div className="flex Font15 bold">{_l('以表格显示')}</div>;
    }
  }
  renderHeaderAction() {
    const { base, settingVisible, currentReport, worksheetInfo, direction, onChangeDirection, onClose, isSmall } =
      this.props;
    const viewId = _.get(currentReport, ['filter', 'viewId']);
    const view = _.find(worksheetInfo.views, { viewId });
    return (
      <div className="valignWrapper">
        {base.reportSingleCacheId && <div className="actionDivider" />}
        {base.reportSingleCacheId && view && !view.viewType && !md.global.Account.isPortal && (
          <Tooltip title={_l('前往视图查看')}>
            <Icon className="Font20 Gray_9e pointer hoverHighlight mLeft12" icon="launch" onClick={this.handleToView} />
          </Tooltip>
        )}
        {/*!settingVisible && (
          <Tooltip title={direction === 'vertical' ? _l('切换为竖版模式') : _l('切换为横版模式')}>
            <Icon className={cx('Font20 Gray_9e pointer mLeft12 hoverHighlight', direction)} icon="call_to_action_on" onClick={onChangeDirection} />
          </Tooltip>
        )*/}
        <Icon
          icon="close"
          className="Font22 Gray_9e pointer mLeft12 hoverHighlight"
          onClick={() => {
            this.handleCloseReportSingleCacheId();
            onClose();
          }}
        />
      </div>
    );
  }
  renderHeader() {
    return (
      <div className="valignWrapper mBottom16">
        {this.renderHeaderName()}
        {this.renderHeaderAction()}
      </div>
    );
  }
  renderBody() {
    const { currentReport, tableData, worksheetInfo, base, reportSingleCacheLoading, settingVisible } = this.props;
    const Chart = charts[reportTypes.PivotTable];
    const isPublicShareChart = location.href.includes('public/chart');
    const isPublicSharePage = location.href.includes('public/page') || window.shareAuthor;

    if (
      (_.isEmpty(tableData) && this.isRequestTableData) ||
      (!_.isEmpty(base.match) && _.isEmpty(base.reportSingleCacheId))
    ) {
      return <LoadDiv />;
    }

    if (base.reportSingleCacheId) {
      const { filter = {}, displaySetup = {} } = currentReport || {};
      return reportSingleCacheLoading ? (
        <LoadDiv />
      ) : (
        <SingleView
          showAsSheetView
          filtersGroup={[]}
          showHeader={true}
          appId={base.apkId}
          worksheetId={worksheetInfo.worksheetId}
          viewId={filter.viewId}
          chartId={base.reportSingleCacheId}
          showControlIds={displaySetup.showControlIds}
          headerLeft={this.renderHeaderName()}
          headerRight={this.renderHeaderAction()}
        />
      );
    } else if (this.isRequestTableData) {
      const { data = {}, status } = tableData;
      return _.isEmpty(data.data) || !status ? (
        <WithoutData />
      ) : (
        <Fragment>
          {this.renderHeader()}
          <Chart
            isViewOriginalData={!settingVisible && !isPublicShareChart && !isPublicSharePage}
            requestOriginalData={this.props.requestOriginalData}
            reportData={tableData}
          />
        </Fragment>
      );
    }
  }
  render() {
    const { style, isSmall, base } = this.props;
    return (
      <Con className={cx('chartSheet flexColumn', { small: isSmall, pTop10: base.reportSingleCacheId })} style={style}>
        {this.renderBody()}
      </Con>
    );
  }
}
