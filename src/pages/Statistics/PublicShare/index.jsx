import React, { Component, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import 'worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import preall from 'src/common/preall';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import store from 'src/redux/configureStore';
import { shareGetAppLangDetail } from 'src/utils/app';
import { getRequest } from 'src/utils/common';
import './index.less';

const { hideHeader } = getRequest();
const LoadableChartDialog = lazy(() => import('../ChartDialog'));
const SHARE_REFRESH_INTERVAL = 3 * 60 * 60 * 1000;

if (hideHeader === 'true') {
  setCookie('i18n_langtag', 'zh-Hans');
}

export default class PublicShareChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null,
    };
    this.isUnmounted = false;
  }

  componentDidMount() {
    this.refreshShareInfo();
    this.refreshTimer = setInterval(() => {
      this.refreshShareInfo({ showLoading: true });
    }, SHARE_REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    clearInterval(this.refreshTimer);
  }

  refreshShareInfo({ showLoading = false } = {}) {
    const pathname = location.pathname.split('/');
    const id = pathname[pathname.length - 1];
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;

    if (showLoading) {
      this.setState({
        loading: true,
        errorCode: null,
      });
    }

    appManagementApi
      .getEntityShareById({
        id,
        sourceType: 31,
        clientId,
      })
      .then(async data => {
        const shareData = data.data || {};
        const { appId, projectId } = shareData;
        safeLocalStorageSetItem('currentProjectId', projectId);
        preall(
          {
            type: 'function',
          },
          {
            allowNotLogin: true,
            requestParams: {
              projectId,
            },
          },
        );
        const resultClientId = _.get(data, 'data.clientId');
        window.clientId = resultClientId;
        resultClientId && sessionStorage.setItem(id, resultClientId);

        if (data.resultCode === 1 && appId && projectId) {
          window.appInfo = {
            id: appId,
          };
          await shareGetAppLangDetail({
            appId,
            projectId,
          });
        }

        if (this.isUnmounted) {
          return;
        }

        this.setState({
          data,
          loading: false,
          errorCode: null,
        });
      })
      .catch(err => {
        if (this.isUnmounted) {
          return;
        }

        this.setState({
          loading: false,
          errorCode: err.errorCode,
        });
      });
  }

  renderChart() {
    const { resultCode, data } = this.state.data;
    return resultCode === 1 ? (
      <Suspense fallback={<LoadDiv className="mTop10" />}>
        <LoadableChartDialog
          className={cx({
            hideHeader: hideHeader === 'true',
          })}
          permissions={false}
          sourceType={1}
          nodialog={true}
          settingVisible={false}
          report={{
            id: data.sourceId,
          }}
          appId={data.appId}
          projectId={data.projectId}
          themeColor={data.appIconColor}
        />
      </Suspense>
    ) : (
      <div
        className="h100 w100 flexColumn valignWrapper bgPrimary"
        style={{
          justifyContent: 'center',
        }}
      >
        <img
          style={{
            width: 230,
          }}
          src={abnormal}
        />
        <div className="Font17 mTop20">{_l('分享已经关闭')}</div>
      </div>
    );
  }

  render() {
    const { loading, errorCode } = this.state;

    if (errorCode === 300016) {
      return <RestrictAccessStatus />;
    }

    return (
      <Provider store={store}>
        {loading ? (
          <div className="h100 flexRow flexCenter">
            <LoadDiv />
          </div>
        ) : (
          this.renderChart()
        )}
      </Provider>
    );
  }
}
const root = createRoot(document.getElementById('app'));
root.render(<PublicShareChart />);
