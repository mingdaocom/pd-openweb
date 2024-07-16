import React from 'react';
import { Provider } from 'react-redux';
import Config from '../../../config';
import Root from './container/root';
import configureStore from './store/configureStore';
import './index.less';
import { updateProjectId } from './actions/current';

const store = configureStore();

export default class App extends React.Component {
  constructor() {
    super();
    Config.setPageTitle(_l('成员与部门'));
  }

  componentDidMount() {
    $('html').addClass('AppAdminStructure');
  }

  componentWillUnmount() {
    store.dispatch({ type: 'PROJECT_ID_CHANGED' });
    $('html').removeClass('AppAdminStructure');
  }

  render() {
    store.dispatch(updateProjectId(this.props.projectId));

    return (
      <Provider store={store}>
        <Root handleShowHeader={this.props.handleShowHeader} authority={this.props.authority} />
      </Provider>
    );
  }
}
