import React, { Component } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { LoadDiv } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import AppAnalytics from './components/AppAnalytics';

export default class AppAnalyticsWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    let paramArr = window.location.href.split('/');
    let projectId = paramArr[paramArr.length - 2];
    let appId = paramArr[paramArr.length - 1];
    homeAppAjax.getAppDetail({ appId }).then(data => {
      this.setState({
        loading: false,
        projectId,
        currentAppInfo: {
          appId: data.id,
          name: data.name,
          iconColor: data.iconColor,
          iconUrl: data.iconUrl,
        },
      });
    });
  }
  renderPage = () => {
    
  };
  render() {
    const { loading } = this.state;
    const { currentAppInfo = {}, projectId } = this.state;
    document.title = currentAppInfo.name + '-' + _l('使用分析');
    if(loading){
      return <LoadDiv />
    }

    return (
      <div>
        <AppAnalytics currentAppInfo={currentAppInfo} projectId={projectId} isIndividual={true} />;
      </div>
    );
  }
}

const Comp = preall(AppAnalyticsWrap);

ReactDom.render(<Comp />, document.getElementById('app'));
