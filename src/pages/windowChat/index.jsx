import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import preall from 'src/common/preall';
import store from 'src/redux/configureStore';
import { socketInit } from 'src/socket';
import Chat from './Chat';

class WindowChat extends Component {
  constructor(props) {
    super(props);
    socketInit();
    const { Account } = md.global;
    const settings = {
      isOpenMessageSound: Account.isOpenMessageSound,
      isOpenMessageTwinkle: Account.isOpenMessageTwinkle,
      backHomepageWay: Account.backHomepageWay || 1,
    };
    Object.assign(window, settings);
  }
  render() {
    return (
      <Provider store={store}>
        <Chat />
      </Provider>
    );
  }
}

const Comp = preall(WindowChat);
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
