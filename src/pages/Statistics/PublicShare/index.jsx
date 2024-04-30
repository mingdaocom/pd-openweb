import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import ChartDialog from '../ChartDialog';
import { Provider } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import store from 'src/redux/configureStore';
import appManagementApi from 'src/api/appManagement';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import './index.less';
import 'worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import _ from 'lodash';
import cx from 'classnames';
import { getRequest } from 'src/util';

const { hideHeader } = getRequest();

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
  }
  componentDidMount() {
    const pathname = location.pathname.split('/');
    const id = pathname[pathname.length - 1];
    appManagementApi
      .getEntityShareById({
        id,
        sourceType: 31,
        langType: getCurrentLangCode(),
      })
      .then(async data => {
        localStorage.setItem('currentProjectId', _.get(data, 'data.projectId'));
        preall(
          { type: 'function' },
          {
            allowNotLogin: true,
            requestParams: { projectId: _.get(data, 'data.projectId') },
          },
        );
        window.clientId = _.get(data, 'data.clientId');
        const { projectId, appId, langInfo } = data.data;
        if (langInfo && langInfo.appLangId) {
          const lang = await appManagementApi.getAppLangDetail({
            projectId,
            appId,
            appLangId: langInfo.appLangId,
          });
          window.appInfo = { id: appId };
          window[`langData-${appId}`] = lang.items;
        }
        this.setState({ data, loading: false });
      });
  }
  renderChart() {
    const { resultCode, data } = this.state.data;
    return resultCode === 1 ? (
      <ChartDialog
        className={cx({ hideHeader: hideHeader === 'true' })}
        permissions={false}
        sourceType={1}
        nodialog={true}
        settingVisible={false}
        report={{ id: data.sourceId }}
        themeColor={data.appIconColor}
      />
    ) : (
      <div className="h100 w100 flexColumn valignWrapper WhiteBG" style={{ justifyContent: 'center' }}>
        <img style={{ width: 230 }} src={abnormal} />
        <div className="Font17 mTop20">{_l('分享已经关闭')}</div>
      </div>
    );
  }
  render() {
    const { loading } = this.state;
    return <Provider store={store}>{loading ? <LoadDiv /> : this.renderChart()}</Provider>;
  }
}

ReactDom.render(<PublicShareChart />, document.getElementById('app'));
