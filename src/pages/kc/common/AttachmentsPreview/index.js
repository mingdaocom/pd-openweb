import React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import AttachmentsPreview from './attachmentsPreview';
import reducer from './reducers/reducer';

const store = createStore(reducer, compose(applyMiddleware(thunk)));

export default function (props) {
  return (
    <Provider store={store}>
      <AttachmentsPreview {...props} />
    </Provider>
  );
}
