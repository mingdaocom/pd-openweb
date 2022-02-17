import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import ChartDialog from '../ChartDialog';
import { Provider } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import store from 'src/redux/configureStore';
import appManagement from 'src/api/appManagement';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import './index.less';
import 'worksheet/common/WorkSheetFilter/WorkSheetFilter.less';

export default class PublicShareChart extends Component {
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
      sourceType: 31
    }).then(data => {
      window.publicAppAuthorization = data.shareAuthor;
      this.setState({ data, loading: false });
    });
  }
  renderChart() {
    const { data } = this.state;
    return (
      data.status ? (
        <ChartDialog
          permissions={false}
          sourceType={1}
          nodialog={true}
          settingVisible={false}
          report={{ id: data.sourceId }}
        />
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
          this.renderChart()
        )}
      </Provider>
    );
  }
}

const Comp = preall(PublicShareChart, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
