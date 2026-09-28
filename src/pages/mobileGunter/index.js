import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import GunterView from 'worksheet/views/GunterView/mobile';
import preall from 'src/common/entries/preall';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/iconfont/mdfont.css';
import store from 'src/redux/configureStore';

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

const Comp = preall(MobileGunter, { allowNotLogin: false });
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
