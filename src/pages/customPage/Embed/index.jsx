import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import preall from 'src/common/preall';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import CustomPageContent from 'src/pages/customPage/pageContent';
import MobileCustomPage from 'src/pages/Mobile/CustomPage';
import { LoadDiv } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import UnusualContent from 'src/components/UnusualContent';
import socketInit from 'src/socket';
import { browserIsMobile } from 'src/util';
import './index.less';

const isMobile = browserIsMobile();

export default class EmbedPage extends Component {
  constructor(props) {
    super(props);
    const pathname = location.pathname.split(/.*\/embed\/page\/(.*?)\//).filter(o => o);
    const [appId, pageId] = pathname;
    this.state = {
      loading: true,
      data: null,
    };
    this.appId = appId;
    this.pageId = pageId;
  }
  componentDidMount() {
    const { appId } = this;
    homeAppApi
      .checkApp({ appId })
      .then(status => {
        homeAppApi.getApp({ appId }).then(data => {
          this.setState({ loading: false, status });
          window[`timeZone_${this.appId}`] = data.timeZone;
        });
      })
      .catch(() => {
        location.href = '/login';
      });
    socketInit();
  }
  renderPage() {
    const { data, status } = this.state;
    if (status !== 1) {
      return <UnusualContent status={status} appId={this.appId} />;
    }
    if (isMobile) {
      const params = {
        appId: this.appId,
        worksheetId: this.pageId,
      };
      return <MobileCustomPage match={{ params, path: location.pathname }} />;
    } else {
      return <CustomPageContent ids={{ appId: this.appId }} id={this.pageId} />;
    }
  }
  render() {
    const { loading } = this.state;
    return <Provider store={store}>{loading ? <LoadDiv /> : this.renderPage()}</Provider>;
  }
}

const Comp = preall(EmbedPage);
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
