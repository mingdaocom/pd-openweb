import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { getRequest } from 'src/util';
import preall from 'src/common/preall';
import ChartContent from 'src/pages/Mobile/CustomPage/ChartContent';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import 'src/common/mdcss/inStyle.css';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/Themes/theme.less';
import 'src/common/mdcss/iconfont/mdfont.css';

const store = configureStore();

const LayoutContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px 15px;
  box-sizing: border-box;
  background-color: #fff;
`;

function isIOS() {
  var ua = navigator.userAgent.toLocaleLowerCase();
  var u = navigator.userAgent;
  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
  return isIOS;
}

const { reportId, access_token, getFilters } = getRequest();

class MobileChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      filters: []
    }
  }
  componentDidMount() {
    if (getFilters === 'true') {
      // 注册监听
      window.MD_APP_RESPONSE = (base64) => {
        const decodedData = window.atob(base64);
        const { value } = JSON.parse(decodeURIComponent(escape(decodedData)));
        this.setState({
          loading: false,
          filters: _.isArray(value) && value.length ? value : []
        });
      }
      // 触发监听的回调函数
      const string = JSON.stringify({ type: 'getFilters' });
      const base64 = window.btoa(string);
      if (isIOS()) {
        window.webkit.messageHandlers.MD_APP_REQUEST.postMessage(base64);
      } else {
        window.Android.MD_APP_REQUEST(base64);
      }
    } else {
      this.setState({
        loading: false
      });
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
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          <LayoutContent className="mobileAnalysis flexColumn">
            <ChartContent
              reportId={reportId}
              accessToken={access_token}
              dimensions={dimensions}
              filters={filters}
            />
          </LayoutContent>
        )}
      </Provider>
    );
  }
}

const Comp = preall(MobileChart, { allownotlogin: true });

ReactDOM.render(<Comp />, document.querySelector('#mobileChart'));
