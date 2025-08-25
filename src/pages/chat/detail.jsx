import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from 'redux/configureStore';
import DocumentTitle from 'react-document-title';
import qs from 'query-string';
import ConnectChatWindow from 'src/pages/chat/containers/ChatWindow';

export default class ChatWindowEntrypoint extends Component {
  constructor(props) {
    super(props);
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

const root = createRoot(document.getElementById('app'));

root.render(<ChatWindowEntrypoint />);
