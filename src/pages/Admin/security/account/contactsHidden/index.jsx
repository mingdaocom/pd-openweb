import React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { updateProjectId } from './actions/action';
import ContactsHidden from './container/ContactsHidden';
import reducer from './reducers/reducer';
import './index.less';

const store = createStore(reducer, compose(applyMiddleware(thunk)));

export default class ContactsHiddenWrap extends React.Component {
  constructor() {
    super();
  }

  componentDidMount() {
    $('html').addClass('AppAdminContactsHidden');
  }

  componentWillUnmount() {
    $('html').removeClass('AppAdminContactsHidden');
  }

  render() {
    store.dispatch(updateProjectId(this.props.projectId));

    return (
      <Provider store={store}>
        <ContactsHidden {...this.props} />
      </Provider>
    );
  }
}
