import React, { Component, Fragment } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import { Tabs } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import store from 'src/redux/configureStore';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { reportTypes } from '../Charts/common';
import { chartNav } from '../common/chartNav';
import ChartAnalyse from '../components/ChartAnalyse';
import ChartSetting from '../components/ChartSetting';
import ChartStyle from '../components/ChartStyle';
import DataSource from '../components/DataSource';

export default class EditorPanel extends Component {
  renderCharts() {
    const { geoCountryRegionCode, projectId, currentReport, changeCurrentReport, onUpdateReportType } = this.props;
    const { reportType, displaySetup } = currentReport;
    return (
      <div className="charts flexRow pLeft20 pRight20">
        {chartNav
          .filter(item => {
            if (item.type === reportTypes.CountryLayer) {
              return !geoCountryRegionCode || geoCountryRegionCode === 'CN';
            }

            return true;
          })
          .map((item, index) => (
            <Fragment key={index}>
              <Tooltip title={item.name}>
                <div
                  onClick={() => {
                    if (item.type === reportTypes.BarChart) {
                      changeCurrentReport({
                        displaySetup: { ...displaySetup, showChartType: 1 },
                      });
                    }

                    if (
                      item.type === reportTypes.WorldMap &&
                      getFeatureStatus(projectId, VersionProductType.worldMap) === '2'
                    ) {
                      buriedUpgradeVersionDialog(projectId, VersionProductType.worldMap);
                      return;
                    }

                    onUpdateReportType(item.type);
                  }}
                  className={cx('chartItem', {
                    active:
                      item.type === reportTypes.BarChart
                        ? reportType === reportTypes.BarChart && displaySetup.showChartType === 1
                        : reportType === item.type,
                  })}
                >
                  <Icon icon={item.icon} />
                </div>
              </Tooltip>
              {item.type === reportTypes.BarChart && (
                <Tooltip title={_l('横向柱图')}>
                  <div
                    onClick={() => {
                      changeCurrentReport({
                        displaySetup: { ...displaySetup, showChartType: 2 },
                      });

                      if (reportType !== reportTypes.BarChart) {
                        onUpdateReportType(item.type);
                      }
                    }}
                    className={cx('chartItem', {
                      active: reportType === reportTypes.BarChart && displaySetup.showChartType === 2,
                    })}
                  >
                    <Icon icon="stats_bar_chart1" />
                  </div>
                </Tooltip>
              )}
            </Fragment>
          ))}
      </div>
    );
  }

  renderSetting() {
    const {
      chartIsUnfold,
      projectId,
      reportData,
      currentReport,
      sourceType,
      themeColor,
      customPageConfig = {},
      reportId,
      onToggleChartUnfold,
    } = this.props;
    const { reportType, xaxes } = currentReport;

    const getAnalyseVisible = (function () {
      if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType)) {
        return false;
      }

      if (reportType === reportTypes.WorldMap) {
        return xaxes.controlType !== 40;
      }

      return true;
    })();

    if (!chartIsUnfold) {
      return (
        <div className="setting flexColumn small">
          <div className="pAll20">
            <div className="flexColumn valignWrapper mTop9 mBottom20">
              <Icon className="textTertiary Font18 pointer" icon="arrow-left-border" onClick={onToggleChartUnfold} />
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
            <Icon className="textTertiary Font18 pointer" icon="arrow-right-border" onClick={onToggleChartUnfold} />
          </div>
          <ScrollView className="flex">
            {this.renderCharts()}
            <Tabs className="chartTabs pLeft20 pRight20" defaultActiveKey="setting">
              <Tabs.TabPane tab={_l('配置')} key="setting">
                <ChartSetting projectId={projectId} sourceType={sourceType} />
              </Tabs.TabPane>
              <Tabs.TabPane tab={_l('样式')} key="style" disabled={reportData.status <= 0}>
                <ChartStyle
                  projectId={projectId}
                  sourceType={sourceType}
                  themeColor={themeColor || _.get(store.getState(), 'appPkg.iconColor')}
                  customPageConfig={customPageConfig}
                />
              </Tabs.TabPane>
              {getAnalyseVisible && (
                <Tabs.TabPane tab={_l('分析')} key="analyse" disabled={reportData.status <= 0}>
                  <ChartAnalyse sourceType={sourceType} reportId={reportId} />
                </Tabs.TabPane>
              )}
            </Tabs>
          </ScrollView>
        </div>
      </div>
    );
  }

  render() {
    const {
      dataIsUnfold,
      permissionType,
      ownerId,
      appId,
      projectId,
      sourceType,
      onChangeDataIsUnfold,
      onChangeSheetId,
    } = this.props;
    return (
      <div className="ChartDialogSetting flexRow h100">
        <DndProvider key="statistics" context={window} backend={HTML5Backend}>
          <DataSource
            dataIsUnfold={dataIsUnfold}
            permissionType={permissionType}
            ownerId={ownerId}
            appId={appId}
            projectId={projectId}
            sourceType={sourceType}
            onChangeDataIsUnfold={onChangeDataIsUnfold}
            onChangeSheetId={onChangeSheetId}
          />
          {this.renderSetting()}
        </DndProvider>
      </div>
    );
  }
}
