import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import preall from 'src/common/preall';
import GunterView from 'worksheet/views/GunterView/mobile';
import store from 'src/redux/configureStore';
import 'src/common/mdcss/inStyle.css';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/Themes/theme.less';
import 'src/common/mdcss/iconfont/mdfont.css';

class MobileGunter extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Provider store={store}>
        <GunterView />
      </Provider>
    );
  }
}

const Comp = preall(MobileGunter, { allownotlogin: true });

ReactDOM.render(<Comp />, document.querySelector('#mobileGunter'));
