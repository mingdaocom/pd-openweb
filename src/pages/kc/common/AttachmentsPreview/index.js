import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import AttachmentsPreview from './attachmentsPreview';
import reducer from './reducers/reducer';

const store = createStore(reducer, compose(applyMiddleware(thunk)));

module.exports = function (props) {
  return (
    <Provider store={store}>
      <AttachmentsPreview {...props} />
    </Provider>
  );
};
