import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/configureStore';
import Container from './Container';

const root = createRoot(document.getElementById('app'));

root.render(
  <Provider store={store}>
    <Router>
      <Container />
    </Router>
  </Provider>,
);
