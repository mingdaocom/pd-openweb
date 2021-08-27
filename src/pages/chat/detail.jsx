import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import DocumentTitle from 'react-document-title';
import qs from 'querystring';
import { connect, Provider } from 'react-redux';
import ConnectChatWindow from 'src/pages/chat/containers/ChatWindow';
import store from 'redux/configureStore';

export default class ChatWindowEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppChat');
  }
  componentWillUnmount() {
    $('html').removeClass('AppChat');
  }
  render() {
    const data = qs.parse(location.search.slice(1));
    return (
      <DocumentTitle title={data.name}>
        {
          <Provider store={store}>
            <ConnectChatWindow session={data} />
          </Provider>
        }
      </DocumentTitle>
    );
  }
}

ReactDOM.render(<ChatWindowEntrypoint />, document.getElementById('app'));
