import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import CustomPageContent from 'worksheet/components/CustomPageContent';
import { LoadDiv } from 'ming-ui';
import homeApp from 'src/api/homeApp';
import UnusualContent from 'src/router/Application/UnusualContent';
import './index.less';
import 'src/router/Application/index.less';

export default class EmbedPage extends Component {
  constructor(props) {
    super(props);
    const pathname = location.pathname.split('/').slice(3);
    const [ appId, pageId ] = pathname;
    this.state = {
      loading: true,
      data: null
    }
    this.appId = appId;
    this.pageId = pageId;
  }
  componentDidMount() {
    const { appId } = this;
    homeApp.checkApp({ appId }).then(status => {
      this.setState({ loading: false, status });
    }).fail(() => {
      location.href = '/login';
    });
  }
  renderPage() {
    const { data, status } = this.state;
    const ids = {}
    if (status !== 1) {
      return (
        <UnusualContent status={status} appId={this.appId} />
      );
    }
    return (
      <CustomPageContent ids={ids} currentSheet={{ workSheetId: this.pageId }} />
    );
  }
  render() {
    const { loading } = this.state;
    return (
      <Provider store={store}>
        {loading ? (
          <LoadDiv />
        ) : (
          this.renderPage()
        )}
      </Provider>
    );
  }
}

const Comp = preall(EmbedPage);

ReactDom.render(<Comp />, document.getElementById('app'));
