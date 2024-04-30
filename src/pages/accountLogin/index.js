import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/configureStore';
import Container from './Container';

render(
  <Provider store={store}>
    <Router>
      <Container />
    </Router>
  </Provider>,
  document.getElementById('app'),
);
