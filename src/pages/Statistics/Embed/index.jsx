import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import homeAppApi from 'api/homeApp';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import MobileChart from 'mobile/CustomPage/ChartContent';
import Chart from 'statistics/Card';
import exportPivotTableSocket from 'statistics/components/socket';
import preall from 'src/common/preall';
import { socketInit } from 'src/socket';
import customNotice from 'src/socket/customNotice';
import { browserIsMobile, getRequest } from 'src/utils/common';
import './index.less';

const isMobile = browserIsMobile();

export default class EmbedChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      appInfo: {},
    };
    const { pageId } = getRequest();
    const pathname = location.pathname.split(/.*\/embed\/chart\/(.*?)\//).filter(o => o);
    const [appId, chartId] = pathname;
    this.appId = appId;
    this.chartId = chartId;
    this.pageId = pageId;
    socketInit();
    exportPivotTableSocket();
    customNotice();
  }
  componentDidMount() {
    const { appId } = this;
    homeAppApi
      .getApp({
        appId,
        getLang: true,
      })
      .then(async data => {
        const { langInfo } = data;
        window.appInfo = data;
        if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
          const lang = await appManagementApi.getAppLangDetail({
            projectId: data.projectId,
            appId,
            appLangId: langInfo.appLangId,
          });
          window[`langData-${appId}`] = lang.items;
          window[`langVersion-${appId}`] = langInfo.version;
        }
        this.setState({
          appInfo: data,
          loading: false,
        });
        window[`timeZone_${this.appId}`] = data.timeZone;
      });
  }
  render() {
    const { loading, appInfo } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    if (isMobile) {
      return <MobileChart reportId={this.chartId} projectId={appInfo.projectId} />;
    } else {
      return (
        <Chart
          appId={this.appId}
          pageId={this.pageId}
          projectId={appInfo.projectId}
          report={{
            id: this.chartId,
          }}
          sourceType={1}
          isCharge={false}
          onLoad={data => {
            document.title = data.name;
          }}
        />
      );
    }
  }
}

const Comp = preall(EmbedChart);
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
