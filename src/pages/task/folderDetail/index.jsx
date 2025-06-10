import React, { Component } from 'react';
import { emitter } from 'src/utils/common';
import TaskCenter from './containers/taskCenter/taskCenter';

export default class FolderEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppTask');
  }
  componentWillUnmount() {
    $('#container').off('.task');
    $('body').off('.task').removeClass('taskDetailOpen');
    $('html').removeClass('AppTask');
  }
  render() {
    return <TaskCenter folderId={this.props.match.params.id} hideNavigation={true} emitter={emitter} />;
  }
}
