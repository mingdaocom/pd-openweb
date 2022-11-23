import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import appManagement from 'src/api/appManagement';
import CustomPageContent from 'worksheet/components/CustomPageContent';
import { LoadDiv } from 'ming-ui';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import './index.less';

export default class PublicSharePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null
    }
  }
  componentDidMount() {
    const pathname = location.pathname.split('/');
    const id = pathname[pathname.length - 1];
    appManagement.getEntityShareById({
      id,
      sourceType: 21
    }).then(data => {
      window.pageShareAuthor = data.shareAuthor;
      this.setState({ data, loading: false });
    });
  }
  renderPage() {
    const { data } = this.state;
    const ids = {
    }
    return (
      data.status ? (
        <CustomPageContent ids={ids} currentSheet={{ workSheetId: data.sourceId }} />
      ) : (
        <div
          className="h100 w100 flexColumn valignWrapper WhiteBG"
          style={{ justifyContent: 'center' }}
        >
          <img style={{ width: 230 }} src={abnormal} />
          <div className="Font17 mTop20">{_l('分享已经关闭')}</div>
        </div>
      )
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

const Comp = preall(PublicSharePage, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
