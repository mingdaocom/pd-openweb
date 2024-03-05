import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import preall from 'src/common/preall';
import MobileContainer from './MobileContainer';
import store from 'src/redux/configureStore';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/Themes/theme.less';
import 'src/common/mdcss/iconfont/mdfont.css';

export default function NativeEMbedCustomWidgetView(props) {
  return (
    <Provider store={store}>
      <MobileContainer />
    </Provider>
  );
}

const Comp = preall(NativeEMbedCustomWidgetView, { allownotlogin: false });

ReactDOM.render(<Comp />, document.querySelector('#app'));
