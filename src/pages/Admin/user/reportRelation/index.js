import React from 'react';
import { Provider } from 'react-redux';
import Config from '../../config';
import Root from './root';
import createReportRelationStore from './store';
import './style/index.less';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.projectId = props.from && props.projectId ? props.projectId : Config.projectId;
    this.store = createReportRelationStore(this.projectId);
    if (!(props.from && props.projectId)) {
      Config.setPageTitle(_l('用户 - 汇报关系'));
    }
  }

  render() {
    const { from } = this.props;
    return (
      <Provider store={this.store}>
        <Root from={from} projectId={this.projectId} />
      </Provider>
    );
  }
}
