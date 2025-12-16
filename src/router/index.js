import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GlobalStoreProvider } from 'src/common/GlobalStore';
import store from 'src/redux/configureStore';
import App from './App';

const root = createRoot(document.getElementById('app'));

root.render(
  <Provider store={store}>
    <GlobalStoreProvider>
      <Router>
        <App />
      </Router>
    </GlobalStoreProvider>
  </Provider>,
);
