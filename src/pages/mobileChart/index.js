import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { SpinLoading } from 'antd-mobile';
import homeAppApi from 'api/homeApp';
import _ from 'lodash';
import styled from 'styled-components';
import appManagementApi from 'src/api/appManagement';
import ChartContent from 'mobile/CustomPage/ChartContent';
import preall from 'src/common/preall';
import { configureStore } from 'src/redux/configureStore';
import { getRequest } from 'src/utils/common';
import { mdAppResponse } from 'src/utils/project';

const store = configureStore();

const LayoutContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px 15px;
  box-sizing: border-box;
  background-color: var(--color-background-primary);
  .g2-tooltip {
    background-color: var(--color-background-card) !important;
  }
`;

const { appId, reportId, getFilters } = getRequest();

class MobileChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      filters: [],
    };
  }
  componentDidMount() {
    const run = () => {
      if (getFilters === 'true') {
        mdAppResponse({ type: 'getFilters' }).then(data => {
          const { value } = data;
          this.setState({
            loading: false,
            filters: _.isArray(value) && value.length ? value : [],
          });
        });
      } else {
        this.setState({
          loading: false,
        });
      }
    };

    if (appId) {
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
          run();
        });
    } else {
      run();
    }
  }
  render() {
    const { loading, filters } = this.state;
    const paddingHorizontal = 15 * 2;
    const paddingVertical = 8 * 2;
    const dimensions = {
      width: document.documentElement.clientWidth - paddingHorizontal,
      height: document.documentElement.clientHeight - paddingVertical,
    };
    return (
      <Provider store={store}>
        {loading ? (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color="primary" />
          </div>
        ) : (
          <LayoutContent className="mobileAnalysis flexColumn">
            <ChartContent reportId={reportId} dimensions={dimensions} filters={filters} />
          </LayoutContent>
        )}
      </Provider>
    );
  }
}

const Comp = preall(MobileChart, { allowNotLogin: false });
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
