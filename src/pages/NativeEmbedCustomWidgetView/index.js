import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/iconfont/mdfont.css';
import 'src/common/mdcss/Themes/theme.less';
import preall from 'src/common/preall';
import store from 'src/redux/configureStore';
import MobileContainer from './MobileContainer';

export default function NativeEMbedCustomWidgetView() {
  return (
    <Provider store={store}>
      <MobileContainer />
    </Provider>
  );
}

const Comp = preall(NativeEMbedCustomWidgetView, { allowNotLogin: false });
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
