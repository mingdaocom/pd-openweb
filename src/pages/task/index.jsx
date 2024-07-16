import React, { Component } from 'react';
import TaskCenter from './containers/taskCenter/taskCenter';
import { emitter } from 'src/util';
import UniformRoute from 'src/router/withTitle';
import { connect } from 'react-redux';
import _ from 'lodash';

const MODULE_TO_TITLE = {
  center: _l(' 任务'),
  star: _l('星标任务-任务 '),
  subordinate: _l('下属任务-任务 '),
};

class TaskEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppTask');
  }
  componentWillUnmount() {
    $('html').removeClass('AppTask');
  }

  renderPageTitle = () => {
    const { pathname } = this.props.location;
    let moduleName = pathname.match(/\/apps\/task\/(\w+)/) ? pathname.match(/\/apps\/task\/(\w+)/)[1] : 'center';
    if (_.includes(['center', 'star', 'subordinate'], moduleName)) {
      return MODULE_TO_TITLE[moduleName];
    }
    const { folderName = '' } = this.props.folderSettings;
    return `${folderName}-任务`;
  };
  render() {
    const { pathname } = this.props.location;
    return <UniformRoute title={this.renderPageTitle()} pathname={pathname} emitter={emitter} component={TaskCenter} />;
  }
}

export default connect(state => state.task)(TaskEntrypoint);
