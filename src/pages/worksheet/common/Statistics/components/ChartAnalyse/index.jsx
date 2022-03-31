import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch } from 'antd';
import OriginalData from './components/OriginalData';
import DataContrast from './components/DataContrast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/common/Statistics/redux/actions';
import { isTimeControl, formatContrastTypes } from 'src/pages/worksheet/common/Statistics/common';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'worksheetInfo', 'reportData'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartAnalyse extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    const { displaySetup } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        displaySetup: {
          ...displaySetup,
          ...data
        }
      },
      isRequest
    );
  }
  handleChangeStyle = (data, isRequest = false) => {
    const { style } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        style: {
          ...style,
          ...data
        }
      },
      isRequest
    );
  }
  renderOriginalData() {
    const { worksheetInfo, currentReport } = this.props;
    const { displaySetup, filter, style } = currentReport;
    return (
      <Collapse.Panel
        key="originalData"
        header={_l('查看原始数据')}
        className={cx({ collapsible: !displaySetup.showRowList })}
        extra={(
          <Switch
            size="small"
            checked={displaySetup.showRowList}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                showRowList: checked
              });
            }}
          />
        )}
      >
        <OriginalData
          worksheetInfo={worksheetInfo}
          displaySetup={displaySetup}
          viewId={filter.viewId}
          style={style || {}}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderDataContrast(xAxisisTime) {
    const { currentReport, reportData } = this.props;
    const { reportType, displaySetup, filter } = currentReport;
    const { rangeType } = filter || {};
    const isNumberChart = reportType === reportTypes.NumberChart;
    return (
      <Collapse.Panel
        header={_l('数据对比')}
        key="dataContrast"
        className={cx({ collapsible: isNumberChart ? !displaySetup.contrastType : false })}
        extra={(
          isNumberChart ? (
            <Switch
              size="small"
              checked={displaySetup.contrastType}
              disabled={!rangeType}
              onClick={(checked, event) => {
                event.stopPropagation();
              }}
              onChange={checked => {
                const list = formatContrastTypes(filter);
                const first = list[1];
                this.handleChangeDisplaySetup({
                  ...displaySetup,
                  contrastType: checked ? first.value : 0
                }, true);
              }}
            />
          ) : null
        )}
      >
        <DataContrast
          xAxisisTime={xAxisisTime}
          currentReport={currentReport}
          mapKeys={Object.keys(reportData.map || [])}
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderExpandIcon(panelProps) {
    return (
      <Icon
        className={cx('Font18 mRight5 Gray_9e', { 'icon-arrow-active': panelProps.isActive })}
        icon="arrow-down-border"
      />
    );
  }
  render() {
    const { currentReport } = this.props;
    const { reportType, xaxes } = currentReport;
    const xAxisisTime = isTimeControl(xaxes.controlType);
    return (
      <div className="chartAdvanced">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {((reportType === reportTypes.LineChart && xAxisisTime) ||
            [reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType)) &&
            this.renderDataContrast(xAxisisTime)}
          {this.renderOriginalData()}
        </Collapse>
      </div>
    );
  }
}
