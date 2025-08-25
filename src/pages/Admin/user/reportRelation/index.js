import React from 'react';
import { Provider } from 'react-redux';
import Config from '../../config';
import Root from './root';
import store from './store';
import './style/index.less';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    if (props.from && props.projectId) {
      Config.projectId = props.projectId;
    } else {
      Config.setPageTitle(_l('汇报关系'));
    }
  }

  componentDidMount() {
    $('html').addClass('AppAdminReportRelation');
  }

  componentWillUnmount() {
    $('html').removeClass('AppAdminReportRelation');
  }

  render() {
    const { from } = this.props;
    return (
      <Provider store={store}>
        <Root from={from} />
      </Provider>
    );
  }
}
