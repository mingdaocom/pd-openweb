import React, { Component } from 'react';
import { Provider } from 'react-redux';
import DocumentTitle from 'react-document-title';
import qs from 'query-string';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import ConnectChatWindow from 'src/pages/chat/containers/ChatWindow';
import store from 'src/redux/configureStore';

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
