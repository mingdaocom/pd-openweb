import React from 'react';
import { Provider } from 'react-redux';
import Config from '../config';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import ContactsHidden from './container/ContactsHidden';
import reducer from './reducers/reducer';
import { updateProjectId } from './actions/action';
import './index.less';

const store = createStore(reducer, compose(applyMiddleware(thunk)));

export default class App extends React.Component {
  constructor() {
    super();
    Config.setPageTitle(_l('通讯录隔离'));
  }

  componentDidMount() {
    $('html').addClass('AppAdminContactsHidden');
  }

  componentWillUnmount() {
    $('html').removeClass('AppAdminContactsHidden');
    // store.dispatch({ type: 'PROJECT_ID_CHANGED' });
  }

  render() {
    store.dispatch(updateProjectId(this.props.match.params.projectId));

    return (
      <Provider store={store}>
        <ContactsHidden />
      </Provider>
    );
  }
}

