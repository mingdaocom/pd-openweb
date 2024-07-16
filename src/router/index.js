import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import App from './App';

const root = createRoot(document.getElementById('app'));

root.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
);
